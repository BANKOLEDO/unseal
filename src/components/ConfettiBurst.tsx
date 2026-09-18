// Flat geometric pop-art confetti explosion (squares + circles with ink
// outlines). Fires once when `burstKey` changes, then fades out.

import { motion } from 'motion/react'
import { useMemo } from 'react'

const COLORS = ['#FFD166', '#F72585', '#4CC9F0', '#00A86B', '#3A0CA3', '#FDF8F0']

interface Particle {
  id: number
  x: number
  y: number
  size: number
  color: string
  round: boolean
  rotate: number
  delay: number
}

export function ConfettiBurst({ burstKey, count = 28 }: { burstKey: number; count?: number }) {
  // Deterministic pseudo-random from (burstKey, i): pure, stable per burst,
  // and a fresh explosion layout every time the seal breaks.
  const particles = useMemo<Particle[]>(
    () =>
      Array.from({ length: count }, (_, i) => {
        const rand = (salt: number) => {
          let s = (burstKey * 374761393 + i * 668265263 + salt * 2246822519) >>> 0
          s = (s ^ (s >> 13)) >>> 0
          s = (s * 1274126177) >>> 0
          return ((s ^ (s >> 16)) >>> 0) / 4294967295
        }
        const angle = (i / count) * Math.PI * 2 + rand(1) * 0.5
        const dist = 90 + rand(2) * 130
        return {
          id: i,
          x: Math.cos(angle) * dist,
          y: Math.sin(angle) * dist - 40,
          size: 8 + rand(3) * 12,
          color: COLORS[i % COLORS.length],
          round: rand(4) > 0.5,
          rotate: (rand(5) - 0.5) * 360,
          delay: rand(6) * 0.08,
        }
      }),
    [count, burstKey],
  )

  if (burstKey <= 0) return null

  return (
    <motion.div
      key={burstKey}
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 0.6, delay: 0.9 }}
      className="pointer-events-none absolute inset-0 z-30"
      aria-hidden
    >
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ scale: 0, x: 0, y: 0, rotate: 0 }}
          animate={{ scale: 1, x: p.x, y: p.y, rotate: p.rotate }}
          transition={{ type: 'spring', stiffness: 160, damping: 13, delay: p.delay }}
          className="absolute top-1/2 left-1/2 border-2 border-ink"
          style={{
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: p.round ? '9999px' : '2px',
          }}
        />
      ))}
    </motion.div>
  )
}
