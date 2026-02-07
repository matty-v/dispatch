import { SheetsDbClient } from '@/services/sheetsdb'

const SHEET_NAME = 'Cron'

export const API_BASE_URL = 'https://sheetsapi-g56q77hy2a-uc.a.run.app'

export const SERVICE_ACCOUNT_EMAIL = 'sheets-db-api@kinetic-object-322814.iam.gserviceaccount.com'

const STORAGE_KEY_SPREADSHEET_ID = 'dispatch_sheets_spreadsheet_id'

export function getSpreadsheetId(): string | null {
  return localStorage.getItem(STORAGE_KEY_SPREADSHEET_ID)
}

export function saveSpreadsheetId(spreadsheetId: string): void {
  localStorage.setItem(STORAGE_KEY_SPREADSHEET_ID, spreadsheetId)
}

export function clearSpreadsheetId(): void {
  localStorage.removeItem(STORAGE_KEY_SPREADSHEET_ID)
}

export function isConfigured(): boolean {
  return !!getSpreadsheetId()
}

const SHEET_COLUMNS: string[] = [
  'id', 'name', 'type', 'status', 'schedule', 'description',
  'nextRun', 'lastRun', 'lastResult', 'createdAt', 'updatedAt',
]

export async function initializeSheets(spreadsheetId: string): Promise<void> {
  const client = new SheetsDbClient({ baseUrl: API_BASE_URL, spreadsheetId })
  await client.health()

  const existingSheets = await client.listSheets()
  const existingNames = existingSheets.map((s) => s.title)

  if (!existingNames.includes(SHEET_NAME)) {
    await client.createSheet(SHEET_NAME)
    const placeholderData: Record<string, string> = {}
    SHEET_COLUMNS.forEach((col) => { placeholderData[col] = '' })
    const { rowIndex } = await client.createRow(SHEET_NAME, placeholderData)
    await client.deleteRow(SHEET_NAME, rowIndex)
  }
}

export function createSheetsClient(): SheetsDbClient | null {
  const spreadsheetId = getSpreadsheetId()
  if (!spreadsheetId) return null
  return new SheetsDbClient({ baseUrl: API_BASE_URL, spreadsheetId })
}

export function getTasksSheet() {
  const client = createSheetsClient()
  if (!client) return null
  return client.sheet(SHEET_NAME)
}
