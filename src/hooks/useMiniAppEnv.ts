import { useEffect, useState } from 'react'
import { isInsideNimiqPay } from '../lib/nimiq'

export type MiniAppEnv = 'checking' | 'miniapp' | 'browser'

/** Detect whether we run inside Nimiq Pay (wallet provider present). */
export function useMiniAppEnv(): MiniAppEnv {
  const [env, setEnv] = useState<MiniAppEnv>('checking')
  useEffect(() => {
    let alive = true
    isInsideNimiqPay().then((inside) => {
      if (alive) setEnv(inside ? 'miniapp' : 'browser')
    })
    return () => {
      alive = false
    }
  }, [])
  return env
}
