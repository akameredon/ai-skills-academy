# AI Skills Academy

Responsive React/Vite learning academy with five AI learning pathways, Supabase authentication, server-calculated checkout pricing and Paystack checkout integration.

## Included

- Five selectable pathways and optional Mentorship Plus.
- Current pricing: NGN 5,000 per selected specialist pathway and NGN 10,000 for optional Mentorship Plus. There is no foundation/base fee.
- Each verified purchase grants 365 days of access to the purchased pathways; no automatic renewal.
- Supabase email sign-up/sign-in and saved member selections.
- Supabase Edge Function authenticates the member, calculates the amount on the server, creates an order and initializes Paystack checkout.
- Webhook validates Paystack's HMAC signature, independently verifies the transaction with Paystack, and calls a database function that checks reference/amount and grants access idempotently.
- Row-level security on orders, payment records and pathway access.
- Responsive interface with accessible focus states, a mobile navigation menu, reduced-motion support, and clearer selection/checkout feedback.

## Marketplace status

Course creators, referral tracking, commissions, creator publishing and payouts are not implemented. The current creator/partner section describes intended future capabilities, not active features. Course-content delivery and admin tools also require implementation.

## Local setup

Requires Node.js 20+ and npm.

```bash
cp .env.example .env.local
npm install
npm run dev
```

Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. Run `supabase/schema.sql` in a new Supabase project, then run `supabase/migrations/202610230001_secure_checkout.sql` in the SQL Editor.

## Payment setup

1. Configure a Paystack account and start with test keys.
2. Deploy `create-checkout`: `supabase functions deploy create-checkout`.
3. Deploy the public Paystack webhook without JWT verification (Paystack authenticates the request using its signature): `supabase functions deploy paystack-webhook --no-verify-jwt`.
4. Set Edge Function secrets: `PAYSTACK_SECRET_KEY`, `SITE_URL`, and Supabase's standard `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`. Never place Paystack or service-role secrets in frontend variables.
5. Set Paystack's webhook URL to `https://YOUR_PROJECT.supabase.co/functions/v1/paystack-webhook`.
6. Test successful, failed, duplicate and mismatched-amount events in test mode. Confirm access is only granted after verified success.
7. Set Vercel frontend variables and redeploy.

The browser return URL does not grant access. The signed webhook and server-side Paystack verification are the source of truth.

## Build and deploy

```bash
npm run build
```

Vercel settings: build command `npm run build`, output directory `dist`.

## Security notes

Never expose the Supabase service-role key or Paystack secret in a `VITE_` variable. Review RLS using separate test accounts. Do not accept real payments until the build, authentication, access expiry and payment webhook tests pass.

## License

MIT — see `LICENSE`.
