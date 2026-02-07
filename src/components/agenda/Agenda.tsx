import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { AgendaItem } from './AgendaItem'
import { TaskDetail } from '@/components/task/TaskDetail'
import { TaskForm } from '@/components/task/TaskForm'
import { TaskFilters } from '@/components/task/TaskFilters'
import { useTasks } from '@/hooks/use-tasks'
import { useFilters } from '@/hooks/use-filters'
import type { DispatchTask } from '@/lib/types'

export function Agenda() {
  const { data: tasks, isLoading } = useTasks()
  const { filters, setFilters, filteredTasks } = useFilters(tasks)
  const [selectedTask, setSelectedTask] = useState<DispatchTask | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground text-sm">Loading tasks...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold glow-cyan">Agenda</h2>
        <Button size="sm" onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-1" />
          New Task
        </Button>
      </div>

      <TaskFilters filters={filters} onFiltersChange={setFilters} />

      <div className="flex flex-col gap-2 mt-4">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-sm">No tasks found</p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <AgendaItem
              key={task.id}
              task={task}
              onClick={() => setSelectedTask(task)}
            />
          ))
        )}
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
