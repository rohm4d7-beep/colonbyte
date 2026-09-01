'use client'

import Link from 'next/link'
import { Printer, FileDown, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function InvoiceActions({ invoiceNumber }: { invoiceNumber: string }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="outline" size="sm" render={<Link href="/dashboard/finance/invoices" />}>
        <ArrowLeft className="mr-1 h-3.5 w-3.5" />
        Back
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => window.print()}
      >
        <FileDown className="mr-1 h-3.5 w-3.5" />
        Download PDF
      </Button>
      <Button size="sm" onClick={() => window.print()}>
        <Printer className="mr-1 h-3.5 w-3.5" />
        Print
      </Button>
      <span className="hidden font-mono text-xs text-gray-400">{invoiceNumber}</span>
    </div>
  )
}
