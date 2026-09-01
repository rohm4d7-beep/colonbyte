'use client'

import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { exportToCSV, type ExportColumn } from '@/lib/export'

interface ExportButtonProps {
  data: Record<string, unknown>[]
  columns: ExportColumn[]
  filename: string
  disabled?: boolean
  label?: string
}

export function ExportButton({
  data,
  columns,
  filename,
  disabled,
  label = 'Export',
}: ExportButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      disabled={disabled || data.length === 0}
      onClick={() => exportToCSV(data, columns, filename)}
    >
      <Download className="mr-1 h-3.5 w-3.5" />
      {label}
    </Button>
  )
}
