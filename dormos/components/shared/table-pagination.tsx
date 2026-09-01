'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Table } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

function pageNumbers(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages = new Set<number>([1, 2, total - 1, total, current, current - 1, current + 1])
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b)
  const result: (number | 'ellipsis')[] = []
  let prev = 0
  for (const page of sorted) {
    if (page - prev > 1) result.push('ellipsis')
    result.push(page)
    prev = page
  }
  return result
}

export function TablePagination<TData>({
  table,
  className,
}: {
  table: Table<TData>
  className?: string
}) {
  const { pageIndex, pageSize } = table.getState().pagination
  const totalRows = table.getFilteredRowModel().rows.length
  const pageCount = table.getPageCount()
  const start = totalRows === 0 ? 0 : pageIndex * pageSize + 1
  const end = Math.min(totalRows, (pageIndex + 1) * pageSize)

  return (
    <div
      className={cn(
        'flex flex-col gap-3 border-t border-gray-100 p-3 sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          Rows per page
          <Select
            value={String(pageSize)}
            onValueChange={(value) => table.setPageSize(Number(value))}
          >
            <SelectTrigger size="sm" className="w-16" aria-label="Rows per page">
              <SelectValue>{pageSize}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 30, 50].map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <p className="text-xs text-gray-500" aria-live="polite">
          {start}–{end} of {totalRows}
        </p>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon-sm"
          aria-label="Previous page"
          disabled={!table.getCanPreviousPage()}
          onClick={() => table.previousPage()}
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </Button>
        {pageNumbers(pageIndex + 1, pageCount).map((page, index) =>
          page === 'ellipsis' ? (
            <span key={`e-${index}`} className="px-1 text-xs text-gray-400">
              …
            </span>
          ) : (
            <Button
              key={page}
              variant={page === pageIndex + 1 ? 'default' : 'outline'}
              size="xs"
              aria-current={page === pageIndex + 1 ? 'page' : undefined}
              onClick={() => table.setPageIndex(page - 1)}
              className="min-w-7 px-1.5"
            >
              {page}
            </Button>
          ),
        )}
        <Button
          variant="outline"
          size="icon-sm"
          aria-label="Next page"
          disabled={!table.getCanNextPage()}
          onClick={() => table.nextPage()}
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}
