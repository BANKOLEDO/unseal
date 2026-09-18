// Gate envelope: everything the Unlock view needs, packed into the share URL.
// Payload lives in the hash-side query string (`#/s?g=...`) so it is never
// sent to any server. Zero database custody, zero escrow.

import { bytesToB64Url, b64UrlToBytes, type SealedPayload } from './crypto'

export type Currency = 'NIM' | 'USDT'
export type GateKind = 'link' | 'text'

export interface GateEnvelope {
  v: 1
  title: string
  kind: GateKind
  /** Human-unit decimal string, e.g. "12.5" */
  price: string
  currency: Currency
  /** Creator payout address: Nimiq (NQ…) for NIM, 0x… (Polygon) for USDT */
  to: string
  sealed: SealedPayload
  /** Unix ms when the gate was created */
  at: number
}

export const LUNA_PER_NIM = 100_000
export const USDT_DECIMALS = 6
/** Share links above this length get flaky in some WebViews. Warn the creator. */
export const LINK_WARN_LENGTH = 1800

export function nimToLuna(nim: number): number {
  return Math.round(nim * LUNA_PER_NIM)
}

export function lunaToNim(luna: number): number {
  return luna / LUNA_PER_NIM
}

/** Normalize + validate a Nimiq user-friendly address (NQ + 34 chars). */
export function normalizeNimiqAddress(input: string): string | null {
  const compact = input.replace(/[\s-]/g, '').toUpperCase()
  if (!/^NQ[0-9]{2}[0-9A-Z]{32}$/.test(compact)) return null
  // Re-group into the canonical 4-char blocks for display.
  return compact.replace(/(.{4})(?=.)/g, '$1 ')
}

export function isEvmAddress(input: string): boolean {
  return /^0x[0-9a-fA-F]{40}$/.test(input.trim())
}

/** Parse a human price string into a positive number. Returns null if invalid. */
export function parsePrice(input: string): number | null {
  const n = Number(input.trim().replace(',', '.'))
  if (!Number.isFinite(n) || n <= 0) return null
  return n
}

export function validateGate(input: {
  title: string
  kind: GateKind
  price: string
  currency: Currency
  to: string
}): string | null {
  if (input.title.trim().length < 3) return 'Give your seal a title (min 3 characters).'
  if (input.title.trim().length > 80) return 'Keep the title under 80 characters.'
  const price = parsePrice(input.price)
  if (price === null) return 'Enter a valid price greater than zero.'
  if (input.currency === 'NIM') {
    if (nimToLuna(price) < 1) return 'Price is below 1 Luna. Raise it a little.'
    if (normalizeNimiqAddress(input.to) === null)
      return 'That Nimiq address looks off. It should start with NQ…'
  } else {
    if (!isEvmAddress(input.to))
      return 'For USDT, use your 0x… Polygon wallet address.'
    if (price < 0.000001) return 'Price is below 1 micro-USDT. Raise it a little.'
  }
  return null
}

export function encodeGate(envelope: GateEnvelope): string {
  const json = JSON.stringify(envelope)
  return bytesToB64Url(new TextEncoder().encode(json))
}

export function decodeGate(encoded: string): GateEnvelope {
  let json: string
  try {
    json = new TextDecoder().decode(b64UrlToBytes(encoded))
  } catch {
    throw new Error('This seal link is corrupted (bad encoding).')
  }
  let raw: unknown
  try {
    raw = JSON.parse(json)
  } catch {
    throw new Error('This seal link is corrupted (bad payload).')
  }
  if (typeof raw !== 'object' || raw === null) throw new Error('This seal link is corrupted.')
  const e = raw as Record<string, unknown>
  const sealed = e.sealed as Record<string, unknown> | undefined
  if (
    e.v !== 1 ||
    typeof e.title !== 'string' ||
    (e.kind !== 'link' && e.kind !== 'text') ||
    typeof e.price !== 'string' ||
    (e.currency !== 'NIM' && e.currency !== 'USDT') ||
    typeof e.to !== 'string' ||
    typeof sealed?.k !== 'string' ||
    typeof sealed?.iv !== 'string' ||
    typeof sealed?.ct !== 'string'
  ) {
    throw new Error('This seal link is corrupted or from a newer Unseal version.')
  }
  if (parsePrice(e.price) === null) throw new Error('This seal carries an invalid price.')
  return {
    v: 1,
    title: e.title,
    kind: e.kind,
    price: e.price,
    currency: e.currency,
    to: e.to,
    sealed: { k: sealed.k, iv: sealed.iv, ct: sealed.ct },
    at: typeof e.at === 'number' ? e.at : 0,
  }
}

/** Build the full shareable URL for an encoded gate. */
export function buildShareUrl(encoded: string): string {
  const { origin, pathname } = window.location
  return `${origin}${pathname}#/s?g=${encoded}`
}
