// First-launch onboarding: 3 poster-style slides, dots, skip/next.
// Completion persisted so it only shows once per device.

import { motion } from 'motion/react'
import { useState } from 'react'
import { NeoButton } from '../components/NeoButton'
import { CoinPocket, FolderMark, PadlockMark } from '../components/SealMark'
import { StackLines } from '../components/StackLines'
import { Sticker } from '../components/Sticker'
import { ONBOARDED_KEY } from '../lib/keys'

const SLIDES = [
  {
    art: <PadlockMark className="h-28 w-28 drop-shadow-[5px_5px_0px_#1A1A1A]" />,
    chip: 'step 01',
    chipClass: 'bg-butter text-ink',
    lines: [
      { text: 'LOCK', colorClass: 'text-grape' },
      { text: 'ANYTHING.', colorClass: 'text-punch' },
    ],
    body: 'Links, passwords, alpha drops. Encrypted right in your browser. Nothing ever uploads.',
  },
  {
    art: <FolderMark className="h-28 w-28 drop-shadow-[5px_5px_0px_#1A1A1A]" />,
    chip: 'step 02',
    chipClass: 'bg-splash text-ink',
    lines: [
      { text: 'SHARE', colorClass: 'text-kelly' },
      { text: 'ONE LINK.', colorClass: 'text-grape' },
    ],
    body: 'The whole locked box lives inside one link. No accounts, no apps to install, no database.',
  },
  {
    art: <CoinPocket className="h-28 w-28 drop-shadow-[5px_5px_0px_#1A1A1A]" />,
    chip: 'step 03',
    chipClass: 'bg-kelly text-cream',
    lines: [
      { text: 'BANK IT', colorClass: 'text-punch' },
      { text: 'DIRECTLY.', colorClass: 'text-ink' },
    ],
    body: 'Fans pay your wallet in Nimiq Pay. NIM or USDT. 100% yours. The seal breaks on arrival.',
  },
]

export function Onboarding({ onDone }: { onDone: () => void }) {
  const [index, setIndex] = useState(0)
  const last = index === SLIDES.length - 1
  const slide = SLIDES[index]

  function finish() {
    try {
      localStorage.setItem(ONBOARDED_KEY, '1')
    } catch {
      // private mode. Onboarding just shows again next time
    }
    onDone()
  }

  return (
    <div className="paper-grain noise relative flex min-h-dvh flex-col px-5 pt-6 pb-6">
      <div className="flex items-center justify-between">
        <Sticker colorClass={slide.chipClass} rotate={-3}>
          {slide.chip}
        </Sticker>
        {!last && (
          <button
            type="button"
            onClick={finish}
            className="cursor-pointer font-display text-xs font-extrabold tracking-widest uppercase underline"
          >
            Skip
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col items-center justify-center py-5 text-center">
        <motion.div
          key={index}
          initial={{ scale: 0.6, opacity: 0, rotate: -6 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 220, damping: 15 }}
        >
          {slide.art}
        </motion.div>
        <motion.div
          key={`t-${index}`}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mt-6"
        >
          <StackLines lines={slide.lines} align="center" className="text-4xl leading-[0.95]" />
          <p className="mx-auto mt-3 max-w-[280px] text-sm font-medium">{slide.body}</p>
        </motion.div>
      </div>

      <div className="flex items-center justify-center gap-2">
        {SLIDES.map((_, i) => (
          <span
            key={i}
            className={`h-3 border-2 border-ink ${i === index ? 'w-8 bg-punch' : 'w-3 bg-white'}`}
          />
        ))}
      </div>

      <NeoButton
        tone={last ? 'kelly' : 'grape'}
        onClick={() => (last ? finish() : setIndex(index + 1))}
        className="mt-5 w-full"
      >
        {last ? "Let's seal something →" : 'Next →'}
      </NeoButton>
    </div>
  )
}
