-- 006: the public site board and stats strip for /lab (PRD F6 and "App flow", Phase 4 v2).
-- Views only: lab_public still gets no table (S1). Each view picks its columns by name.

-- One row per public, active site. Live up/down appears only where the client agreed
-- (show_live_status); otherwise is_up is null, so a short outage never shows as "DOWN" (PRD F6).
create view lab.public_sites as
select
  s.id as site_id,
  s.name,
  u.uptime_30d,
  u.checks_30d,
  u.last_checked_at,
  p.perf_score,
  p.perf_checked_at,
  case when s.show_live_status then l.is_up end as is_up
from lab.sites s
left join lateral (
  select
    round(100.0 * count(*) filter (where c.is_up) / nullif(count(*), 0), 1) as uptime_30d,
    count(*) as checks_30d,
    max(c.checked_at) as last_checked_at
  from lab.site_checks c
  where c.site_id = s.id and c.checked_at > now() - interval '30 days'
) u on true
left join lateral (
  select c.perf_score, c.checked_at as perf_checked_at
  from lab.site_checks c
  where c.site_id = s.id and c.perf_score is not null
  order by c.checked_at desc
  limit 1
) p on true
left join lateral (
  select c.is_up from lab.site_checks c where c.site_id = s.id order by c.checked_at desc limit 1
) l on true
where s.is_public and s.active;
grant select on lab.public_sites to lab_public, lab_agent, lab_admin;

-- One row of totals for the stats strip. Counts across all active sites, private ones included,
-- reveal no names: only how many sites there are and how often they were up.
create view lab.public_stats as
select
  (select count(*) from lab.runs where finished_at > now() - interval '7 days') as runs_this_week,
  (select count(*) from lab.sites where active) as sites_monitored,
  (select round(100.0 * count(*) filter (where is_up) / nullif(count(*), 0), 1)
     from lab.site_checks where checked_at > now() - interval '30 days') as uptime_30d;
grant select on lab.public_stats to lab_public, lab_agent, lab_admin;
