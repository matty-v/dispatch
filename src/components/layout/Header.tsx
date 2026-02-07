import { RefreshCw, Settings } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { useSync } from '@/hooks/use-sync'

export function Header() {
  const { isSyncing, isConnected, sync } = useSync()

  return (
    <header className="relative z-10 border-b border-border/50 backdrop-blur-sm">
      <div className="container flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold tracking-wider glow-cyan">
            DISPATCH
          </h1>
          <span className="text-xs text-muted-foreground hidden sm:inline">
            // command center
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isConnected && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => sync()}
              disabled={isSyncing}
              title="Sync with Google Sheets"
            >
              <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
            </Button>
          )}
          <Button variant="ghost" size="icon" asChild>
            <Link to="/settings" title="Settings">
              <Settings className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
