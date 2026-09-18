# UNSEAL — Break the seal. Unlock the content.

A **zero-escrow micro-paywall mini app** for [Nimiq Pay](https://nimiq.dev/mini-apps).
Lock links, secret text, or digital access behind a tiny fee. Buyers pay the
creator's wallet **directly** — no middleman holds, no custody, no platform cut.

## How it works

1. **Seal it** — Enter a title, secret (link or text), price (NIM or USDT), and your
   payout address. The secret is encrypted in your browser with AES-GCM-256 and
   packed into a shareable link. Nothing is uploaded anywhere. Sealing is free.
2. **Share it** — The link carries the locked box in its URL fragment (`#/s?g=…`),
   so it is never sent to any server.
3. **Break the seal** — The buyer opens the link, sees the price, and pays via
   Nimiq Pay. The returned transaction hash proves broadcast, and the app
   decrypts locally with a seal-breaking animation.
4. **Brag about it** — Every crack mints a shareable certificate that links back
   to the seal.

| Currency | Rails | Payout address |
| -------- | ----- | -------------- |
| NIM | `sendBasicTransaction` (Luna units) via `@nimiq/mini-app-sdk` | NQ… Nimiq address |
| USDT | ERC-20 `transfer` on Polygon via `window.ethereum` (EIP-1193) | 0x… Polygon address |

## What cracking costs

The buyer pays three things at most, the creator receives one:

| Paid by buyer | Goes to | Amount |
| ------------- | ------- | ------ |
| Seal price | Creator, 100% | Set by creator (min 1 Luna / 1 micro-USDT) |
| Network fee | The network, not Unseal | Tiny (Luna dust on Nimiq, a little POL on Polygon) |
| Tip | Unseal treasury, only if the buyer opts in | 0 by default |

Sealing is free. Demo mode is free. Testnet NIM is free from the faucet.

Outside Nimiq Pay the app runs in **demo mode** with clearly-labeled simulated
payments, so the full flow is testable in any browser.

> **Honest security note:** the decryption key travels inside the share link, so
> the paywall is enforced by the app flow (pay first, then reveal), not by
> cryptography. Unseal is a casual/social paywall — it stops casual freeloaders,
> not cryptographers. Funds, however, are genuinely peer-to-peer: the app never
> holds money.

## Tech stack

- React 19 + React Router (HashRouter — static-host friendly, payload stays in the fragment)
- Tailwind CSS v4 (`@tailwindcss/vite`) + custom Neo-Retro Pop design tokens
- `motion` (`motion/react`) for splash, onboarding, tactile buttons, stickers, seal-break + confetti
- `@heroicons/react` for icons
- `@nimiq/mini-app-sdk` for NIM wallet access, `viem` for USDT calldata encoding
- Web Crypto API (AES-GCM) — no crypto dependencies
- Umami (cookie-free open counting, off unless configured — see Config)

## App shape

Mobile-app frame: a 430px phone column with an app bar, flush full-width bottom
tab bar (Home · Seal it · Open), slide transitions between screens, and a sticky
pay bar on the unlock screen. Scroll reveals slide in from the travel direction.
On desktop the column sits on a poster-style plum backdrop with corner color
bands, halftone fields, ghost words, grain, and string-hung stickers.

Boot flow: animated **splash** (seal slam + loading stripes) → 3-slide
**onboarding** (LOCK ANYTHING. / SHARE ONE LINK. / BANK IT DIRECTLY., once per
device) → tabs. The intro can be replayed from the Home footer.

## Social layer (local-first, zero backend)

- **On-chain shouts** — NIM unlocks accept an optional message that rides inside
  the payment via `sendBasicTransactionWithData`. The creator sees it forever.
- **Crack certificates** — every unlock mints a poster-style proof card (title,
  price, tx hash, crack number + level) with a **Brag about this crack** button
  (share sheet → clipboard → manual copy box) that links back to the seal.
- **Your record** — cracks, day streaks, and NIM/USDT volume tracked on-device,
  with levels from Seal Rookie to Seal Legend. Demo cracks never count.
- **Free demo seals** — one tap mints a 1-Luna demo seal so anyone can feel the
  full pay → reveal flow without spending.

## Business model

Free by design. The 0% cut is the trust pitch, and costs are near zero (static
hosting, no backend). Revenue paths: optional buyer tips (a second, separate
tx, default off), Creator Pro tools later, white-label instances for
communities. Money and payloads stay peer-to-peer either way.

## Config

Copy `.env.example` to `.env`. All four values are optional. Empty = off.

| Var | Enables |
| --- | ------- |
| `VITE_TIP_NIM_ADDRESS` | NIM tip button (your NQ treasury address) |
| `VITE_TIP_USDT_ADDRESS` | USDT tip button (your 0x Polygon address) |
| `VITE_UMAMI_WEBSITE_ID` | Anonymous open counting (ID from cloud.umami.is) |
| `VITE_UMAMI_DOMAINS` | Restrict counting to prod domains |

Set them before `npm run build` (Vite bakes them in at build time).

## Run it

```sh
npm install
npm run dev -- --host   # network URL → open in Nimiq Pay → Mini Apps → custom URL
```

Test with free testnet NIM: in Nimiq Pay, long-press settings to reach the dev
menu, switch to testnet, and tap **Get free NIM**.

```sh
npm run build    # tsc + production bundle (served OK from dist/)
npm run lint
npm run preview
```

## Project layout

```
src/
  lib/          crypto.ts (AES-GCM) · envelope.ts (gate encode/validate)
                nimiq.ts (NIM payments + on-chain shouts) · evm.ts (USDT payments)
                format.ts (incl. explorer links) · store.ts (stash)
                social.ts (crack record) · demo.ts (demo seals)
                share.ts (brag sharing + clipboard fallbacks)
                tips.ts (env-gated) · analytics.ts (env-gated) · keys.ts
  hooks/        useMiniAppEnv.ts (Nimiq Pay vs demo detection)
  components/   SealMark.tsx (SVG assets) · Wordmark · StackLines
                StringSticker · Sticker · NeoButton · TabBar
                Splash · ConfettiBurst · UnlockSeal · TopBar · CopyField
                Reveal (scroll-direction reveals) · ErrorBoundary
                SealQR (desktop to phone handoff)
  pages/        Home · Create · Open · Unlock · Onboarding · NotFound
                legal.tsx (Terms + Privacy)
  App.tsx       HashRouter + boot flow + phone-column shell (lazy routes)
```

## Design language

Neo-Retro Pop / Risograph: warm cream paper (`#FDF8F0`), deep indigo `#3A0CA3`,
hot pink `#F72585`, cyan `#4CC9F0`, butter `#FFD166`, kelly `#00A86B`; Syne
display + Space Grotesk body; 2px ink outlines with hard offset shadows;
sticker badges; press-down tactile buttons; sticky mobile pay CTA.

## License

MIT — see [LICENSE](LICENSE).
