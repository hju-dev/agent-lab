-- 004: what Site Doctor's findings need (PRD F1, ADR-0015).
-- perf_range: how far the site's PageSpeed score varied between back-to-back runs (SP2). A drop
-- counts only when it is at least max(10, perf_range). Empty means 10.
alter table lab.sites add column perf_range smallint check (perf_range between 0 and 100);

-- lab_agent reads its own past checks, to spot a site down twice in a row or a sustained score drop.
-- It's still the only role besides admin that can; lab_public still has no access (S1).
grant select on lab.site_checks to lab_agent;
create policy site_checks_agent_read on lab.site_checks for select to lab_agent using (true);
