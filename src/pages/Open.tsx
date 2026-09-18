import { ArrowRightIcon, SparklesIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { NeoButton } from '../components/NeoButton'
import { PadlockMark } from '../components/SealMark'
import { StackLines } from '../components/StackLines'
import { mintDemoSeal } from '../lib/demo'

export function Open() {
  const [value, setValue] = useState('')
  const [error, setError] = useState('')
  const [makingDemo, setMakingDemo] = useState(false)
  const navigate = useNavigate()

  function open() {
    setError('')
    const v = value.trim()
    if (!v) {
      setError('Paste a seal link first.')
      return
    }
    const match = v.match(/[?#&]g=([A-Za-z0-9\-_]+)/)
    const g = match ? match[1] : v
    if (!/^[A-Za-z0-9\-_]+$/.test(g)) {
      setError('That does not look like a seal link. It should contain ?g=… or #/s?g=…')
      return
    }
    navigate(`/s?g=${g}`)
  }

  async function openDemoSeal() {
    setError('')
    setMakingDemo(true)
    try {
      navigate(`/s?g=${await mintDemoSeal()}`)
    } catch {
      setError('Could not mint the demo seal. Check crypto support and retry.')
      setMakingDemo(false)
    }
  }

  return (
    <div className="px-4 pt-5">
      <div className="flex items-center gap-3">
        <PadlockMark className="h-12 w-12" />
        <StackLines
          className="text-2xl leading-[0.95]"
          lines={[{ text: 'CRACK', colorClass: 'text-grape' }, { text: 'A SEAL.', colorClass: 'text-punch' }]}
        />
      </div>
      <p className="mt-2 text-sm font-medium">
        Got a seal link? Paste it below. Nothing opens until you decide to pay.
      </p>

      <div className="mt-4 border-2 border-ink bg-white p-5 shadow-neo">
        <div className="flex flex-col gap-2">
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && open()}
            placeholder="unseal.app/#/s?g=…"
            className="min-h-[48px] w-full min-w-0 border-2 border-ink bg-paper px-3 py-2 font-mono text-xs"
            aria-label="Paste a seal link"
            spellCheck={false}
          />
          <NeoButton tone="ink" onClick={open} className="w-full">
            Peek at the seal <ArrowRightIcon className="h-5 w-5" />
          </NeoButton>
        </div>
        {error && <p className="mt-2 text-sm font-bold text-punch">{error}</p>}
      </div>

      <div className="mt-4 border-2 border-dashed border-ink bg-paper p-4">
        <p className="font-display text-xs font-extrabold tracking-wider uppercase">
          No link handy?
        </p>
        <p className="mt-1 text-sm">Crack a sample seal to feel the full pay → reveal flow.</p>
        <NeoButton tone="butter" onClick={openDemoSeal} disabled={makingDemo} className="mt-3 w-full">
          <SparklesIcon className="h-5 w-5" />
          {makingDemo ? 'Minting demo seal…' : 'Open a demo seal'}
        </NeoButton>
      </div>
    </div>
  )
}
