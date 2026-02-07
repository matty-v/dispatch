import { useCallback, useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { processSyncQueue, pullFromRemote } from '@/lib/sync'
import { isConfigured } from '@/lib/tasks-api'

interface SyncState {
  isSyncing: boolean
  lastSync: Date | null
  error: string | null
}

export function useSync() {
  const queryClient = useQueryClient()
  const [state, setState] = useState<SyncState>({
    isSyncing: false,
    lastSync: null,
    error: null,
  })

  const isConnected = isConfigured()

  const sync = useCallback(async () => {
    if (!isConfigured()) return

    setState((prev) => ({ ...prev, isSyncing: true, error: null }))

    try {
      await processSyncQueue()
      await pullFromRemote()
      await queryClient.invalidateQueries({ queryKey: ['tasks'] })
      setState({ isSyncing: false, lastSync: new Date(), error: null })
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isSyncing: false,
        error: err instanceof Error ? err.message : 'Sync failed',
      }))
    }
  }, [queryClient])

  // Sync on mount
  useEffect(() => {
    sync()
  }, [sync])

  // Auto-sync every 30 seconds
  useEffect(() => {
    const interval = setInterval(sync, 30000)
    return () => clearInterval(interval)
  }, [sync])

  return {
    ...state,
    isConnected,
    sync,
  }
}
