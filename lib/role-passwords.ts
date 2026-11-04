// Migration 001 creates the three roles with passwords from the environment, through psql's \getenv.
// psql can't read some characters (an accented letter, a non-breaking space pasted with the value),
// and a password also goes inside connection strings, where @ : / ? # % break the URL.
// So: letters and digits only, checked before psql runs, with a plain message.

export const ROLE_PASSWORD_VARS = ['LAB_PUBLIC_PASSWORD', 'LAB_AGENT_PASSWORD', 'LAB_ADMIN_PASSWORD'] as const

export function rolePasswordProblems(env: Record<string, string | undefined>): string[] {
  return ROLE_PASSWORD_VARS.flatMap((name) => {
    const value = env[name]
    if (!value) return [`${name} is missing`]
    if (!/^[A-Za-z0-9]+$/.test(value)) return [`${name} may only contain letters A–Z, a–z and digits 0–9 (no spaces or symbols)`]
    return []
  })
}
