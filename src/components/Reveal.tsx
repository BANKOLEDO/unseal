// Scroll-direction-aware reveal: content slides in from the right while
// scrolling down, and from the left while scrolling up. A single shared
// scroll listener feeds every Reveal on the page.

import { motion, useInView } from 'motion/react'
import { useEffect, useRef, useState, type ReactNode } from 'react'

type Dir = 'down' | 'up'

let current: Dir = 'down'
const subs = new Set<(d: Dir) => void>()
let listening = false

function ensureListening() {
  if (listening || typeof window === 'undefined') return
  listening = true
  let last = window.scrollY
  let ticking = false
  const onScroll = () => {
    if (ticking) return
    ticking = true
    requestAnimationFrame(() => {
      ticking = false
      const y = window.scrollY
      const d: Dir = y >= last ? 'down' : 'up'
      last = y
      if (d !== current) {
        current = d
        subs.forEach((fn) => fn(d))
      }
    })
  }
  window.addEventListener('scroll', onScroll, { passive: true })
}

function useScrollDir(): Dir {
  const [dir, setDir] = useState<Dir>(current)
  useEffect(() => {
    ensureListening()
    subs.add(setDir)
    return () => {
      subs.delete(setDir)
    }
  }, [])
  return dir
}

interface RevealProps {
  children: ReactNode
  className?: string
  /** horizontal travel in px */
  distance?: number
  /** stagger delay (s) applied on entry */
  delay?: number
}

export function Reveal({ children, className = '', distance = 72, delay = 0 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { margin: '-48px', once: false })
  const dir = useScrollDir()

  return (
    <motion.div
      ref={ref}
      initial={false}
      animate={{ x: inView ? 0 : dir === 'down' ? distance : -distance, opacity: inView ? 1 : 0 }}
      transition={{ type: 'spring', stiffness: 110, damping: 19, delay: inView ? delay : 0 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
