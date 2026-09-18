import { AnimatePresence, motion } from 'motion/react'
import { lazy, Suspense, useEffect, useState, type ReactNode } from 'react'
import { HashRouter, Route, Routes, useLocation } from 'react-router-dom'
import { ErrorBoundary } from './components/ErrorBoundary'
import { CoinMark } from './components/SealMark'
import { Splash } from './components/Splash'
import { StringSticker } from './components/StringSticker'
import { TabBar } from './components/TabBar'
import { TopBar } from './components/TopBar'
import { ONBOARDED_KEY } from './lib/keys'

// Pages load on demand so the first paint stays light inside Nimiq Pay.
const Home = lazy(() => import('./pages/Home').then((m) => ({ default: m.Home })))
const Create = lazy(() => import('./pages/Create').then((m) => ({ default: m.Create })))
const Open = lazy(() => import('./pages/Open').then((m) => ({ default: m.Open })))
const Unlock = lazy(() => import('./pages/Unlock').then((m) => ({ default: m.Unlock })))
const Onboarding = lazy(() => import('./pages/Onboarding').then((m) => ({ default: m.Onboarding })))
const NotFound = lazy(() => import('./pages/NotFound').then((m) => ({ default: m.NotFound })))
const Terms = lazy(() => import('./pages/legal').then((m) => ({ default: m.Terms })))
const Privacy = lazy(() => import('./pages/legal').then((m) => ({ default: m.Privacy })))

function ScrollToTop() {
  const { pathname, search } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname, search])
  return null
}

function readOnboarded(): boolean {
  try {
    return localStorage.getItem(ONBOARDED_KEY) === '1'
  } catch {
    return false
  }
}

type Stage = 'splash' | 'onboarding' | 'app'

function Boot() {
  const [stage, setStage] = useState<Stage>('splash')
  const [onboarded] = useState(readOnboarded)

  if (stage === 'splash') {
    return (
      <Backdrop bare>
        <Splash onDone={() => setStage(onboarded ? 'app' : 'onboarding')} />
      </Backdrop>
    )
  }
  if (stage === 'onboarding') {
    return (
      <Backdrop bare>
        <Suspense fallback={null}>
          <Onboarding onDone={() => setStage('app')} />
        </Suspense>
      </Backdrop>
    )
  }
  return <Shell />
}

/**
 * Poster-style desktop backdrop: gradient plum with diagonal pink/kelly
 * bands, halftone fields, a torn-paper slash, ghost words, drifting pop
 * marks, and string-hung stickers flanking the phone column.
 * On phones it collapses to nothing. The column IS the screen.
 */
function Backdrop({ children, bare = false }: { children: ReactNode; bare?: boolean }) {
  return (
    <div className="relative min-h-dvh bg-[linear-gradient(165deg,#4a154b_0%,#3a0ca3_55%,#2a0875_100%)]">
      <div className="noise pointer-events-none absolute inset-0 hidden overflow-hidden sm:block" aria-hidden>
        {/* soft glow behind the column */}
        <div className="absolute top-1/2 left-1/2 h-[72vmin] w-[72vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,#ffd1662e_0%,transparent_60%)]" />
        {/* corner bands: pink top-left, kelly bottom-right */}
        <div className="absolute -top-20 -left-24 h-72 w-72 rotate-12 bg-punch" />
        <div className="absolute -right-28 -bottom-24 h-80 w-80 -rotate-12 bg-kelly" />
        {/* halftone fields behind the ghost words */}
        <div className="halftone-pop absolute top-1/2 left-[max(3rem,calc(50%_-_380px))] h-64 w-80 -translate-y-1/2 opacity-50" />
        <div className="halftone-kelly absolute top-1/2 right-[max(3rem,calc(50%_-_380px))] h-64 w-80 -translate-y-1/2 opacity-50" />
        {/* torn-paper cream slash */}
        <div className="absolute top-12 left-0 h-8 w-[110%] -rotate-2 border-y-2 border-ink bg-cream/85" />
        {/* ghost words, mirror-flanking the column */}
        <span className="text-outline-cream absolute top-[34%] left-10 -rotate-90 font-display text-7xl font-extrabold tracking-tight opacity-25">
          SEALED
        </span>
        <span className="text-outline-cream absolute top-[34%] right-10 rotate-90 font-display text-7xl font-extrabold tracking-tight opacity-25">
          UNSEAL
        </span>
        {/* string stickers on a shared top row */}
        <div className="absolute top-[13%] left-[max(2.5rem,calc(50%_-_400px))]">
          <StringSticker colorClass="bg-butter text-ink" stringLength={70}>
            0% cut,
            <br />
            forever
          </StringSticker>
        </div>
        <div className="absolute top-[13%] right-[max(2.5rem,calc(50%_-_400px))]">
          <StringSticker colorClass="bg-splash text-ink" stringLength={90} swingDelay={1.4}>
            1-tap
            <br />
            unlock
          </StringSticker>
        </div>
        {/* lone coin mark bottom-left, for balance */}
        <motion.div
          animate={{ y: [0, -12, 0], rotate: [-5, 4, -5] }}
          transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
          className="absolute bottom-[14%] left-[max(2.5rem,calc(50%_-_400px))] hidden lg:block"
        >
          <CoinMark className="h-24 w-24" />
        </motion.div>
      </div>

      <div
        className={
          bare
            ? 'relative mx-auto min-h-dvh w-full max-w-[430px] bg-cream sm:border-x-2 sm:border-ink'
            : 'relative mx-auto min-h-dvh w-full max-w-[430px] bg-cream sm:border-x-2 sm:border-ink sm:shadow-[12px_0_0_#1A1A1A,-12px_0_0_#1A1A1A]'
        }
      >
        {children}
      </div>
    </div>
  )
}

/** Slim loader shown while a lazy route chunk fetches. */
function RouteFallback() {
  return (
    <div className="px-4 py-8">
      <div className="flex h-36 items-center justify-center border-2 border-dashed border-ink/40 bg-cream">
        <span className="inline-block h-6 w-6 animate-spin rounded-full border-[3px] border-ink border-t-transparent" />
      </div>
    </div>
  )
}

function Shell() {
  const location = useLocation()
  // The unlock screen is a focused checkout. It brings its own sticky pay bar.
  const hideTabs =
    location.pathname.startsWith('/s') ||
    location.pathname === '/terms' ||
    location.pathname === '/privacy'

  return (
    <Backdrop>
      <div className="paper-grain flex min-h-dvh flex-col">
        <TopBar />
        <AnimatePresence mode="wait" initial={false}>
          <motion.main
            key={location.pathname + location.search}
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -32 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            // Bottom breathing room matches the visible bottom bar exactly
            // (tab bar where it shows, nothing on tab-less pages).
            className={
              hideTabs ? 'flex-1' : 'flex-1 pb-[calc(64px+env(safe-area-inset-bottom))]'
            }
          >
            <Suspense fallback={<RouteFallback />}>
              <Routes location={location}>
                <Route path="/" element={<Home />} />
                <Route path="/create" element={<Create />} />
                <Route path="/open" element={<Open />} />
                <Route path="/s" element={<Unlock />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </motion.main>
        </AnimatePresence>
        {!hideTabs && <TabBar />}
      </div>
    </Backdrop>
  )
}

// HashRouter keeps every route client-side and, crucially, keeps the gate
// payload (`#/s?g=…`) in the URL fragment, so sealed content is never sent to
// any server. It also works on plain static hosting with no rewrites.
export default function App() {
  return (
    <HashRouter>
      <ErrorBoundary>
        <ScrollToTop />
        <Boot />
      </ErrorBoundary>
    </HashRouter>
  )
}
