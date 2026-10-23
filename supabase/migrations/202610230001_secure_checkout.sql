-- Run after supabase/schema.sql in the Supabase SQL Editor.
create table if not exists public.orders (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 email text not null,
 pathway_ids text[] not null default '{}',
 mentorship boolean not null default false,
 amount_naira integer not null check (amount_naira >= 5000),
 currency text not null default 'NGN' check (currency = 'NGN'),
 status text not null default 'pending' check (status in ('pending','paid','failed','refunded')),
 provider_reference text unique,
 created_at timestamptz not null default now(),
 paid_at timestamptz,
 constraint orders_valid_pathways check(pathway_ids <@ array['video','graphics','prompting','websites','digital-products']::text[])
);
create index if not exists orders_user_created_idx on public.orders(user_id, created_at desc);
create table if not exists public.payments (
 id uuid primary key default gen_random_uuid(),
 order_id uuid not null unique references public.orders(id) on delete restrict,
 provider text not null default 'paystack',
 provider_reference text not null unique,
 amount_naira integer not null check (amount_naira > 0),
 currency text not null default 'NGN',
 status text not null check(status in ('success','refunded')),
 created_at timestamptz not null default now()
);
create table if not exists public.member_access (
 user_id uuid primary key references auth.users(id) on delete cascade,
 pathway_ids text[] not null default '{}',
 mentorship boolean not null default false,
 expires_at timestamptz not null,
 updated_at timestamptz not null default now(),
 constraint access_valid_pathways check(pathway_ids <@ array['video','graphics','prompting','websites','digital-products']::text[])
);
alter table public.orders enable row level security;
alter table public.payments enable row level security;
alter table public.member_access enable row level security;
drop policy if exists "members read own orders" on public.orders;
create policy "members read own orders" on public.orders for select to authenticated using(user_id = auth.uid());
drop policy if exists "members read own payments" on public.payments;
create policy "members read own payments" on public.payments for select to authenticated using(exists(select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
drop policy if exists "members read own access" on public.member_access;
create policy "members read own access" on public.member_access for select to authenticated using(user_id = auth.uid());
revoke insert, update, delete on public.orders from anon, authenticated;
revoke insert, update, delete on public.payments from anon, authenticated;
revoke insert, update, delete on public.member_access from anon, authenticated;
grant select on public.orders, public.payments, public.member_access to authenticated;

create or replace function public.apply_verified_payment(p_reference text, p_amount_kobo integer, p_currency text, p_provider_status text)
returns boolean language plpgsql security definer set search_path = ''
as $$
declare v_order public.orders%rowtype;
begin
 if p_provider_status <> 'success' or p_currency <> 'NGN' or p_amount_kobo <= 0 or mod(p_amount_kobo, 100) <> 0 then raise exception 'Payment verification data is invalid'; end if;
 select * into v_order from public.orders where provider_reference = p_reference for update;
 if not found then raise exception 'Order not found'; end if;
 if v_order.amount_naira <> p_amount_kobo / 100 or v_order.currency <> p_currency then raise exception 'Verified payment amount does not match order'; end if;
 if v_order.status = 'paid' then return true; end if;
 if v_order.status <> 'pending' then raise exception 'Order is not payable'; end if;
 insert into public.payments(order_id, provider_reference, amount_naira, currency, status) values(v_order.id, p_reference, p_amount_kobo / 100, p_currency, 'success');
 update public.orders set status = 'paid', paid_at = now() where id = v_order.id;
 insert into public.member_access as current_access(user_id, pathway_ids, mentorship, expires_at, updated_at)
 values(v_order.user_id, v_order.pathway_ids, v_order.mentorship, now() + interval '30 days', now())
 on conflict(user_id) do update set
  pathway_ids = case when current_access.expires_at > now() then array(select distinct unnest(current_access.pathway_ids || excluded.pathway_ids)) else excluded.pathway_ids end,
  mentorship = case when current_access.expires_at > now() then current_access.mentorship or excluded.mentorship else excluded.mentorship end,
  expires_at = greatest(current_access.expires_at, now()) + interval '30 days',
  updated_at = now();
 return true;
end;
$$;
revoke all on function public.apply_verified_payment(text, integer, text, text) from public, anon, authenticated;
grant execute on function public.apply_verified_payment(text, integer, text, text) to service_role;
