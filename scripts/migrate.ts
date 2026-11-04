// Applies the numbered SQL files in migrations/ that haven't run yet, one transaction per file.
// Run: node --env-file=.env scripts/migrate.ts DATABASE_URL_OWNER_DEV
// The argument names the variable that holds the owner connection string. There is no default,
// so a migration can't reach production by accident.
import { spawnSync } from 'node:child_process'
import { readdirSync } from 'node:fs'
import { rolePasswordProblems } from '../lib/role-passwords.ts'

const urlVar = process.argv[2]
const url = urlVar ? process.env[urlVar] : undefined
if (!url) {
  console.error('Usage: node --env-file=.env scripts/migrate.ts <VARIABLE_WITH_OWNER_URL>')
  process.exit(1)
}

function psql(args: string[]) {
  const result = spawnSync('psql', [url!, '-X', '-q', '-t', '-A', '-v', 'ON_ERROR_STOP=1', ...args], { encoding: 'utf8' })
  if (result.error) throw new Error(`Couldn't start psql: ${result.error.message}`)
  return result
}

const tracked = psql(['-c', "select to_regclass('lab.schema_migrations') is not null"])
if (tracked.status !== 0) {
  console.error(`Couldn't connect with ${urlVar}:\n${tracked.stderr}`)
  process.exit(1)
}
// Split on \r?\n: psql on Windows ends lines with \r\n.
const applied = new Set(
  tracked.stdout.trim() === 't' ? psql(['-c', 'select version from lab.schema_migrations']).stdout.split(/\r?\n/).filter(Boolean) : [],
)

const files = readdirSync('migrations').filter((f) => /^\d{3}_[a-z0-9_]+\.sql$/.test(f)).sort()
const pending = files.filter((f) => !applied.has(f.slice(0, 3)))
if (pending.length === 0) console.log('No migrations to apply.')

// 001 creates the roles from the three password variables: check them before psql sees them.
if (pending.some((f) => f.startsWith('001_'))) {
  const problems = rolePasswordProblems(process.env)
  if (problems.length) {
    console.error(`Nothing was applied. Fix these in your env file first:\n${problems.map((p) => `- ${p}`).join('\n')}`)
    process.exit(1)
  }
}

for (const file of pending) {
  const version = file.slice(0, 3)
  // -1 wraps the file and the bookkeeping insert in one transaction: all of it applies, or none of it.
  const result = psql(['-1', '-f', `migrations/${file}`, '-c', `insert into lab.schema_migrations (version) values ('${version}')`])
  if (result.status !== 0) {
    console.error(`${file} failed and was rolled back:\n${result.stderr}`)
    process.exit(1)
  }
  console.log(`Applied ${file}`)
}
