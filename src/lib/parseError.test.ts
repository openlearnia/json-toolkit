import { describe, expect, it } from 'vitest'
import { formatParseError } from './parseError'

describe('formatParseError', () => {
  it('adds line/col once when engine message lacks them', () => {
    const source = '{\n  "a": 1,\n}'
    const err = new SyntaxError('Unexpected token } in JSON at position 14')
    const msg = formatParseError(source, err)
    expect(msg.match(/line/gi)?.length ?? 0).toBe(1)
    expect(msg).toMatch(/line \d+/i)
  })

  it('does not duplicate coords if message already has them', () => {
    const err = new SyntaxError('Bad JSON (line 2, column 3)')
    const msg = formatParseError('{\n}', err)
    expect(msg.match(/line 2/gi)?.length ?? 0).toBe(1)
  })
})
