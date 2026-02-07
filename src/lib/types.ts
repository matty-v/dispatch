export type TaskType = 'recurring' | 'one-shot' | 'reminder'

export type TaskStatus = 'Scheduled' | 'In Progress' | 'Done' | 'Error' | 'Paused'

export interface DispatchTask {
  id: string
  name: string
  type: TaskType
  status: TaskStatus
  schedule: string
  description: string
  nextRun: string
  lastRun: string
  lastResult: string
  createdAt: string
  updatedAt: string
}

export type SyncOperation = 'create' | 'update' | 'delete'

export interface PendingSync {
  id?: number
  taskId: string
  operation: SyncOperation
  data?: DispatchTask
  createdAt: string
}

export interface SheetRow {
  id: string
  name: string
  type: string
  status: string
  schedule: string
  description: string
  nextRun: string
  lastRun: string
  lastResult: string
  createdAt: string
  updatedAt: string
}
