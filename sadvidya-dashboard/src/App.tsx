/** Top-level layout: the nav, the settings drawer, and the three routes. */
import { useState } from 'react'
import { Link, NavLink, Route, Routes } from 'react-router-dom'
import SettingsDrawer from './components/SettingsDrawer'
import { useData } from './context/DataContext'
import AddReport from './pages/AddReport'
import ArticleDetail from './pages/ArticleDetail'
import Articles from './pages/Articles'
import Home from './pages/Home'

function NavItem({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        `btn text-sm ${isActive ? 'bg-sand text-ink' : 'text-ink/70 hover:bg-sand/60'}`
      }
    >
      {children}
    </NavLink>
  )
}

export default function App() {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const { languageFilter } = useData()

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-ink/10 bg-cream/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
          <Link to="/" className="mr-auto flex items-baseline gap-2">
            <span className="h-display text-base sm:text-lg">Translation Scorecard</span>
            <span className="hidden font-heading text-[11px] uppercase tracking-[0.14em] text-olive sm:inline">
              Sadvidya
            </span>
          </Link>

          <nav className="flex items-center gap-1">
            <NavItem to="/">Home</NavItem>
            <NavItem to="/articles">Articles</NavItem>
            <Link to="/add" className="btn-primary text-sm">
              + Add Report
            </Link>
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              className="btn-quiet text-sm"
              aria-label="Open settings"
              title="Settings"
            >
              ⚙
              {languageFilter !== 'All' && (
                <span className="font-heading text-[11px] text-terracotta">{languageFilter}</span>
              )}
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/articles" element={<Articles />} />
          <Route path="/articles/:id" element={<ArticleDetail />} />
          <Route path="/add" element={<AddReport />} />
          <Route
            path="*"
            element={
              <div className="card card-pad text-center">
                <p className="h-display text-lg">Page not found</p>
                <Link to="/" className="btn-primary mt-4">
                  Back to the Progress Garden
                </Link>
              </div>
            }
          />
        </Routes>
      </main>

      <footer className="mx-auto max-w-6xl px-4 pb-10 text-center text-[12px] text-ink/40 sm:px-6">
        Sadvidya Magazine · Shree Swaminarayan Gurukul, Rajkot — everything is stored only in this
        browser.
      </footer>

      <SettingsDrawer open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  )
}
