'use client'

import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRightLeft, ArrowLeft, ArrowRight, Check, Building2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { SearchBar } from '@/components/shared/search-bar'
import { AvatarInitials } from '@/components/shared/avatar-initials'
import { StatusBadge, ROOM_STATUS_STYLES, BED_STATUS_STYLES } from '@/components/shared/status'
import { cn } from '@/lib/utils'
import { formatPKR } from '@/lib/format'
import {
  BUILDINGS,
  FLOORS,
  STUDENTS,
  BEDS_BY_ROOM,
  roomOccupancy,
  floorOccupancy,
  floorRooms,
} from '@/lib/mock-data'
import type { Building, Room, Student } from '@/types/dorm'

const STEPS = ['Student', 'Building', 'Floor', 'Room', 'Bed', 'Confirm']

interface MoveStudentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  student?: Student | null
}

interface MoveFlowProps {
  student?: Student | null
  onClose: () => void
}

function MoveFlow({ student, onClose }: MoveFlowProps) {
  const [step, setStep] = useState(student ? 1 : 0)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(student ?? null)
  const [building, setBuilding] = useState<Building | null>(BUILDINGS[0] ?? null)
  const [floor, setFloor] = useState<number | null>(null)
  const [room, setRoom] = useState<Room | null>(null)
  const [bedId, setBedId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [done, setDone] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const roomBeds = room ? BEDS_BY_ROOM.get(room.id) ?? [] : []
  const filteredStudents = useMemo(() => {
    const q = search.trim().toLowerCase()
    return STUDENTS.filter(
      (s) => !q || s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q),
    ).slice(0, 40)
  }, [search])

  const currentLabel = selectedStudent?.roomId
    ? `Room ${selectedStudent.roomId} · Bed ${selectedStudent.bedId?.split('-').pop() ?? '—'}`
    : 'Not allocated'

  const canContinue =
    (step === 0 && !!selectedStudent) ||
    (step === 1 && !!building) ||
    (step === 2 && floor !== null) ||
    (step === 3 && !!room) ||
    (step === 4 && !!bedId) ||
    step === 5

  const handleContinue = () => {
    if (step < 5) {
      setStep((s) => s + 1)
    } else {
      setSubmitting(true)
      setTimeout(() => {
        setSubmitting(false)
        setDone(true)
      }, 900)
    }
  }

  const handleBack = () => setStep((s) => Math.max(0, s - 1))

  return (
    <>
      {done ? (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <motion.span
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600"
          >
            <Check className="h-6 w-6" />
          </motion.span>
          <h3 className="text-lg font-bold text-gray-900">Student moved</h3>
          <p className="max-w-sm text-sm text-gray-500">
            {selectedStudent?.name} has been moved to Room {room?.number}, Bed{' '}
            {bedId?.split('-').pop()}.
          </p>
          <DialogFooter className="mt-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button
              onClick={() => {
                onClose()
                if (selectedStudent) {
                  window.location.href = `/dashboard/students/${selectedStudent.id}`
                }
              }}
            >
              View profile
            </Button>
          </DialogFooter>
        </div>
      ) : (
        <>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <ArrowRightLeft className="h-4 w-4 text-primary" />
              Move Student
            </DialogTitle>
            <DialogDescription>
              Reassign {selectedStudent?.name ?? 'a student'} to a new room and bed.
            </DialogDescription>
          </DialogHeader>

          {/* Stepper */}
          <ol className="flex items-center gap-1" aria-label="Move student progress">
            {STEPS.map((label, index) => (
              <li key={label} className="flex flex-1 items-center gap-1">
                <span
                  className={cn(
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors',
                    index < step
                      ? 'bg-emerald-500 text-white'
                      : index === step
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-400',
                  )}
                >
                  {index < step ? <Check className="h-3 w-3" /> : index + 1}
                </span>
                {index < STEPS.length - 1 && (
                  <span
                    className={cn(
                      'h-px flex-1 transition-colors',
                      index < step ? 'bg-emerald-400' : 'bg-gray-200',
                    )}
                  />
                )}
              </li>
            ))}
          </ol>

          <div className="min-h-72">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.18 }}
              >
                {step === 0 && (
                  <div className="flex flex-col gap-3">
                    <SearchBar
                      value={search}
                      onChange={setSearch}
                      placeholder="Search student by name or ID…"
                      className="w-full"
                      autoFocus
                    />
                    <div className="flex max-h-56 flex-col gap-1 overflow-y-auto rounded-xl border border-gray-100 p-1.5">
                      {filteredStudents.length === 0 && (
                        <p className="px-3 py-6 text-center text-sm text-gray-400">
                          No students match your search.
                        </p>
                      )}
                      {filteredStudents.map((candidate) => (
                        <button
                          key={candidate.id}
                          type="button"
                          onClick={() => {
                            setSelectedStudent(candidate)
                            setStep(1)
                          }}
                          className="flex items-center gap-3 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-accent focus-visible:ring-3 focus-visible:ring-primary/40 focus-visible:outline-none"
                        >
                          <AvatarInitials name={candidate.name} size="sm" />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium text-gray-900">
                              {candidate.name}
                            </span>
                            <span className="block text-xs text-gray-400">
                              {candidate.id} ·{' '}
                              {candidate.roomId ? `Room ${candidate.roomId}` : 'Not allocated'}
                            </span>
                          </span>
                          <ArrowRight className="h-4 w-4 shrink-0 text-gray-300" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <div className="flex flex-col gap-3">
                    <p className="text-sm font-medium text-gray-900">Choose building</p>
                    {BUILDINGS.map((item) => {
                      const selected = building?.id === item.id
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setBuilding(item)}
                          className={cn(
                            'flex items-center gap-3 rounded-xl border p-3 text-left transition-all focus-visible:ring-3 focus-visible:ring-primary/40 focus-visible:outline-none',
                            selected
                              ? 'border-primary/35 bg-accent/60 ring-1 ring-primary/20'
                              : 'border-gray-200 bg-white hover:border-primary/25',
                          )}
                        >
                          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-primary">
                            <Building2 className="h-4 w-4" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-semibold text-gray-900">
                              {item.name}
                            </span>
                            <span className="block text-xs text-gray-400">
                              {item.floors} floors · 80 rooms · 320 beds
                            </span>
                          </span>
                          {selected && <Check className="h-4 w-4 text-primary" />}
                        </button>
                      )
                    })}
                  </div>
                )}

                {step === 2 && (
                  <div className="flex flex-col gap-3">
                    <p className="text-sm font-medium text-gray-900">Choose floor</p>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {FLOORS.map((item) => {
                        const occupancy = floorOccupancy(item)
                        const selected = floor === item
                        return (
                          <button
                            key={item}
                            type="button"
                            onClick={() => setFloor(item)}
                            className={cn(
                              'flex flex-col gap-1.5 rounded-xl border p-3 text-left transition-all focus-visible:ring-3 focus-visible:ring-primary/40 focus-visible:outline-none',
                              selected
                                ? 'border-primary/35 bg-accent/60 ring-1 ring-primary/20'
                                : 'border-gray-200 bg-white hover:border-primary/25',
                            )}
                          >
                            <span className="text-sm font-bold text-gray-900">
                              Floor {item}
                            </span>
                            <span className="text-xs text-gray-500">
                              {occupancy.occupied}/{occupancy.total} beds
                            </span>
                            <span className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                              <span
                                className="block h-full rounded-full bg-primary"
                                style={{
                                  width: `${Math.round(
                                    (occupancy.occupied / occupancy.total) * 100,
                                  )}%`,
                                }}
                              />
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {step === 3 && floor !== null && (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">Choose room</p>
                      <span className="text-xs text-gray-400">Floor {floor}</span>
                    </div>
                    <div className="grid max-h-56 grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3">
                      {floorRooms(floor).map((item) => {
                        const occupancy = roomOccupancy(item)
                        const selected = room?.id === item.id
                        const full =
                          occupancy.vacant === 0 &&
                          item.status !== 'Cleaning' &&
                          item.status !== 'Maintenance'
                        const unavailable =
                          full || item.status === 'Cleaning' || item.status === 'Maintenance'
                        return (
                          <button
                            key={item.id}
                            type="button"
                            disabled={unavailable}
                            onClick={() => setRoom(item)}
                            className={cn(
                              'flex flex-col gap-1 rounded-xl border p-2.5 text-left transition-all focus-visible:ring-3 focus-visible:ring-primary/40 focus-visible:outline-none',
                              selected
                                ? 'border-primary/35 bg-accent/60 ring-1 ring-primary/20'
                                : unavailable
                                  ? 'cursor-not-allowed border-gray-100 bg-gray-50 opacity-60'
                                  : 'border-gray-200 bg-white hover:border-primary/25',
                            )}
                          >
                            <span className="text-sm font-semibold text-gray-900">
                              {item.number}
                            </span>
                            <span className="text-xs text-gray-500">
                              {occupancy.occupied}/{item.capacity} filled
                            </span>
                            <StatusBadge
                              style={ROOM_STATUS_STYLES[item.status]}
                              showDot={false}
                            />
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {step === 4 && room && (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">Choose bed</p>
                      <span className="text-xs text-gray-400">Room {room.number}</span>
                    </div>
                    <div className="grid max-h-56 grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-4">
                      {roomBeds.map((bed) => {
                        const occupant = bed.studentId
                          ? STUDENTS.find((s) => s.id === bed.studentId)
                          : undefined
                        const selected = bedId === bed.id
                        const disabled =
                          bed.status === 'Occupied' || bed.status === 'Maintenance'
                        return (
                          <button
                            key={bed.id}
                            type="button"
                            disabled={disabled}
                            onClick={() => setBedId(bed.id)}
                            className={cn(
                              'flex flex-col gap-1 rounded-xl border p-3 text-left transition-all focus-visible:ring-3 focus-visible:ring-primary/40 focus-visible:outline-none',
                              selected
                                ? 'border-primary/35 bg-accent/60 ring-1 ring-primary/20'
                                : disabled
                                  ? 'cursor-not-allowed border-gray-100 bg-gray-50 opacity-60'
                                  : 'border-gray-200 bg-white hover:border-primary/25',
                            )}
                          >
                            <span className="font-mono text-sm font-bold text-gray-900">
                              {bed.label}
                            </span>
                            <StatusBadge
                              style={BED_STATUS_STYLES[bed.status]}
                              showDot={false}
                            />
                            {occupant && (
                              <span className="truncate text-xs text-gray-500">
                                {occupant.name}
                              </span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {step === 5 && selectedStudent && room && bedId && (
                  <div className="flex flex-col gap-3">
                    <p className="text-sm font-medium text-gray-900">Confirm move</p>
                    <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
                      <div className="flex items-center gap-3">
                        <AvatarInitials name={selectedStudent.name} />
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {selectedStudent.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {selectedStudent.id} · {selectedStudent.department}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                        <div className="rounded-lg border border-gray-200 bg-white p-3">
                          <p className="text-xs text-gray-400">From</p>
                          <p className="mt-0.5 text-sm font-semibold text-gray-900">
                            {currentLabel}
                          </p>
                        </div>
                        <ArrowRight className="mx-auto h-4 w-4 text-gray-400" />
                        <div className="rounded-lg border border-primary/25 bg-accent p-3">
                          <p className="text-xs text-primary">To</p>
                          <p className="mt-0.5 text-sm font-semibold text-primary">
                            {building?.name} · Floor {floor} · Room {room.number} · Bed{' '}
                            {bedId.split('-').pop()}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between rounded-lg bg-white px-3 py-2 text-xs">
                        <span className="text-gray-500">Monthly rent</span>
                        <span className="font-semibold text-gray-900">
                          {formatPKR(room.rentPerBed)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            {step > 0 && !(step === 1 && student) && (
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="mr-1 h-3.5 w-3.5" />
                Back
              </Button>
            )}
            <Button disabled={!canContinue || submitting} onClick={handleContinue}>
              {submitting ? (
                <span className="flex items-center gap-1.5">
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Moving…
                </span>
              ) : (
                <>
                  {step === 5 ? 'Confirm move' : 'Continue'}
                  {step < 5 && <ArrowRight className="ml-1 h-3.5 w-3.5" />}
                </>
              )}
            </Button>
          </DialogFooter>
        </>
      )}
    </>
  )
}

export function MoveStudentModal({ open, onOpenChange, student }: MoveStudentModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && (
        <DialogContent className="sm:max-w-2xl">
          <MoveFlow
            key={student?.id ?? 'new'}
            student={student}
            onClose={() => onOpenChange(false)}
          />
        </DialogContent>
      )}
    </Dialog>
  )
}
