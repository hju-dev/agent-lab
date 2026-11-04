-- 003: where Site Doctor's hourly uptime check points (S43, PRD F1).
-- A site with a database is checked on a static URL, never its home page, so hourly checks
-- can't keep the client's Neon database awake. has_database defaults to true, so a new site
-- is treated the safe way unless someone says otherwise.
alter table lab.sites add column has_database boolean not null default true;
-- Optional override for the static URL. Empty means <site origin>/robots.txt.
alter table lab.sites add column check_url text check (check_url ~ '^https?://');
