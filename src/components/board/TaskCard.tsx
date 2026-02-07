import { Clock, Play, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'
import type { DispatchTask } from '@/lib/types'

const typeVariantMap = {
  recurring: 'recurring',
  'one-shot': 'one-shot',
  reminder: 'reminder',
} as const

const typeClassMap = {
  recurring: 'task-type-recurring',
  'one-shot': 'task-type-one-shot',
  reminder: 'task-type-reminder',
} as const

interface TaskCardProps {
  task: DispatchTask
  onClick?: () => void
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left tech-card rounded-lg p-3 cursor-pointer hover:scale-[1.02] transition-all',
        typeClassMap[task.type]
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="text-sm font-medium text-foreground truncate">{task.name}</h4>
        <Badge variant={typeVariantMap[task.type]} className="shrink-0 text-[10px]">
          {task.type}
        </Badge>
      </div>

      {task.description && (
        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
          {task.description}
        </p>
      )}

      <div className="flex flex-col gap-1 text-xs text-muted-foreground">
        {task.schedule && (
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span className="truncate">{task.schedule}</span>
          </div>
        )}
        {task.nextRun && (
          <div className="flex items-center gap-1">
            <Play className="h-3 w-3" />
            <span className="truncate">Next: {task.nextRun}</span>
          </div>
        )}
        {task.lastResult && (
          <div className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            <span className="truncate">{task.lastResult}</span>
          </div>
        )}
      </div>
    </button>
  )
}
