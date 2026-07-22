export function getLineAndColumn(text: string, index: number) {
  const safeIndex = Math.max(0, Math.min(index, text.length))
  const lines = text.slice(0, safeIndex).split('\n')
  return { line: lines.length, column: lines[lines.length - 1].length + 1 }
}

export function formatParseError(source: string, error: unknown): string {
  const fallback = error instanceof Error ? error.message : 'Invalid JSON.'
  if (/\bline\s+\d+/i.test(fallback)) return fallback

  const match = fallback.match(/position\s+(\d+)/i)
  if (!match) return fallback

  const position = Number.parseInt(match[1], 10)
  if (Number.isNaN(position)) return fallback

  const { line, column } = getLineAndColumn(source, position)
  return `${fallback} (line ${line}, column ${column})`
}
