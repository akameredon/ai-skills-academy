
-- AI Skills Academy base schema
-- Apply once to a fresh Supabase project.

create extension if not exists pgcrypto;

-- Member profiles: account creation is handled by the auth trigger.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  role text not null default 'member'
    check (role in ('member', 'mentor', 'admin')),
  created_at timestamptz not null default now()
);

-- Learner course selections. Prices here are quotes, not proof of payment.
create table if not exists public.member_selections (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  pathway_ids text[] not null default '{}',
  mentorship boolean not null default false,
  quoted_monthly_naira integer not null check (quoted_monthly_naira >= 5000),
  updated_at timestamptz not null default now(),
  constraint valid_pathways check (
    pathway_ids <@ array[
      'video', 'graphics', 'prompting', 'websites', 'digital-products'
    ]::text[]
  )
);

-- Published course catalogue.
create table if not exists public.pathways (
  id text primary key,
  title text not null,
  monthly_price_naira integer not null check (monthly_price_naira >= 0),
  published boolean not null default true
);

insert into public.pathways (id, title, monthly_price_naira)
values
  ('video', 'AI Video Creation', 5000),
  ('graphics', 'AI Graphics & Design', 5000),
  ('prompting', 'Prompt Engineering', 5000),
  ('websites', 'AI-Assisted Websites', 5000),
  ('digital-products', 'Digital Products & E-books', 5000)
on conflict (id) do nothing;

-- Enable row-level security.
alter table public.profiles enable row level security;
alter table public.member_selections enable row level security;
alter table public.pathways enable row level security;

-- Remove the original policy names if they exist.
drop policy if exists "profile read own or admin" on public.profiles;
drop policy if exists "profile update own name only" on public.profiles;
drop policy if exists "profile insert self" on public.profiles;
drop policy if exists "profile read own" on public.profiles;
drop policy if exists "profile update own name" on public.profiles;
drop policy if exists "selection read own or admin" on public.member_selections;
drop policy if exists "selection insert own" on public.member_selections;
drop policy if exists "selection update own" on public.member_selections;
drop policy if exists "published pathways readable" on public.pathways;

-- Users can read only their own profile.
-- Avoid querying profiles from a policy on profiles, which can recurse.
create policy "profile read own"
on public.profiles for select
to authenticated
using (id = (select auth.uid()));

-- Users may update their own profile, subject to column permissions below.
create policy "profile update own name"
on public.profiles for update
to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

-- Learners can manage only their own selections.
create policy "selection read own"
on public.member_selections for select
to authenticated
using (user_id = (select auth.uid()));

create policy "selection insert own"
on public.member_selections for insert
to authenticated
with check (user_id = (select auth.uid()));

create policy "selection update own"
on public.member_selections for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

-- Anyone can read published pathways.
create policy "published pathways readable"
on public.pathways for select
to anon, authenticated
using (published = true);

-- Remove broad profile write permissions and grant only name updates.
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (full_name) on public.profiles to authenticated;

-- Selections can be managed by their owner under RLS.
revoke all on public.member_selections from anon, authenticated;
grant select, insert, update on public.member_selections to authenticated;

-- The course catalogue is read-only for browser clients.
revoke all on public.pathways from anon, authenticated;
grant select on public.pathways to anon, authenticated;

-- Create a profile for each newly registered user.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    'member'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
