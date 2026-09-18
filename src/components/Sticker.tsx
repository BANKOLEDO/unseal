// Floating micro-sticker badge: gentle infinite bob, tilts on hover.

import { motion } from 'motion/react'
import type { ReactNode } from 'react'

interface StickerProps {
  children: ReactNode
  className?: string
  colorClass?: string
  rotate?: number
  floatDelay?: number
}

export function Sticker({
  children,
  className = '',
  colorClass = 'bg-butter text-ink',
  rotate = -3,
  floatDelay = 0,
}: StickerProps) {
  return (
    <motion.div
      animate={{ y: [-3, 3, -3], rotate: [rotate, rotate + 1, rotate] }}
      transition={{ repeat: Infinity, duration: 3.2, ease: 'easeInOut', delay: floatDelay }}
      whileHover={{ scale: 1.06, rotate: rotate - 2 }}
      className={`inline-block border-2 border-ink px-3 py-1 font-display text-xs font-extrabold tracking-wider uppercase shadow-neo-sm ${colorClass} ${className}`}
    >
      {children}
    </motion.div>
  )
}
