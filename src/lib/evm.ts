// USDT payments through the injected EIP-1193 provider (window.ethereum).
// Same zero-escrow story as NIM: an ERC-20 `transfer` straight to the
// creator's Polygon address, approved in Nimiq Pay's native dialog.

import { encodeFunctionData, parseUnits, type Hex } from 'viem'
import { errorMessage } from './format'

/** USDT on Polygon, 6 decimals. */
export const USDT_POLYGON: Hex = '0xc2132D05D31c914a87C6611C10748AEb04B58e8F'
export const POLYGON_CHAIN_ID = '0x89'
export const USDT_DECIMALS = 6

const ERC20_TRANSFER_ABI = [
  {
    name: 'transfer',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'value', type: 'uint256' },
    ],
    outputs: [{ type: 'bool' }],
  },
] as const

interface Eip1193 {
  request: (args: { method: string; params?: unknown }) => Promise<unknown>
}

function getEthereum(): Eip1193 | null {
  const w = window as unknown as Record<string, unknown>
  const eth = w.ethereum as Eip1193 | undefined
  return eth && typeof eth.request === 'function' ? eth : null
}

export function hasEvmProvider(): boolean {
  return getEthereum() !== null
}

/** Request the connected EVM accounts. Prompts MetaMask on first call. */
export async function getEvmAccounts(): Promise<string[]> {
  const eth = getEthereum()
  if (!eth) throw new Error('EVM_MISSING')
  const accounts = (await eth.request({ method: 'eth_requestAccounts' })) as unknown
  return Array.isArray(accounts) ? (accounts as string[]) : []
}

export interface UsdtPayment {
  hash: string
  sender: string
}

/** Request a direct USDT transfer buyer → creator on Polygon. */
export async function sendUsdtPayment(
  recipient: string,
  amountHuman: string,
): Promise<UsdtPayment> {
  const eth = getEthereum()
  if (!eth) throw new Error('EVM_MISSING')

  const accounts = (await eth.request({ method: 'eth_requestAccounts' })) as string[]
  const from = accounts[0]
  if (!from) throw new Error('No EVM account returned by the wallet.')

  const chainId = (await eth.request({ method: 'eth_chainId' })) as string
  if (typeof chainId === 'string' && chainId.toLowerCase() !== POLYGON_CHAIN_ID) {
    await eth.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: POLYGON_CHAIN_ID }],
    })
  }

  const data = encodeFunctionData({
    abi: ERC20_TRANSFER_ABI,
    functionName: 'transfer',
    args: [recipient as Hex, parseUnits(amountHuman, USDT_DECIMALS)],
  })

  const hash = (await eth.request({
    method: 'eth_sendTransaction',
    params: [{ from, to: USDT_POLYGON, data, value: '0x0' }],
  })) as string
  if (!hash) throw new Error('EMPTY_TX_HASH')
  return { hash, sender: from }
}

export function describeEvmError(err: unknown): string {
  const msg = errorMessage(err)
  if (msg === 'EVM_MISSING')
    return 'No EVM wallet found. Open this seal inside Nimiq Pay, or use demo mode.'
  if (/denied|reject|cancel|dismiss|user/i.test(msg) && /action|transaction|request/i.test(msg))
    return 'Payment was rejected in the wallet. No funds moved. Try again whenever.'
  if (/rejected/i.test(msg))
    return 'Payment was rejected in the wallet. No funds moved. Try again whenever.'
  return msg || 'USDT payment failed for an unknown reason.'
}
