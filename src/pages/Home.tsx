import { ArrowPathIcon, BoltIcon, ChevronLeftIcon, ChevronRightIcon, FireIcon, PlusIcon, QrCodeIcon, TrashIcon, TrophyIcon } from '@heroicons/react/24/outline'
import { LockOpenIcon } from '@heroicons/react/24/outline'
import { motion } from 'motion/react'
import { Fragment, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { crackStats } from '../lib/social'
import { NeoButton } from '../components/NeoButton'
import { Reveal } from '../components/Reveal'
import { SealQR } from '../components/SealQR'
import { CoinPocket, FolderMark, PadlockMark, SealIntact } from '../components/SealMark'
import { StackLines } from '../components/StackLines'
import { Sticker } from '../components/Sticker'
import { StringSticker } from '../components/StringSticker'
import { formatPrice } from '../lib/format'
import { buildShareUrl } from '../lib/envelope'
import { listSeals, removeSeal } from '../lib/store'
import { ONBOARDED_KEY, FTUE_KEY } from '../lib/keys'
import { mintDemoSeal } from '../lib/demo'

const TICKER = ['0% cut', 'instant P2P', '1-tap unlock', 'zero escrow', 'no sign-up']

const STASH_PAGE_SIZE = 5

function Ticker() {
  const row = [...TICKER, ...TICKER]
  return (
    <div className="overflow-hidden border-y-2 border-ink bg-ink py-2 text-cream">
      <div className="animate-marquee flex w-max gap-8 pr-8 whitespace-nowrap">
        {row.map((t, i) => (
          <span key={i} className="font-display text-sm font-extrabold tracking-widest uppercase">
            ✦ {t}
          </span>
        ))}
      </div>
    </div>
  )
}

/** Cracker record: level, streak, volume. The SocialFi shelf. */
function Record() {
  const [stats] = useState(crackStats)

  if (stats.count === 0) {
    return (
      <section className="mb-6 flex items-center gap-3 border-2 border-dashed border-ink bg-paper p-3">
        <TrophyIcon className="h-8 w-8 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="font-display text-sm font-extrabold tracking-wide uppercase">
            No cracks yet
          </p>
          <p className="text-xs font-medium">Every legend starts with one.</p>
        </div>
        <Link
          to="/open"
          className="shrink-0 border-2 border-ink bg-butter px-3 py-2 font-display text-xs font-extrabold tracking-wider uppercase shadow-neo-sm transition-transform active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
        >
          Start
        </Link>
      </section>
    )
  }

  const volumes = [
    stats.nimVolume > 0 ? `${stats.nimVolume} NIM` : null,
    stats.usdtVolume > 0 ? `${stats.usdtVolume} USDT` : null,
  ].filter((v): v is string => v !== null)

  return (
    <section className="mb-6 border-2 border-ink bg-white p-3 shadow-neo">
      <div className="flex items-center justify-between gap-2">
        <p className="font-display text-xs font-extrabold tracking-widest uppercase">
          Your record
        </p>
        <Sticker colorClass={stats.level.chip} rotate={2}>
          {stats.level.name}
        </Sticker>
      </div>
      <div className="mt-2 grid grid-cols-3 divide-x-2 divide-ink border-2 border-ink bg-cream text-center">
        <div className="py-2">
          <p className="font-display text-xl leading-none font-extrabold">{stats.count}</p>
          <p className="mt-0.5 text-[10px] font-extrabold tracking-widest uppercase">cracks</p>
        </div>
        <div className="py-2">
          <p className="inline-flex items-center gap-0.5 font-display text-xl leading-none font-extrabold">
            <FireIcon className="h-4 w-4 text-punch" />
            {stats.streak}
          </p>
          <p className="mt-0.5 text-[10px] font-extrabold tracking-widest uppercase">day streak</p>
        </div>
        <div className="px-1 py-2">
          <p className="font-display text-sm leading-tight font-extrabold">
            {volumes.length > 0 ? volumes.join(' · ') : '-'}
          </p>
          <p className="mt-0.5 text-[10px] font-extrabold tracking-widest uppercase">paid out</p>
        </div>
      </div>
    </section>
  )
}

function Stash() {
  const [seals, setSeals] = useState(listSeals)
  const [page, setPage] = useState(0)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  if (seals.length === 0) return null

  const pageCount = Math.max(1, Math.ceil(seals.length / STASH_PAGE_SIZE))
  const safePage = Math.min(page, pageCount - 1)
  const visible = seals.slice(safePage * STASH_PAGE_SIZE, safePage * STASH_PAGE_SIZE + STASH_PAGE_SIZE)

  return (
    <section className="mt-6">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="font-display text-xl font-extrabold">YOUR STASH</h2>
        <Sticker colorClass="bg-splash text-ink" rotate={2}>
          this device
        </Sticker>
      </div>
      <ul className="space-y-3">
        {visible.map((s) => (
          <Fragment key={s.id}>
            <li className="flex items-center gap-2 border-2 border-ink bg-white p-2 shadow-neo-sm">
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-base font-extrabold">{s.title}</p>
                <p className="text-xs font-bold">
                  {formatPrice(s.price, s.currency)} · {s.kind === 'link' ? 'link' : 'secret text'}
                </p>
              </div>
              <Link
                to={`/s?g=${s.encoded}`}
                className="shrink-0 border-2 border-ink bg-butter px-3 py-2 font-display text-xs font-extrabold tracking-wider uppercase shadow-neo-sm transition-transform active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
              >
                Open
              </Link>
              <button
                type="button"
                onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}
                aria-expanded={expandedId === s.id}
                aria-label={`Show QR for ${s.title}`}
                className="flex min-h-[44px] min-w-[44px] shrink-0 cursor-pointer items-center justify-center border-2 border-ink bg-white transition-colors hover:bg-splash"
              >
                <QrCodeIcon className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  removeSeal(s.id)
                  setSeals(listSeals())
                }}
                className="flex min-h-[44px] min-w-[44px] shrink-0 cursor-pointer items-center justify-center border-2 border-ink bg-white transition-colors hover:bg-punch hover:text-cream"
                aria-label={`Delete seal ${s.title}`}
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </li>
            {expandedId === s.id && (
              <li>
                <SealQR value={buildShareUrl(s.encoded)} caption="Scan to open in Nimiq Pay" />
              </li>
            )}
          </Fragment>
        ))}
      </ul>
      {pageCount > 1 && (
        <div className="mt-3 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setPage(safePage - 1)}
            disabled={safePage === 0}
            className="inline-flex min-h-[44px] cursor-pointer items-center gap-1 border-2 border-ink bg-paper px-3 font-display text-xs font-extrabold tracking-wider uppercase shadow-neo-sm transition-transform active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
          >
            <ChevronLeftIcon className="h-4 w-4" /> Prev
          </button>
          <span className="font-display text-xs font-extrabold tracking-wider uppercase">
            Page {safePage + 1} of {pageCount}
          </span>
          <button
            type="button"
            onClick={() => setPage(safePage + 1)}
            disabled={safePage === pageCount - 1}
            className="inline-flex min-h-[44px] cursor-pointer items-center gap-1 border-2 border-ink bg-paper px-3 font-display text-xs font-extrabold tracking-wider uppercase shadow-neo-sm transition-transform active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
          >
            Next <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>
      )}
    </section>
  )
}

function FirstTimer() {
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(FTUE_KEY) === '1'
    } catch {
      return false
    }
  })
  if (dismissed) return null

  function dismiss() {
    try {
      localStorage.setItem(FTUE_KEY, '1')
    } catch {
    }
    setDismissed(true)
  }

  return (
    <div className="border-y-2 border-ink bg-butter px-4 py-3">
      <p className="font-display text-sm font-extrabold tracking-wider uppercase">New to NIM?</p>
      <ol className="mt-1 list-decimal space-y-0.5 pl-5 text-[13px] font-medium">
        <li>Install Nimiq Pay on your phone. Your wallet lives inside it.</li>
        <li>Open Unseal inside the app. No extension, no signup.</li>
        <li>Grab free testnet NIM from the faucet and crack away.</li>
      </ol>
      <div className="mt-2 flex gap-2">
        <a
          href="https://www.nimiq.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 border-2 border-ink bg-grape px-3 py-2 text-center font-display text-xs font-extrabold tracking-wider text-cream uppercase shadow-neo-sm transition-transform active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
        >
          Get Nimiq Pay
        </a>
        <button
          type="button"
          onClick={dismiss}
          className="flex-1 cursor-pointer border-2 border-ink bg-paper px-3 py-2 font-display text-xs font-extrabold tracking-wider uppercase shadow-neo-sm transition-transform active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
        >
          Got it
        </button>
      </div>
    </div>
  )
}

function replayTour() {
  try {
    localStorage.removeItem(ONBOARDED_KEY)
  } catch {    // ignore
  }
  window.location.reload()
}

export function Home() {
  const navigate = useNavigate()
  const [makingDemo, setMakingDemo] = useState(false)
  const [demoErr, setDemoErr] = useState('')

  async function tryDemo() {
    setDemoErr('')
    setMakingDemo(true)
    try {
      navigate(`/s?g=${await mintDemoSeal()}`)
    } catch {
      setDemoErr('Could not mint the demo seal. Retry, or use the Open tab.')
      setMakingDemo(false)
    }
  }

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden px-4 pt-3 pb-5">
        <div className="halftone pointer-events-none absolute inset-x-0 top-0 h-24 opacity-60" />
        <div className="relative flex justify-center">
          <StringSticker colorClass="bg-plum text-cream" stringLength={26}>
            psst… creators keep 100%
          </StringSticker>
        </div>

        <div className="relative mt-1 text-center">
          <motion.div
            initial={{ scale: 0, rotate: -12 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 14 }}
            className="mx-auto w-fit"
          >
            <SealIntact className="h-20 w-20 drop-shadow-[4px_4px_0px_#1A1A1A]" />
          </motion.div>
          <motion.div
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <StackLines
              align="center"
              className="mt-3 text-5xl leading-[0.92]"
              lines={[
                { text: 'SEAL IT.', colorClass: 'text-grape' },
                { text: 'SHARE IT.', colorClass: 'text-punch' },
                { text: 'BANK IT.', colorClass: 'text-kelly' },
              ]}
            />
          </motion.div>
          <motion.p
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mx-auto mt-3 max-w-[300px] text-sm font-medium"
          >
            Lock links &amp; secrets behind a tiny fee. Fans pay{' '}
            <strong>your wallet directly</strong>. Then the seal breaks. No middleman, no cut.
          </motion.p>
          <motion.div
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-4 flex flex-col gap-2"
          >
            <Link to="/create">
              <NeoButton tone="grape" className="w-full">
                <PlusIcon className="h-5 w-5" /> Seal something
              </NeoButton>
            </Link>
            <Link to="/open">
              <NeoButton tone="paper" className="w-full">
                <LockOpenIcon className="h-5 w-5" /> Crack a seal
              </NeoButton>
            </Link>
          </motion.div>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <Sticker colorClass="bg-butter text-ink">0% cut, forever</Sticker>
            <Sticker colorClass="bg-splash text-ink" rotate={2} floatDelay={1}>
              <span className="inline-flex items-center gap-1">
                <BoltIcon className="h-3.5 w-3.5" /> instant P2P
              </span>
            </Sticker>
          </div>
          <button
            type="button"
            onClick={tryDemo}
            disabled={makingDemo}
            className="mt-4 inline-flex cursor-pointer items-center gap-1 font-display text-xs font-extrabold tracking-wider uppercase decoration-2 underline-offset-4 underline disabled:opacity-50"
          >
            {makingDemo ? 'Minting a demo seal…' : 'Try a free demo crack first'}
          </button>
          {demoErr && <p className="mt-2 text-xs font-bold text-punch">{demoErr}</p>}
        </div>
      </section>

      <FirstTimer />

      <Ticker />

      <div className="px-4 py-6">
        <Record />
        {/* HOW IT WORKS */}
        <section>
          <Reveal>
            <h2 className="text-center font-display text-xl font-extrabold">
              SEALED IN <span className="bg-butter px-1">3 STEPS</span>
            </h2>
          </Reveal>
          <div className="mt-4 grid gap-3">
            {[
              {
                icon: <PadlockMark className="h-12 w-12" />,
                bg: 'bg-butter',
                title: '1. Seal it',
                body: 'Paste a link or secret, slap on a tiny NIM/USDT price. It encrypts in your browser.',
              },
              {
                icon: <FolderMark className="h-12 w-12" />,
                bg: 'bg-splash',
                title: '2. Share it',
                body: 'One link with everything baked in. No accounts, no uploads, no database.',
              },
              {
                icon: <CoinPocket className="h-12 w-12" />,
                bg: 'bg-kelly',
                title: '3. Bank it',
                body: 'Fans pay your wallet directly in Nimiq Pay. The seal cracks the second it lands.',
              },
            ].map((c, i) => (
              <Reveal key={c.title} delay={i * 0.08}>
                <div className="flex items-center gap-3 border-2 border-ink bg-white p-3 shadow-neo">
                  <div
                    className={`flex h-16 w-16 shrink-0 items-center justify-center border-2 border-ink ${c.bg}`}
                  >
                    {c.icon}
                  </div>
                  <div>
                    <h3 className="font-display text-base font-extrabold">{c.title}</h3>
                    <p className="mt-0.5 text-[13px]">{c.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ZERO ESCROW STRIP */}
        <Reveal>
          <section className="relative mt-6 overflow-hidden border-2 border-ink bg-grape p-4 text-cream shadow-neo-lg">
            <div className="halftone-light pointer-events-none absolute inset-0 opacity-40" />
            <div className="relative flex flex-col items-center gap-2 text-center">
              <CoinPocket className="h-16 w-16 shrink-0" />
              <h2 className="font-display text-xl leading-tight font-extrabold">
                MONEY NEVER
                <br />
                <span className="bg-butter px-1 text-ink">TOUCHES US.</span>
              </h2>
              <p className="text-sm text-cream/90">
                Every payment is wallet-to-wallet, approved by the buyer in Nimiq Pay. Nothing to
                withdraw, nothing to trust, nothing to hack.
              </p>
              <p className="inline-flex items-center gap-1 font-display text-xs font-extrabold tracking-wider uppercase">
                <BoltIcon className="h-4 w-4 text-butter" /> buyer → creator, always
              </p>
            </div>
          </section>
        </Reveal>

        <Stash />

        {/* REAL TALK */}
        <section className="mt-6 border-2 border-dashed border-ink bg-paper p-4">
          <h2 className="font-display text-lg font-extrabold">REAL TALK</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-[13px]">
            <li>
              No servers, nothing to hack. The seal lives entirely in the link, so there is no
              database to breach and no account to steal.
            </li>
            <li>
              The link is the key. Anyone holding it can open the box after paying. Think ticket,
              not safe.
            </li>
            <li>Short secrets make short links. Chat apps truncate monster URLs.</li>
            <li>USDT pays out on Polygon · NIM pays out on Nimiq.</li>
          </ul>
        </section>

        <footer className="mt-6 border-t-2 border-ink pt-3 pb-1 text-center text-xs font-bold">
          <p>UNSEAL · built for Nimiq Pay</p>
          <div className="mt-1.5 flex items-center justify-center gap-3">
            <Link to="/terms" className="underline">
              Terms
            </Link>
            <span className="text-ink/40">·</span>
            <Link to="/privacy" className="underline">
              Privacy
            </Link>
          </div>
          <button
            type="button"
            onClick={replayTour}
            className="mt-1.5 inline-flex cursor-pointer items-center gap-1 underline"
          >
            <ArrowPathIcon className="h-3.5 w-3.5" /> replay the intro
          </button>
        </footer>
      </div>
    </div>
  )
}
