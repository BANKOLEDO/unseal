// Social layer, local-first: crack history, levels, streaks, volume.
// No accounts, no server. Your record lives on this device.

import type { Currency } from './envelope'

export interface CrackRecord {
  id: string
  title: string
  price: string
  currency: Currency
  hash: string
  demo: boolean
  at: number
}

const KEY = 'unseal:cracks:v1'
const MAX = 100

function readAll(): CrackRecord[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (c): c is CrackRecord =>
        typeof c === 'object' &&
        c !== null &&
        typeof (c as CrackRecord).title === 'string' &&
        typeof (c as CrackRecord).hash === 'string',
    )
  } catch {
    return []
  }
}

export function listCracks(): CrackRecord[] {
  return readAll().sort((a, b) => b.at - a.at)
}

/** Cracks backed by real on-chain payments (demo cracks don't count). */
export function realCracks(): CrackRecord[] {
  return listCracks().filter((c) => !c.demo)
}

export function recordCrack(input: Omit<CrackRecord, 'id' | 'at'>): CrackRecord {
  const entry: CrackRecord = {
    ...input,
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    at: Date.now(),
  }
  const next = [entry, ...readAll()].slice(0, MAX)
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    // storage blocked. The unlock itself already succeeded
  }
  return entry
}

function dayKey(at: number): string {
  return new Date(at).toISOString().slice(0, 10)
}

/** Consecutive UTC days with at least one real crack (streak stays alive if today is empty but yesterday hit). */
export function currentStreak(): number {
  const days = new Set(realCracks().map((c) => dayKey(c.at)))
  if (days.size === 0) return 0
  const cursor = new Date()
  cursor.setUTCHours(0, 0, 0, 0)
  if (!days.has(dayKey(cursor.getTime()))) {
    cursor.setUTCDate(cursor.getUTCDate() - 1)
  }
  let streak = 0
  while (days.has(dayKey(cursor.getTime()))) {
    streak++
    cursor.setUTCDate(cursor.getUTCDate() - 1)
  }
  return streak
}

export interface CrackerLevel {
  name: string
  chip: string
}

export function crackerLevel(count: number): CrackerLevel {
  if (count >= 15) return { name: 'Seal Legend', chip: 'bg-grape text-cream' }
  if (count >= 7) return { name: 'Vault Cracker', chip: 'bg-punch text-cream' }
  if (count >= 3) return { name: 'Seal Breaker', chip: 'bg-butter text-ink' }
  if (count >= 1) return { name: 'Seal Rookie', chip: 'bg-splash text-ink' }
  return { name: 'Uncracked', chip: 'bg-paper text-ink' }
}

export interface CrackStats {
  count: number
  nimVolume: number
  usdtVolume: number
  streak: number
  level: CrackerLevel
}

export function crackStats(): CrackStats {
  const real = realCracks()
  let nimVolume = 0
  let usdtVolume = 0
  for (const c of real) {
    const n = Number(c.price)
    if (!Number.isFinite(n)) continue
    if (c.currency === 'NIM') nimVolume += n
    else usdtVolume += n
  }
  return {
    count: real.length,
    nimVolume,
    usdtVolume,
    streak: currentStreak(),
    level: crackerLevel(real.length),
  }
}
