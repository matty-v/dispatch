import { useCallback, useState } from 'react'
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
    if (!isConnected) return

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
  }, [isConnected, queryClient])

  return {
    ...state,
    isConnected,
    sync,
  }
}
