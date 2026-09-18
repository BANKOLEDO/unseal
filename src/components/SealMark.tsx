// Pop-art vector assets: wax seal (intact + broken halves), padlock, NIM coin,
// starburst, folder, and the direct-payment coin-into-pocket visual.
// Thick ink outlines + hard offset shadows, per the Unseal style guide.

interface MarkProps {
  className?: string
}

export function SealIntact({ className }: MarkProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} role="img" aria-label="Sealed wax stamp">
      <path
        d="M54 14 C76 14 94 32 94 54 C94 76 76 94 54 94 C32 94 14 76 14 54 C14 32 32 14 54 14 Z"
        fill="#1A1A1A"
      />
      <path
        d="M50 10 C72 10 90 28 90 50 C90 72 72 90 50 90 C28 90 10 72 10 50 C10 28 28 10 50 10 Z"
        fill="#F72585"
        stroke="#1A1A1A"
        strokeWidth="3"
      />
      <circle
        cx="50"
        cy="50"
        r="28"
        fill="none"
        stroke="#1A1A1A"
        strokeWidth="2"
        strokeDasharray="4 4"
      />
      <rect
        x="40"
        y="48"
        width="20"
        height="16"
        rx="2"
        fill="#FFD166"
        stroke="#1A1A1A"
        strokeWidth="2"
      />
      <path
        d="M44 48 V40 C44 36 56 36 56 40 V48"
        fill="none"
        stroke="#1A1A1A"
        strokeWidth="2"
      />
    </svg>
  )
}

export function SealTop({ className }: MarkProps) {
  return (
    <svg viewBox="0 0 100 52" className={className} role="img" aria-label="Broken seal top half">
      <path
        d="M14 54 C14 32 32 14 54 14 C76 14 94 32 94 54 L79 47 L64 57 L49 44 L34 54 L14 54 Z"
        fill="#1A1A1A"
        transform="translate(4,4)"
      />
      <path
        d="M10 50 C10 28 28 10 50 10 C72 10 90 28 90 50 L75 43 L60 53 L45 40 L30 50 L10 50 Z"
        fill="#F72585"
        stroke="#1A1A1A"
        strokeWidth="3"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function SealBottom({ className }: MarkProps) {
  return (
    <svg viewBox="0 0 100 52" className={className} role="img" aria-label="Broken seal bottom half">
      <path
        d="M14 2 L34 4 L49 -6 L64 7 L79 -3 L94 2 C94 24 76 42 54 42 C32 42 14 24 14 2 Z"
        fill="#1A1A1A"
        transform="translate(4,4)"
      />
      <path
        d="M10 2 L30 4 L45 -6 L60 7 L75 -3 L90 2 C90 24 72 42 50 42 C28 42 10 24 10 2 Z"
        fill="#F72585"
        stroke="#1A1A1A"
        strokeWidth="3"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function PadlockMark({ className }: MarkProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} role="img" aria-label="Padlock">
      <rect x="28" y="44" width="52" height="44" rx="4" fill="#1A1A1A" />
      <path
        d="M34 44 V28 C34 14 66 14 66 28 V44"
        fill="none"
        stroke="#1A1A1A"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <path
        d="M34 44 V28 C34 14 66 14 66 28 V44"
        fill="none"
        stroke="#FDF8F0"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <rect
        x="24"
        y="40"
        width="52"
        height="44"
        rx="4"
        fill="#FFD166"
        stroke="#1A1A1A"
        strokeWidth="3"
      />
      <circle cx="50" cy="56" r="6" fill="#1A1A1A" />
      <path d="M47 60 L44 72 H56 L53 60 Z" fill="#1A1A1A" />
      <line
        x1="30"
        y1="46"
        x2="30"
        y2="54"
        stroke="#1A1A1A"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function CoinMark({ className }: MarkProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} role="img" aria-label="NIM coin">
      <circle cx="54" cy="54" r="40" fill="#1A1A1A" />
      <circle cx="50" cy="50" r="40" fill="#FFD166" stroke="#1A1A1A" strokeWidth="3" />
      <circle
        cx="50"
        cy="50"
        r="30"
        fill="none"
        stroke="#1A1A1A"
        strokeWidth="2"
        strokeDasharray="4 4"
      />
      <polygon
        points="50,28 69,39 69,61 50,72 31,61 31,39"
        fill="#F72585"
        stroke="#1A1A1A"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <circle cx="50" cy="50" r="4" fill="#FDF8F0" />
    </svg>
  )
}

export function BurstMark({ className }: MarkProps) {
  return (
    <svg viewBox="0 0 120 120" className={className} role="img" aria-label="Starburst">
      <polygon
        points="60,10 70,40 100,30 80,55 110,80 75,80 70,110 50,85 20,100 35,70 10,50 45,45"
        fill="#1A1A1A"
        transform="translate(5, 5)"
      />
      <polygon
        points="60,10 70,40 100,30 80,55 110,80 75,80 70,110 50,85 20,100 35,70 10,50 45,45"
        fill="#4CC9F0"
        stroke="#1A1A1A"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <line
        x1="60"
        y1="20"
        x2="60"
        y2="30"
        stroke="#1A1A1A"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1="90"
        y1="40"
        x2="82"
        y2="48"
        stroke="#1A1A1A"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1="30"
        y1="40"
        x2="38"
        y2="48"
        stroke="#1A1A1A"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function FolderMark({ className }: MarkProps) {
  return (
    <svg viewBox="0 0 120 120" className={className} role="img" aria-label="Sealed folder">
      <path d="M14 34 H106 V94 H14 Z" fill="#1A1A1A" />
      <path
        d="M10 30 H40 L48 42 H102 V90 H10 Z"
        fill="#3A0CA3"
        stroke="#1A1A1A"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <g transform="translate(55, 45) rotate(8) translate(-55, -45)">
        <rect
          x="25"
          y="16"
          width="56"
          height="60"
          fill="#FDF8F0"
          stroke="#1A1A1A"
          strokeWidth="2.5"
        />
        <line
          x1="35"
          y1="30"
          x2="70"
          y2="30"
          stroke="#1A1A1A"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <line
          x1="35"
          y1="42"
          x2="60"
          y2="42"
          stroke="#1A1A1A"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <line
          x1="35"
          y1="54"
          x2="75"
          y2="54"
          stroke="#1A1A1A"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </g>
      <path
        d="M10 42 H102 L96 90 H16 Z"
        fill="#F72585"
        stroke="#1A1A1A"
        strokeWidth="3"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function CoinPocket({ className }: MarkProps) {
  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      role="img"
      aria-label="Coin falling directly into a pocket"
    >
      <rect x="24" y="64" width="76" height="56" rx="4" fill="#1A1A1A" />
      <rect
        x="20"
        y="60"
        width="76"
        height="56"
        rx="4"
        fill="#3A0CA3"
        stroke="#1A1A1A"
        strokeWidth="3"
      />
      <path d="M20 60 L58 75 L96 60" fill="none" stroke="#1A1A1A" strokeWidth="3" />
      <circle cx="58" cy="30" r="16" fill="#FFD166" stroke="#1A1A1A" strokeWidth="3" />
      <path d="M58 20 V40 M48 30 H68" stroke="#1A1A1A" strokeWidth="2" />
      <path
        d="M45 10 V18 M71 10 V18"
        stroke="#1A1A1A"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}
