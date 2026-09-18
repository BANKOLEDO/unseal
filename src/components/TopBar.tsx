import { Link } from 'react-router-dom'
import { useMiniAppEnv } from '../hooks/useMiniAppEnv'
import { hasEvmProvider } from '../lib/evm'
import { Wordmark } from './Wordmark'

export function EnvBadge() {
  const env = useMiniAppEnv()
  if (env === 'checking')
    return (
      <span className="inline-block border-2 border-ink bg-paper px-2 py-0.5 font-display text-[11px] font-extrabold tracking-wider uppercase">
        checking…
      </span>
    )
  if (env === 'miniapp')
    return (
      <span
        className="inline-block border-2 border-ink bg-kelly px-2 py-0.5 font-display text-[11px] font-extrabold tracking-wider text-cream uppercase"
        title="Wallet provider detected. Real payments enabled"
      >
        ● Nimiq Pay
      </span>
    )
  if (hasEvmProvider())
    return (
      <span
        className="inline-block border-2 border-ink bg-kelly px-2 py-0.5 font-display text-[11px] font-extrabold tracking-wider text-cream uppercase"
        title="EVM wallet detected. USDT payments are real, NIM is simulated"
      >
        ● USDT live
      </span>
    )
  return (
    <span
      className="inline-block border-2 border-ink bg-butter px-2 py-0.5 font-display text-[11px] font-extrabold tracking-wider uppercase"
      title="No wallet provider. Demo mode with simulated payments"
    >
      ● Demo
    </span>
  )
}

export function TopBar() {
  return (
    <header className="sticky top-0 z-40 border-b-2 border-ink bg-cream">
      <div className="flex items-center justify-between gap-3 px-4 py-2">
        <Link to="/" aria-label="Unseal home">
          <Wordmark size="sm" className="-rotate-2" />
        </Link>
        <EnvBadge />
      </div>
    </header>
  )
}
