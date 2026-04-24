-- Run this once in Supabase SQL Editor for project: wkoohtlkjmkeeirvlcah

create table if not exists public.rankmaster_user_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  app_state jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.rankmaster_user_state enable row level security;

grant usage on schema public to anon, authenticated, service_role;
grant select, insert, update on table public.rankmaster_user_state to authenticated, service_role;

drop policy if exists "rankmaster_select_own_state" on public.rankmaster_user_state;
create policy "rankmaster_select_own_state"
on public.rankmaster_user_state
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "rankmaster_insert_own_state" on public.rankmaster_user_state;
create policy "rankmaster_insert_own_state"
on public.rankmaster_user_state
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "rankmaster_update_own_state" on public.rankmaster_user_state;
create policy "rankmaster_update_own_state"
on public.rankmaster_user_state
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create or replace function public.rankmaster_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists trg_rankmaster_user_state_updated_at on public.rankmaster_user_state;
create trigger trg_rankmaster_user_state_updated_at
before update on public.rankmaster_user_state
for each row
execute function public.rankmaster_set_updated_at();

-- Force PostgREST schema cache reload so the table becomes immediately available via API.
select pg_notify('pgrst', 'reload schema');

-- Sanity check: should return "public.rankmaster_user_state"
select to_regclass('public.rankmaster_user_state');
