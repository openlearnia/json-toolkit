import { useMemo, useState } from 'react'
import type { ChangeEvent, ReactNode } from 'react'
import { AppChrome } from './chrome/AppChrome'
import { relatedExcept } from './chrome/relatedTools'
import { formatParseError } from './lib/parseError'
import './App.css'

type FeedbackKind = 'success' | 'error'

type Feedback = {
  kind: FeedbackKind
  message: string
}

function getLineNumbers(text: string) {
  return Array.from({ length: text.split('\n').length }, (_, index) => index + 1)
}

function highlightJson(text: string) {
  const tokenPattern = /("(?:\\.|[^"\\])*")(?=\s*:)|("(?:\\.|[^"\\])*")|\b(true|false|null)\b|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g
  const nodes: ReactNode[] = []
  let cursor = 0

  for (const match of text.matchAll(tokenPattern)) {
    const token = match[0]
    const index = match.index ?? 0
    if (index > cursor) {
      nodes.push(text.slice(cursor, index))
    }

    const className = match[1]
      ? 'json-key'
      : match[2]
        ? 'json-string'
        : match[3]
          ? 'json-boolean'
          : 'json-number'
    nodes.push(
      <span className={className} key={`${index}-${token}`}>
        {token}
      </span>,
    )
    cursor = index + token.length
  }

  if (cursor < text.length) {
    nodes.push(text.slice(cursor))
  }

  return nodes
}

function App() {
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [feedback, setFeedback] = useState<Feedback | null>(null)

  const outputLength = useMemo(() => outputText.length, [outputText])

  const setErrorFeedback = (source: string, error: unknown) => {
    setFeedback({
      kind: 'error',
      message: formatParseError(source, error),
    })
  }

  const parseJson = (source: string) => JSON.parse(source)

  const handleFormat = () => {
    try {
      const parsed = parseJson(inputText)
      const formatted = JSON.stringify(parsed, null, 2)
      setOutputText(formatted)
      setFeedback({ kind: 'success', message: 'JSON formatted successfully.' })
    } catch (error) {
      setErrorFeedback(inputText, error)
    }
  }

  const handleMinify = () => {
    try {
      const parsed = parseJson(inputText)
      const minified = JSON.stringify(parsed)
      setOutputText(minified)
      setFeedback({ kind: 'success', message: 'JSON minified successfully.' })
    } catch (error) {
      setErrorFeedback(inputText, error)
    }
  }

  const handleValidate = () => {
    try {
      parseJson(inputText)
      setFeedback({ kind: 'success', message: 'Valid JSON.' })
    } catch (error) {
      setErrorFeedback(inputText, error)
    }
  }

  const handleCopyOutput = async () => {
    if (!outputText) {
      setFeedback({ kind: 'error', message: 'No output available to copy.' })
      return
    }

    try {
      await navigator.clipboard.writeText(outputText)
      setFeedback({ kind: 'success', message: 'Output copied to clipboard.' })
    } catch {
      setFeedback({ kind: 'error', message: 'Copy failed. Please copy manually.' })
    }
  }

  const handleClear = () => {
    setInputText('')
    setOutputText('')
    setFeedback(null)
  }

  const handleDownload = () => {
    if (!outputText) {
      setFeedback({ kind: 'error', message: 'No output available to download.' })
      return
    }

    const blob = new Blob([outputText], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const downloadLink = document.createElement('a')
    downloadLink.href = url
    downloadLink.download = 'formatted.json'
    downloadLink.click()
    URL.revokeObjectURL(url)
    setFeedback({ kind: 'success', message: 'JSON downloaded.' })
  }

  const handleFileLoad = async (event: ChangeEvent<HTMLInputElement>) => {
    const [file] = event.target.files ?? []
    if (!file) {
      return
    }

    try {
      const fileContent = await file.text()
      setInputText(fileContent)
      setFeedback({
        kind: 'success',
        message: `Loaded ${file.name}.`,
      })
    } catch {
      setFeedback({
        kind: 'error',
        message: 'Unable to read file.',
      })
    } finally {
      event.target.value = ''
    }
  }

  return (
    <AppChrome
      productName="JSON Toolkit"
      githubUrl="https://github.com/openlearnia/json-toolkit"
      relatedTools={relatedExcept('https://json-toolkit.openlearnia.com')}
    >
      <div className="app-shell">
        <header className="tool-intro">
          <h1>JSON Toolkit</h1>
          <p>Format, validate, and minify JSON entirely in your browser.</p>
        </header>

        <div className="panes">
          <section className="panel pane">
            <div className="pane-header">
              <label htmlFor="json-input" className="section-title">
                Input JSON
              </label>
              <span>{inputText.length} chars</span>
            </div>
            <div className="code-editor">
              <pre className="line-numbers" aria-hidden="true">
                {getLineNumbers(inputText).map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </pre>
              <textarea
                id="json-input"
                value={inputText}
                onChange={(event) => setInputText(event.target.value)}
                placeholder='Paste JSON here, e.g. {"name":"Openlearnia"}'
                spellCheck={false}
              />
            </div>

            <div className="controls">
              <input type="file" accept=".json,application/json,text/plain" onChange={handleFileLoad} />
              <button className="primary-action" type="button" onClick={handleFormat}>
                Format
              </button>
              <button className="secondary-action" type="button" onClick={handleMinify}>
                Minify
              </button>
              <button className="secondary-action" type="button" onClick={handleValidate}>
                Validate
              </button>
              <button className="secondary-action" type="button" onClick={handleClear}>
                Clear
              </button>
            </div>
          </section>

          <section className="panel pane">
            <div className="pane-header">
              <h2>Output</h2>
              <span>{outputLength} chars</span>
            </div>
            <div className="pane-actions">
              <button className="secondary-action" type="button" onClick={handleCopyOutput}>
                Copy
              </button>
              <button className="secondary-action" type="button" onClick={handleDownload}>
                Download
              </button>
            </div>
            <div className="code-output" aria-label="Formatted JSON output">
              <pre className="line-numbers" aria-hidden="true">
                {getLineNumbers(outputText).map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </pre>
              <pre className="json-hl">{outputText ? highlightJson(outputText) : 'Output will appear here.'}</pre>
            </div>
          </section>
        </div>

        {feedback && (
          <p className={`feedback ${feedback.kind}`} role={feedback.kind === 'error' ? 'alert' : 'status'}>
            {feedback.message}
          </p>
        )}
      </div>
    </AppChrome>
  )
}

export default App
