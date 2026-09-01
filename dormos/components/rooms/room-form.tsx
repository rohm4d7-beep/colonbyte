'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { CheckCircle2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/shared/checkbox'
import { createRoom, updateRoom } from '@/lib/rooms-api'
import { getActiveHostelId } from '@/lib/api'
import { FLOORS } from '@/lib/mock-data'
import type { Room, RoomType, RoomStatus, CleaningStatus, MaintenanceStatus } from '@/types/dorm'
import { cn } from '@/lib/utils'

const roomSchema = z.object({
  number: z.string().min(1, 'Room number is required'),
  floor: z.string().min(1, 'Select a floor'),
  capacity: z.string().min(1, 'Select capacity'),
  type: z.string().min(1, 'Select room type'),
  ac: z.boolean(),
  attachedBathroom: z.boolean(),
  rentPerBed: z
    .string()
    .min(1, 'Rent per bed is required')
    .regex(/^\d+$/, 'Enter a valid amount'),
  status: z.string().min(1, 'Select a status'),
  cleaningStatus: z.string().min(1),
  maintenanceStatus: z.string().min(1),
})

type RoomFormValues = z.infer<typeof roomSchema>

const ROOM_TYPES: RoomType[] = ['Single', 'Twin', 'Triple', 'Quad', 'Dorm']
const ROOM_STATUSES: RoomStatus[] = ['Vacant', 'Occupied', 'Cleaning', 'Maintenance']
const CLEANING_STATUSES: CleaningStatus[] = ['Clean', 'Needs Cleaning', 'In Progress']
const MAINTENANCE_STATUSES: MaintenanceStatus[] = ['None', 'Scheduled', 'In Progress', 'Overdue']

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>
        {label}
        {required && <span className="ml-0.5 text-rose-500">*</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-rose-500" role="alert">{error}</p>}
    </div>
  )
}

interface SelectFieldProps {
  label: string
  name: keyof RoomFormValues
  control: import('react-hook-form').Control<RoomFormValues>
  options: string[]
  placeholder?: string
  required?: boolean
}

function SelectField({ label, name, control, options, placeholder = 'Select…', required }: SelectFieldProps) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field label={label} required={required} error={fieldState.error?.message}>
          <Select value={field.value || undefined} onValueChange={(next) => field.onChange(String(next ?? ''))}>
            <SelectTrigger className="w-full" aria-label={label}>
              <SelectValue>{String(field.value || placeholder)}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      )}
    />
  )
}

function roomDefaults(room?: Room): RoomFormValues {
  return {
    number: room ? room.number : '',
    floor: room ? String(room.floor) : String(FLOORS[0]),
    capacity: room ? String(room.capacity) : '4',
    type: room?.type ?? 'Quad',
    ac: room?.ac ?? true,
    attachedBathroom: room?.attachedBathroom ?? true,
    rentPerBed: room ? String(room.rentPerBed) : '12000',
    status: room?.status ?? 'Vacant',
    cleaningStatus: room?.cleaningStatus ?? 'Clean',
    maintenanceStatus: room?.maintenanceStatus ?? 'None',
  }
}

export function RoomForm({ mode = 'add', room }: { mode?: 'add' | 'edit'; room?: Room }) {
  const [saved, setSaved] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RoomFormValues>({
    resolver: zodResolver(roomSchema),
    defaultValues: roomDefaults(room),
  })

  const onSubmit = async (values: RoomFormValues) => {
    setSubmitError(null)
    const hostelId = getActiveHostelId()
    if (!hostelId) {
      setSubmitError('No active hostel found. Please sign in again.')
      return
    }
    const payload: Record<string, unknown> = {
      hostelId,
      number: values.number,
      floor: Number(values.floor),
      capacity: Number(values.capacity),
      type: values.type,
      ac: values.ac,
      attachedBathroom: values.attachedBathroom,
      rentPerBed: Number(values.rentPerBed) || 0,
      status: values.status,
      cleaningStatus: values.cleaningStatus.replace(' ', ''),
      maintenanceStatus: values.maintenanceStatus.replace(' ', ''),
    }
    try {
      if (mode === 'edit' && room) {
        await updateRoom(room.id, payload)
      } else {
        await createRoom(payload)
      }
      setSaved(true)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to save room')
    }
  }

  if (saved) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-2xl border border-gray-200/70 bg-white p-8 text-center shadow-sm"
      >
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 className="h-7 w-7" />
        </span>
        <h2 className="text-lg font-bold text-gray-900">
          {mode === 'add' ? 'Room created' : 'Room updated'}
        </h2>
        <p className="text-sm text-gray-500">
          {mode === 'add'
            ? 'The new room has been added to the hostel inventory.'
            : `Room ${room?.number} has been updated successfully.`}
        </p>
        <div className="mt-2 flex gap-2">
          <Button variant="outline" render={<Link href="/dashboard/rooms" />}>
            Back to rooms
          </Button>
          <Button render={<Link href="/dashboard/rooms" />}>
            View rooms
          </Button>
        </div>
      </motion.div>
    )
  }

  return (
    <form
      className="mx-auto flex max-w-2xl flex-col gap-5"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="rounded-2xl border border-gray-200/70 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900">Room Details</h3>
        <p className="mt-0.5 text-xs text-gray-400">
          {mode === 'add'
            ? 'Configure the room attributes and billing.'
            : `Edit the configuration for room ${room?.number}.`}
        </p>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Room number" required error={errors.number?.message}>
            <Input {...register('number')} placeholder="e.g. 105" aria-label="Room number" />
          </Field>
          <SelectField
            label="Floor"
            name="floor"
            control={control}
            options={FLOORS.map((floor) => String(floor))}
            required
          />
          <SelectField
            label="Capacity"
            name="capacity"
            control={control}
            options={['2', '4', '8']}
            required
          />
          <SelectField
            label="Room type"
            name="type"
            control={control}
            options={ROOM_TYPES}
            required
          />
          <Field label="Rent per bed (PKR)" required error={errors.rentPerBed?.message}>
            <Input {...register('rentPerBed')} placeholder="12000" inputMode="numeric" aria-label="Rent per bed" />
          </Field>
          <SelectField
            label="Room status"
            name="status"
            control={control}
            options={ROOM_STATUSES}
            required
          />
          <SelectField
            label="Cleaning status"
            name="cleaningStatus"
            control={control}
            options={CLEANING_STATUSES}
            required
          />
          <SelectField
            label="Maintenance status"
            name="maintenanceStatus"
            control={control}
            options={MAINTENANCE_STATUSES}
            required
          />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Controller
            control={control}
            name="ac"
            render={({ field }) => (
              <label
                className={cn(
                  'flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3 transition-colors',
                  'border-gray-200',
                )}
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">Air conditioned</p>
                  <p className="text-xs text-gray-400">Room has AC unit installed</p>
                </div>
                <Checkbox checked={field.value} onChange={() => field.onChange(!field.value)} aria-label="Air conditioned" />
              </label>
            )}
          />
          <Controller
            control={control}
            name="attachedBathroom"
            render={({ field }) => (
              <label
                className={cn(
                  'flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3 transition-colors',
                  'border-gray-200',
                )}
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">Attached bathroom</p>
                  <p className="text-xs text-gray-400">Private bathroom in the room</p>
                </div>
                <Checkbox
                  checked={field.value}
                  onChange={() => field.onChange(!field.value)}
                  aria-label="Attached bathroom"
                />
              </label>
            )}
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        {submitError && (
          <p className="mr-auto text-sm text-rose-600" role="alert">
            {submitError}
          </p>
        )}
        <Button type="button" variant="outline" render={<Link href="/dashboard/rooms" />}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          <Save className="mr-1 h-3.5 w-3.5" />
          {mode === 'add' ? 'Create room' : 'Save changes'}
        </Button>
      </div>
    </form>
  )
}
