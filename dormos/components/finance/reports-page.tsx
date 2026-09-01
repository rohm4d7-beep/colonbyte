'use client'

import { useMemo } from 'react'
import {
  BarChart3,
  FileSpreadsheet,
  Printer,
  FileDown,
  Banknote,
  Receipt,
  TrendingUp,
  Percent,
  FileWarning,
  Undo2,
} from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { FinanceTabs } from '@/components/finance/finance-tabs'
import { AnalyticsCards, type AnalyticsItem } from '@/components/shared/analytics-cards'
import { ChartCard } from '@/components/widgets/chart-card'
import { StatusBadge } from '@/components/shared/status'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  FinanceRevenueAreaChart,
  FinanceMethodDonutChart,
  FinanceExpenseBarChart,
  FinanceOutstandingChart,
} from '@/components/finance/finance-charts'
import { INVOICE_STATUS_STYLES } from '@/components/finance/styles'
import {
  COLLECTION_RATE,
  EXPENSES,
  INVOICES,
  MONTHLY_FINANCE,
  NET_PROFIT,
  OUTSTANDING_DUES,
  PAYMENT_METHOD_BREAKDOWN,
  PAYMENTS,
  TOTAL_EXPENSES,
  TOTAL_REVENUE,
  studentName,
  studentRoomNumber,
} from '@/lib/mock-data/finance'
import { exportToCSV } from '@/lib/export'
import { formatDate, formatPKR } from '@/lib/format'

function ReportCard({
  title,
  subtitle,
  children,
  className,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`rounded-2xl border border-gray-200/70 bg-white p-5 shadow-sm ${className ?? ''}`}>
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      {subtitle && <p className="mt-0.5 text-xs text-gray-400">{subtitle}</p>}
      <div className="mt-4">{children}</div>
    </div>
  )
}

function SimpleTable({
  head,
  rows,
}: {
  head: string[]
  rows: (string | number | React.ReactNode)[][]
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-max border-collapse text-sm">
        <thead>
          <tr className="border-b border-gray-100 text-left text-xs tracking-wide text-gray-400 uppercase">
            {head.map((cell) => (
              <th key={cell} className="px-3 py-2 font-semibold">
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="border-b border-gray-50 last:border-b-0 hover:bg-gray-50/60">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-3 py-2.5 text-gray-700">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function ReportsPage() {
  const expenseCategories = useMemo(() => {
    const map = EXPENSES.filter((e) => e.status !== 'Rejected').reduce(
      (acc, e) => {
        acc[e.category] = (acc[e.category] ?? 0) + e.amount
        return acc
      },
      {} as Record<string, number>,
    )
    return Object.entries(map).sort((a, b) => b[1] - a[1])
  }, [])

  const overdueInvoices = useMemo(
    () =>
      INVOICES.filter((inv) => inv.status === 'Overdue')
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
        .slice(0, 6),
    [],
  )

  const pendingPayments = useMemo(
    () =>
      PAYMENTS.filter((p) => p.status === 'Pending' || p.status === 'Failed')
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
        .slice(0, 6),
    [],
  )

  const kpis: AnalyticsItem[] = [
    {
      id: 'revenue',
      label: 'Total Revenue',
      value: formatPKR(TOTAL_REVENUE),
      sub: 'Sep 2025 – Aug 2026',
      icon: Banknote,
      accent: 'emerald',
    },
    {
      id: 'expenses',
      label: 'Total Expenses',
      value: formatPKR(TOTAL_EXPENSES),
      sub: `${((TOTAL_EXPENSES / TOTAL_REVENUE) * 100).toFixed(1)}% of revenue`,
      icon: Receipt,
      accent: 'rose',
    },
    {
      id: 'profit',
      label: 'Net Profit',
      value: formatPKR(NET_PROFIT),
      sub: `${((NET_PROFIT / TOTAL_REVENUE) * 100).toFixed(1)}% margin`,
      icon: TrendingUp,
      accent: 'blue',
    },
    {
      id: 'collection',
      label: 'Collection Rate',
      value: `${COLLECTION_RATE}%`,
      sub: 'Payments collected on time',
      icon: Percent,
      accent: 'violet',
    },
    {
      id: 'outstanding',
      label: 'Outstanding Dues',
      value: formatPKR(OUTSTANDING_DUES),
      sub: 'Overdue + pending invoices',
      icon: FileWarning,
      accent: 'amber',
    },
    {
      id: 'refunds',
      label: 'Refunds Issued',
      value: String(PAYMENTS.filter((p) => p.status === 'Refunded').length),
      sub: 'Refunded payment entries',
      icon: Undo2,
      accent: 'cyan',
    },
  ]

  const summaryCsv = MONTHLY_FINANCE.map((m) => ({
    month: `${m.month} ${m.year}`,
    revenue: m.revenue,
    expenses: m.expenses,
    netProfit: m.netProfit,
    collectionRate: `${m.collectionRate}%`,
    outstanding: m.outstanding,
  }))

  const pnlRows = MONTHLY_FINANCE.map((m) => [
    `${m.month} ${m.year}`,
    formatPKR(m.revenue),
    formatPKR(m.expenses),
    formatPKR(m.netProfit),
    `${m.collectionRate}%`,
  ])

  const collectionRows = MONTHLY_FINANCE.map((m) => [
    `${m.month} ${m.year}`,
    formatPKR(m.revenue),
    formatPKR(m.expenses),
    formatPKR(m.netProfit),
    `${m.collectionRate}%`,
    formatPKR(m.outstanding),
  ])

  const revenueMethodRows = PAYMENT_METHOD_BREAKDOWN.map((m) => [
    m.name,
    formatPKR(m.value),
    `${((m.value / PAYMENT_METHOD_BREAKDOWN.reduce((s, e) => s + e.value, 0)) * 100).toFixed(1)}%`,
  ])

  const expenseRows = expenseCategories.map(([name, value]) => [
    name,
    formatPKR(value),
    `${((value / TOTAL_EXPENSES) * 100).toFixed(1)}%`,
  ])

  const exportExcel = () => {
    const rows = summaryCsv.map((row) => [
      row.month,
      row.revenue,
      row.expenses,
      row.netProfit,
      row.collectionRate,
      row.outstanding,
    ])
    const headers = ['Month', 'Revenue', 'Expenses', 'Net Profit', 'Collection Rate', 'Outstanding']
    const html = [
      '<html xmlns:o="urn:schemas-microsoft-com:office:office"><body><table>',
      `<tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr>`,
      rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`).join(''),
      '</table></body></html>',
    ].join('')
    const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `dormos-financial-report-${new Date().toISOString().slice(0, 10)}.xls`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Financial Reports"
        description="Summaries, profit & loss and collection performance for the fiscal year."
        icon={BarChart3}
        crumbs={[{ label: 'Finance' }, { label: 'Reports' }]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={exportExcel}>
              <FileSpreadsheet className="mr-1 h-3.5 w-3.5" />
              Excel
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="mr-1 h-3.5 w-3.5" />
              Print / PDF
            </Button>
            <Button
              size="sm"
              onClick={() =>
                exportToCSV(
                  summaryCsv,
                  [
                    { key: 'month', label: 'Month' },
                    { key: 'revenue', label: 'Revenue' },
                    { key: 'expenses', label: 'Expenses' },
                    { key: 'netProfit', label: 'Net Profit' },
                    { key: 'collectionRate', label: 'Collection Rate' },
                    { key: 'outstanding', label: 'Outstanding' },
                  ],
                  `dormos-financial-report-${new Date().toISOString().slice(0, 10)}`,
                )
              }
            >
              <FileDown className="mr-1 h-3.5 w-3.5" />
              Export CSV
            </Button>
          </div>
        }
      />

      <FinanceTabs />

      <Tabs defaultValue="summary">
        <TabsList className="flex w-full overflow-x-auto">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="pnl">Profit &amp; Loss</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="outstanding">Outstanding</TabsTrigger>
          <TabsTrigger value="collection">Fee Collection</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="flex flex-col gap-4 pt-4">
          <AnalyticsCards items={kpis} />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ChartCard title="Cash Flow" subtitle="Revenue vs expenses across the year">
              <FinanceRevenueAreaChart />
            </ChartCard>
            <ChartCard title="Revenue by Method" subtitle="Share of collections by payment method">
              <FinanceMethodDonutChart />
            </ChartCard>
          </div>
        </TabsContent>

        <TabsContent value="pnl" className="flex flex-col gap-4 pt-4">
          <ReportCard
            title="Profit & Loss Statement"
            subtitle="Monthly revenue, expenses and net profit for the current fiscal year"
          >
            <SimpleTable
              head={['Month', 'Revenue', 'Expenses', 'Net Profit', 'Collection Rate']}
              rows={pnlRows}
            />
            <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3 text-sm">
              <span className="font-semibold text-gray-900">Fiscal year total</span>
              <span className="font-bold text-gray-900">{formatPKR(NET_PROFIT)}</span>
            </div>
          </ReportCard>
        </TabsContent>

        <TabsContent value="revenue" className="flex flex-col gap-4 pt-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ChartCard title="Revenue Trend" subtitle="Monthly collections">
              <FinanceRevenueAreaChart />
            </ChartCard>
            <ChartCard title="Revenue by Payment Method" subtitle="Distribution of collections">
              <FinanceMethodDonutChart />
            </ChartCard>
          </div>
          <ReportCard title="Revenue by Payment Method" subtitle="Full-year breakdown">
            <SimpleTable
              head={['Method', 'Collected', 'Share']}
              rows={revenueMethodRows}
            />
          </ReportCard>
        </TabsContent>

        <TabsContent value="expenses" className="flex flex-col gap-4 pt-4">
          <ChartCard title="Expense by Category" subtitle="Total spend across the fiscal year">
            <FinanceExpenseBarChart />
          </ChartCard>
          <ReportCard title="Expense Breakdown" subtitle="Category totals and share of spend">
            <SimpleTable head={['Category', 'Spent', 'Share']} rows={expenseRows} />
          </ReportCard>
        </TabsContent>

        <TabsContent value="outstanding" className="flex flex-col gap-4 pt-4">
          <ChartCard title="Outstanding by Month" subtitle="Collected, pending and overdue">
            <FinanceOutstandingChart />
          </ChartCard>
          <ReportCard
            title="Priority Overdue Invoices"
            subtitle="Oldest unpaid invoices that need follow-up"
          >
            <SimpleTable
              head={['Invoice', 'Student', 'Room', 'Total', 'Due', 'Status']}
              rows={overdueInvoices.map((inv) => [
                <span key={inv.id} className="font-mono text-xs text-primary">{inv.number}</span>,
                studentName(inv.studentId),
                studentRoomNumber(inv.studentId),
                formatPKR(inv.total),
                formatDate(inv.dueDate),
                <StatusBadge key={inv.id} style={INVOICE_STATUS_STYLES[inv.status]} />,
              ])}
            />
          </ReportCard>
        </TabsContent>

        <TabsContent value="collection" className="flex flex-col gap-4 pt-4">
          <ReportCard
            title="Monthly Fee Collection"
            subtitle="Collection rate and outstanding per month"
          >
            <SimpleTable
              head={['Month', 'Revenue', 'Expenses', 'Net Profit', 'Collection Rate', 'Outstanding']}
              rows={collectionRows}
            />
          </ReportCard>
          <ReportCard
            title="Payments Awaiting Confirmation"
            subtitle="Pending and failed payments that need follow-up"
          >
            <SimpleTable
              head={['Payment', 'Student', 'Amount', 'Method', 'Due', 'Status']}
              rows={pendingPayments.map((p) => [
                <span key={p.id} className="font-mono text-xs text-primary">{p.referenceNo}</span>,
                studentName(p.studentId),
                formatPKR(p.amount),
                p.method,
                formatDate(p.dueDate),
                <StatusBadge key={p.id} style={INVOICE_STATUS_STYLES.Pending} />,
              ])}
            />
          </ReportCard>
        </TabsContent>
      </Tabs>
    </div>
  )
}
