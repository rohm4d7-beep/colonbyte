'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, CheckCircle2, Upload, Wrench } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { MaintenanceTabs } from './maintenance-tabs'
import { cn } from '@/lib/utils'

const CATEGORIES = ['Electrical', 'Plumbing', 'Cleaning', 'Furniture', 'Painting', 'Internet', 'Air Conditioning', 'General']
const STAFF = ['Mohammad Zubair', 'Tariq Hussain', 'Imran Khan', 'Saeed Ahmad', 'Ali Hassan', 'Bashir Ahmed']
const FLOORS = ['Floor 1', 'Floor 2', 'Floor 3', 'Floor 4']

type Priority = 'Low' | 'Medium' | 'High' | 'Critical'

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; bg: string; ring: string; desc: string }> = {
  Low: { label: 'Low', color: 'text-gray-600', bg: 'bg-gray-50', ring: 'ring-gray-300', desc: 'Non-urgent, can wait' },
  Medium: { label: 'Medium', color: 'text-primary', bg: 'bg-accent', ring: 'ring-primary/25', desc: 'Address within 48h' },
  High: { label: 'High', color: 'text-amber-700', bg: 'bg-amber-50', ring: 'ring-amber-300', desc: 'Fix within 24 hours' },
  Critical: { label: 'Critical', color: 'text-rose-700', bg: 'bg-rose-50', ring: 'ring-rose-300', desc: 'Immediate action' },
}

export function CreateTicketPage() {
  const [priority, setPriority] = useState<Priority>('Medium')
  const [category, setCategory] = useState('Electrical')
  const [title, setTitle] = useState('')
  const [room, setRoom] = useState('')
  const [floor, setFloor] = useState('Floor 2')
  const [description, setDescription] = useState('')
  const [assignedTo, setAssignedTo] = useState('')
  const [estimatedCost, setEstimatedCost] = useState('')
  const [scheduledDate, setScheduledDate] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [ticketNumber, setTicketNumber] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const num = `MNT-2026-${String(251 + Math.floor(Math.random() * 100)).padStart(3, '0')}`
    setTicketNumber(num)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="flex flex-col gap-5">
        <PageHeader title="Create Ticket" icon={Plus} crumbs={[{ label: 'Maintenance', href: '/dashboard/maintenance' }, { label: 'Create' }]} />
        <MaintenanceTabs />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 py-16 text-center"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900">Ticket Created!</p>
            <p className="mt-1 text-sm text-gray-500">Your maintenance ticket has been submitted.</p>
            <p className="mt-2 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">{ticketNumber}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setSubmitted(false)}
              className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50">
              Create Another
            </button>
            <button className="rounded-xl bg-primary px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-primary/80">
              View Ticket
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Create Ticket"
        description="Submit a new maintenance request for rooms, equipment or facilities."
        icon={Plus}
        crumbs={[{ label: 'Maintenance', href: '/dashboard/maintenance' }, { label: 'Create' }]}
      />

      <MaintenanceTabs />

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {/* Main form */}
          <div className="flex flex-col gap-5 lg:col-span-2">
            {/* Location */}
            <div className="rounded-2xl border border-gray-200/70 bg-white p-5 shadow-sm">
              <h3 className="mb-4 text-sm font-semibold text-gray-900">Location</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700">Floor</label>
                  <select value={floor} onChange={(e) => setFloor(e.target.value)}
                    className="h-9 w-full rounded-xl border border-gray-200 bg-white px-3 text-xs text-gray-900 shadow-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20">
                    {FLOORS.map((f) => <option key={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700">Room Number</label>
                  <input type="text" placeholder="e.g. 208" value={room} onChange={(e) => setRoom(e.target.value)}
                    className="h-9 w-full rounded-xl border border-gray-200 bg-white px-3 text-xs text-gray-900 placeholder-gray-400 shadow-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20" />
                </div>
              </div>
            </div>

            {/* Issue Details */}
            <div className="rounded-2xl border border-gray-200/70 bg-white p-5 shadow-sm">
              <h3 className="mb-4 text-sm font-semibold text-gray-900">Issue Details</h3>
              <div className="flex flex-col gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700">Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)}
                    className="h-9 w-full rounded-xl border border-gray-200 bg-white px-3 text-xs text-gray-900 shadow-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20">
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700">Issue Title</label>
                  <input type="text" placeholder="Brief description of the issue" value={title} onChange={(e) => setTitle(e.target.value)} required
                    className="h-9 w-full rounded-xl border border-gray-200 bg-white px-3 text-xs text-gray-900 placeholder-gray-400 shadow-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700">Description</label>
                  <textarea rows={3} placeholder="Detailed description of the problem..." value={description} onChange={(e) => setDescription(e.target.value)}
                    className="w-full resize-none rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs text-gray-900 placeholder-gray-400 shadow-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20" />
                </div>
              </div>
            </div>

            {/* Priority */}
            <div className="rounded-2xl border border-gray-200/70 bg-white p-5 shadow-sm">
              <h3 className="mb-4 text-sm font-semibold text-gray-900">Priority</h3>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {(Object.entries(PRIORITY_CONFIG) as [Priority, typeof PRIORITY_CONFIG[Priority]][]).map(([key, conf]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setPriority(key)}
                    className={cn(
                      'flex flex-col items-center gap-1 rounded-xl border-2 p-3 text-center transition-all',
                      priority === key ? `${conf.bg} border-current ${conf.color} ring-2 ring-offset-1 ${conf.ring}` : 'border-gray-100 bg-gray-50/50 text-gray-500 hover:border-gray-200',
                    )}
                  >
                    <span className="text-xs font-bold">{conf.label}</span>
                    <span className="text-[10px] leading-tight">{conf.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Photo Upload */}
            <div className="rounded-2xl border border-gray-200/70 bg-white p-5 shadow-sm">
              <h3 className="mb-4 text-sm font-semibold text-gray-900">Photos (Optional)</h3>
              <div className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-200 py-8 text-center hover:border-primary/35 hover:bg-accent/30 transition-colors cursor-pointer">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
                  <Upload className="h-5 w-5 text-gray-400" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600">Click to upload photos</p>
                  <p className="text-[10px] text-gray-400">PNG, JPG up to 5MB each</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl border border-gray-200/70 bg-white p-5 shadow-sm">
              <h3 className="mb-4 text-sm font-semibold text-gray-900">Assignment</h3>
              <div className="flex flex-col gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700">Assign To</label>
                  <select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)}
                    className="h-9 w-full rounded-xl border border-gray-200 bg-white px-3 text-xs text-gray-900 shadow-sm outline-none focus:border-primary/50">
                    <option value="">Auto-assign</option>
                    {STAFF.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700">Scheduled Date</label>
                  <input type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)}
                    className="h-9 w-full rounded-xl border border-gray-200 bg-white px-3 text-xs text-gray-900 shadow-sm outline-none focus:border-primary/50" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700">Estimated Cost (Rs)</label>
                  <input type="number" placeholder="0" value={estimatedCost} onChange={(e) => setEstimatedCost(e.target.value)}
                    className="h-9 w-full rounded-xl border border-gray-200 bg-white px-3 text-xs text-gray-900 shadow-sm outline-none focus:border-primary/50" />
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="rounded-2xl border border-gray-200/70 bg-white p-5 shadow-sm">
              <h3 className="mb-3 text-sm font-semibold text-gray-900">Summary</h3>
              <dl className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Location</dt>
                  <dd className="font-medium text-gray-900">{floor}{room ? `, Room ${room}` : ''}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Category</dt>
                  <dd className="font-medium text-gray-900">{category}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Priority</dt>
                  <dd className={cn('font-bold', PRIORITY_CONFIG[priority].color)}>{priority}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Estimated Cost</dt>
                  <dd className="font-medium text-gray-900">{estimatedCost ? `Rs ${parseInt(estimatedCost).toLocaleString()}` : 'TBD'}</dd>
                </div>
              </dl>
            </div>

            <div className="flex flex-col gap-2">
              <button type="submit"
                className="flex items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary/80">
                <Wrench className="h-4 w-4" />
                Submit Ticket
              </button>
              <button type="button"
                className="flex items-center justify-center rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
