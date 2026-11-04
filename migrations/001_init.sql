-- 001: the lab schema, the three roles, the agents and runs tables, and the first public view.
-- Apply with scripts/migrate.ts, which runs this file through psql in a single transaction.
-- Role passwords come from the environment (\getenv), never from this file. The repo is public.

\getenv lab_public_password LAB_PUBLIC_PASSWORD
\getenv lab_agent_password LAB_AGENT_PASSWORD
\getenv lab_admin_password LAB_ADMIN_PASSWORD

create role lab_public login password :'lab_public_password';
create role lab_agent login password :'lab_agent_password';
create role lab_admin login password :'lab_admin_password';

create schema lab;
grant usage on schema lab to lab_public, lab_agent, lab_admin;

-- Which migrations have run. Only the owner (the migration role) can see it.
create table lab.schema_migrations (
  version text primary key,
  applied_at timestamptz not null default now()
);
alter table lab.schema_migrations enable row level security;

create table lab.agents (
  id text primary key,
  name text not null,
  role text not null,
  schedule_label text not null,
  enabled boolean not null default true
);
alter table lab.agents enable row level security;
grant select on lab.agents to lab_agent, lab_admin;
create policy agents_read on lab.agents for select to lab_agent, lab_admin using (true);

-- id is the GitHub run id plus attempt, so a retried run can't add a second row (S10).
create table lab.runs (
  id text primary key,
  agent_id text not null references lab.agents (id),
  status text not null check (status in ('running', 'succeeded', 'failed', 'waiting')),
  started_at timestamptz not null,
  finished_at timestamptz,
  public_summary text check (char_length(public_summary) <= 140),
  metrics jsonb not null default '{}',
  error_detail text
);
alter table lab.runs enable row level security;
grant insert on lab.runs to lab_agent;
create policy runs_agent_insert on lab.runs for insert to lab_agent with check (true);
grant select on lab.runs to lab_admin;
create policy runs_admin_read on lab.runs for select to lab_admin using (true);

-- Each enabled agent with its latest finished run. Public columns only.
-- A view runs with its owner's rights, so lab_public can read this without any access to lab.runs.
create view lab.public_state as
select a.id as agent_id, a.name, a.schedule_label, r.status as last_status, r.finished_at as last_run_at, r.public_summary
from lab.agents a
left join lateral (
  select status, finished_at, public_summary
  from lab.runs
  where agent_id = a.id and finished_at is not null
  order by finished_at desc
  limit 1
) r on true
where a.enabled;
grant select on lab.public_state to lab_public, lab_agent, lab_admin;

insert into lab.agents (id, name, role, schedule_label) values
  ('site-doctor', 'Site Doctor', 'Checks client sites and reports problems', 'About hourly'),
  ('lead-scout', 'Lead Scout', 'Audits sites a buyer shared and drafts a proposal', 'Daily');
