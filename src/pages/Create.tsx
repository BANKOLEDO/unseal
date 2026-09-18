import {
  ArrowPathIcon,
  BanknotesIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  LinkIcon,
  LockClosedIcon,
  WalletIcon,
} from '@heroicons/react/24/outline'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CopyField } from '../components/CopyField'
import { NeoButton } from '../components/NeoButton'
import { SealIntact } from '../components/SealMark'
import { SealQR } from '../components/SealQR'
import { StackLines } from '../components/StackLines'
import { Sticker } from '../components/Sticker'
import { sealSecret } from '../lib/crypto'
import {
  LINK_WARN_LENGTH,
  buildShareUrl,
  encodeGate,
  normalizeNimiqAddress,
  validateGate,
  type Currency,
  type GateKind,
} from '../lib/envelope'
import { getWalletAccounts } from '../lib/nimiq'
import { getEvmAccounts } from '../lib/evm'
import { saveSeal } from '../lib/store'

type Phase = 'form' | 'sealing' | 'done'

interface Result {
  link: string
  longLink: boolean
}

const inputCls =
  'min-h-[48px] w-full border-2 border-ink bg-paper px-3 py-2 text-base font-medium placeholder:text-ink/40'

export function Create() {
  const [title, setTitle] = useState('')
  const [kind, setKind] = useState<GateKind>('link')
  const [secret, setSecret] = useState('')
  const [price, setPrice] = useState('')
  const [currency, setCurrency] = useState<Currency>('NIM')
  const [to, setTo] = useState('')
  const [error, setError] = useState('')
  const [phase, setPhase] = useState<Phase>('form')
  const [result, setResult] = useState<Result | null>(null)
  const [walletState, setWalletState] = useState<'idle' | 'loading' | 'missing'>('idle')

  async function useWalletAddress() {
    setWalletState('loading')
    setError('')
    try {
      if (currency === 'USDT') {
        const accounts = await getEvmAccounts()
        if (accounts.length === 0) {
          setError('Wallet returned no addresses. Unlock MetaMask and try again, or paste manually.')
          setWalletState('idle')
          return
        }
        setTo(accounts[0])
        setWalletState('idle')
        return
      }
      const accounts = await getWalletAccounts()
      if (accounts.length === 0) {
        setError('Wallet returned no addresses. Add an account in Nimiq Pay first.')
        setWalletState('idle')
        return
      }
      setTo(accounts[0])
      setWalletState('idle')
    } catch {
      setWalletState('missing')
      setError(
        currency === 'USDT'
          ? 'No EVM wallet found. Install MetaMask, or paste the address manually.'
          : 'No wallet found. Open Unseal inside Nimiq Pay to pull your address, or paste it manually.',
      )
    }
  }

  async function onSeal(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    let payload = secret.trim()
    if (!payload) {
      setError(kind === 'link' ? 'Paste the link you want to lock.' : 'Write the secret text you want to lock.')
      return
    }
    if (kind === 'link' && !/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(payload)) {
      payload = `https://${payload}`
    }

    const err = validateGate({ title, kind, price, currency, to })
    if (err) {
      setError(err)
      return
    }

    setPhase('sealing')
    try {
      const sealed = await sealSecret(payload)
      const normalizedTo =
        currency === 'NIM' ? (normalizeNimiqAddress(to) ?? to.trim()) : to.trim()
      const encoded = encodeGate({
        v: 1,
        title: title.trim(),
        kind,
        price: price.trim().replace(',', '.'),
        currency,
        to: normalizedTo,
        sealed,
        at: Date.now(),
      })
      saveSeal({
        title: title.trim(),
        kind,
        price: price.trim().replace(',', '.'),
        currency,
        to: normalizedTo,
        encoded,
      })
      const link = buildShareUrl(encoded)
      setResult({ link, longLink: link.length > LINK_WARN_LENGTH })
      setPhase('done')
    } catch (err2) {
      setError(err2 instanceof Error ? err2.message : 'Sealing failed. Try again.')
      setPhase('form')
    }
  }

  function reset() {
    setTitle('')
    setSecret('')
    setPrice('')
    setTo('')
    setError('')
    setResult(null)
    setPhase('form')
  }

  if (phase === 'done' && result) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-5">
        <div className="border-2 border-ink bg-white p-5 shadow-neo-lg">
          <div className="flex items-start justify-between gap-3">
            <Sticker colorClass="bg-kelly text-cream" rotate={-2}>
              ✓ sealed!
            </Sticker>
          </div>
          <StackLines
            className="mt-4 text-4xl leading-[0.95]"
            lines={[
              { text: 'SEALED.', colorClass: 'text-grape' },
              { text: "NOW GO BANK.", colorClass: 'text-kelly' },
            ]}
          />
          <p className="mt-2 text-sm">
            Share this link anywhere. Buyers pay <strong>{to.trim().slice(0, 12)}…</strong>{' '}
            directly. You keep 100% of every crack.
          </p>
          <div className="mt-5">
            <CopyField value={result.link} label="Shareable seal link" />
          </div>
          <div className="mt-4">
            <SealQR value={result.link} caption="Scan with your phone to crack it in Nimiq Pay" />
          </div>
          {result.longLink && (
            <p className="mt-3 border-2 border-ink bg-butter p-3 text-sm font-bold">
              Heads-up: this link is {result.link.length} characters. Some chat apps truncate
              very long links. Shorter secrets make shorter links.
            </p>
          )}
          <div className="mt-4 flex flex-col gap-2">
            <Link to={`/s?g=${result.link.split('g=')[1]}`} className="w-full">
              <NeoButton tone="grape" className="w-full text-sm!">
                Preview the locked seal
              </NeoButton>
            </Link>
            <NeoButton tone="paper" onClick={reset} className="w-full text-sm!">
              <ArrowPathIcon className="h-5 w-5" /> Seal another
            </NeoButton>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-5">
      <div className="flex items-center gap-3">
        <SealIntact className="h-12 w-12 shrink-0" />
        <div>
          <StackLines
            className="text-2xl leading-[0.95]"
            lines={[
              { text: 'SEAL', colorClass: 'text-grape' },
              { text: 'SOMETHING.', colorClass: 'text-punch' },
            ]}
          />
          <p className="mt-1 text-sm font-medium">Encrypted in your browser. Paid to your wallet.</p>
        </div>
      </div>

      <form
        onSubmit={onSeal}
        className="mt-4 space-y-4 border-2 border-ink bg-white p-4 shadow-neo-lg"
      >
        {/* Title */}
        <div>
          <label htmlFor="seal-title" className="mb-1 block font-display text-xs font-extrabold tracking-wider uppercase">
            Title <span className="text-punch">*</span>
          </label>
          <input
            id="seal-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. My secret mixtape link"
            maxLength={80}
            className={inputCls}
          />
        </div>

        {/* Kind toggle */}
        <div>
          <span className="mb-1 block font-display text-xs font-extrabold tracking-wider uppercase">
            What are you locking?
          </span>
          <div className="grid grid-cols-2 gap-1.5">
            {(['link', 'text'] as GateKind[]).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setKind(k)}
                aria-pressed={kind === k}
                className={`inline-flex min-h-[48px] w-full cursor-pointer items-center justify-center gap-1 border-2 border-ink px-1 font-display text-[11px] font-extrabold whitespace-nowrap uppercase ${
                  kind === k ? 'bg-ink text-cream shadow-none' : 'bg-paper shadow-neo-sm'
                }`}
              >
                {k === 'link' ? (
                  <>
                    <LinkIcon className="h-3 w-3 shrink-0" /> Link / URL
                  </>
                ) : (
                  <>
                    <DocumentTextIcon className="h-3 w-3 shrink-0" /> Secret text
                  </>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Secret */}
        <div>
          <label htmlFor="seal-secret" className="mb-1 block font-display text-xs font-extrabold tracking-wider uppercase">
            {kind === 'link' ? 'Link to lock' : 'Secret text'} <span className="text-punch">*</span>
          </label>
          {kind === 'link' ? (
            <input
              id="seal-secret"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="https://…"
              inputMode="url"
              className={inputCls}
            />
          ) : (
            <textarea
              id="seal-secret"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="The secret… (passwords, alpha, early access…)"
              rows={4}
              maxLength={1200}
              className={`${inputCls} resize-y`}
            />
          )}
          {kind === 'text' && (
            <p className="mt-1 text-xs font-bold text-ink/60">{secret.length}/1200 · shorter = shorter link</p>
          )}
        </div>

        {/* Price + currency */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="seal-price" className="mb-1 block font-display text-xs font-extrabold tracking-wider uppercase">
              Unlock price <span className="text-punch">*</span>
            </label>
            <input
              id="seal-price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder={currency === 'NIM' ? 'e.g. 10' : 'e.g. 0.5'}
              inputMode="decimal"
              className={inputCls}
            />
          </div>
          <div>
            <span className="mb-1 block font-display text-xs font-extrabold tracking-wider uppercase">
              Currency
            </span>
            <div className="grid grid-cols-2 gap-2">
              {(['NIM', 'USDT'] as Currency[]).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCurrency(c)}
                  aria-pressed={currency === c}
                  className={`min-h-[48px] cursor-pointer border-2 border-ink px-4 font-display text-sm font-extrabold tracking-wider ${
                    currency === c ? 'bg-butter shadow-none' : 'bg-paper shadow-neo-sm'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Payout address */}
        <div>
          <label htmlFor="seal-to" className="mb-1 block font-display text-xs font-extrabold tracking-wider uppercase">
            Your payout address <span className="text-punch">*</span>
          </label>
          <input
            id="seal-to"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder={currency === 'NIM' ? 'NQ… (your Nimiq address)' : '0x… (your Polygon address)'}
            className={`${inputCls} font-mono text-sm`}
            autoComplete="off"
            spellCheck={false}
          />
          <button
            type="button"
            onClick={useWalletAddress}
            disabled={walletState === 'loading'}
            className="mt-2 inline-flex min-h-[44px] cursor-pointer items-center gap-1 border-2 border-ink bg-splash px-3 py-1 font-display text-xs font-extrabold tracking-wider uppercase shadow-neo-sm transition-transform active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-60"
          >
            <WalletIcon className="h-4 w-4" />
            {walletState === 'loading' ? 'Reading wallet…' : 'Use my wallet address'}
          </button>
          {walletState === 'missing' && (
            <p className="mt-1 text-xs font-bold">Wallet not detected. Paste the address manually.</p>
          )}
          <p className="mt-2 flex items-start gap-1.5 border-2 border-dashed border-ink bg-paper p-2 text-xs font-bold">
            <BanknotesIcon className="h-4 w-4 shrink-0" />
            <span>100% of every unlock goes here. Unseal takes 0% and never holds funds.</span>
          </p>
        </div>

        {error && (
          <p role="alert" className="border-2 border-ink bg-punch p-3 text-sm font-bold text-cream">
            {error}
          </p>
        )}

        <NeoButton type="submit" tone="punch" disabled={phase === 'sealing'} className="w-full text-lg">
          {phase === 'sealing' ? (
            <>
              <CheckCircleIcon className="h-5 w-5 animate-pulse" /> Stamping…
            </>
          ) : (
            <>
              <LockClosedIcon className="h-5 w-5" /> Seal it: get the link
            </>
          )}
        </NeoButton>
      </form>
    </div>
  )
}
