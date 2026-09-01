'use client'

import { useEffect, useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { EmptyState } from '@/components/widgets/empty-state'
import { Checkbox } from '@/components/shared/checkbox'
import { ColumnToggle } from '@/components/shared/column-toggle'
import { TablePagination } from '@/components/shared/table-pagination'
import { TableSkeleton } from '@/components/shared/skeletons'
import { Skeleton } from '@/components/ui/skeleton'

function SortableHeader({
  title,
  sorted,
  onSort,
}: {
  title: string
  sorted: false | 'asc' | 'desc'
  onSort: ((event?: unknown) => void) | undefined
}) {
  if (!onSort) {
    return <span>{title}</span>
  }
  return (
    <button
      type="button"
      onClick={onSort}
      className="group inline-flex items-center gap-1 rounded font-medium text-gray-600 transition-colors hover:text-gray-900 focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none"
    >
      {title}
      {sorted === 'asc' ? (
        <ArrowUp className="h-3.5 w-3.5 text-primary" />
      ) : sorted === 'desc' ? (
        <ArrowDown className="h-3.5 w-3.5 text-primary" />
      ) : (
        <ChevronsUpDown className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-50" />
      )}
    </button>
  )
}

interface DataTableProps<TData> {
  columns: ColumnDef<TData>[]
  data: TData[]
  toolbar?: React.ReactNode
  actions?: React.ReactNode
  loading?: boolean
  onRowClick?: (row: TData) => void
  enableRowSelection?: boolean
  getRowId?: (row: TData) => string
  onSelectionChange?: (ids: string[]) => void
  emptyTitle?: string
  emptyDescription?: string
  emptyAction?: React.ReactNode
  stickyHeader?: boolean
  showColumnToggle?: boolean
  initialPageSize?: number
  initialColumnVisibility?: Record<string, boolean>
  className?: string
}

export function DataTable<TData>({
  columns,
  data,
  toolbar,
  actions,
  loading,
  onRowClick,
  enableRowSelection,
  getRowId,
  onSelectionChange,
  emptyTitle = 'No results found',
  emptyDescription = 'Try adjusting your search or filters.',
  emptyAction,
  stickyHeader,
  showColumnToggle,
  initialPageSize = 10,
  initialColumnVisibility,
  className,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})

  const allColumns = enableRowSelection
    ? [
        {
          id: 'select',
          enableSorting: false,
          enableHiding: false,
          header: ({ table }: { table: import('@tanstack/react-table').Table<TData> }) => (
            <Checkbox
              aria-label="Select all rows"
              checked={table.getIsAllPageRowsSelected()}
              indeterminate={
                table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()
              }
              onChange={table.getToggleAllPageRowsSelectedHandler()}
            />
          ),
          cell: ({ row }: { row: import('@tanstack/react-table').Row<TData> }) => (
            <Checkbox
              aria-label="Select row"
              checked={row.getIsSelected()}
              onChange={row.getToggleSelectedHandler()}
            />
          ),
        } as ColumnDef<TData>,
        ...columns,
      ]
    : columns

  const table = useReactTable({
    data,
    columns: allColumns,
    state: { sorting, rowSelection },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getRowId,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: initialPageSize },
      columnVisibility: initialColumnVisibility,
    },
    enableRowSelection,
  })

  useEffect(() => {
    if (!onSelectionChange) return
    const ids = Object.keys(rowSelection).filter((id) => rowSelection[id])
    onSelectionChange(ids)
  }, [rowSelection, onSelectionChange])

  const selectedCount = Object.keys(rowSelection).filter((id) => rowSelection[id]).length

  return (
    <div className={cn('rounded-2xl border border-gray-200/70 bg-white shadow-sm', className)}>
      {(toolbar || actions || showColumnToggle) && (
        <div className="flex flex-col gap-2 border-b border-gray-100 p-3 lg:flex-row lg:items-center lg:justify-between">
          {toolbar && <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">{toolbar}</div>}
          {(actions || showColumnToggle) && (
            <div className="flex flex-wrap items-center gap-2">
              {actions}
              {showColumnToggle && <ColumnToggle table={table} />}
            </div>
          )}
        </div>
      )}

      {selectedCount > 0 && (
        <div className="flex items-center justify-between gap-2 bg-accent/70 px-3 py-2">
          <p className="text-xs font-medium text-primary">
            {selectedCount} selected
          </p>
          <button
            type="button"
            onClick={() => setRowSelection({})}
            className="text-xs font-medium text-primary transition-colors hover:text-primary focus-visible:ring-3 focus-visible:ring-primary/40 focus-visible:outline-none"
          >
            Clear selection
          </button>
        </div>
      )}

      <div
        className={cn(
          'w-full',
          stickyHeader ? 'max-h-[calc(100vh-240px)] overflow-auto' : 'overflow-x-auto',
        )}
      >
        <table className="w-full min-w-max border-collapse text-sm">
          <thead
            className={cn(
              'sticky top-0 z-10 border-b border-gray-100 bg-gray-50/95 text-xs uppercase tracking-wide backdrop-blur',
            )}
          >
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort()
                  const headerValue = header.column.columnDef.header
                  return (
                    <th
                      key={header.id}
                      className="px-3 py-2.5 text-left font-semibold text-gray-600"
                    >
                      {canSort && typeof headerValue === 'string' ? (
                        <SortableHeader
                          title={headerValue}
                          sorted={header.column.getIsSorted()}
                          onSort={header.column.getToggleSortingHandler()}
                        />
                      ) : (
                        flexRender(headerValue, header.getContext())
                      )}
                    </th>
                  )
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {loading
              ? <TableSkeleton rows={table.getState().pagination.pageSize} columns={allColumns.length} />
              : table.getRowModel().rows.length === 0
                ? (
                    <tr>
                      <td colSpan={allColumns.length} className="px-3 py-8">
                        <EmptyState
                          title={emptyTitle}
                          description={emptyDescription}
                          action={emptyAction}
                        />
                      </td>
                    </tr>
                  )
                : table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      data-state={row.getIsSelected() ? 'selected' : undefined}
                      onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                      onKeyDown={
                        onRowClick
                          ? (event) => {
                              if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault()
                                onRowClick(row.original)
                              }
                            }
                          : undefined
                      }
                      tabIndex={onRowClick ? 0 : undefined}
                      className={cn(
                        'border-b border-gray-50 transition-colors last:border-b-0',
                        onRowClick && 'cursor-pointer',
                        row.getIsSelected()
                          ? 'bg-accent/50'
                          : 'hover:bg-gray-50/80',
                      )}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-3 py-2.5 align-middle">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
          </tbody>
        </table>
      </div>

      <TablePagination table={table} />
    </div>
  )
}

export function DataTableToolbarSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-200/70 bg-white p-3 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-8 w-40" />
      </div>
    </div>
  )
}
