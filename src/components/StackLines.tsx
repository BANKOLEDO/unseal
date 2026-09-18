// Stacked poster headline: each line its own color, tight and loud,
// like "Open. / Snap. / Bite. / Repeat." in the inspo.

interface StackLinesProps {
  lines: { text: string; colorClass: string }[]
  className?: string
  align?: 'left' | 'center'
}

export function StackLines({ lines, className = '', align = 'left' }: StackLinesProps) {
  return (
    <span
      className={`block font-display font-extrabold tracking-tight ${align === 'center' ? 'text-center' : 'text-left'} ${className}`}
    >
      {lines.map((l) => (
        <span key={l.text} className={`block ${l.colorClass}`}>
          {l.text}
        </span>
      ))}
    </span>
  )
}
