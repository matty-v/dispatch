import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Column } from './Column'
import { TaskDetail } from '@/components/task/TaskDetail'
import { TaskForm } from '@/components/task/TaskForm'
import { useTasks } from '@/hooks/use-tasks'
import type { DispatchTask, TaskStatus } from '@/lib/types'

const COLUMNS: TaskStatus[] = ['Scheduled', 'In Progress', 'Done', 'Error', 'Paused']

export function Board() {
  const { data: tasks, isLoading } = useTasks()
  const [selectedTask, setSelectedTask] = useState<DispatchTask | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground text-sm">Loading tasks...</p>
      </div>
    )
  }

  const tasksByStatus = COLUMNS.reduce(
    (acc, status) => {
      acc[status] = (tasks || []).filter((t) => t.status === status)
      return acc
    },
    {} as Record<TaskStatus, DispatchTask[]>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold glow-cyan">Board</h2>
        <Button size="sm" onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-1" />
          New Task
        </Button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((status) => (
          <Column
            key={status}
            status={status}
            tasks={tasksByStatus[status]}
            onTaskClick={setSelectedTask}
          />
        ))}
      </div>

      <TaskDetail
        task={selectedTask}
        open={!!selectedTask}
        onClose={() => setSelectedTask(null)}
      />

      <TaskForm
        open={showCreateForm}
        onClose={() => setShowCreateForm(false)}
      />
    </div>
  )
}
