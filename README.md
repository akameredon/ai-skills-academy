# AI Skills Academy — MVP starter

Mobile-friendly membership selector for AI Skills Academy. Includes a React/Vite landing page, learning pathway pricing, Supabase email/password authentication, saved member selections, and an affiliate partner MVP.

## Current scope and limitations

- Foundation membership: ₦5,000/month.
- Each specialist pathway: +₦5,000/month.
- Mentorship Plus: +₦10,000/month.
- Supabase-backed sign-up, sign-in and saved selections require project configuration.
- Selar checkout URLs remain blank until real products are created and tested.
- Referral signup attribution is not proof of payment. Payment verification, automated commissions and payouts are not production-ready.

## Local setup

Requirements: Node.js 20+ and npm.

```bash
cp .env.example .env.local
npm install
npm run dev
```

Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env.local` to enable authentication and saved selections. Run `supabase/schema.sql` in the SQL Editor of a new Supabase project. Never put a Supabase service-role key in a `VITE_` variable.

## Build and deploy

```bash
npm run build
```

Deploy to Vercel or Cloudflare Pages with build command `npm run build` and output directory `dist`. Configure the public Supabase values and actual Selar product URLs in the host's environment settings, then test sign-up, redirects and each checkout URL.

## Before launch

Add server-side payment verification, order/subscription state, paid-course authorization, refund handling, admin moderation, payout controls and tested RLS policies. Do not promise commission income or paid access until those flows are implemented and verified.

See `.env.example` for supported environment variable names. MIT license; see `LICENSE`.