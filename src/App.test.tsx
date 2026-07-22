import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import App from './App'

;(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true

let container: HTMLDivElement | null = null
let root: ReturnType<typeof createRoot> | null = null

afterEach(async () => {
  if (root) {
    await act(async () => root?.unmount())
  }
  container?.remove()
  container = null
  root = null
})

describe('App', () => {
  it('loads sample JSON into an empty input', async () => {
    container = document.createElement('div')
    document.body.append(container)
    root = createRoot(container)

    await act(async () => root?.render(<App />))

    const sampleButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent === 'Try sample JSON',
    )
    expect(sampleButton).toBeDefined()

    await act(async () => sampleButton?.click())

    const input = container.querySelector<HTMLTextAreaElement>('#json-input')
    expect(input?.value).toBe('{\n  "hello": "openlearnia",\n  "tools": ["json", "markdown"]\n}\n')
  })
})
