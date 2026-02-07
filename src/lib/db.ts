import Dexie, { type Table } from 'dexie'
import type { DispatchTask, PendingSync } from './types'

export class DispatchDB extends Dexie {
  tasks!: Table<DispatchTask, string>
  pendingSync!: Table<PendingSync, number>

  constructor() {
    super('dispatch')
    this.version(1).stores({
      tasks: 'id, name, type, status, nextRun, createdAt',
      pendingSync: '++id, taskId, operation, createdAt',
    })
  }
}

export const db = new DispatchDB()
