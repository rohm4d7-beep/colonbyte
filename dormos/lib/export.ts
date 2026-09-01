export type ExportColumn = {
  key: string
  label: string
}

export function exportToCSV(
  rows: Record<string, unknown>[],
  columns: ExportColumn[],
  filename: string,
) {
  const escape = (value: unknown) => {
    const str = String(value ?? '')
    if (/[",\n]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }

  const header = columns.map((column) => escape(column.label)).join(',')
  const body = rows
    .map((row) => columns.map((column) => escape(row[column.key])).join(','))
    .join('\n')

  const blob = new Blob([`${header}\n${body}`], {
    type: 'text/csv;charset=utf-8;',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
