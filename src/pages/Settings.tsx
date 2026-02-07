import { useState, useEffect } from 'react'
import { ArrowLeft, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { getSpreadsheetId, saveSpreadsheetId, clearSpreadsheetId, createSheetsClient, SERVICE_ACCOUNT_EMAIL } from '@/lib/tasks-api'

export function Settings() {
  const [spreadsheetId, setSpreadsheetId] = useState('')
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')
  const [testMessage, setTestMessage] = useState('')

  useEffect(() => {
    const id = getSpreadsheetId()
    if (id) {
      setSpreadsheetId(id)
    }
  }, [])

  const handleSave = () => {
    saveSpreadsheetId(spreadsheetId.trim())
    setTestStatus('idle')
  }

  const handleClear = () => {
    clearSpreadsheetId()
    setSpreadsheetId('')
    setTestStatus('idle')
    setTestMessage('')
  }

  const handleTest = async () => {
    if (!spreadsheetId.trim()) {
      setTestStatus('error')
      setTestMessage('Please enter a Spreadsheet ID')
      return
    }

    saveSpreadsheetId(spreadsheetId.trim())
    setTestStatus('testing')

    try {
      const client = createSheetsClient()
      if (!client) throw new Error('Failed to create client')
      const result = await client.health()
      if (result.status === 'ok') {
        setTestStatus('success')
        setTestMessage('Connected successfully')
      } else {
        setTestStatus('error')
        setTestMessage('Unexpected response')
      }
    } catch (err) {
      setTestStatus('error')
      setTestMessage(err instanceof Error ? err.message : 'Connection failed')
    }
  }

  const isConnected = getSpreadsheetId() !== null

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h2 className="text-lg font-semibold glow-cyan">Settings</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Google Sheets Connection
            {isConnected && (
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="spreadsheetId">Spreadsheet ID</Label>
            <Input
              id="spreadsheetId"
              value={spreadsheetId}
              onChange={(e) => setSpreadsheetId(e.target.value)}
              placeholder="your-spreadsheet-id"
            />
            <p className="text-xs text-muted-foreground">
              Share your Google Sheet with{' '}
              <code className="rounded bg-white/5 px-1 py-0.5 text-[#00d4ff]">
                {SERVICE_ACCOUNT_EMAIL}
              </code>{' '}
              (Editor) for Dispatch to read and write data.
            </p>
          </div>

          {testStatus !== 'idle' && (
            <div className="flex items-center gap-2 text-sm">
              {testStatus === 'testing' && (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-[#00d4ff]" />
                  <span className="text-muted-foreground">Testing connection...</span>
                </>
              )}
              {testStatus === 'success' && (
                <>
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                  <span className="text-emerald-400">{testMessage}</span>
                </>
              )}
              {testStatus === 'error' && (
                <>
                  <XCircle className="h-4 w-4 text-pink-400" />
                  <span className="text-pink-400">{testMessage}</span>
                </>
              )}
            </div>
          )}

          <div className="flex justify-between pt-2">
            <Button variant="ghost" size="sm" onClick={handleClear}>
              Disconnect
            </Button>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={handleTest}>
                Test
              </Button>
              <Button size="sm" onClick={handleSave}>
                Save
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
