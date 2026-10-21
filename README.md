# AI Skills Academy — MVP starter

A mobile-friendly React/Vite landing page for an AI learning academy. The current scaffold includes five learning pathways, an estimated membership price calculator, Supabase email sign-up, configurable Selar checkout URLs, and an introductory section for future course creators and community partners.

## Current functionality

- Five learning pathways: AI video, graphics and design, prompt engineering, AI-assisted websites, and digital products.
- Pricing calculator: Foundation ₦5,000/month, +₦5,000/month per selected pathway, optional Mentorship Plus +₦10,000/month.
- Supabase sign-up form when environment variables are configured.
- Checkout redirects only when a matching Selar URL is configured.
- Responsive mobile-first styling.

## Not implemented yet

The current repository is an MVP starter, not a launched production marketplace. Member sign-in, saved selections, course upload/submission, public creator aliases, creator dashboards, referral tracking, payment verification, automated commissions/payouts, course access control, mentor scheduling and admin moderation are not implemented in this version. The creator/partner section is informational only. Do not advertise those features as live until built and tested.

## Local setup

Requirements: Node.js 20+ and npm.

```bash
cp .env.example .env.local
npm install
npm run dev
```

Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to `.env.local` to enable sign-up. Run `supabase/schema.sql` in the SQL Editor of a new Supabase project. The current UI does not yet save membership selections to the database.

## Selar checkout

Create real products in Selar and configure the relevant `VITE_SELAR_*_URL` values in `.env.local` and in your deployment environment. Test every checkout link before launch. Multi-path combinations and some mentorship combinations need matching product URLs or a dedicated checkout flow. A redirect is not proof of payment.

## Build and deploy

```bash
npm run build
```

Deploy to Vercel or Cloudflare Pages with build command `npm run build` and output directory `dist`. Configure the environment variables in the hosting dashboard. This repository has not yet been verified by a production build or deployed.

## Security and production checklist

- Never put a Supabase service-role key in a `VITE_` variable.
- Review and test row-level security before storing real student data.
- Add server-side payment verification and trusted order/subscription records.
- Grant paid course access only after verified payment events.
- Build and test creator profiles, course moderation, referrals, commission calculation, refund reversals and payout controls before promising those capabilities.
- Add terms, privacy notice, refund policy, support contact, backups and monitoring.

## License

MIT — see `LICENSE`.