-- ==========================================================================
-- Daily Lead Radar — publicly sourced, admin-only outreach leads
-- Run once in Supabase SQL editor (Project -> SQL -> New query -> Run).
-- Safe to re-run: every statement is idempotent.
--
-- Sources are public OpenStreetMap objects and, where available, a public
-- email address printed on the business's own website. Nothing is invented,
-- nothing is auto-sent, and anonymous visitors have no access.
-- ==========================================================================

begin;

create table if not exists public.outreach_leads (
  id                  bigint generated always as identity primary key,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  scan_date           date not null default current_date,
  source              text not null default 'openstreetmap',
  source_id           text not null,
  source_url          text not null,
  business_name       text not null,
  phone               text not null default '',
  phone_source_url    text not null default '',
  email               text not null default '',
  email_source_url    text not null default '',
  website             text not null default '',
  location            text not null default '',
  business_type       text not null default '',
  service_type        text not null default '',
  service_opportunity text not null default '',
  signal              text not null default '',
  status              text not null default 'new',
  contacted_at        timestamptz,
  notes               text not null default ''
);

alter table public.outreach_leads drop constraint if exists outreach_leads_source_id_key;
alter table public.outreach_leads add constraint outreach_leads_source_id_key unique (source, source_id);

alter table public.outreach_leads drop constraint if exists outreach_leads_text_len;
alter table public.outreach_leads add constraint outreach_leads_text_len check (
  char_length(source) between 1 and 40
  and char_length(source_id) between 1 and 40
  and char_length(source_url) between 1 and 300
  and char_length(business_name) between 1 and 180
  and char_length(phone) <= 32
  and char_length(phone_source_url) <= 500
  and char_length(email) <= 200
  and char_length(email_source_url) <= 500
  and char_length(website) <= 500
  and char_length(location) <= 200
  and char_length(business_type) <= 80
  and char_length(service_type) <= 80
  and char_length(service_opportunity) <= 600
  and char_length(signal) <= 300
  and char_length(status) between 1 and 30
  and char_length(notes) <= 5000
);

alter table public.outreach_leads drop constraint if exists outreach_leads_source_check;
alter table public.outreach_leads add constraint outreach_leads_source_check check (
  source = 'openstreetmap'
);

alter table public.outreach_leads drop constraint if exists outreach_leads_source_id_check;
alter table public.outreach_leads add constraint outreach_leads_source_id_check check (
  source_id ~ '^[nwr]-[1-9][0-9]*$'
);

alter table public.outreach_leads drop constraint if exists outreach_leads_source_url_check;
alter table public.outreach_leads add constraint outreach_leads_source_url_check check (
  source_url like 'https://www.openstreetmap.org/%'
);

alter table public.outreach_leads drop constraint if exists outreach_leads_phone_check;
alter table public.outreach_leads add constraint outreach_leads_phone_check check (
  phone = '' or phone ~ E'^\\+254[17][0-9]{8}$'
);

alter table public.outreach_leads drop constraint if exists outreach_leads_email_check;
alter table public.outreach_leads add constraint outreach_leads_email_check check (
  email = '' or email ~* E'^[^@[:space:]]+@[^@[:space:]]+\\.[A-Za-z]{2,}$'
);

alter table public.outreach_leads drop constraint if exists outreach_leads_status_check;
alter table public.outreach_leads add constraint outreach_leads_status_check check (
  status in ('new', 'contacted', 'replied', 'won', 'lost', 'do_not_contact')
);

create index if not exists outreach_leads_scan_date_idx
  on public.outreach_leads (scan_date desc, created_at desc);
create index if not exists outreach_leads_status_idx
  on public.outreach_leads (status, scan_date desc);
create index if not exists outreach_leads_phone_idx
  on public.outreach_leads (phone);

create or replace function public.outreach_leads_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists outreach_leads_touch on public.outreach_leads;
create trigger outreach_leads_touch
  before update on public.outreach_leads
  for each row execute function public.outreach_leads_touch_updated_at();

alter table public.outreach_leads enable row level security;

drop policy if exists "outreach leads admin all" on public.outreach_leads;
create policy "outreach leads admin all"
  on public.outreach_leads
  for all
  to authenticated
  using (true)
  with check (true);

revoke all on public.outreach_leads from anon;
grant select, insert, update, delete on public.outreach_leads to authenticated;

commit;
