// Tiny formatting helpers.

/** Shorten an address like "NQ32 ABCD … WXYZ" for badges. */
export function shortAddress(addr: string): string {
  const t = addr.trim()
  if (t.length <= 14) return t
  return `${t.slice(0, 8)}…${t.slice(-4)}`
}

/** Shorten a tx hash like "a1b2…9f". */
export function shortHash(hash: string): string {
  const t = hash.trim()
  if (t.length <= 12) return t
  return `${t.slice(0, 6)}…${t.slice(-4)}`
}

/** Format a human price string with its currency symbol. */
export function formatPrice(price: string, currency: 'NIM' | 'USDT'): string {
  const n = Number(price)
  const shown = Number.isFinite(n)
    ? n.toLocaleString('en-US', { maximumFractionDigits: 6 })
    : price
  return currency === 'NIM' ? `${shown} NIM` : `${shown} USDT`
}

/** Fake a broadcast hash for demo mode (clearly marked, off-chain). */
export function demoTxHash(): string {
  const bytes = globalThis.crypto.getRandomValues(new Uint8Array(16))
  return `demo-${Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')}`
}

/** Deep link to a transaction on its chain's public explorer. */
export function explorerUrl(hash: string, currency: 'NIM' | 'USDT'): string {
  return currency === 'NIM'
    ? `https://explorer.nimiq.com/#/tx/${hash}`
    : `https://polygonscan.com/tx/${hash}`
}

export function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

/** Turn anything a wallet throws (Error, string, EIP-1193 object) into text. */
export function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message
  if (typeof err === 'string') return err
  if (typeof err === 'object' && err !== null) {
    const o = err as Record<string, unknown>
    if (typeof o.message === 'string' && o.message) return o.message
    if (typeof o.code !== 'undefined') {
      return o.code === 4001 ? 'User rejected the request.' : `Wallet error ${String(o.code)}.`
    }
    try {
      const s = JSON.stringify(o)
      return s && s !== '{}' ? s : 'Unknown wallet error.'
    } catch {
      return 'Unknown wallet error.'
    }
  }
  return String(err)
}
