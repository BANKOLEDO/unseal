// Brag sharing with layered fallbacks:
// native share sheet → async clipboard → legacy execCommand → manual box.

export type ShareOutcome = 'shared' | 'dismissed' | 'manual'

export interface BragInput {
  title: string
  text: string
  url: string
}

export function bragMessage(input: BragInput): string {
  return `${input.text} ${input.url}`
}

/**
 * Legacy clipboard copy for contexts without the async Clipboard API
 * (plain-HTTP LAN testing, older WebViews). The helper textarea MUST stay
 * inside the visual viewport and receive focus: mobile browsers refuse to
 * select off-screen elements and silently copy nothing.
 */
export function legacyCopy(text: string): boolean {
  try {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.setAttribute('readonly', '')
    ta.style.position = 'fixed'
    ta.style.top = '0'
    ta.style.left = '0'
    ta.style.opacity = '0'
    ta.style.pointerEvents = 'none'
    ta.style.fontSize = '16px'
    document.body.appendChild(ta)
    ta.focus()
    ta.select()
    ta.setSelectionRange(0, ta.value.length)
    const ok = document.execCommand('copy')
    ta.remove()
    try {
      ;(document.activeElement as HTMLElement | null)?.blur?.()
    } catch {
      // focus cleanup is best-effort
    }
    return ok
  } catch {
    return false
  }
}

/**
 * Share a crack announcement. Resolves 'shared' when the message verifiably
 * left the device (sheet accepted or clipboard written), 'dismissed' when the
 * user closed the sheet, or 'manual' when nothing programmatic worked and the
 * caller should show the text for hand-copying.
 */
export async function shareBrag(input: BragInput): Promise<ShareOutcome> {
  const nav = navigator as Navigator & {
    share?: (data: { title?: string; text?: string; url?: string }) => Promise<void>
  }
  if (typeof nav.share === 'function') {
    try {
      await nav.share({ title: input.title, text: input.text, url: input.url })
      return 'shared'
    } catch {
      return 'dismissed'
    }
  }
  if (typeof navigator.clipboard?.writeText === 'function') {
    try {
      await navigator.clipboard.writeText(bragMessage(input))
      return 'shared'
    } catch {
      // fall through to the legacy path
    }
  }
  try {
    return legacyCopy(bragMessage(input)) ? 'shared' : 'manual'
  } catch {
    return 'manual'
  }
}
