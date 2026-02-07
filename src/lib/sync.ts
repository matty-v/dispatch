import { db } from './db'
import { getTasksSheet } from './tasks-api'
import { sheetRowToTask, taskToSheetRow } from './transformers'
import type { DispatchTask, SheetRow, SyncOperation } from './types'

export async function queueSync(
  taskId: string,
  operation: SyncOperation,
  data?: DispatchTask
): Promise<void> {
  await db.pendingSync.add({
    taskId,
    operation,
    data,
    createdAt: new Date().toISOString(),
  })
}

export async function processSyncQueue(): Promise<{ synced: number; errors: number }> {
  const sheet = getTasksSheet()
  if (!sheet) return { synced: 0, errors: 0 }

  const pending = await db.pendingSync.toArray()
  let synced = 0
  let errors = 0

  for (const item of pending) {
    try {
      if (item.operation === 'create' && item.data) {
        const row = taskToSheetRow(item.data)
        await sheet.createRow(row)
      } else if (item.operation === 'update' && item.data) {
        const rows = await sheet.getRows<SheetRow>()
        const rowIndex = rows.findIndex((r) => r.id === item.taskId)
        if (rowIndex >= 0) {
          const row = taskToSheetRow(item.data)
          await sheet.updateRow(rowIndex + 1, row)
        }
      } else if (item.operation === 'delete') {
        const rows = await sheet.getRows<SheetRow>()
        const rowIndex = rows.findIndex((r) => r.id === item.taskId)
        if (rowIndex >= 0) {
          await sheet.deleteRow(rowIndex + 1)
        }
      }

      await db.pendingSync.delete(item.id!)
      synced++
    } catch {
      errors++
    }
  }

  return { synced, errors }
}

export async function pullFromRemote(): Promise<DispatchTask[]> {
  const sheet = getTasksSheet()
  if (!sheet) return []

  const rows = await sheet.getRows<SheetRow>()
  const remoteTasks = rows.map(sheetRowToTask)

  for (const remote of remoteTasks) {
    const local = await db.tasks.get(remote.id)
    if (!local || remote.updatedAt >= local.updatedAt) {
      await db.tasks.put(remote)
    }
  }

  // Remove local tasks that no longer exist remotely (unless they have pending syncs)
  const localTasks = await db.tasks.toArray()
  const remoteIds = new Set(remoteTasks.map((t) => t.id))
  const pendingSyncs = await db.pendingSync.toArray()
  const pendingIds = new Set(pendingSyncs.map((p) => p.taskId))

  for (const local of localTasks) {
    if (!remoteIds.has(local.id) && !pendingIds.has(local.id)) {
      await db.tasks.delete(local.id)
    }
  }

  return await db.tasks.toArray()
}
