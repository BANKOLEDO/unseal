// Terms of Service + Privacy Policy, styled to match the brand.
// Plain, honest pages for a plain, honest app. No legalese cadence.

import { Link } from 'react-router-dom'
import { NeoButton } from '../components/NeoButton'

interface Section {
  title: string
  body: string[]
}

function LegalPage({
  eyebrow,
  title,
  updated,
  intro,
  sections,
}: {
  eyebrow: string
  title: string
  updated: string
  intro: string
  sections: Section[]
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="border-2 border-ink bg-white shadow-neo-lg">
        <div className="border-b-2 border-ink bg-grape px-4 py-3 text-cream">
          <p className="font-display text-xs font-extrabold tracking-widest uppercase">{eyebrow}</p>
          <h1 className="font-display mt-0.5 text-2xl font-extrabold">{title}</h1>
        </div>
        <div className="p-4">
          <p className="text-[13px] leading-relaxed">{intro}</p>
          <p className="mt-1 text-[11px] font-bold text-ink/50">Last updated: {updated}</p>
          <div className="mt-4 space-y-5">
            {sections.map((s, i) => (
              <section key={s.title}>
                <h2 className="font-display text-sm font-extrabold tracking-wider uppercase">
                  {i + 1}. {s.title}
                </h2>
                <div className="mt-1 space-y-1.5">
                  {s.body.map((p) => (
                    <p key={p} className="text-[13px] leading-relaxed">
                      {p}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>
          <Link to="/" className="mt-6 inline-block">
            <NeoButton tone="grape">Back home</NeoButton>
          </Link>
        </div>
      </div>
    </div>
  )
}

const TERMS: Section[] = [
  {
    title: 'What Unseal is',
    body: [
      'Unseal is a micro-paywall Mini App for Nimiq Pay. A creator locks a link or a short secret behind a small NIM or USDT fee and shares one link. The buyer pays and instantly gets the contents.',
      'Unseal is not a platform, marketplace, or store. You are dealing directly with the person who made the seal.',
    ],
  },
  {
    title: 'Payments, escrow and refunds',
    body: [
      'Unseal never holds, escrows, or touches money. Every payment goes buyer-to-creator, wallet-to-wallet: NIM on the Nimiq blockchain, or USDT on Polygon via your own wallet address.',
      'Because funds move directly and instantly, there are no refunds, chargebacks, or reversal mechanisms. Before you pay, always check the price and the creator address shown in your wallet prompt. You will see them before you approve.',
      'Disputes are between you and the creator. If what you unlocked was junk, that is a creator-payment problem, not something Unseal can undo.',
    ],
  },
  {
    title: 'Your responsibility as a creator',
    body: [
      'You are responsible for the content you seal and for the address that payments land in.',
      'Do not use Unseal to hide or distribute anything illegal, malicious, or deceptive. No phishing pages, malware links, or scam bait. Unseal is a peer-to-peer tool, so there is no moderation; keep it honest.',
    ],
  },
  {
    title: 'The limits of a seal',
    body: [
      'A seal stores its payload entirely inside the share link. There is no server and no database, but that also means the unlocking key travels with the link.',
      'Seals are a casual, honour-based paywall: they stop casual freeloaders, not cryptographers. Treat a seal like a ticket, not a safe. If you want real secrecy, your secret should be needed only by humans who would pay for it, not genuinely secret material.',
    ],
  },
  {
    title: 'Network fees and volatility',
    body: [
      'You pay blockchain network fees on top of the seal price, in NIM or in Polygon gas. Those go to the network, not to Unseal.',
      'Crypto prices move. What cost 10 NIM yesterday may cost differently today. Unseal gives you no financial advice.',
    ],
  },
  {
    title: 'Availability and changes',
    body: [
      'Unseal may be updated, changed, or taken down at any time. Any seal links you already shared keep working because the payload lives in the link itself, not on our servers (we have none).',
      'We may update these terms; the “Last updated” date at the top reflects the latest version.',
    ],
  },
  {
    title: 'Limitation of liability',
    body: [
      'Unseal is provided “as is” without warranties of any kind. To the maximum extent permitted by law, Unseal is not liable for lost funds, lost content, failed payments, or anything you seal, buy, or share through it.',
    ],
  },
  {
    title: 'Contact',
    body: [
      'This is an open-source build for the Nimiq ecosystem. You can reach the maintainers through the Nimiq community or the repository where you obtained Unseal.',
    ],
  },
]

const PRIVACY: Section[] = [
  {
    title: 'No accounts, no servers',
    body: [
      'Unseal has no backend and no accounts. It does not set cookies, use fingerprinting, or communicate with any Unseal-run server.',
      'Everything is generated and processed in your browser. This policy is a promise about what a purely client-side app does with your data: almost nothing.',
    ],
  },
  {
    title: 'Anonymous open counting',
    body: [
      'To know whether anyone uses Unseal, the app counts anonymous page opens with Umami, a cookie-free counter. It sees a visit happened, never who visited. No wallets, keys, balances, or seal contents are collected. Seal links carry their payload in the page address, and that part is excluded from counting. Your browser Do Not Track setting is respected.',
    ],
  },
  {
    title: 'What is stored on your device',
    body: [
      'Unseal saves a few small things in your browser storage (localStorage) so the app remembers you:',
      '· Seals you chose to save to “Your Stash”, stored under unseal:my-seals:v1',
      '· Your crack record, streaks, and volumes, under unseal:cracks:v1',
      '· Whether you have seen the intro, under unseal:onboarded:v1',
      'None of this leaves your device or is visible to anyone else. Clear your site data (or reinstall your browser) and it is gone.',
    ],
  },
  {
    title: 'Sealed content',
    body: [
      'The link, title, price, creator address, and encrypted contents of a seal are packed into the share URL itself. They are never uploaded, indexed, or readable by us. We have nowhere to put them.',
      'Anyone with the link can view the seal’s metadata. That is how sharing works.',
    ],
  },
  {
    title: 'Payments, wallets and blockchain',
    body: [
      'Payments are made through your own wallet: Nimiq Pay for NIM, or your connected EVM wallet for USDT on Polygon. Unseal never sees your private keys, balances, or seed.',
      'A successful payment is recorded on a public blockchain (Nimiq or Polygon) forever. This includes the wallet addresses involved and, for NIM seals, any shout message you chose to attach. The shout rides in the public transaction data. Anyone can read it. Do not put anything sensitive in a shout.',
      'An optional tip is a second, separate payment to a public Unseal address. Like any payment, it stays visible on-chain.',
    ],
  },
  {
    title: 'Encryption',
    body: [
      'Secrets are encrypted in your browser with AES-256-GCM using a fresh random key per seal. Because the key ships inside the link so the buyer can decrypt, the encryption protects casual prying. See the Terms for the honest limits of a seal.',
    ],
  },
  {
    title: 'Children',
    body: [
      'Unseal is not directed at children under 13, and its payments involve cryptocurrencies, something a child should only touch with a guardian’s involvement. We do not knowingly collect any personal data from anyone, child or adult, by design.',
    ],
  },
  {
    title: 'Changes to this policy',
    body: [
      'If this policy changes, the “Last updated” date at the top of this page will change. Because nothing is sent to any server, the practical impact of any change is limited to how the app behaves on your device.',
    ],
  },
]

export function Terms() {
  return (
    <LegalPage
      eyebrow="The fine print, honestly"
      title="Terms of Service"
      updated="September 5, 2026"
      intro="Unseal is a peer-to-peer paywall with no escrow, no accounts, and no platform behind it. These terms say what that really means, short and plain."
      sections={TERMS}
    />
  )
}

export function Privacy() {
  return (
    <LegalPage
      eyebrow="What your device keeps to itself"
      title="Privacy Policy"
      updated="September 5, 2026"
      intro="Unseal has no backend and no accounts. This page explains the small footprint the app leaves: what stays on your device, what goes to the blockchain, and what never leaves your browser."
      sections={PRIVACY}
    />
  )
}