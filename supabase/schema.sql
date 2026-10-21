-- AI Skills Academy MVP schema. Run once in a new Supabase project and review before production.
create extension if not exists pgcrypto;
create table if not exists public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 full_name text not null default '',
 role text not null default 'member' check (role in ('member','mentor','admin')),
 created_at timestamptz not null default now()
);
create table if not exists public.member_selections (
 user_id uuid primary key references public.profiles(id) on delete cascade,
 pathway_ids text[] not null default '{}',
 mentorship boolean not null default false,
 quoted_monthly_naira integer not null check (quoted_monthly_naira >= 5000),
 updated_at timestamptz not null default now(),
 constraint valid_pathways check(pathway_ids <@ array['video','graphics','prompting','websites','digital-products']::text[])
);
create table if not exists public.pathways(id text primary key,title text not null,monthly_price_naira integer not null check(monthly_price_naira>=0),published boolean not null default true);
insert into public.pathways(id,title,monthly_price_naira) values
 ('video','AI Video Creation',5000),('graphics','AI Graphics & Design',5000),('prompting','Prompt Engineering',5000),('websites','AI-Assisted Websites',5000),('digital-products','Digital Products & E-books',5000)
on conflict(id) do nothing;
alter table public.profiles enable row level security;
alter table public.member_selections enable row level security;
alter table public.pathways enable row level security;
create policy "profile read own or admin" on public.profiles for select to authenticated using(id=auth.uid() or exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin'));
create policy "profile update own name only" on public.profiles for update to authenticated using(id=auth.uid()) with check(id=auth.uid() and role=(select p.role from public.profiles p where p.id=auth.uid()));
create policy "profile insert self" on public.profiles for insert to authenticated with check(id=auth.uid() and role='member');
create policy "selection read own or admin" on public.member_selections for select to authenticated using(user_id=auth.uid() or exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin'));
create policy "selection insert own" on public.member_selections for insert to authenticated with check(user_id=auth.uid());
create policy "selection update own" on public.member_selections for update to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy "published pathways readable" on public.pathways for select to anon,authenticated using(published=true or exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin'));
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path='' as $$
begin
 insert into public.profiles(id,full_name,role) values(new.id,coalesce(new.raw_user_meta_data->>'full_name',''),'member') on conflict(id) do nothing;
 return new;
end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();
-- Never expose a service-role key in the browser. Set the first admin manually in SQL Editor after creating your account:
-- update public.profiles set role='admin' where id='YOUR-AUTH-USER-UUID';
