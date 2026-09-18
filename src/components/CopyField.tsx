import { CheckIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'
import { legacyCopy } from '../lib/share'

export function CopyField({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(value)
    } catch {
      // Fallback for contexts without async clipboard (see lib/share).
      legacyCopy(value)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div>
      <span className="mb-1 block font-display text-xs font-extrabold tracking-wider uppercase">
        {label}
      </span>
      <div className="flex items-stretch gap-2">
        <input
          readOnly
          value={value}
          onFocus={(e) => e.target.select()}
          className="min-h-[48px] w-full min-w-0 border-2 border-ink bg-paper px-3 py-2 font-mono text-xs break-all"
        />
        <button
          type="button"
          onClick={copy}
          className="flex min-h-[48px] min-w-[48px] shrink-0 cursor-pointer items-center justify-center border-2 border-ink bg-butter px-3 shadow-neo-sm transition-transform active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
          aria-label={copied ? 'Copied' : 'Copy to clipboard'}
        >
          {copied ? <CheckIcon className="h-5 w-5" /> : <ClipboardDocumentIcon className="h-5 w-5" />}
        </button>
      </div>
      {copied && (
        <p className="mt-1 text-xs font-bold text-kelly">Copied! Go share it!</p>
      )}
    </div>
  )
}
