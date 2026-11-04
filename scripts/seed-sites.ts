// Adds Henry's sites to lab.sites from a git-ignored file, so client names never enter the public repo.
// Run: node --env-file=.env scripts/seed-sites.ts DATABASE_URL_OWNER_DEV [private/sites.json]
// The format is in scripts/sites.example.json. Existing ids are left alone (insert-or-ignore, S10),
// so running it twice adds nothing. Add --update to also overwrite existing sites with the file's values,
// for example to set a site's perf_range. Prints counts only.
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { z } from 'zod'

const Site = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/, 'id must be a lowercase slug, such as memory-matters'),
  name: z.string().min(1),
  url: z.url({ protocol: /^https?$/, message: 'url must start with http:// or https://' }),
  is_public: z.boolean().default(false),
  show_live_status: z.boolean().default(false),
  active: z.boolean().default(true),
  report_email: z.email().optional(),
  notes: z.string().optional(),
  has_database: z.boolean().default(true), // S43: checked on a static URL, not the home page
  check_url: z.url({ protocol: /^https?$/, message: 'check_url must start with http:// or https://' }).optional(),
  perf_range: z.number().int().min(0).max(100).optional(), // SP2's measured score range (ADR-0015)
})
const Sites = z.array(Site).min(1)

const args = process.argv.slice(2)
const update = args.includes('--update')
const [urlVar, file = 'private/sites.json'] = args.filter((a) => a !== '--update')
const url = urlVar ? process.env[urlVar] : undefined
if (!url) {
  console.error('Usage: node --env-file=.env scripts/seed-sites.ts <VARIABLE_WITH_OWNER_URL> [private/sites.json] [--update]')
  process.exit(1)
}

let raw: unknown
try {
  raw = JSON.parse(readFileSync(file, 'utf8'))
} catch (err) {
  console.error(`Couldn't read ${file}: ${(err as Error).message}`)
  process.exit(1)
}
const parsed = Sites.safeParse(raw)
if (!parsed.success) {
  // Field paths and messages only, never the values, which may be client details.
  console.error(`${file} isn't valid:\n${parsed.error.issues.map((i) => `- row ${i.path.join('.')}: ${i.message}`).join('\n')}`)
  process.exit(1)
}

// The JSON goes in as one psql variable, quoted by psql itself, so no value is pasted into SQL.
const sql = `
with incoming as (
  select * from jsonb_to_recordset(:'sites'::jsonb) as s(
    id text, name text, url text, is_public boolean, show_live_status boolean, active boolean, report_email text, notes text,
    has_database boolean, check_url text, perf_range smallint)
), written as (
  insert into lab.sites (id, name, url, is_public, show_live_status, active, report_email, notes, has_database, check_url, perf_range)
  select id, name, url, is_public, show_live_status, active, report_email, notes, has_database, check_url, perf_range from incoming
  ${
    update
      ? `on conflict (id) do update set name = excluded.name, url = excluded.url, is_public = excluded.is_public,
    show_live_status = excluded.show_live_status, active = excluded.active, report_email = excluded.report_email,
    notes = excluded.notes, has_database = excluded.has_database, check_url = excluded.check_url, perf_range = excluded.perf_range`
      : 'on conflict (id) do nothing'
  }
  returning (xmax = 0) as is_new
)
select count(*) filter (where is_new) || ' ' || count(*) filter (where not is_new) from written;
`
const result = spawnSync('psql', [url, '-X', '-q', '-t', '-A', '-v', 'ON_ERROR_STOP=1', '-v', `sites=${JSON.stringify(parsed.data)}`], {
  input: sql,
  encoding: 'utf8',
})
if (result.error || result.status !== 0) {
  console.error(`Seeding failed: ${result.error?.message ?? result.stderr}`)
  process.exit(1)
}
const [added, updated] = result.stdout.trim().split(' ').map(Number) as [number, number]
console.log(
  update
    ? `Sites in file: ${parsed.data.length}. Added: ${added}. Updated: ${updated}.`
    : `Sites in file: ${parsed.data.length}. Added: ${added}. Already there: ${parsed.data.length - added}.`,
)
