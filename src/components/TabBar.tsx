import { HomeIcon, LockOpenIcon, PlusIcon } from '@heroicons/react/24/outline'
import { NavLink } from 'react-router-dom'

const sideBase =
  'flex min-h-[62px] flex-1 flex-col items-center justify-center gap-0.5 font-display text-[10px] font-extrabold tracking-widest uppercase'

export function TabBar() {
  return (
    <nav
      aria-label="Main"
      className="fixed bottom-0 left-1/2 z-40 grid w-full max-w-[430px] -translate-x-1/2 grid-cols-3 items-stretch border-t-2 border-ink bg-cream pb-[env(safe-area-inset-bottom)]"
    >
      <NavLink
        to="/"
        end
        className={({ isActive }) =>
          `${sideBase} ${isActive ? 'bg-butter text-ink' : 'text-ink/60'}`
        }
      >
        {({ isActive }) => (
          <>
            <HomeIcon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 1.8} />
            Home
          </>
        )}
      </NavLink>

      {/* Raised center action: circular FAB overlapping the bar, label aligned
          with the side-tab labels via matching bottom padding. */}
      <div className="relative flex flex-col items-center justify-end pb-[13px]">
        <NavLink
          to="/create"
          aria-label="Seal it, create a new seal"
          className={({ isActive }) =>
            `absolute -top-6 left-1/2 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full border-2 border-ink shadow-neo transition-transform active:translate-x-[calc(-50%+2px)] active:translate-y-[2px] active:shadow-none ${
              isActive ? 'bg-punch text-cream' : 'bg-grape text-cream'
            }`
          }
        >
          <PlusIcon className="h-7 w-7" strokeWidth={2.5} />
        </NavLink>
        <span className="font-display text-[10px] font-extrabold tracking-widest uppercase">
          Seal it
        </span>
      </div>

      <NavLink
        to="/open"
        className={({ isActive }) =>
          `${sideBase} ${isActive ? 'bg-butter text-ink' : 'text-ink/60'}`
        }
      >
        {({ isActive }) => (
          <>
            <LockOpenIcon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 1.8} />
            Open
          </>
        )}
      </NavLink>
    </nav>
  )
}
