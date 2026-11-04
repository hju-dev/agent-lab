// Adds Henry's sites to lab.sites from a git-ignored file, so client names never enter the public repo.
// Run: node --env-file=.env scripts/seed-sites.ts DATABASE_URL_OWNER_DEV [private/sites.json]
// The format is in scripts/sites.example.json. Existing ids are left alone (insert-or-ignore, S10),
// so running it twice adds nothing. Prints counts only.
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
})
const Sites = z.array(Site).min(1)

const [urlVar, file = 'private/sites.json'] = process.argv.slice(2)
const url = urlVar ? process.env[urlVar] : undefined
if (!url) {
  console.error('Usage: node --env-file=.env scripts/seed-sites.ts <VARIABLE_WITH_OWNER_URL> [private/sites.json]')
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
    has_database boolean, check_url text)
), added as (
  insert into lab.sites (id, name, url, is_public, show_live_status, active, report_email, notes, has_database, check_url)
  select id, name, url, is_public, show_live_status, active, report_email, notes, has_database, check_url from incoming
  on conflict (id) do nothing
  returning 1
)
select count(*) from added;
`
const result = spawnSync('psql', [url, '-X', '-q', '-t', '-A', '-v', 'ON_ERROR_STOP=1', '-v', `sites=${JSON.stringify(parsed.data)}`], {
  input: sql,
  encoding: 'utf8',
})
if (result.error || result.status !== 0) {
  console.error(`Seeding failed: ${result.error?.message ?? result.stderr}`)
  process.exit(1)
}
const added = Number(result.stdout.trim())
console.log(`Sites in file: ${parsed.data.length}. Added: ${added}. Already there: ${parsed.data.length - added}.`)
