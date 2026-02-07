import type { DispatchTask, SheetRow, TaskStatus, TaskType } from './types'

const VALID_TYPES: TaskType[] = ['recurring', 'one-shot', 'reminder']
const VALID_STATUSES: TaskStatus[] = ['Scheduled', 'In Progress', 'Done', 'Error', 'Paused']

export function sheetRowToTask(row: SheetRow): DispatchTask {
  return {
    id: row.id,
    name: row.name || '',
    type: VALID_TYPES.includes(row.type as TaskType) ? (row.type as TaskType) : 'one-shot',
    status: VALID_STATUSES.includes(row.status as TaskStatus) ? (row.status as TaskStatus) : 'Scheduled',
    schedule: row.schedule || '',
    description: row.description || '',
    nextRun: row.nextRun || '',
    lastRun: row.lastRun || '',
    lastResult: row.lastResult || '',
    createdAt: row.createdAt || new Date().toISOString(),
    updatedAt: row.updatedAt || new Date().toISOString(),
  }
}

export function taskToSheetRow(task: DispatchTask): SheetRow {
  return {
    id: task.id,
    name: task.name,
    type: task.type,
    status: task.status,
    schedule: task.schedule,
    description: task.description,
    nextRun: task.nextRun,
    lastRun: task.lastRun,
    lastResult: task.lastResult,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  }
}
