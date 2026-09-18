// Sticker badge hanging from a string, like the inspo callouts
// ("¡Ayyy, muy delicioso!"). Gentle swing, ink line included.

import { motion } from 'motion/react'
import type { ReactNode } from 'react'

interface StringStickerProps {
  children: ReactNode
  className?: string
  colorClass?: string
  stringLength?: number
  swingDelay?: number
}

export function StringSticker({
  children,
  className = '',
  colorClass = 'bg-plum text-cream',
  stringLength = 44,
  swingDelay = 0,
}: StringStickerProps) {
  return (
    <div className={`flex flex-col items-center ${className}`} aria-hidden={false}>
      <div className="w-[2px] bg-ink" style={{ height: stringLength }} />
      <motion.div
        animate={{ rotate: [-4, 4, -4] }}
        transition={{ repeat: Infinity, duration: 3.6, ease: 'easeInOut', delay: swingDelay }}
        className={`origin-top border-2 border-ink px-3 py-1 text-center font-display text-xs font-extrabold tracking-wide uppercase shadow-neo-sm ${colorClass}`}
      >
        {children}
      </motion.div>
    </div>
  )
}
