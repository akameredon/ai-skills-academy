# AI Skills Academy

Responsive React/Vite learning academy with five AI learning pathways, Supabase authentication, server-calculated checkout pricing and Paystack checkout integration.

## Included in this update

- Five selectable pathways and optional Mentorship Plus.
- Shared pricing rules: NGN 5,000 foundation + NGN 5,000 per selected pathway + NGN 10,000 mentorship.
- Supabase email sign-up/sign-in and saved member selections.
- Supabase Edge Function authenticates the member, calculates the amount on the server, creates an order and initializes Paystack checkout.
- Webhook validates Paystack's HMAC signature, independently verifies the transaction with Paystack, and calls a database function that checks reference/amount and grants access idempotently.
- Row-level security on orders, payment records and pathway access.
- Verified payments grant 30 days of access; another successful payment extends access by 30 days.

## Launch limitations

**Not production-ready until the configuration and tests below are completed.** No real/test payment was run as part of this code change. Checkout is a one-time payment for a 30-day access period and does **not** automatically renew. Refund/reversal automation, auto-renewing subscriptions, course-content delivery, admin tools, creator publishing, affiliate tracking and payouts are not implemented.

Pricing currently means NGN 5,000 foundation + NGN 5,000 per selected pathway + NGN 10,000 mentorship. Confirm this rule before launch.

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
2. Deploy `create-checkout` normally: `supabase functions deploy create-checkout`.
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

Never expose the Supabase service-role key or Paystack secret in a `VITE_` variable. Review RLS using separate test accounts. The code has not been run against the live Supabase project or tested with Paystack credentials; complete the build and test checklist before accepting real payments.

## License

MIT — see `LICENSE`.
