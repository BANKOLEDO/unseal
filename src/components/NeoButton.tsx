// Tactile neo-brutalist button: thick ink border, hard offset shadow that
// presses flat on tap. Built on motion/react.

import { motion } from 'motion/react'
import type { ReactNode } from 'react'

type Tone = 'grape' | 'punch' | 'butter' | 'ink' | 'paper' | 'kelly' | 'splash'

const TONES: Record<Tone, string> = {
  grape: 'bg-grape text-cream',
  punch: 'bg-punch text-cream',
  butter: 'bg-butter text-ink',
  ink: 'bg-ink text-cream',
  paper: 'bg-white text-ink',
  kelly: 'bg-kelly text-cream',
  splash: 'bg-splash text-ink',
}

interface NeoButtonProps {
  children: ReactNode
  onClick?: () => void
  type?: 'button' | 'submit'
  tone?: Tone
  disabled?: boolean
  className?: string
  label?: string
}

export function NeoButton({
  children,
  onClick,
  type = 'button',
  tone = 'grape',
  disabled = false,
  className = '',
  label,
}: NeoButtonProps) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      whileHover={disabled ? undefined : { x: -1, y: -1, boxShadow: '5px 5px 0px #1A1A1A' }}
      whileTap={disabled ? undefined : { x: 4, y: 4, boxShadow: '0px 0px 0px #1A1A1A' }}
      transition={{ type: 'spring', stiffness: 500, damping: 28 }}
      className={`inline-flex min-h-[48px] cursor-pointer items-center justify-center gap-2 border-2 border-ink px-6 py-3 font-display text-base font-extrabold tracking-wide uppercase shadow-neo select-none ${TONES[tone]} ${disabled ? 'cursor-not-allowed opacity-50 saturate-50' : ''} ${className}`}
    >
      {children}
    </motion.button>
  )
}
