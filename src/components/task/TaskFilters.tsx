import { Search } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import type { TaskStatus, TaskType } from '@/lib/types'

interface FilterState {
  type: TaskType | 'all'
  status: TaskStatus | 'all'
  search: string
}

interface TaskFiltersProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
}

export function TaskFilters({ filters, onFiltersChange }: TaskFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={filters.search}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
          placeholder="Search tasks..."
          className="pl-9"
        />
      </div>

      <Select
        value={filters.type}
        onValueChange={(v) => onFiltersChange({ ...filters, type: v as TaskType | 'all' })}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All types</SelectItem>
          <SelectItem value="recurring">Recurring</SelectItem>
          <SelectItem value="one-shot">One-shot</SelectItem>
          <SelectItem value="reminder">Reminder</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.status}
        onValueChange={(v) => onFiltersChange({ ...filters, status: v as TaskStatus | 'all' })}
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          <SelectItem value="Scheduled">Scheduled</SelectItem>
          <SelectItem value="In Progress">In Progress</SelectItem>
          <SelectItem value="Done">Done</SelectItem>
          <SelectItem value="Error">Error</SelectItem>
          <SelectItem value="Paused">Paused</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
