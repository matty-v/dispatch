import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Navigation } from './Navigation'

export function Layout() {
  return (
    <div className="relative min-h-screen">
      {/* Background effects */}
      <div className="gradient-backdrop" />
      <div className="grid-overlay" />
      <div className="scanline" />
      <div className="corner-accent top-left" />
      <div className="corner-accent bottom-right" />

      {/* App content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />
        <Navigation />
        <main className="flex-1 container px-4 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
