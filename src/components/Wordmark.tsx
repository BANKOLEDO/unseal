// Poster-style stacked sticker wordmark, à la the inspo lockup:
// stacked words in alternating colors on a cream sticker with hard offset.

interface WordmarkProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const SIZES: Record<NonNullable<WordmarkProps['size']>, string> = {
  sm: 'text-xl leading-[0.9] px-2 py-1',
  md: 'text-3xl leading-[0.9] px-3 py-1.5',
  lg: 'text-5xl leading-[0.9] px-4 py-2',
}

export function Wordmark({ size = 'md', className = '' }: WordmarkProps) {
  return (
    <span
      className={`inline-block border-2 border-ink bg-cream font-display font-extrabold tracking-tight shadow-neo-sm ${SIZES[size]} ${className}`}
      aria-label="Unseal"
    >
      <span className="block text-punch">UN</span>
      <span className="block text-grape">
        SEAL<span className="text-ink">.</span>
      </span>
    </span>
  )
}
