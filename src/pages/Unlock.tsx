import {
  ArrowTopRightOnSquareIcon,
  BeakerIcon,
  CheckCircleIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  LockClosedIcon,
  MegaphoneIcon,
  ShareIcon,
} from '@heroicons/react/24/outline'
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CopyField } from '../components/CopyField'
import { NeoButton } from '../components/NeoButton'
import { FolderMark } from '../components/SealMark'
import { SealQR } from '../components/SealQR'
import { TabBar } from '../components/TabBar'
import { Sticker } from '../components/Sticker'
import { useMiniAppEnv } from '../hooks/useMiniAppEnv'
import { UnlockSeal } from '../components/UnlockSeal'
import { unsealSecret } from '../lib/crypto'
import {
  decodeGate,
  nimToLuna,
  parsePrice,
  type GateEnvelope,
} from '../lib/envelope'
import { describeEvmError, hasEvmProvider, sendUsdtPayment } from '../lib/evm'
import { demoTxHash, errorMessage, explorerUrl, formatPrice, shortAddress, shortHash, sleep } from '../lib/format'
import { describePaymentError, sendNimPayment, sendNimPaymentWithShout } from '../lib/nimiq'
import { bragMessage, shareBrag } from '../lib/share'
import { crackerLevel, realCracks, recordCrack } from '../lib/social'
import { tipAddress, tipPresets } from '../lib/tips'

type Phase = 'locked' | 'paying' | 'broken'

interface Receipt {
  hash: string
  sender: string
  demo: boolean
  /** Optional keep-alive tip: separate tx, never part of the seal price. */
  tip?: { amount: string; hash: string }
}

function isSafeHttpUrl(s: string): boolean {
  try {
    const u = new URL(s)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

export function Unlock() {
  const [params] = useSearchParams()
  const raw = params.get('g')

  if (!raw) {
    return <BrokenSeal message="No seal found in this link. Ask the creator for the full share URL." />
  }
  let envelope: GateEnvelope
  try {
    envelope = decodeGate(raw)
  } catch (e) {
    return <BrokenSeal message={e instanceof Error ? e.message : 'Broken seal link.'} />
  }
  // Keyed by payload: opening a different seal mounts a fresh screen.
  return <UnlockScreen key={raw} envelope={envelope} />
}

function BrokenSeal({ message }: { message: string }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="border-2 border-ink bg-white p-8 text-center shadow-neo-lg">
        <ExclamationTriangleIcon className="mx-auto h-14 w-14 text-punch" />
        <h1 className="font-display mt-4 text-3xl font-extrabold">THIS SEAL IS BROKEN</h1>
        <p className="mx-auto mt-2 max-w-sm text-sm">{message}</p>
        <Link to="/" className="mt-6 inline-block">
          <NeoButton tone="grape">Back home</NeoButton>
        </Link>
      </div>
    </div>
  )
}

function UnlockScreen({ envelope }: { envelope: GateEnvelope }) {
  const env = useMiniAppEnv()
  const [phase, setPhase] = useState<Phase>('locked')
  const [plaintext, setPlaintext] = useState('')
  const [receipt, setReceipt] = useState<Receipt | null>(null)
  const [error, setError] = useState('')
  const [burstKey, setBurstKey] = useState(0)
  const [shout, setShout] = useState('')
  const [crackNo, setCrackNo] = useState(0)
  const [shareState, setShareState] = useState<'idle' | 'done' | 'manual'>('idle')
  const [tipAmount, setTipAmount] = useState(0)
  const [tipNote, setTipNote] = useState('')

  // Optional tip. Separate tx, never blocks the reveal.
  async function maybeTip(real: boolean): Promise<{ amount: string; hash: string } | undefined> {
    if (!real || tipAmount <= 0) return undefined
    const addr = tipAddress(envelope.currency)
    if (!addr) return undefined
    try {
      if (envelope.currency === 'NIM') {
        const t = await sendNimPayment(addr, nimToLuna(tipAmount))
        return { amount: String(tipAmount), hash: t.hash }
      }
      const t = await sendUsdtPayment(addr, String(tipAmount))
      return { amount: String(tipAmount), hash: t.hash }
    } catch {
      setTipNote('Tip skipped. The creator was still paid in full.')
      return undefined
    }
  }

  async function pay(real: boolean) {
    setError('')
    setTipNote('')
    setPhase('paying')
    try {
      let r: Receipt
      if (!real) {
        await sleep(1400)
        r = { hash: demoTxHash(), sender: 'demo-wallet', demo: true }
      } else if (envelope.currency === 'NIM') {
        const price = parsePrice(envelope.price) ?? 0
        const trimmed = shout.trim().slice(0, 64)
        const paid = trimmed
          ? await sendNimPaymentWithShout(envelope.to, nimToLuna(price), trimmed)
          : await sendNimPayment(envelope.to, nimToLuna(price))
        r = { ...paid, demo: false }
        const tipped = await maybeTip(real)
        if (tipped) r.tip = tipped
      } else {
        const paid = await sendUsdtPayment(envelope.to, envelope.price)
        r = { ...paid, demo: false }
        const tipped = await maybeTip(real)
        if (tipped) r.tip = tipped
      }
      // Payment broadcast verified → decrypt locally and break the seal.
      const pt = await unsealSecret(envelope.sealed)
      recordCrack({
        title: envelope.title,
        price: envelope.price,
        currency: envelope.currency,
        hash: r.hash,
        demo: r.demo,
      })
      setCrackNo(realCracks().length)
      setPlaintext(pt)
      setReceipt(r)
      setBurstKey((k) => k + 1)
      setPhase('broken')
    } catch (e) {
      const msg = errorMessage(e)
      setError(envelope.currency === 'USDT' ? describeEvmError(msg) : describePaymentError(msg))
      setPhase('locked')
    }
  }

  const demoMode = env === 'browser' && !(envelope.currency === 'USDT' && hasEvmProvider())
  const treasury = demoMode ? null : tipAddress(envelope.currency)
  const presets = tipPresets(envelope.currency)
  const linkSafe = envelope.kind === 'link' && phase === 'broken' && isSafeHttpUrl(plaintext)
  const shareText = `I just cracked "${envelope.title}" for ${formatPrice(envelope.price, envelope.currency)} on UNSEAL. Your turn:`
  const shareFull = bragMessage({
    title: 'UNSEAL crack',
    text: shareText,
    url: window.location.href,
  })

  function markShared() {
    setShareState('done')
    setTimeout(() => setShareState('idle'), 2600)
  }

  async function shareCrack() {
    if (shareState === 'manual') return
    const outcome = await shareBrag({
      title: 'UNSEAL crack',
      text: shareText,
      url: window.location.href,
    })
    if (outcome === 'shared') markShared()
    else if (outcome === 'manual') setShareState('manual')
    // 'dismissed': share sheet closed. Stay silent, nothing to do.
  }

  return (
    <div className="mx-auto max-w-3xl px-4 pt-5 pb-[calc(78px+env(safe-area-inset-bottom))]">
      {/* Locked preview card */}
      <div className="overflow-hidden border-2 border-ink bg-white shadow-neo-lg">
        <div className="halftone flex items-center justify-between border-b-2 border-ink bg-butter px-4 py-2">
          <span className="inline-flex items-center gap-1 font-display text-xs font-extrabold tracking-widest uppercase">
            <LockClosedIcon className="h-3.5 w-3.5" />
            sealed {envelope.kind === 'link' ? 'link' : 'secret'}
          </span>
          <Sticker colorClass="bg-punch text-cream" rotate={3}>
            {formatPrice(envelope.price, envelope.currency)}
          </Sticker>
        </div>

        <div className="p-4">
          <div className="flex items-start gap-3">
            <FolderMark className="h-16 w-16 shrink-0" />
            <div className="min-w-0">
              <h1 className="font-display text-xl leading-tight font-extrabold break-words">
                {envelope.title}
              </h1>
              <p className="mt-1 text-xs font-bold text-ink/70">
                creator <span className="font-mono">{shortAddress(envelope.to)}</span> · gets 100%
              </p>
            </div>
          </div>

          {/* Seal stage */}
          <UnlockSeal broken={phase === 'broken'} burstKey={burstKey}>
            {phase === 'broken' && (
              <div className="border-2 border-ink bg-cream p-4 shadow-neo">
                <p className="font-display text-xs font-extrabold tracking-widest text-kelly uppercase">
                  ✓ unsealed. It&apos;s yours
                </p>
                {envelope.kind === 'link' ? (
                  <div className="mt-2">
                    <p className="font-mono text-sm break-all">{plaintext}</p>
                    {linkSafe && (
                      <a href={plaintext} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block">
                        <NeoButton tone="kelly">
                          Open link <ArrowTopRightOnSquareIcon className="h-5 w-5" />
                        </NeoButton>
                      </a>
                    )}
                  </div>
                ) : (
                  <div className="mt-2">
                    <p className="text-base whitespace-pre-wrap break-words">{plaintext}</p>
                    <div className="mt-3">
                      <CopyField value={plaintext} label="Secret text" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </UnlockSeal>

          {phase === 'broken' && tipNote && (
            <p className="mt-3 border-2 border-ink bg-butter p-2 text-xs font-bold">{tipNote}</p>
          )}

          {phase === 'broken' && receipt && (
            <CrackCertificate
              envelope={envelope}
              receipt={receipt}
              crackNo={crackNo}
              shareState={shareState}
              shareFull={shareFull}
              onShare={shareCrack}
            />
          )}

          {phase === 'locked' && (
            <div className="mt-2 border-2 border-dashed border-ink bg-paper p-3 text-sm">
              <p className="font-display text-xs font-extrabold tracking-wider uppercase">Before you pay, check:</p>
              <ul className="mt-1 list-disc space-y-0.5 pl-5 text-[13px] font-medium">
                <li>
                  Price: <strong>{formatPrice(envelope.price, envelope.currency)}</strong>
                </li>
                <li>
                  Goes to: <strong className="font-mono">{shortAddress(envelope.to)}</strong>
                </li>
                <li>
                  You unlock: <strong>a {envelope.kind === 'link' ? 'link' : 'secret text'}</strong>{' '}
                  (contents stay hidden until payment)
                </li>
              </ul>
            </div>
          )}

          {phase === 'locked' && envelope.currency === 'NIM' && !demoMode && (
            <div className="mt-2 border-2 border-ink bg-white p-3 shadow-neo-sm">
              <label
                htmlFor="shout"
                className="flex items-center gap-1 font-display text-xs font-extrabold tracking-wider uppercase"
              >
                <MegaphoneIcon className="h-4 w-4" />
                Shout it on-chain <span className="font-bold text-ink/50 normal-case">(optional)</span>
              </label>
              <input
                id="shout"
                value={shout}
                onChange={(e) => setShout(e.target.value)}
                maxLength={64}
                placeholder="e.g. first crack!!"
                className="mt-1.5 min-h-[48px] w-full border-2 border-ink bg-paper px-3 text-sm"
              />
              <p className="mt-1 text-[11px] font-bold text-ink/60">
                Rides inside your payment. The creator sees it forever.
              </p>
            </div>
          )}

          {phase === 'locked' && treasury && !demoMode && (
            <div className="mt-2 border-2 border-ink bg-white p-3 shadow-neo-sm">
              <p className="font-display text-xs font-extrabold tracking-wider uppercase">
                Keep Unseal free <span className="font-bold text-ink/50 normal-case">(optional)</span>
              </p>
              <div className="mt-1.5 grid grid-cols-3 gap-1.5">
                {presets.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTipAmount(t)}
                    aria-pressed={tipAmount === t}
                    className={`min-h-[44px] cursor-pointer border-2 border-ink px-1 font-display text-xs font-extrabold ${
                      tipAmount === t ? 'bg-ink text-cream shadow-none' : 'bg-paper shadow-neo-sm'
                    }`}
                  >
                    {t === 0 ? 'No tip' : `${t} ${envelope.currency}`}
                  </button>
                ))}
              </div>
              <p className="mt-1 text-[11px] font-bold text-ink/60">
                A separate approval after the creator is paid. Goes to{' '}
                <span className="font-mono">{shortAddress(treasury)}</span>. Never touches the
                creator&apos;s cut.
              </p>
            </div>
          )}

          {error && (
            <p role="alert" className="mt-3 border-2 border-ink bg-punch p-3 text-sm font-bold text-cream">
              {error}
            </p>
          )}

          {demoMode && phase === 'locked' && (
            <p className="mt-3 flex items-start gap-1.5 border-2 border-ink bg-butter p-3 text-xs font-bold">
              <BeakerIcon className="h-4 w-4 shrink-0" />
              <span>
                Demo mode: payments are simulated here.{' '}
                {envelope.currency === 'USDT'
                  ? 'Add an EVM wallet like MetaMask, or open this link in Nimiq Pay, to pay for real.'
                  : 'Open this same link in Nimiq Pay to pay for real.'}
              </span>
            </p>
          )}

          {phase === 'broken' && (
            <Link to="/create" className="mt-4 block">
              <NeoButton tone="grape" className="w-full">
                Seal your own content
              </NeoButton>
            </Link>
          )}
        </div>
      </div>

      {/* Sticky pay bar (the tab bar hides on this screen) */}
      {phase !== 'broken' && (
        <div className="fixed bottom-0 left-1/2 z-40 w-full max-w-[430px] -translate-x-1/2 border-t-2 border-ink bg-cream p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          {phase === 'paying' ? (
            <PayingCard currency={envelope.currency} />
          ) : (
            <NeoButton tone="punch" onClick={() => pay(!demoMode)} className="w-full text-base">
              <LockClosedIcon className="h-5 w-5" />
              Break the seal: {formatPrice(envelope.price, envelope.currency)}
              {tipAmount > 0 && treasury ? ` (+${tipAmount} ${envelope.currency} tip)` : ''}
            </NeoButton>
          )}
        </div>
      )}
      {/* Navigation returns on the final screen. The tab bar was hidden during checkout. */}
      {phase === 'broken' && <TabBar />}
    </div>
  )
}

/** Poster-style proof-of-crack: what, for how much, which tx. Built to share. */
function CrackCertificate({
  envelope,
  receipt,
  crackNo,
  shareState,
  shareFull,
  onShare,
}: {
  envelope: GateEnvelope
  receipt: Receipt
  crackNo: number
  shareState: 'idle' | 'done' | 'manual'
  shareFull: string
  onShare: () => void
}) {
  const level = crackerLevel(crackNo)
  return (
    <div className="mt-4 overflow-hidden border-2 border-ink bg-white shadow-neo">
      <div className="flex items-center justify-between gap-2 border-b-2 border-ink bg-butter px-3 py-1.5">
        <span className="font-display text-xs font-extrabold tracking-widest uppercase">
          Crack certified
        </span>
        {receipt.demo ? (
          <Sticker colorClass="bg-paper text-ink" rotate={2}>
            demo
          </Sticker>
        ) : (
          <Sticker colorClass={level.chip} rotate={2}>
            #{crackNo} · {level.name}
          </Sticker>
        )}
      </div>
      <div className="p-3">
        <p className="truncate font-display text-base font-extrabold">{envelope.title}</p>
        <p className="mt-0.5 flex items-center gap-1 text-xs font-bold text-kelly">
          <CheckCircleIcon className="h-4 w-4" />
          {receipt.demo ? 'Demo crack. No funds moved.' : 'Payment confirmed on-chain.'}
        </p>
        <p className="mt-1 font-mono text-xs break-all">
          tx <span title={receipt.hash}>{shortHash(receipt.hash)}</span>
        </p>
        {!receipt.demo && (
          <a
            href={explorerUrl(receipt.hash, envelope.currency)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex items-center gap-1 text-xs font-bold underline"
          >
            View on explorer <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" />
          </a>
        )}
        <p className="mt-1 text-[11px] font-bold text-ink/60">
          Paid straight to the creator. Unseal took 0%.
        </p>
        {receipt.tip && (
          <p className="mt-1 text-[11px] font-extrabold text-grape">
            You tipped {receipt.tip.amount} {envelope.currency} to keep Unseal free. Thank you.
          </p>
        )}
        <NeoButton
          tone="splash"
          onClick={onShare}
          disabled={shareState === 'done'}
          className="mt-3 w-full"
        >
          {shareState === 'done' ? (
            <>
              <CheckIcon className="h-5 w-5" /> Link copied! Go brag
            </>
          ) : (
            <>
              <ShareIcon className="h-5 w-5" /> Brag about this crack
            </>
          )}
        </NeoButton>
        {shareState === 'manual' && (
          <div className="mt-2 border-2 border-dashed border-ink bg-paper p-2">
            <p className="text-[11px] font-bold">
              Auto-copy is blocked in this browser. Long-press the text and copy it yourself:
            </p>
            <input
              readOnly
              value={shareFull}
              onFocus={(e) => e.target.select()}
              onClick={(e) => e.currentTarget.select()}
              className="mt-1.5 min-h-[48px] w-full border-2 border-ink bg-white px-2 py-1.5 font-mono text-xs break-all"
              aria-label="Share text to copy manually"
            />
          </div>
        )}
        <div className="mt-3">
          <SealQR value={window.location.href} caption="Scan to open this seal on another device" />
        </div>
      </div>
    </div>
  )
}

function PayingCard({ currency }: { currency: string }) {
  return (
    <div
      className="flex min-h-[48px] w-full items-center justify-center gap-2 border-2 border-ink bg-butter px-3 font-display text-sm font-extrabold tracking-wider uppercase"
      role="status"
      aria-live="polite"
    >
      <span className="inline-block h-5 w-5 shrink-0 animate-spin border-[3px] border-ink border-t-transparent" />
      {currency === 'NIM' ? 'Waiting for Nimiq Pay…' : 'Waiting for wallet…'}
    </div>
  )
}
