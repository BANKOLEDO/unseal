// Boot splash: a seal drops, slams with an impact ring, and the wordmark pops.
// Pure theatre (~2.2s) while the wallet provider warms up.

import { motion } from 'motion/react'
import { useEffect } from 'react'
import { SealIntact } from './SealMark'
import { Wordmark } from './Wordmark'

export function Splash({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2200)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div className="paper-grain noise relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6">
      <motion.div
        initial={{ y: -320, rotate: -14 }}
        animate={{ y: 0, rotate: 3 }}
        transition={{ type: 'spring', stiffness: 90, damping: 12, delay: 0.25 }}
        className="relative"
      >
        <SealIntact className="h-28 w-28 drop-shadow-[5px_5px_0px_#1A1A1A]" />
        <span className="animate-impact absolute inset-0 rounded-full border-4 border-punch" />
      </motion.div>

      <motion.div
        initial={{ scale: 0, rotate: -8 }}
        animate={{ scale: 1, rotate: -2 }}
        transition={{ type: 'spring', stiffness: 260, damping: 14, delay: 0.9 }}
        className="mt-6"
      >
        <Wordmark size="lg" />
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="mt-3 text-center font-display text-sm font-extrabold tracking-widest uppercase"
      >
        Break the seal. Unlock the content.
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3 }}
        className="mt-6 h-5 w-48 overflow-hidden border-2 border-ink bg-white"
      >
        <div className="barber-stripes h-full w-full" />
      </motion.div>
    </div>
  )
}
