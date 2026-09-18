// Anonymous open counting via Umami (cookie-free, open source).
// Off until the owner pastes a website ID below.
//
// Privacy rules, enforced here:
// - The gate payload lives in the URL hash, so hashes are never collected.
// - Query strings are excluded too. No wallets, keys, or contents ever leave.
// - Do Not Track is respected. Set UMAMI_DOMAINS to count prod only.

/** Umami website ID from cloud.umami.is. Null = counting off. */
export const UMAMI_WEBSITE_ID: string | null =
  import.meta.env.VITE_UMAMI_WEBSITE_ID?.trim() || null

/** Comma-separated prod domains, e.g. 'unseal.app,www.unseal.app'. Empty = all. */
export const UMAMI_DOMAINS: string = import.meta.env.VITE_UMAMI_DOMAINS?.trim() || ''

const UMAMI_SRC = 'https://cloud.umami.is/script.js'

let started = false

export function initAnalytics(): void {
  if (started || typeof document === 'undefined' || !UMAMI_WEBSITE_ID) return
  started = true
  const s = document.createElement('script')
  s.defer = true
  s.src = UMAMI_SRC
  s.setAttribute('data-website-id', UMAMI_WEBSITE_ID)
  s.setAttribute('data-exclude-hash', 'true')
  s.setAttribute('data-exclude-search', 'true')
  s.setAttribute('data-do-not-track', 'true')
  if (UMAMI_DOMAINS) s.setAttribute('data-domains', UMAMI_DOMAINS)
  document.head.appendChild(s)
}
