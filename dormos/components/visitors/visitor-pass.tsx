'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { QrCode, Printer, Download, Shield, Clock, User, MapPin } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { VisitorTabs } from './visitor-tabs'
import { VISITORS } from '@/lib/mock-data/visitors'
import { cn } from '@/lib/utils'

const checkedIn = VISITORS.filter((v) => v.status === 'Checked In' || v.status === 'Overstay')

const REL_COLORS: Record<string, { bg: string; text: string }> = {
  Parent: { bg: 'bg-accent', text: 'text-primary' },
  Sibling: { bg: 'bg-violet-100', text: 'text-violet-700' },
  Friend: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  Relative: { bg: 'bg-amber-100', text: 'text-amber-700' },
  Guardian: { bg: 'bg-accent', text: 'text-primary' },
  Official: { bg: 'bg-rose-100', text: 'text-rose-700' },
}

export function VisitorPassPage() {
  const [selected, setSelected] = useState(checkedIn[0] ?? VISITORS[0])

  const rel = REL_COLORS[selected.relationship] ?? { bg: 'bg-gray-100', text: 'text-gray-600' }
  const checkInDate = new Date(selected.checkIn)

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Visitor Pass"
        description="View and print visitor passes for visitors currently on premises."
        icon={QrCode}
        crumbs={[{ label: 'Visitors', href: '/dashboard/visitors' }, { label: 'Pass' }]}
        actions={
          <div className="flex gap-2">
            <button className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 shadow-sm transition-colors hover:bg-gray-50">
              <Download className="h-3.5 w-3.5" />
              Download PDF
            </button>
            <button className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-medium text-white shadow-sm transition-colors hover:bg-primary/80">
              <Printer className="h-3.5 w-3.5" />
              Print Pass
            </button>
          </div>
        }
      />

      <VisitorTabs />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Visitor selector */}
        <div className="rounded-2xl border border-gray-200/70 bg-white p-5 shadow-sm">
          <p className="mb-3 text-sm font-semibold text-gray-900">Active Visitors</p>
          <div className="flex flex-col gap-1.5 max-h-[500px] overflow-y-auto pr-1">
            {checkedIn.map((v, i) => (
              <motion.button key={v.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                onClick={() => setSelected(v)}
                className={cn('flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition-colors', selected.id === v.id ? 'bg-accent ring-1 ring-primary/20' : 'hover:bg-gray-50')}>
                <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold', selected.id === v.id ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600')}>
                  {v.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-gray-900 truncate">{v.name}</p>
                  <p className="text-[10px] text-gray-400 truncate">→ {v.visitingStudent} · {v.studentRoom}</p>
                </div>
                {v.status === 'Overstay' && (
                  <span className="rounded-full bg-rose-100 px-1.5 py-0.5 text-[10px] font-semibold text-rose-700">!</span>
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Pass Card */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <motion.div key={selected.id} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}
            className="rounded-2xl border border-gray-200/70 bg-white shadow-sm overflow-hidden">
            {/* Pass Header */}
            <div className="bg-gradient-to-r from-primary to-primary/80 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-primary-foreground/80">DormOS — Hostel Management</p>
                    <p className="text-sm font-bold">VISITOR PASS</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-primary-foreground/80">Pass Number</p>
                  <p className="font-mono text-lg font-bold">{selected.passNumber}</p>
                </div>
              </div>
            </div>

            {/* Pass Body */}
            <div className="p-6">
              <div className="flex gap-6">
                {/* Left: Visitor Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-lg font-bold text-white shadow-lg">
                      {selected.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">{selected.name}</h2>
                      <span className={cn('rounded-full px-2 py-0.5 text-xs font-semibold', rel.bg, rel.text)}>
                        {selected.relationship}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <InfoRow icon={User} label="CNIC" value={selected.cnic} mono />
                    <InfoRow icon={User} label="Phone" value={selected.phone} mono />
                    <InfoRow icon={User} label="Visiting" value={selected.visitingStudent} />
                    <InfoRow icon={MapPin} label="Room" value={selected.studentRoom} />
                    <InfoRow icon={User} label="Purpose" value={selected.purpose} />
                    <InfoRow icon={User} label="Approved By" value={selected.approvedBy} />
                    <InfoRow icon={Clock} label="Check-In Time"
                      value={checkInDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} />
                    <InfoRow icon={Clock} label="Date"
                      value={checkInDate.toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' })} />
                  </div>
                </div>

                {/* Right: QR Code placeholder */}
                <div className="flex flex-col items-center gap-3">
                  <div className="flex h-36 w-36 items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50">
                    <div className="flex flex-col items-center gap-1.5 text-gray-300">
                      <QrCode className="h-12 w-12" />
                      <p className="text-[10px] font-medium">QR Code</p>
                    </div>
                  </div>
                  <p className="font-mono text-xs text-gray-500">{selected.passNumber}</p>
                </div>
              </div>

              {/* Status bar */}
              <div className={cn('mt-5 flex items-center justify-between rounded-xl p-3',
                selected.status === 'Overstay' ? 'bg-rose-50 border border-rose-200' : 'bg-emerald-50 border border-emerald-200')}>
                <div className="flex items-center gap-2">
                  <div className={cn('h-2 w-2 animate-pulse rounded-full', selected.status === 'Overstay' ? 'bg-rose-500' : 'bg-emerald-500')} />
                  <span className={cn('text-xs font-semibold', selected.status === 'Overstay' ? 'text-rose-700' : 'text-emerald-700')}>
                    {selected.status === 'Overstay' ? 'OVERSTAY ALERT — Exceeded allowed time' : 'ACTIVE — Visitor currently inside premises'}
                  </span>
                </div>
                {selected.notes && (
                  <span className="text-xs text-gray-500">{selected.notes}</span>
                )}
              </div>

              {/* Footer note */}
              <p className="mt-3 text-center text-[10px] text-gray-400">
                This pass is valid for today only. Must be presented at exit. Unauthorized access prohibited.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ icon: Icon, label, value, mono }: { icon: typeof User; label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start gap-1.5">
      <Icon className="mt-0.5 h-3 w-3 text-gray-300" />
      <div>
        <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">{label}</p>
        <p className={cn('text-xs font-semibold text-gray-900 mt-0.5', mono && 'font-mono')}>{value}</p>
      </div>
    </div>
  )
}
