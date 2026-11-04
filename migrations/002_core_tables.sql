-- 002: the sites, site_checks and events tables, and the public events view (PRD, "Backend schema").
-- RLS is on for every table. lab_public gets no table at all, only views (S1).
-- Agents only insert for now; update rights come when an agent needs them, with a test.

-- The sites Site Doctor watches. Rows come from scripts/seed-sites.ts, never from this file:
-- the repo is public and client names stay out of it.
create table lab.sites (
  id text primary key, -- a short slug, such as 'memory-matters'
  name text not null,
  url text not null check (url ~ '^https?://'),
  is_public boolean not null default false,
  show_live_status boolean not null default false,
  active boolean not null default true,
  report_email text,
  notes text,
  -- Live status is shown only for sites that are public at all.
  constraint live_status_needs_public check (is_public or not show_live_status)
);
alter table lab.sites enable row level security;
grant select on lab.sites to lab_agent, lab_admin;
grant update on lab.sites to lab_admin;
create policy sites_read on lab.sites for select to lab_agent, lab_admin using (true);
create policy sites_admin_update on lab.sites for update to lab_admin using (true) with check (true);

-- One row per check of one site. The key stops a retried run from adding a second row (S10).
create table lab.site_checks (
  site_id text not null references lab.sites (id),
  checked_at timestamptz not null,
  is_up boolean not null,
  response_ms integer check (response_ms >= 0),
  perf_score smallint check (perf_score between 0 and 100),
  a11y_score smallint check (a11y_score between 0 and 100),
  seo_score smallint check (seo_score between 0 and 100),
  ssl_days_left integer,
  broken_links text[] not null default '{}',
  raw_report jsonb,
  primary key (site_id, checked_at)
);
alter table lab.site_checks enable row level security;
grant insert on lab.site_checks to lab_agent;
create policy site_checks_agent_insert on lab.site_checks for insert to lab_agent with check (true);
grant select on lab.site_checks to lab_admin;
create policy site_checks_admin_read on lab.site_checks for select to lab_admin using (true);

-- What agents did, for the ticker on /lab. A null public_text keeps an event off /lab.
-- id is set by the agent (run id plus a counter), so a retried run can't add duplicates (S10).
create table lab.events (
  id text primary key,
  agent_id text not null references lab.agents (id),
  run_id text references lab.runs (id),
  kind text not null,
  created_at timestamptz not null default now(),
  public_text text,
  private_payload jsonb
);
alter table lab.events enable row level security;
grant insert on lab.events to lab_agent;
create policy events_agent_insert on lab.events for insert to lab_agent with check (true);
grant select on lab.events to lab_admin;
create policy events_admin_read on lab.events for select to lab_admin using (true);

-- The latest 50 events that have public text. Public columns only.
-- Like public_state, it runs with its owner's rights, so lab_public needs no access to lab.events.
create view lab.public_events as
select id, agent_id, run_id, kind, created_at, public_text
from lab.events
where public_text is not null
order by created_at desc
limit 50;
grant select on lab.public_events to lab_public, lab_agent, lab_admin;
