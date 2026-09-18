// Last-resort crash shield: turns any unexpected React error into a friendly
// poster instead of a frozen white screen.

import { Component, type ReactNode } from 'react'
import { NeoButton } from './NeoButton'
import { SealIntact } from './SealMark'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-dvh items-center justify-center bg-cream px-4 py-10">
          <div className="w-full max-w-md border-2 border-ink bg-white p-8 text-center shadow-neo-lg">
            <SealIntact className="mx-auto h-14 w-14" />
            <h1 className="font-display mt-4 text-3xl font-extrabold">THE SEAL MELTED.</h1>
            <p className="mx-auto mt-2 max-w-sm text-sm">
              Something unexpected crashed the app. Reload and we&apos;ll be back. Your seals and
              cracks are safe on this device.
            </p>
            <div className="mt-6">
              <NeoButton tone="punch" onClick={() => window.location.reload()}>
                Reload Unseal
              </NeoButton>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}