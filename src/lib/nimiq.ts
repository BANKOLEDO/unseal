// Nimiq provider access via the official Mini App SDK.
// All wallet operations run inside Nimiq Pay: keys never leave the wallet,
// every payment needs native user approval, and the returned tx hash proves
// broadcast. That hash is what unlocks the seal.

import { init, type ErrorResponse } from '@nimiq/mini-app-sdk'
import { errorMessage } from './format'

type NimiqProvider = Awaited<ReturnType<typeof init>>

function isErrorResponse(value: unknown): value is ErrorResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    'error' in value &&
    typeof (value as ErrorResponse).error?.message === 'string'
  )
}

/** The provider sometimes resolves with { error } instead of rejecting. */
function unwrap<T>(value: T | ErrorResponse, what: string): T {
  if (isErrorResponse(value)) throw new Error(value.error.message || `${what} failed in the wallet.`)
  return value
}

let providerPromise: Promise<NimiqProvider | null> | null = null

/** Resolve the injected Nimiq provider, or null when not inside Nimiq Pay. */
export function getNimiqProvider(timeoutMs = 5000): Promise<NimiqProvider | null> {
  if (!providerPromise) {
    providerPromise = (async () => {
      try {
        return await init({ timeout: timeoutMs })
      } catch {
        return null
      }
    })()
  }
  return providerPromise
}

/** True when running inside Nimiq Pay with an injected wallet provider. */
export async function isInsideNimiqPay(): Promise<boolean> {
  return (await getNimiqProvider(2500)) !== null
}

export async function getWalletAccounts(): Promise<string[]> {
  const nimiq = await getNimiqProvider()
  if (!nimiq) throw new Error('WALLET_MISSING')
  return unwrap(await nimiq.listAccounts(), 'Reading accounts')
}

export interface NimPayment {
  hash: string
  sender: string
}

/**
 * Request a direct NIM payment buyer → creator. Shows the native Nimiq Pay
 * confirmation dialog; resolves with the broadcast tx hash on approval.
 */
export async function sendNimPayment(recipient: string, luna: number): Promise<NimPayment> {
  const nimiq = await getNimiqProvider()
  if (!nimiq) throw new Error('WALLET_MISSING')
  const accounts = unwrap(await nimiq.listAccounts(), 'Reading accounts')
  const sender = accounts[0] ?? 'unknown'
  const hash = unwrap(await nimiq.sendBasicTransaction({ recipient, value: luna }), 'Sending payment')
  if (!hash) throw new Error('EMPTY_TX_HASH')
  return { hash, sender }
}

/**
 * Request a direct NIM payment with an attached on-chain shout.
 * The message rides in the transaction data. The creator (and anyone
 * reading the chain) sees it forever. Social proof, on-chain.
 */
export async function sendNimPaymentWithShout(
  recipient: string,
  luna: number,
  shout: string,
): Promise<NimPayment> {
  const nimiq = await getNimiqProvider()
  if (!nimiq) throw new Error('WALLET_MISSING')
  const accounts = unwrap(await nimiq.listAccounts(), 'Reading accounts')
  const sender = accounts[0] ?? 'unknown'
  const hash = unwrap(
    await nimiq.sendBasicTransactionWithData({ recipient, value: luna, data: shout }),
    'Sending payment',
  )
  if (!hash) throw new Error('EMPTY_TX_HASH')
  return { hash, sender }
}

/** Friendly message for provider errors (rejections, malformed tx, …). */
export function describePaymentError(err: unknown): string {
  const msg = errorMessage(err)
  if (msg === 'WALLET_MISSING')
    return 'No Nimiq wallet found. Open this seal inside Nimiq Pay, or use demo mode.'
  if (/denied|reject|cancel|dismiss/i.test(msg))
    return 'Payment was rejected in the wallet. No funds moved. Try again whenever.'
  if (/invalid|malformed/i.test(msg))
    return 'The wallet refused the transaction data. Double-check the creator address.'
  return msg || 'Payment failed for an unknown reason.'
}
