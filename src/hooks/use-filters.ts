import { useMemo, useState } from 'react'
import type { DispatchTask, TaskStatus, TaskType } from '@/lib/types'

interface FilterState {
  type: TaskType | 'all'
  status: TaskStatus | 'all'
  search: string
}

type SortField = 'nextRun' | 'name' | 'createdAt' | 'status'
type SortDirection = 'asc' | 'desc'

export function useFilters(tasks: DispatchTask[] | undefined) {
  const [filters, setFilters] = useState<FilterState>({
    type: 'all',
    status: 'all',
    search: '',
  })

  const [sortField, setSortField] = useState<SortField>('nextRun')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  const filteredTasks = useMemo(() => {
    if (!tasks) return []

    return tasks
      .filter((task) => {
        if (filters.type !== 'all' && task.type !== filters.type) return false
        if (filters.status !== 'all' && task.status !== filters.status) return false
        if (filters.search) {
          const search = filters.search.toLowerCase()
          return (
            task.name.toLowerCase().includes(search) ||
            task.description.toLowerCase().includes(search)
          )
        }
        return true
      })
      .sort((a, b) => {
        const aVal = a[sortField] || ''
        const bVal = b[sortField] || ''
        const cmp = aVal.localeCompare(bVal)
        return sortDirection === 'asc' ? cmp : -cmp
      })
  }, [tasks, filters, sortField, sortDirection])

  return {
    filters,
    setFilters,
    sortField,
    setSortField,
    sortDirection,
    setSortDirection,
    filteredTasks,
  }
}
