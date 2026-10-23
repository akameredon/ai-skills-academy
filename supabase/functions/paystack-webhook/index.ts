
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const allowedPathways = new Set([
  'video',
  'graphics',
  'prompting',
  'websites',
  'digital-products',
]);

const json = (
  body: unknown,
  status = 200,
  origin = '',
) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Headers':
        'authorization, x-client-info, apikey, content-type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Vary': 'Origin',
      'Content-Type': 'application/json',
    },
  });

Deno.serve(async (req) => {
  const siteUrl = Deno.env.get('SITE_URL');
  const configuredOrigin = (() => {
    try {
      return siteUrl ? new URL(siteUrl).origin : '';
    } catch {
      return '';
    }
  })();

  const requestOrigin = req.headers.get('Origin') ?? '';
  const originAllowed =
    !!configuredOrigin &&
    (!requestOrigin || requestOrigin === configuredOrigin);

  const responseOrigin =
    requestOrigin && originAllowed ? requestOrigin : configuredOrigin;

  if (req.method === 'OPTIONS') {
    if (!originAllowed) {
      return new Response('Origin not allowed.', { status: 403 });
    }
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': responseOrigin,
        'Access-Control-Allow-Headers':
          'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Vary': 'Origin',
      },
    });
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed.' }, 405, responseOrigin);
  }

  if (!originAllowed) {
    return json({ error: 'Checkout origin is not allowed.' }, 403, configuredOrigin);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const paystackKey = Deno.env.get('PAYSTACK_SECRET_KEY');

  if (!supabaseUrl || !anonKey || !serviceKey || !paystackKey || !siteUrl) {
    return json(
      { error: 'Checkout is not configured yet. Ask the site administrator to finish payment setup.' },
      503,
      responseOrigin,
    );
  }

  const authorization = req.headers.get('Authorization');
  if (!authorization) {
    return json({ error: 'Please sign in before checking out.' }, 401, responseOrigin);
  }

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authorization } },
  });

  const {
    data: { user },
    error: authError,
  } = await userClient.auth.getUser();

  if (authError || !user?.email) {
    return json({ error: 'Your session is invalid. Sign in again.' }, 401, responseOrigin);
  }

  let payload: { pathwayIds?: unknown; mentorship?: unknown };

  try {
    payload = await req.json();
  } catch {
    return json({ error: 'Invalid checkout request.' }, 400, responseOrigin);
  }

  if (
    !Array.isArray(payload.pathwayIds) ||
    typeof payload.mentorship !== 'boolean'
  ) {
    return json(
      { error: 'Choose at least one course or mentorship before checkout.' },
      400,
      responseOrigin,
    );
  }

  if (
    payload.pathwayIds.some((id) => typeof id !== 'string')
  ) {
    return json({ error: 'Your selection includes an invalid course.' }, 400, responseOrigin);
  }

  const pathwayIds = [...new Set(payload.pathwayIds as string[])];

  if (pathwayIds.some((id) => !allowedPathways.has(id))) {
    return json({ error: 'Your selection includes an invalid course.' }, 400, responseOrigin);
  }

  if (pathwayIds.length === 0 && !payload.mentorship) {
    return json(
      { error: 'Select at least one course or mentorship before checkout.' },
      400,
      responseOrigin,
    );
  }

  // ₦5,000 per course, plus ₦10,000 if mentorship is selected.
  // No base fee. Calculate prices on the server, never in the browser.
  const amountNaira =
    pathwayIds.length * 5000 + (payload.mentorship ? 10000 : 0);

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: order, error: orderError } = await admin
    .from('orders')
    .insert({
      user_id: user.id,
      email: user.email,
      pathway_ids: pathwayIds,
      mentorship: payload.mentorship,
      amount_naira: amountNaira,
      currency: 'NGN',
      status: 'pending',
    })
    .select('id, amount_naira')
    .single();

  if (orderError || !order) {
    console.error('Order creation failed:', orderError?.message);
    return json({ error: 'We could not prepare your order. Please try again.' }, 500, responseOrigin);
  }

  const reference =
    `asa_${order.id.replaceAll('-', '')}_${crypto.randomUUID().replaceAll('-', '').slice(0, 12)}`;

  const { error: refError } = await admin
    .from('orders')
    .update({ provider_reference: reference })
    .eq('id', order.id)
    .eq('user_id', user.id);

  if (refError) {
    console.error('Payment reference save failed:', refError.message);
    return json({ error: 'We could not prepare your payment reference.' }, 500, responseOrigin);
  }

  const callbackUrl = new URL('/', siteUrl);
  callbackUrl.searchParams.set('payment', 'return');
  callbackUrl.searchParams.set('reference', reference);

  try {
    const response = await fetch(
      'https://api.paystack.co/transaction/initialize',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${paystackKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          amount: order.amount_naira * 100,
          currency: 'NGN',
          reference,
          callback_url: callbackUrl.toString(),
          metadata: {
            order_id: order.id,
            user_id: user.id,
            pathway_ids: pathwayIds,
            mentorship: payload.mentorship,
          },
        }),
      },
    );

    const paystack = await response.json().catch(() => ({}));

    if (
      !response.ok ||
      !paystack.status ||
      !paystack.data?.authorization_url
    ) {
      await admin
        .from('orders')
        .update({ status: 'failed' })
        .eq('id', order.id);

      console.error('Paystack initialize failed:', paystack.message ?? response.status);

      return json(
        { error: 'The payment provider could not start checkout. Please try again later.' },
        502,
        responseOrigin,
      );
    }

    return json(
      { checkoutUrl: paystack.data.authorization_url, reference },
      200,
      responseOrigin,
    );
  } catch (error) {
    console.error('Paystack request failed:', error instanceof Error ? error.message : 'Unknown error');

    return json(
      { error: 'We could not contact the payment provider. Please try again later.' },
      502,
      responseOrigin,
    );
  }
});
