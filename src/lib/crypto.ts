// Client-side AES-GCM sealing for Unseal gates.
// The secret is encrypted with a fresh random 256-bit content key. The key
// travels inside the share link itself, so anyone holding the link can
// decrypt. The paywall is enforced by the app flow (pay first, then reveal),
// NOT by cryptography. Treat gates as a casual/social paywall, not DRM.

const te = new TextEncoder()
const td = new TextDecoder()

export function bytesToB64Url(bytes: Uint8Array): string {
  let bin = ''
  const CHUNK = 0x8000
  for (let i = 0; i < bytes.length; i += CHUNK) {
    bin += String.fromCharCode(...bytes.subarray(i, i + CHUNK))
  }
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function b64UrlToBytes(s: string): Uint8Array {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/')
  const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4)
  const bin = atob(padded)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}

export interface SealedPayload {
  /** b64url AES-GCM-256 content key */
  k: string
  /** b64url 96-bit IV */
  iv: string
  /** b64url ciphertext */
  ct: string
}

function getSubtle(): SubtleCrypto {
  const subtle = globalThis.crypto?.subtle
  if (!subtle) {
    throw new Error(
      'Web Crypto is unavailable in this context. Open Unseal over HTTPS (or inside Nimiq Pay).',
    )
  }
  return subtle
}

/** Encrypt plaintext into a sealed payload with a fresh random key. */
export async function sealSecret(plaintext: string): Promise<SealedPayload> {
  const subtle = getSubtle()
  const key = await subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, [
    'encrypt',
    'decrypt',
  ])
  const iv = globalThis.crypto.getRandomValues(new Uint8Array(12))
  const ct = await subtle.encrypt({ name: 'AES-GCM', iv }, key, te.encode(plaintext))
  const rawKey = await subtle.exportKey('raw', key)
  return {
    k: bytesToB64Url(new Uint8Array(rawKey)),
    iv: bytesToB64Url(iv),
    ct: bytesToB64Url(new Uint8Array(ct)),
  }
}

/** Copy bytes into an exactly-sized ArrayBuffer (satisfies BufferSource). */
function toExactBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.length)
  copy.set(bytes)
  return copy.buffer
}

/** Decrypt a sealed payload back to plaintext. Throws on tampered data. */
export async function unsealSecret(payload: SealedPayload): Promise<string> {
  const subtle = getSubtle()
  const key = await subtle.importKey(
    'raw',
    toExactBuffer(b64UrlToBytes(payload.k)),
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt'],
  )
  const pt = await subtle.decrypt(
    { name: 'AES-GCM', iv: toExactBuffer(b64UrlToBytes(payload.iv)) },
    key,
    toExactBuffer(b64UrlToBytes(payload.ct)),
  )
  return td.decode(pt)
}
