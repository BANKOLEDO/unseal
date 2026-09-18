// Fresh demo seals for instant "try it" flows. Demo payouts are simulated
// and never touch real funds, so unsealing one costs nothing.

import { sealSecret } from './crypto'
import { encodeGate } from './envelope'

export const DEMO_TO = `NQ07${'0'.repeat(32)}`

/** Mint a fresh 1-Luna demo seal. Returns the encoded gate for #/s?g=…. */
export async function mintDemoSeal(): Promise<string> {
  const sealed = await sealSecret(
    'You cracked the demo seal! In a real seal this would be the paid content: a link, a password, presale alpha…',
  )
  return encodeGate({
    v: 1,
    title: 'Demo seal (1 NIM, demo payout)',
    kind: 'text',
    price: '1',
    currency: 'NIM',
    to: DEMO_TO,
    sealed,
    at: Date.now(),
  })
}