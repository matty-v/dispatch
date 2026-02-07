import { SheetsDbClient } from '@/services/sheetsdb'

const SHEET_NAME = 'Cron'

const STORAGE_KEYS = {
  baseUrl: 'dispatch_sheets_base_url',
  spreadsheetId: 'dispatch_sheets_spreadsheet_id',
} as const

export function getSheetsConfig(): { baseUrl: string; spreadsheetId: string } | null {
  const baseUrl = localStorage.getItem(STORAGE_KEYS.baseUrl)
  const spreadsheetId = localStorage.getItem(STORAGE_KEYS.spreadsheetId)
  if (!baseUrl || !spreadsheetId) return null
  return { baseUrl, spreadsheetId }
}

export function saveSheetsConfig(baseUrl: string, spreadsheetId: string): void {
  localStorage.setItem(STORAGE_KEYS.baseUrl, baseUrl)
  localStorage.setItem(STORAGE_KEYS.spreadsheetId, spreadsheetId)
}

export function clearSheetsConfig(): void {
  localStorage.removeItem(STORAGE_KEYS.baseUrl)
  localStorage.removeItem(STORAGE_KEYS.spreadsheetId)
}

export function createSheetsClient(): SheetsDbClient | null {
  const config = getSheetsConfig()
  if (!config) return null
  return new SheetsDbClient(config)
}

export function getTasksSheet() {
  const client = createSheetsClient()
  if (!client) return null
  return client.sheet(SHEET_NAME)
}
