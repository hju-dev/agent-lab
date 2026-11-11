// S2: public text (run summaries, ticker lines) must never hold a web address, an email address or a
// site's or lead's name. Checked before anything is saved; /api/lab checks again on the way out.

const URL_OR_EMAIL = /https?:\/\/|www\.|@|\b[a-z0-9-]+\.(?:com|net|org|io|dev|app|co|th|uk|info|biz)\b/i

export type NamedSite = { id: string; url: string; name?: string | null }

// The words that would identify a site: its id, its name, its host and the host without the ending.
export function identifyingWords(sites: NamedSite[]): string[] {
  return sites.flatMap((s) => {
    const host = (() => {
      try {
        return new URL(s.url).hostname.replace(/^www\./, '')
      } catch {
        return ''
      }
    })()
    return [s.id, s.name ?? '', host, host.split('.')[0] ?? ''].filter((w) => w.length >= 3)
  })
}

// Returns the text if it's safe to show publicly, or null if it isn't.
export function safePublicText(text: string, forbiddenWords: string[]): string | null {
  if (URL_OR_EMAIL.test(text)) return null
  const lower = text.toLowerCase()
  return forbiddenWords.some((w) => lower.includes(w.toLowerCase())) ? null : text
}
