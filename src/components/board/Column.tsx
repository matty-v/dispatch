import { Badge } from '@/components/ui/Badge'
import { TaskCard } from './TaskCard'
import type { DispatchTask, TaskStatus } from '@/lib/types'

const statusBadgeMap: Record<TaskStatus, 'scheduled' | 'in-progress' | 'done' | 'error' | 'paused'> = {
  'Scheduled': 'scheduled',
  'In Progress': 'in-progress',
  'Done': 'done',
  'Error': 'error',
  'Paused': 'paused',
}

interface ColumnProps {
  status: TaskStatus
  tasks: DispatchTask[]
  onTaskClick?: (task: DispatchTask) => void
}

export function Column({ status, tasks, onTaskClick }: ColumnProps) {
  return (
    <div className="flex flex-col min-w-[260px] max-w-[320px] flex-1">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-border/30">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          {status}
        </h3>
        <Badge variant={statusBadgeMap[status]} className="text-[10px]">
          {tasks.length}
        </Badge>
      </div>

      <div className="flex flex-col gap-2 flex-1">
        {tasks.length === 0 ? (
          <p className="text-xs text-muted-foreground/50 text-center py-8">
            No tasks
          </p>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={() => onTaskClick?.(task)}
            />
          ))
        )}
      </div>
    </div>
  )
}
