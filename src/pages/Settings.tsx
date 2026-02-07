import { useState } from 'react'
import { ArrowLeft, CheckCircle, XCircle, Loader2, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { getSpreadsheetId, saveSpreadsheetId, clearSpreadsheetId, createSheetsClient, SERVICE_ACCOUNT_EMAIL } from '@/lib/tasks-api'

export function Settings() {
  const [savedId, setSavedId] = useState(() => getSpreadsheetId() || '')
  const [isEditing, setIsEditing] = useState(() => !getSpreadsheetId())
  const [inputValue, setInputValue] = useState('')
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')
  const [statusMessage, setStatusMessage] = useState('')

  const isConnected = !!savedId

  const handleSave = async () => {
    const id = inputValue.trim()
    if (!id) {
      setStatus('error')
      setStatusMessage('Please enter a Spreadsheet ID')
      return
    }

    setStatus('saving')
    setStatusMessage('')

    try {
      saveSpreadsheetId(id)
      const client = createSheetsClient()
      if (!client) throw new Error('Failed to create client')
      await client.health()

      setSavedId(id)
      setIsEditing(false)
      setInputValue('')
      setStatus('success')
      setStatusMessage('Connected successfully')
    } catch (err) {
      clearSpreadsheetId()
      setStatus('error')
      setStatusMessage(err instanceof Error ? err.message : 'Connection failed')
    }
  }

  const handleDisconnect = () => {
    clearSpreadsheetId()
    setSavedId('')
    setIsEditing(true)
    setInputValue('')
    setStatus('idle')
    setStatusMessage('')
  }

  const handleStartEditing = () => {
    setInputValue(savedId)
    setIsEditing(true)
    setStatus('idle')
    setStatusMessage('')
  }

  const handleCancel = () => {
    setIsEditing(false)
    setInputValue('')
    setStatus('idle')
    setStatusMessage('')
  }

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
          {isEditing ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="spreadsheetId">Spreadsheet ID</Label>
                <Input
                  id="spreadsheetId"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
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

              {status !== 'idle' && (
                <div className="flex items-center gap-2 text-sm">
                  {status === 'saving' && (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-[#00d4ff]" />
                      <span className="text-muted-foreground">Connecting...</span>
                    </>
                  )}
                  {status === 'error' && (
                    <>
                      <XCircle className="h-4 w-4 text-pink-400" />
                      <span className="text-pink-400">{statusMessage}</span>
                    </>
                  )}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                {isConnected && (
                  <Button variant="ghost" size="sm" onClick={handleCancel}>
                    Cancel
                  </Button>
                )}
                <Button
                  size="sm"
                  className="ml-auto"
                  onClick={handleSave}
                  disabled={status === 'saving' || !inputValue.trim()}
                >
                  {status === 'saving' ? 'Connecting...' : 'Save & Connect'}
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="rounded-lg border border-emerald-400/20 bg-emerald-400/10 p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                  <span className="text-emerald-400 font-medium">Connected</span>
                </div>
                <a
                  href={`https://docs.google.com/spreadsheets/d/${savedId}/edit`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-[#a78bfa] hover:text-[#00d4ff] underline transition-colors"
                >
                  Open Spreadsheet
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              <div className="flex justify-between pt-2">
                <Button variant="ghost" size="sm" onClick={handleDisconnect}>
                  Disconnect
                </Button>
                <Button variant="secondary" size="sm" onClick={handleStartEditing}>
                  Change Spreadsheet
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
