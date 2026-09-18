// "Break the Seal" reveal: the wax seal snaps apart (top/bottom halves fly
// off with a spring), confetti explodes, and the unlocked payload springs in.

import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { ConfettiBurst } from './ConfettiBurst'
import { SealBottom, SealIntact, SealTop } from './SealMark'

interface UnlockSealProps {
  /** true once payment is verified. Plays the break animation */
  broken: boolean
  burstKey: number
  children: ReactNode
}

export function UnlockSeal({ broken, burstKey, children }: UnlockSealProps) {
  return (
    <div className="relative flex min-h-[240px] w-full items-center justify-center overflow-visible py-4">
      <ConfettiBurst burstKey={burstKey} />

      {/* Unlocked payload */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={broken ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }}
        transition={{ type: 'spring', bounce: 0.5, delay: broken ? 0.25 : 0 }}
        className="z-10 w-full"
      >
        {children}
      </motion.div>

      {/* The wax seal */}
      {!broken ? (
        <div className="animate-wiggle absolute z-20">
          <SealIntact className="h-36 w-36 drop-shadow-[4px_4px_0px_#1A1A1A]" />
        </div>
      ) : (
        <div className="pointer-events-none absolute z-20 flex flex-col items-center">
          <motion.div
            initial={{ y: 0, opacity: 1, rotate: 0 }}
            animate={{ y: -130, opacity: 0, rotate: -18 }}
            transition={{ type: 'spring', stiffness: 220, damping: 14 }}
            className="origin-bottom"
          >
            <SealTop className="h-[72px] w-36" />
          </motion.div>
          <motion.div
            initial={{ y: 0, opacity: 1, rotate: 0 }}
            animate={{ y: 130, opacity: 0, rotate: 18 }}
            transition={{ type: 'spring', stiffness: 220, damping: 14 }}
            className="-mt-1 origin-top"
          >
            <SealBottom className="h-[72px] w-36" />
          </motion.div>
        </div>
      )}
    </div>
  )
}
