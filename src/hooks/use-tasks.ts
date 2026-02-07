import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { v4 as uuidv4 } from 'uuid'
import { db } from '@/lib/db'
import { queueSync } from '@/lib/sync'
import type { DispatchTask } from '@/lib/types'

const TASKS_KEY = ['tasks'] as const

export function useTasks() {
  return useQuery({
    queryKey: TASKS_KEY,
    queryFn: () => db.tasks.toArray(),
  })
}

export function useTask(id: string | undefined) {
  return useQuery({
    queryKey: [...TASKS_KEY, id],
    queryFn: () => (id ? db.tasks.get(id) : undefined),
    enabled: !!id,
  })
}

export function useCreateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: Omit<DispatchTask, 'id' | 'createdAt' | 'updatedAt'>) => {
      const now = new Date().toISOString()
      const task: DispatchTask = {
        ...input,
        id: uuidv4(),
        createdAt: now,
        updatedAt: now,
      }
      await db.tasks.add(task)
      await queueSync(task.id, 'create', task)
      return task
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_KEY })
    },
  })
}

export function useUpdateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (updates: Partial<DispatchTask> & { id: string }) => {
      const existing = await db.tasks.get(updates.id)
      if (!existing) throw new Error('Task not found')

      const updated: DispatchTask = {
        ...existing,
        ...updates,
        updatedAt: new Date().toISOString(),
      }
      await db.tasks.put(updated)
      await queueSync(updated.id, 'update', updated)
      return updated
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_KEY })
    },
  })
}

export function useDeleteTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await db.tasks.delete(id)
      await queueSync(id, 'delete')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_KEY })
    },
  })
}
