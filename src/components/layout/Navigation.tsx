import { LayoutGrid, List } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/', label: 'Board', icon: LayoutGrid },
  { to: '/agenda', label: 'Agenda', icon: List },
] as const

export function Navigation() {
  return (
    <nav className="relative z-10 border-b border-border/30">
      <div className="container flex items-center gap-1 px-4">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all border-b-2',
                isActive
                  ? 'border-[#00d4ff] text-[#00d4ff]'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              )
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
