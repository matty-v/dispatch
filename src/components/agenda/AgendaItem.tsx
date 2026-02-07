import { Clock, Play, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'
import type { DispatchTask } from '@/lib/types'

const typeVariantMap = {
  recurring: 'recurring',
  'one-shot': 'one-shot',
  reminder: 'reminder',
} as const

const statusBadgeMap = {
  'Scheduled': 'scheduled',
  'In Progress': 'in-progress',
  'Done': 'done',
  'Error': 'error',
  'Paused': 'paused',
} as const

interface AgendaItemProps {
  task: DispatchTask
  onClick?: () => void
}

export function AgendaItem({ task, onClick }: AgendaItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left tech-card rounded-lg p-4 cursor-pointer hover:scale-[1.01] transition-all flex items-center gap-4'
      )}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="text-sm font-medium text-foreground truncate">{task.name}</h4>
          <Badge variant={typeVariantMap[task.type]} className="shrink-0 text-[10px]">
            {task.type}
          </Badge>
          <Badge variant={statusBadgeMap[task.status]} className="shrink-0 text-[10px]">
            {task.status}
          </Badge>
        </div>

        {task.description && (
          <p className="text-xs text-muted-foreground mb-1 truncate">
            {task.description}
          </p>
        )}

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {task.schedule && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{task.schedule}</span>
            </div>
          )}
          {task.lastResult && (
            <div className="flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              <span className="truncate">{task.lastResult}</span>
            </div>
          )}
        </div>
      </div>

      {task.nextRun && (
        <div className="shrink-0 text-right">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Play className="h-3 w-3" />
            <span>Next run</span>
          </div>
          <p className="text-sm font-medium text-foreground">{task.nextRun}</p>
        </div>
      )}
    </button>
  )
}
