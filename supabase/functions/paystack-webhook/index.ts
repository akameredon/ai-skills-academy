import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

async function hmacSha512(secret: string, body: string) {
 const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-512' }, false, ['sign']);
 const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body));
 return [...new Uint8Array(signature)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}
function safeEqual(a: string, b: string) {
 if (a.length !== b.length) return false;
 let result = 0;
 for (let i = 0; i < a.length; i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
 return result === 0;
}
Deno.serve(async (req) => {
 if (req.method !== 'POST') return json({ error: 'Method not allowed.' }, 405);
 const secret = Deno.env.get('PAYSTACK_SECRET_KEY');
 const url = Deno.env.get('SUPABASE_URL');
 const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
 if (!secret || !url || !serviceKey) return json({ error: 'Webhook is not configured.' }, 503);
 const rawBody = await req.text();
 const signature = req.headers.get('x-paystack-signature') ?? '';
 const expected = await hmacSha512(secret, rawBody);
 if (!signature || !safeEqual(signature, expected)) return json({ error: 'Invalid signature.' }, 401);
 let event: { event?: string; data?: { reference?: string } };
 try { event = JSON.parse(rawBody); } catch { return json({ error: 'Invalid JSON.' }, 400); }
 if (event.event !== 'charge.success' || !event.data?.reference) return json({ received: true });
 // Verify with Paystack directly before granting access.
 const verifyResponse = await fetch('https://api.paystack.co/transaction/verify/' + encodeURIComponent(event.data.reference), { headers: { Authorization: 'Bearer ' + secret } });
 const verified = await verifyResponse.json().catch(() => ({}));
 if (!verifyResponse.ok || !verified.status || verified.data?.status !== 'success') return json({ error: 'Payment verification failed.' }, 400);
 const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
 const { data, error } = await admin.rpc('apply_verified_payment', { p_reference: event.data.reference, p_amount_kobo: verified.data.amount, p_currency: verified.data.currency, p_provider_status: verified.data.status });
 if (error) { console.error('Payment apply failed:', error.message); return json({ error: 'Payment received but membership update needs retry.' }, 500); }
 return json({ received: true, applied: data });
});
