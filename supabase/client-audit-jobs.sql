-- ==========================================================================
-- Client audit fix workbench — admin-only job tracking
-- Run once in Supabase SQL editor (Project → SQL → New query → Run).
-- Safe to re-run: every statement is idempotent.
--
-- Only the signed-in administrator can read or change these rows.
-- The public website has no access at all.
-- ==========================================================================

begin;

create table if not exists public.client_audit_jobs (
  id              bigint generated always as identity primary key,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  client_name     text not null default '',
  client_phone    text not null default '',
  client_email    text not null default '',
  domain          text not null,
  scanned_url     text not null default '',
  paid            boolean not null default false,
  paid_at         timestamptz,
  payment_method  text not null default '',
  amount_ksh      integer,
  score           integer,
  overall_label   text not null default '',
  checks          jsonb not null default '[]'::jsonb,
  issue_status    jsonb not null default '{}'::jsonb,
  client_message  text not null default '',
  notes           text not null default ''
);

alter table public.client_audit_jobs drop constraint if exists client_audit_jobs_text_len;
alter table public.client_audit_jobs add constraint client_audit_jobs_text_len check (
  char_length(client_name) <= 120
  and char_length(client_phone) <= 32
  and char_length(client_email) <= 200
  and char_length(domain) between 1 and 300
  and char_length(scanned_url) <= 500
  and char_length(overall_label) <= 60
  and char_length(payment_method) <= 40
  and char_length(client_message) <= 20000
  and char_length(notes) <= 5000
);

alter table public.client_audit_jobs drop constraint if exists client_audit_jobs_score_range;
alter table public.client_audit_jobs add constraint client_audit_jobs_score_range check (
  score is null or (score >= 0 and score <= 100)
);

alter table public.client_audit_jobs drop constraint if exists client_audit_jobs_amount_range;
alter table public.client_audit_jobs add constraint client_audit_jobs_amount_range check (
  amount_ksh is null or amount_ksh >= 0
);

alter table public.client_audit_jobs drop constraint if exists client_audit_jobs_payment_method;
alter table public.client_audit_jobs add constraint client_audit_jobs_payment_method check (
  payment_method in ('', 'mpesa_buy_goods', 'kcb_bank', 'mpesa_send_money', 'other')
);

alter table public.client_audit_jobs drop constraint if exists client_audit_jobs_paid_confirmed;
alter table public.client_audit_jobs add constraint client_audit_jobs_paid_confirmed check (
  not paid or paid_at is not null
);

create index if not exists client_audit_jobs_created_idx
  on public.client_audit_jobs (created_at desc);
create index if not exists client_audit_jobs_domain_idx
  on public.client_audit_jobs (domain, created_at desc);
create index if not exists client_audit_jobs_paid_idx
  on public.client_audit_jobs (paid, created_at desc);

create or replace function public.client_audit_jobs_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists client_audit_jobs_touch on public.client_audit_jobs;
create trigger client_audit_jobs_touch
  before update on public.client_audit_jobs
  for each row execute function public.client_audit_jobs_touch_updated_at();

alter table public.client_audit_jobs enable row level security;

drop policy if exists "client audit jobs admin all" on public.client_audit_jobs;
create policy "client audit jobs admin all"
  on public.client_audit_jobs
  for all
  to authenticated
  using (true)
  with check (true);

revoke all on public.client_audit_jobs from anon;
grant select, insert, update, delete on public.client_audit_jobs to authenticated;

commit;
