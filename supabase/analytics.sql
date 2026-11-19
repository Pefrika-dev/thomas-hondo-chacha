-- ==========================================================================
-- First-party analytics for thomashondochacha.co.ke
-- Run once in the Supabase SQL editor (Project → SQL → New query → Run).
-- Safe to re-run: every statement is idempotent.
--
-- Privacy model:
--   * no cookies, no third-party scripts, no advertising identifiers
--   * a visitor is a salted SHA-256 hash of IP + user agent + UTC day, so the
--     hash cannot be reversed and rotates every day
--   * the raw IP is never stored
--   * browsers sending DNT and opted-out browsers are not tracked at all
-- ==========================================================================

begin;

create table if not exists public.analytics_events (
  id           bigint generated always as identity primary key,
  created_at   timestamptz not null default now(),
  event        text not null,
  path         text not null default '/',
  referrer_host text,
  source       text,
  medium       text,
  campaign     text,
  placement    text,
  lang         text,
  device       text,
  session_id   text,
  visitor_hash text,
  metadata     jsonb not null default '{}'::jsonb
);

-- The API validates the same list; this is the second line of defence.
alter table public.analytics_events drop constraint if exists analytics_event_name;
alter table public.analytics_events add constraint analytics_event_name check (
  event in ('page_view', 'whatsapp_click', 'cta_click', 'contact_click',
            'social_click', 'enquiry_submit', 'chat_open')
);

alter table public.analytics_events drop constraint if exists analytics_text_len;
alter table public.analytics_events add constraint analytics_text_len check (
  char_length(path) <= 300
  and char_length(coalesce(referrer_host, '')) <= 200
  and char_length(coalesce(source, '')) <= 120
  and char_length(coalesce(medium, '')) <= 120
  and char_length(coalesce(campaign, '')) <= 120
  and char_length(coalesce(placement, '')) <= 120
  and char_length(coalesce(lang, '')) <= 12
  and char_length(coalesce(device, '')) <= 20
  and char_length(coalesce(session_id, '')) <= 64
  and char_length(coalesce(visitor_hash, '')) <= 64
);

create index if not exists analytics_events_created_idx
  on public.analytics_events (created_at desc);
create index if not exists analytics_events_event_idx
  on public.analytics_events (event, created_at desc);
create index if not exists analytics_events_path_idx
  on public.analytics_events (path, created_at desc);

alter table public.analytics_events enable row level security;

-- The public site may only append events. It can never read, update or delete.
drop policy if exists "analytics anon insert" on public.analytics_events;
create policy "analytics anon insert"
  on public.analytics_events
  for insert
  to anon
  with check (true);

-- Only a signed-in administrator (the Content Studio login) may read.
drop policy if exists "analytics admin read" on public.analytics_events;
create policy "analytics admin read"
  on public.analytics_events
  for select
  to authenticated
  using (true);

revoke update, delete on public.analytics_events from anon, authenticated;

commit;
