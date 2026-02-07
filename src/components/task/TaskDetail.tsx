import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Label } from '@/components/ui/Label'
import { Badge } from '@/components/ui/Badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { useUpdateTask, useDeleteTask } from '@/hooks/use-tasks'
import type { DispatchTask, TaskStatus, TaskType } from '@/lib/types'

const statusBadgeMap = {
  'Scheduled': 'scheduled',
  'In Progress': 'in-progress',
  'Done': 'done',
  'Error': 'error',
  'Paused': 'paused',
} as const

interface TaskDetailProps {
  task: DispatchTask | null
  open: boolean
  onClose: () => void
}

export function TaskDetail({ task, open, onClose }: TaskDetailProps) {
  if (!task) return null

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent>
        <TaskDetailInner key={task.id} task={task} onClose={onClose} />
      </DialogContent>
    </Dialog>
  )
}

function TaskDetailInner({ task, onClose }: { task: DispatchTask; onClose: () => void }) {
  const updateTask = useUpdateTask()
  const deleteTask = useDeleteTask()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(task.name)
  const [type, setType] = useState<TaskType>(task.type)
  const [status, setStatus] = useState<TaskStatus>(task.status)
  const [schedule, setSchedule] = useState(task.schedule)
  const [description, setDescription] = useState(task.description)

  const handleSave = () => {
    updateTask.mutate(
      {
        id: task.id,
        name,
        type,
        status,
        schedule,
        description,
      },
      {
        onSuccess: () => {
          setEditing(false)
          onClose()
        },
      }
    )
  }

  const handleDelete = () => {
    deleteTask.mutate(task.id, {
      onSuccess: () => onClose(),
    })
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{editing ? 'Edit Task' : task.name}</DialogTitle>
        <DialogDescription>
          {editing ? 'Update task details.' : `Created ${task.createdAt}`}
        </DialogDescription>
      </DialogHeader>

      {editing ? (
        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Name</Label>
            <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-type">Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as TaskType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recurring">Recurring</SelectItem>
                <SelectItem value="one-shot">One-shot</SelectItem>
                <SelectItem value="reminder">Reminder</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-status">Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Scheduled">Scheduled</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Done">Done</SelectItem>
                <SelectItem value="Error">Error</SelectItem>
                <SelectItem value="Paused">Paused</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-schedule">Schedule</Label>
            <Input id="edit-schedule" value={schedule} onChange={(e) => setSchedule(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setEditing(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={updateTask.isPending}>
              {updateTask.isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4 mt-4">
          <div className="flex items-center gap-2">
            <Badge variant={statusBadgeMap[task.status]}>{task.status}</Badge>
            <Badge variant={task.type === 'recurring' ? 'recurring' : task.type === 'one-shot' ? 'one-shot' : 'reminder'}>
              {task.type}
            </Badge>
          </div>

          {task.description && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Description</p>
              <p className="text-sm">{task.description}</p>
            </div>
          )}

          {task.schedule && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Schedule</p>
              <p className="text-sm">{task.schedule}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {task.nextRun && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Next Run</p>
                <p className="text-sm">{task.nextRun}</p>
              </div>
            )}
            {task.lastRun && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Last Run</p>
                <p className="text-sm">{task.lastRun}</p>
              </div>
            )}
          </div>

          {task.lastResult && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Last Result</p>
              <p className="text-sm">{task.lastResult}</p>
            </div>
          )}

          <div className="flex justify-between pt-2">
            <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleteTask.isPending}>
              {deleteTask.isPending ? 'Deleting...' : 'Delete'}
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
              Edit
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
