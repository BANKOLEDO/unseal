// "My Seals": gates created on this device, kept in localStorage.
// Only metadata is stored; the full link is re-openable from here.

import type { Currency, GateKind } from './envelope'

export interface SavedSeal {
  id: string
  title: string
  kind: GateKind
  price: string
  currency: Currency
  to: string
  encoded: string
  at: number
}

const KEY = 'unseal:my-seals:v1'
const MAX = 50

function readAll(): SavedSeal[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (s): s is SavedSeal =>
        typeof s === 'object' &&
        s !== null &&
        typeof (s as SavedSeal).encoded === 'string' &&
        typeof (s as SavedSeal).title === 'string',
    )
  } catch {
    return []
  }
}

export function listSeals(): SavedSeal[] {
  return readAll().sort((a, b) => b.at - a.at)
}

export function saveSeal(seal: Omit<SavedSeal, 'id' | 'at'>): SavedSeal {
  const entry: SavedSeal = {
    ...seal,
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    at: Date.now(),
  }
  const next = [entry, ...readAll()].slice(0, MAX)
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    // Storage full/blocked. The share link itself still works.
  }
  return entry
}

export function removeSeal(id: string): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(readAll().filter((s) => s.id !== id)))
  } catch {
    // ignore
  }
}
