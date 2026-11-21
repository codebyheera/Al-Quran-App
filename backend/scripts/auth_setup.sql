-- ============================================================================
-- auth_setup.sql — Login, private profiles and cross-device sync
--
-- Run ONCE in Supabase → SQL Editor → New query → paste all → Run.
-- Safe to re-run: every statement is idempotent.
--
-- Creates:
--   user_bookmarks  bookmarks of logged-in users (ayah reference only)
--   profiles        one row per user (auto-created on first login)
--   user_settings   reader settings (theme, fonts, reciter, …) as JSON
--   user_progress   last reading, streak, tasbih/darood totals as JSON
--   avatars bucket  PRIVATE, 100 KB max per file (browser compresses first)
--   sync_push()     atomic per-key merge for settings/progress sync
--   delete_my_account()  lets a user permanently delete their account
--
-- Every table has Row Level Security: a logged-in user can only ever read or
-- change their OWN rows. Logged-out visitors can't read anything.
-- ============================================================================


-- ── 1. profiles ─────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  name        text check (char_length(name) <= 60),
  email       text,                                   -- copied from Google/GitHub, read-only
  bio         text check (char_length(bio) <= 300),
  avatar_path text check (char_length(avatar_path) <= 200), -- path in the avatars bucket; null = use provider photo
  socials     jsonb not null default '{}'::jsonb
              check (jsonb_typeof(socials) = 'object' and pg_column_size(socials) <= 2048),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles: read own"   on public.profiles;
drop policy if exists "profiles: update own" on public.profiles;
create policy "profiles: read own"   on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy "profiles: update own" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

-- Users may only edit these columns (not id / email / timestamps).
revoke all on public.profiles from anon;
revoke insert, update, delete on public.profiles from authenticated;
grant  select on public.profiles to authenticated;
grant  update (name, bio, avatar_path, socials) on public.profiles to authenticated;


-- ── 2. user_settings ────────────────────────────────────────────────────────
create table if not exists public.user_settings (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  settings   jsonb not null default '{}'::jsonb
             check (jsonb_typeof(settings) = 'object' and pg_column_size(settings) <= 8192),
  updated_at timestamptz not null default now()
);

alter table public.user_settings enable row level security;

drop policy if exists "settings: read own"   on public.user_settings;
drop policy if exists "settings: insert own" on public.user_settings;
drop policy if exists "settings: update own" on public.user_settings;
create policy "settings: read own"   on public.user_settings for select to authenticated using ((select auth.uid()) = user_id);
create policy "settings: insert own" on public.user_settings for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "settings: update own" on public.user_settings for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

revoke all on public.user_settings from anon;
grant select, insert, update on public.user_settings to authenticated;


-- ── 3. user_progress ────────────────────────────────────────────────────────
create table if not exists public.user_progress (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  progress   jsonb not null default '{}'::jsonb
             check (jsonb_typeof(progress) = 'object' and pg_column_size(progress) <= 16384),
  updated_at timestamptz not null default now()
);

alter table public.user_progress enable row level security;

drop policy if exists "progress: read own"   on public.user_progress;
drop policy if exists "progress: insert own" on public.user_progress;
drop policy if exists "progress: update own" on public.user_progress;
create policy "progress: read own"   on public.user_progress for select to authenticated using ((select auth.uid()) = user_id);
create policy "progress: insert own" on public.user_progress for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "progress: update own" on public.user_progress for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

revoke all on public.user_progress from anon;
grant select, insert, update on public.user_progress to authenticated;


-- ── 4. updated_at auto-bump ─────────────────────────────────────────────────
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists profiles_touch      on public.profiles;
drop trigger if exists user_settings_touch on public.user_settings;
drop trigger if exists user_progress_touch on public.user_progress;
create trigger profiles_touch      before update on public.profiles      for each row execute function public.touch_updated_at();
create trigger user_settings_touch before update on public.user_settings for each row execute function public.touch_updated_at();
create trigger user_progress_touch before update on public.user_progress for each row execute function public.touch_updated_at();


-- ── 5. Auto-create a profile on first login ─────────────────────────────────
-- Google sends full_name / name; GitHub sends name / user_name.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, name, email)
  values (
    new.id,
    left(coalesce(
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      nullif(new.raw_user_meta_data ->> 'name', ''),
      nullif(new.raw_user_meta_data ->> 'user_name', ''),
      split_part(new.email, '@', 1)
    ), 60),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Keep profiles.email in sync if the provider email changes.
create or replace function public.handle_user_email_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles set email = new.email where id = new.id;
  return new;
end;
$$;

drop trigger if exists on_auth_user_email_changed on auth.users;
create trigger on_auth_user_email_changed
  after update of email on auth.users
  for each row when (old.email is distinct from new.email)
  execute function public.handle_user_email_change();

-- Backfill: users who logged in before this script ran.
insert into public.profiles (id, name, email)
select u.id,
       left(coalesce(nullif(u.raw_user_meta_data ->> 'full_name', ''),
                     nullif(u.raw_user_meta_data ->> 'name', ''),
                     nullif(u.raw_user_meta_data ->> 'user_name', ''),
                     split_part(u.email, '@', 1)), 60),
       u.email
from auth.users u
on conflict (id) do nothing;


-- ── 6. Avatars bucket (private, 100 KB, images only) ────────────────────────
-- The browser crops + compresses every photo to 320×320 WebP (~20–30 KB)
-- before upload; the 100 KB limit stops anyone bypassing that.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', false, 102400, array['image/webp', 'image/jpeg'])
on conflict (id) do update
  set public = false,
      file_size_limit = 102400,
      allowed_mime_types = array['image/webp', 'image/jpeg'];

-- Files live at avatars/<user-id>/<file>; a user can only touch their own folder.
drop policy if exists "avatars: read own"   on storage.objects;
drop policy if exists "avatars: insert own" on storage.objects;
drop policy if exists "avatars: update own" on storage.objects;
drop policy if exists "avatars: delete own" on storage.objects;
create policy "avatars: read own" on storage.objects for select to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "avatars: insert own" on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "avatars: update own" on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "avatars: delete own" on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);


-- ============================================================================
-- PHASE 3–5: bookmarks sync, settings/progress sync, account deletion
-- ============================================================================

-- ── 7. user_bookmarks (logged-in users) ─────────────────────────────────────
-- Only the ayah reference is stored ("2:255", ~100 bytes/row). The Arabic and
-- translation text come from the app's own Quran data, so 10k users × 50
-- bookmarks ≈ 50 MB instead of ~750 MB.
create table if not exists public.user_bookmarks (
  owner      uuid not null references auth.users (id) on delete cascade,
  post_id    text not null check (post_id ~ '^[0-9]{1,3}:[0-9]{1,3}$'),
  created_at timestamptz not null default now(),
  primary key (owner, post_id)
);

create index if not exists user_bookmarks_owner_created_idx
  on public.user_bookmarks (owner, created_at desc);

alter table public.user_bookmarks enable row level security;

drop policy if exists "bookmarks: read own"   on public.user_bookmarks;
drop policy if exists "bookmarks: insert own" on public.user_bookmarks;
drop policy if exists "bookmarks: delete own" on public.user_bookmarks;
create policy "bookmarks: read own"   on public.user_bookmarks for select to authenticated using ((select auth.uid()) = owner);
create policy "bookmarks: insert own" on public.user_bookmarks for insert to authenticated with check ((select auth.uid()) = owner);
create policy "bookmarks: delete own" on public.user_bookmarks for delete to authenticated using ((select auth.uid()) = owner);

revoke all on public.user_bookmarks from anon;
revoke update on public.user_bookmarks from authenticated;
grant select, insert, delete on public.user_bookmarks to authenticated;

-- Cap per user so one account can't fill the free-tier database.
create or replace function public.limit_user_bookmarks()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (select count(*) from public.user_bookmarks where owner = new.owner) >= 3000 then
    raise exception 'Bookmark limit reached (3000)' using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

drop trigger if exists user_bookmarks_limit on public.user_bookmarks;
create trigger user_bookmarks_limit
  before insert on public.user_bookmarks
  for each row execute function public.limit_user_bookmarks();


-- ── 8. Settings / progress sync ─────────────────────────────────────────────
-- Both docs are { "<localStorage key>": { "v": "<value>", "t": <ms timestamp> } }.
-- Merging is per key, newest timestamp wins, done atomically on the server so
-- two devices saving at the same moment can't overwrite each other's keys.

-- Room for the 60-day reading history (named so it can be changed later).
alter table public.user_progress drop constraint if exists user_progress_progress_check;
alter table public.user_progress drop constraint if exists user_progress_progress_size;
alter table public.user_progress add constraint user_progress_progress_size
  check (jsonb_typeof(progress) = 'object' and pg_column_size(progress) <= 32768);

create or replace function public.merge_sync_doc(doc jsonb, patch jsonb)
returns jsonb
language sql
immutable
set search_path = ''
as $$
  select coalesce(doc, '{}'::jsonb) || coalesce((
    select jsonb_object_agg(p.key, p.value)
    from jsonb_each(coalesce(patch, '{}'::jsonb)) as p(key, value)
    where jsonb_typeof(p.value) = 'object'
      and char_length(p.key) <= 80
      and (
        doc -> p.key is null
        or coalesce((p.value ->> 't')::bigint, 0) >= coalesce((doc -> p.key ->> 't')::bigint, 0)
      )
  ), '{}'::jsonb)
$$;

-- Drops daily counters (keys ending in a date, e.g. tasbih_subhanallah_2026-11-21)
-- older than 8 days, so the progress doc never keeps growing.
create or replace function public.prune_daily_keys(doc jsonb)
returns jsonb
language sql
stable
set search_path = ''
as $$
  select coalesce(jsonb_object_agg(d.key, d.value), '{}'::jsonb)
  from jsonb_each(coalesce(doc, '{}'::jsonb)) as d(key, value)
  where not (
    d.key ~ '_[0-9]{4}-[0-9]{2}-[0-9]{2}$'
    and right(d.key, 10) < to_char(now() - interval '8 days', 'YYYY-MM-DD')
  )
$$;

-- Runs as the caller, so RLS still applies: users only ever touch their own rows.
create or replace function public.sync_push(p_settings jsonb default '{}'::jsonb, p_progress jsonb default '{}'::jsonb)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'Not logged in' using errcode = '42501';
  end if;

  if p_settings is not null and p_settings <> '{}'::jsonb then
    insert into public.user_settings as s (user_id, settings)
    values (uid, public.merge_sync_doc('{}'::jsonb, p_settings))
    on conflict (user_id) do update
      set settings = public.merge_sync_doc(s.settings, p_settings);
  end if;

  if p_progress is not null and p_progress <> '{}'::jsonb then
    insert into public.user_progress as p (user_id, progress)
    values (uid, public.prune_daily_keys(public.merge_sync_doc('{}'::jsonb, p_progress)))
    on conflict (user_id) do update
      set progress = public.prune_daily_keys(public.merge_sync_doc(p.progress, p_progress));
  end if;
end;
$$;

revoke all on function public.sync_push(jsonb, jsonb) from public, anon;
grant execute on function public.sync_push(jsonb, jsonb) to authenticated;


-- ── 9. Delete my account ────────────────────────────────────────────────────
-- Deleting the auth user cascades to profiles, user_settings, user_progress
-- and user_bookmarks. The app removes the user's avatar files first.
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'Not logged in' using errcode = '42501';
  end if;
  delete from auth.users where id = uid;
end;
$$;

revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
