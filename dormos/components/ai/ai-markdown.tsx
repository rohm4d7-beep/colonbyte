'use client'

import { cn } from '@/lib/utils'

type InlineNode = string | { bold?: boolean; code?: boolean; text: string }

function parseInline(text: string): InlineNode[] {
  const nodes: InlineNode[] = []
  const regex = /(\*\*[^*]+\*\*|`[^`]+`)/g
  let lastIndex = 0
  let match: RegExpExecArray | null
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index))
    const token = match[0]
    if (token.startsWith('**')) {
      nodes.push({ bold: true, text: token.slice(2, -2) })
    } else if (token.startsWith('`')) {
      nodes.push({ code: true, text: token.slice(1, -1) })
    }
    lastIndex = match.index + token.length
  }
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex))
  return nodes
}

function renderInline(nodes: InlineNode[], keyPrefix: string) {
  return nodes.map((node, i) => {
    if (typeof node === 'string') return <span key={`${keyPrefix}-${i}`}>{node}</span>
    if (node.code) {
      return (
        <code
          key={`${keyPrefix}-${i}`}
          className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[12px] text-rose-600"
        >
          {node.text}
        </code>
      )
    }
    return (
      <strong key={`${keyPrefix}-${i}`} className="font-semibold text-gray-900">
        {node.text}
      </strong>
    )
  })
}

function isTableRow(line: string) {
  return line.trim().startsWith('|') && line.trim().endsWith('|') && line.includes('|')
}

function parseTable(rows: string[]) {
  const clean = (row: string) =>
    row
      .trim()
      .replace(/^\|/, '')
      .replace(/\|$/, '')
      .split('|')
      .map((cell) => cell.trim())
  const header = clean(rows[0])
  const body = rows.slice(2).map(clean)
  return { header, body }
}

export function AIMarkdown({ content }: { content: string }) {
  const lines = content.split('\n')
  const blocks: { type: 'heading' | 'code' | 'table' | 'list' | 'paragraph'; value: string | { lang: string; code: string } | { header: string[]; body: string[][] } | { ordered: boolean; items: string[] } }[] = []

  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    const trimmed = line.trim()

    if (trimmed.startsWith('```')) {
      const lang = trimmed.slice(3).trim()
      const codeLines: string[] = []
      i++
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i])
        i++
      }
      i++
      blocks.push({ type: 'code', value: { lang, code: codeLines.join('\n') } })
      continue
    }

    if (/^#{1,3}\s/.test(trimmed)) {
      blocks.push({ type: 'heading', value: trimmed.replace(/^#+\s/, '') })
      i++
      continue
    }

    if (isTableRow(line) && i + 1 < lines.length && /^\s*\|[\s\-|:]+\|\s*$/.test(lines[i + 1])) {
      const tableLines: string[] = [line]
      i += 2
      while (i < lines.length && isTableRow(lines[i]) && lines[i].trim() !== '') {
        tableLines.push(lines[i])
        i++
      }
      blocks.push({ type: 'table', value: parseTable(tableLines) })
      continue
    }

    if (/^[-*]\s/.test(trimmed) || /^\d+\.\s/.test(trimmed)) {
      const ordered = /^\d+\.\s/.test(trimmed)
      const items: string[] = []
      while (i < lines.length && (/^[-*]\s/.test(lines[i].trim()) || /^\d+\.\s/.test(lines[i].trim()))) {
        items.push(lines[i].trim().replace(/^[-*]\s/, '').replace(/^\d+\.\s/, ''))
        i++
      }
      blocks.push({ type: 'list', value: { ordered, items } })
      continue
    }

    if (trimmed === '') {
      i++
      continue
    }

    blocks.push({ type: 'paragraph', value: trimmed })
    i++
  }

  return (
    <div className="flex flex-col gap-3">
      {blocks.map((block, index) => {
        const key = `block-${index}`
        switch (block.type) {
          case 'heading':
            return (
              <p key={key} className="text-sm font-semibold text-gray-900">
                {renderInline(parseInline(block.value as string), key)}
              </p>
            )
          case 'paragraph':
            return (
              <p key={key} className="text-sm leading-relaxed text-gray-700">
                {renderInline(parseInline(block.value as string), key)}
              </p>
            )
          case 'list': {
            const { ordered, items } = block.value as { ordered: boolean; items: string[] }
            return ordered ? (
              <ol key={key} className="flex list-decimal flex-col gap-1.5 pl-5 text-sm text-gray-700 marker:text-gray-400">
                {items.map((item, li) => (
                  <li key={`${key}-${li}`} className="leading-relaxed">
                    {renderInline(parseInline(item), `${key}-${li}`)}
                  </li>
                ))}
              </ol>
            ) : (
              <ul key={key} className="flex list-disc flex-col gap-1.5 pl-5 text-sm text-gray-700 marker:text-gray-400">
                {items.map((item, li) => (
                  <li key={`${key}-${li}`} className="leading-relaxed">
                    {renderInline(parseInline(item), `${key}-${li}`)}
                  </li>
                ))}
              </ul>
            )
          }
          case 'code': {
            const { lang, code } = block.value as { lang: string; code: string }
            return (
              <pre
                key={key}
                className="overflow-x-auto rounded-xl border border-gray-200 bg-gray-900 p-4 text-[12.5px] leading-relaxed text-gray-100"
              >
                <div className="mb-2 flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
                    {lang || 'code'}
                  </span>
                </div>
                <code className="font-mono">{code}</code>
              </pre>
            )
          }
          case 'table': {
            const { header, body } = block.value as { header: string[]; body: string[][] }
            return (
              <div key={key} className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      {header.map((cell, ci) => (
                        <th
                          key={`${key}-h-${ci}`}
                          className="border-b border-gray-200 px-3 py-2 text-left text-xs font-semibold text-gray-500"
                        >
                          {cell}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {body.map((row, ri) => (
                      <tr key={`${key}-r-${ri}`} className={cn(ri % 2 === 0 && 'bg-white', 'hover:bg-gray-50/70')}>
                        {row.map((cell, ci) => (
                          <td key={`${key}-c-${ci}`} className="border-b border-gray-100 px-3 py-2 text-xs text-gray-600">
                            {renderInline(parseInline(cell), `${key}-${ri}-${ci}`)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          }
          default:
            return null
        }
      })}
    </div>
  )
}
