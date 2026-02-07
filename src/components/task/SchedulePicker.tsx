import { useState, useRef } from 'react'
import { Calendar, Clock, RotateCcw } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import type { TaskType } from '@/lib/types'

const RECURRING_PRESETS = [
  { label: 'Daily', value: 'Daily 8 AM MT' },
  { label: 'Weekdays', value: 'Weekdays 8 AM MT' },
  { label: 'Weekly', value: 'Weekly Mon 8 AM MT' },
  { label: 'Monthly', value: 'Monthly 1st 8 AM MT' },
] as const

function formatScheduleDate(dateStr: string, timeStr: string): string {
  if (!dateStr) return ''
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day)

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const monthName = months[date.getMonth()]
  const dayNum = date.getDate()

  let timePart = '12:00 PM'
  if (timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number)
    const period = hours >= 12 ? 'PM' : 'AM'
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
    timePart = `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`
  }

  return `${monthName} ${dayNum} ${year} ${timePart} MST`
}

function parseScheduleToDatetime(schedule: string): { date: string; time: string } {
  const months: Record<string, number> = {
    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
    Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
  }

  // Try to parse "Feb 7 2026 10:00 AM MST" style
  const match = schedule.match(
    /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2})\s+(\d{4})\s+(\d{1,2}):(\d{2})\s*(AM|PM)/i
  )
  if (!match) return { date: '', time: '' }

  const [, monthStr, dayStr, yearStr, hourStr, minStr, period] = match
  const monthIndex = months[monthStr]
  if (monthIndex === undefined) return { date: '', time: '' }

  let hours = parseInt(hourStr, 10)
  if (period.toUpperCase() === 'PM' && hours !== 12) hours += 12
  if (period.toUpperCase() === 'AM' && hours === 12) hours = 0

  const date = `${yearStr}-${String(monthIndex + 1).padStart(2, '0')}-${dayStr.padStart(2, '0')}`
  const time = `${String(hours).padStart(2, '0')}:${minStr}`
  return { date, time }
}

interface SchedulePickerProps {
  type: TaskType
  value: string
  onChange: (value: string) => void
}

export function SchedulePicker({ type, value, onChange }: SchedulePickerProps) {
  if (type === 'recurring') {
    return <RecurringPicker value={value} onChange={onChange} />
  }
  return <DateTimePicker value={value} onChange={onChange} />
}

function DateTimePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const parsed = parseScheduleToDatetime(value)
  const dateRef = useRef(parsed.date)
  const timeRef = useRef(parsed.time || '08:00')
  const [date, setDateState] = useState(parsed.date)
  const [time, setTimeState] = useState(parsed.time || '08:00')

  const setDate = (newDate: string) => {
    dateRef.current = newDate
    setDateState(newDate)
    if (newDate) {
      onChange(formatScheduleDate(newDate, timeRef.current))
    }
  }

  const setTime = (newTime: string) => {
    timeRef.current = newTime
    setTimeState(newTime)
    if (dateRef.current) {
      onChange(formatScheduleDate(dateRef.current, newTime))
    }
  }

  return (
    <div className="space-y-2">
      <Label>Schedule</Label>
      <div className="flex gap-2">
        <div className="flex-1">
          <div className="relative">
            <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <div className="w-[140px]">
          <div className="relative">
            <Clock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </div>
      {value && (
        <p className="text-xs text-muted-foreground">{value}</p>
      )}
    </div>
  )
}

function RecurringPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const isPreset = RECURRING_PRESETS.some((p) => p.value === value)
  const [customMode, setCustomMode] = useState(!isPreset && value !== '')

  return (
    <div className="space-y-2">
      <Label>Schedule</Label>
      <div className="flex flex-wrap gap-1.5">
        {RECURRING_PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => {
              setCustomMode(false)
              onChange(preset.value)
            }}
            className={`px-2.5 py-1 text-xs rounded-md border transition-all ${
              value === preset.value && !customMode
                ? 'border-[var(--accent-cyan)] bg-[rgba(0,212,255,0.15)] text-[var(--accent-cyan)]'
                : 'border-[rgba(100,150,255,0.2)] bg-[rgba(18,24,33,0.5)] text-muted-foreground hover:border-[rgba(167,139,250,0.4)] hover:text-foreground'
            }`}
          >
            {preset.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => {
            setCustomMode(true)
            if (isPreset) onChange('')
          }}
          className={`px-2.5 py-1 text-xs rounded-md border transition-all flex items-center gap-1 ${
            customMode
              ? 'border-[var(--accent-cyan)] bg-[rgba(0,212,255,0.15)] text-[var(--accent-cyan)]'
              : 'border-[rgba(100,150,255,0.2)] bg-[rgba(18,24,33,0.5)] text-muted-foreground hover:border-[rgba(167,139,250,0.4)] hover:text-foreground'
          }`}
        >
          <RotateCcw className="h-3 w-3" />
          Custom
        </button>
      </div>
      {customMode && (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder='e.g., "Every 6 hours" or "0 */6 * * *"'
        />
      )}
      {value && !customMode && (
        <p className="text-xs text-muted-foreground">{value}</p>
      )}
    </div>
  )
}
