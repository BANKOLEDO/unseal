import { Link } from 'react-router-dom'
import { NeoButton } from '../components/NeoButton'
import { SealIntact } from '../components/SealMark'

export function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="border-2 border-ink bg-white p-6 text-center shadow-neo-lg">
        <SealIntact className="mx-auto h-16 w-16" />
        <h1 className="font-display mt-3 text-3xl font-extrabold">404: NOTHING SEALED HERE</h1>
        <p className="mt-2 text-sm">This page doesn&apos;t exist. The seal remains unbroken.</p>
        <Link to="/" className="mt-4 inline-block">
          <NeoButton tone="grape">Back home</NeoButton>
        </Link>
      </div>
    </div>
  )
}
