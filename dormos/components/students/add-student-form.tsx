'use client'

import { useState } from 'react'
import { useForm, Controller, type FieldValues, type Path } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CloudUpload,
  FileText,
} from 'lucide-react'
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
import { Stepper } from '@/components/shared/stepper'
import { RoomBedPicker, type RoomBedSelection } from '@/components/shared/room-bed-picker'
import { BUILDINGS, uniqueValues } from '@/lib/mock-data'
import { createStudent, updateStudent } from '@/lib/students-api'
import { getActiveHostelId } from '@/lib/api'
import type { Student } from '@/types/dorm'
import { cn } from '@/lib/utils'
import { formatDateInput } from '@/lib/format'

const personalSchema = z.object({
  name: z.string().min(3, 'Full name is required'),
  cnic: z
    .string()
    .min(13, 'Enter a valid 13-digit CNIC')
    .regex(/^[0-9-]+$/, 'Numbers and dashes only'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.string().min(1, 'Select gender'),
  phone: z.string().min(10, 'Enter a valid phone number'),
  email: z.string().email('Enter a valid email'),
  bloodGroup: z.string().min(1, 'Select blood group'),
  address: z.string().min(5, 'Enter the permanent address'),
  medicalNotes: z.string(),
})

const guardianSchema = z.object({
  guardianName: z.string().min(3, 'Guardian name is required'),
  guardianRelation: z.string().min(1, 'Select relation'),
  guardianPhone: z.string().min(10, 'Enter a valid phone number'),
  guardianOccupation: z.string().min(2, 'Occupation is required'),
  emergencyName: z.string().min(3, 'Emergency contact name is required'),
  emergencyRelation: z.string().min(1, 'Select relation'),
  emergencyPhone: z.string().min(10, 'Enter a valid phone number'),
})

const universitySchema = z.object({
  university: z.string().min(1, 'Select university'),
  department: z.string().min(1, 'Select department'),
  semester: z.string().min(1, 'Select semester'),
  registrationNo: z.string().min(4, 'Registration number is required'),
  messPlan: z.string().min(1, 'Select mess plan'),
  monthlyFee: z.string().min(1, 'Monthly fee is required'),
})

const roomSchema = z.object({
  buildingId: z.string().min(1),
  floor: z.number().nullable(),
  roomId: z.string().nullable(),
  bedId: z.string().nullable(),
})

const documentsSchema = z.object({
  documents: z.array(z.string()),
})

const formSchema = personalSchema
  .merge(guardianSchema)
  .merge(universitySchema)
  .merge(roomSchema)
  .merge(documentsSchema)

export type StudentFormValues = z.infer<typeof formSchema>

type StepKey = 'personal' | 'guardian' | 'university' | 'room' | 'documents'

const STEPS: { key: StepKey; label: string; fields: (keyof StudentFormValues)[] }[] = [
  { key: 'personal', label: 'Personal Details', fields: ['name', 'cnic', 'dateOfBirth', 'gender', 'phone', 'email', 'bloodGroup', 'address', 'medicalNotes'] },
  { key: 'guardian', label: 'Guardian Information', fields: ['guardianName', 'guardianRelation', 'guardianPhone', 'guardianOccupation', 'emergencyName', 'emergencyRelation', 'emergencyPhone'] },
  { key: 'university', label: 'University Details', fields: ['university', 'department', 'semester', 'registrationNo', 'messPlan', 'monthlyFee'] },
  { key: 'room', label: 'Room Allocation', fields: ['buildingId', 'floor', 'roomId', 'bedId'] },
  { key: 'documents', label: 'Documents', fields: ['documents'] },
]

const SEMESTERS = Array.from({ length: 8 }, (_, i) => `Semester ${i + 1}`)
const UNIVERSITIES = uniqueValues('university')
const DEPARTMENTS = uniqueValues('department')
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']
const MESS_PLANS = ['Standard', 'Premium', 'Vegetarian', 'No Mess']
const SUGGESTED_DOCUMENTS = [
  'CNIC',
  'Bonafide Certificate',
  'University Card',
  'Admission Form',
  'Undertaking',
  'Medical Certificate',
]

function defaultValues(student?: Student): StudentFormValues {
  if (student) {
    return {
      name: student.name,
      cnic: student.cnic,
      dateOfBirth: formatDateInput(student.dateOfBirth),
      gender: student.gender,
      phone: student.phone,
      email: student.email,
      bloodGroup: student.bloodGroup,
      address: student.address,
      medicalNotes: student.medicalNotes,
      guardianName: student.guardian.name,
      guardianRelation: student.guardian.relation,
      guardianPhone: student.guardian.phone,
      guardianOccupation: student.guardian.occupation,
      emergencyName: student.emergencyContact.name,
      emergencyRelation: student.emergencyContact.relation,
      emergencyPhone: student.emergencyContact.phone,
      university: student.university,
      department: student.department,
      semester: student.semester,
      registrationNo: student.registrationNo,
      messPlan: student.messPlan,
      monthlyFee: String(student.monthlyFee),
      buildingId: BUILDINGS[0].id,
      floor: student.roomId ? Number(student.roomId.slice(0, 1)) : null,
      roomId: student.roomId,
      bedId: student.bedId,
      documents: student.documents.map((doc) => doc.category),
    }
  }
  return {
    name: '',
    cnic: '',
    dateOfBirth: '',
    gender: 'Male',
    phone: '',
    email: '',
    bloodGroup: 'O+',
    address: '',
    medicalNotes: 'None',
    guardianName: '',
    guardianRelation: 'Father',
    guardianPhone: '',
    guardianOccupation: '',
    emergencyName: '',
    emergencyRelation: 'Mother',
    emergencyPhone: '',
    university: UNIVERSITIES[0] ?? '',
    department: '',
    semester: 'Semester 1',
    registrationNo: '',
    messPlan: 'Standard',
    monthlyFee: '12000',
    buildingId: BUILDINGS[0].id,
    floor: null,
    roomId: null,
    bedId: null,
    documents: [],
  }
}

function FormField({
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

interface SelectFieldProps<T extends FieldValues> {
  label: string
  name: Path<T>
  control: T extends never ? never : import('react-hook-form').Control<T>
  options: { value: string; label: string }[]
  placeholder?: string
  required?: boolean
}

function SelectField<T extends FieldValues>({
  label,
  name,
  control,
  options,
  placeholder = 'Select…',
  required,
}: SelectFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormField label={label} required={required} error={fieldState.error?.message}>
          <Select value={field.value || undefined} onValueChange={field.onChange}>
            <SelectTrigger className="w-full" aria-label={label}>
              <SelectValue>{String(field.value || placeholder)}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      )}
    />
  )
}

export function AddStudentForm({
  mode = 'add',
  student,
}: {
  mode?: 'add' | 'edit'
  student?: Student
}) {
  const [stepIndex, setStepIndex] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    control,
    handleSubmit,
    trigger,
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<StudentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues(student),
    mode: 'onChange',
  })

  const step = STEPS[stepIndex]
  const isLastStep = stepIndex === STEPS.length - 1

  const onSubmit = async (values: StudentFormValues) => {
    setSubmitError(null)
    const hostelId = getActiveHostelId()
    if (!hostelId) {
      setSubmitError('No active hostel found. Please sign in again.')
      return
    }
    const payload = {
      hostelId,
      name: values.name,
      cnic: values.cnic,
      gender: values.gender,
      dateOfBirth: values.dateOfBirth || undefined,
      phone: values.phone,
      email: values.email || undefined,
      bloodGroup: values.bloodGroup,
      address: values.address,
      medicalNotes: values.medicalNotes,
      guardian: {
        name: values.guardianName,
        relation: values.guardianRelation,
        phone: values.guardianPhone,
        occupation: values.guardianOccupation,
      },
      emergencyContact: {
        name: values.emergencyName,
        relation: values.emergencyRelation,
        phone: values.emergencyPhone,
      },
      university: values.university,
      department: values.department,
      semester: values.semester,
      registrationNo: values.registrationNo,
      messPlan: values.messPlan,
      monthlyFee: Number(values.monthlyFee) || 0,
      roomId: values.roomId ?? undefined,
      bedId: values.bedId ?? undefined,
    }
    try {
      if (mode === 'edit' && student) {
        await updateStudent(student.id, payload)
      } else {
        await createStudent(payload)
      }
      setSubmitted(true)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to save student')
    }
  }

  const handleContinue = async () => {
    const valid = await trigger(step.fields as Path<StudentFormValues>[])
    if (valid) {
      if (isLastStep) {
        await handleSubmit(onSubmit)()
      } else {
        setStepIndex((index) => index + 1)
      }
    }
  }

  const roomSelection: RoomBedSelection = {
    buildingId: watch('buildingId'),
    floor: watch('floor'),
    roomId: watch('roomId'),
    bedId: watch('bedId'),
  }

  if (submitted) {
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
          {mode === 'add' ? 'Student added' : 'Student updated'}
        </h2>
        <p className="text-sm text-gray-500">
          {watch('name')} has been{' '}
          {mode === 'add'
            ? `registered with ID STU-${1100 + Math.floor(Math.random() * 100)}.`
            : 'updated successfully.'}
        </p>
        <div className="mt-2 flex gap-2">
          <Button variant="outline" onClick={() => (window.location.href = '/dashboard/students')}>
            Back to students
          </Button>
          <Button
            onClick={() => {
              window.location.href = '/dashboard/students'
            }}
          >
            View students
          </Button>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <div>
        <h2 className="text-lg font-bold text-gray-900">
          {mode === 'add' ? 'Add a new student' : `Edit ${student?.name}`}
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          {mode === 'add'
            ? 'Capture personal, guardian, university and room details in a few steps.'
            : 'Update the student record. Changes are saved instantly.'}
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200/70 bg-white p-4 shadow-sm sm:p-5">
        <Stepper steps={STEPS.map((s) => s.label)} current={stepIndex} />
        <div className="mt-5 border-t border-gray-100 pt-5">
          <h3 className="text-sm font-semibold text-gray-900">{step.label}</h3>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {step.key === 'personal' && (
              <>
                <FormField label="Full name" required error={errors.name?.message}>
                  <Input {...register('name')} placeholder="e.g. Ahmed Khan" aria-label="Full name" />
                </FormField>
                <FormField label="CNIC" required error={errors.cnic?.message}>
                  <Input {...register('cnic')} placeholder="35202-1234567-1" aria-label="CNIC" />
                </FormField>
                <FormField label="Date of birth" required error={errors.dateOfBirth?.message}>
                  <Input type="date" {...register('dateOfBirth')} aria-label="Date of birth" />
                </FormField>
                <SelectField
                  label="Gender"
                  name="gender"
                  control={control}
                  options={[
                    { value: 'Male', label: 'Male' },
                    { value: 'Female', label: 'Female' },
                  ]}
                />
                <FormField label="Phone" required error={errors.phone?.message}>
                  <Input {...register('phone')} placeholder="0300-1234567" aria-label="Phone" />
                </FormField>
                <FormField label="Email" required error={errors.email?.message}>
                  <Input {...register('email')} type="email" placeholder="student@example.com" aria-label="Email" />
                </FormField>
                <SelectField
                  label="Blood group"
                  name="bloodGroup"
                  control={control}
                  options={BLOOD_GROUPS.map((group) => ({ value: group, label: group }))}
                />
                <FormField label="Permanent address" required error={errors.address?.message}>
                  <Input {...register('address')} placeholder="Gulberg III, Lahore" aria-label="Permanent address" />
                </FormField>
                <div className="sm:col-span-2">
                  <FormField label="Medical notes" error={errors.medicalNotes?.message}>
                    <Input {...register('medicalNotes')} placeholder="None, or any known conditions…" aria-label="Medical notes" />
                  </FormField>
                </div>
              </>
            )}

            {step.key === 'guardian' && (
              <>
                <p className="text-xs font-semibold text-gray-400 uppercase sm:col-span-2">
                  Guardian details
                </p>
                <FormField label="Guardian name" required error={errors.guardianName?.message}>
                  <Input {...register('guardianName')} placeholder="e.g. Mr. Khan" aria-label="Guardian name" />
                </FormField>
                <SelectField
                  label="Relation"
                  name="guardianRelation"
                  control={control}
                  options={['Father', 'Uncle', 'Brother', 'Other'].map((value) => ({ value, label: value }))}
                />
                <FormField label="Guardian phone" required error={errors.guardianPhone?.message}>
                  <Input {...register('guardianPhone')} placeholder="0300-1234567" aria-label="Guardian phone" />
                </FormField>
                <FormField label="Occupation" required error={errors.guardianOccupation?.message}>
                  <Input {...register('guardianOccupation')} placeholder="e.g. Businessman" aria-label="Guardian occupation" />
                </FormField>
                <p className="text-xs font-semibold text-gray-400 uppercase sm:col-span-2">
                  Emergency contact
                </p>
                <FormField label="Contact name" required error={errors.emergencyName?.message}>
                  <Input {...register('emergencyName')} placeholder="e.g. Mrs. Khan" aria-label="Emergency contact name" />
                </FormField>
                <SelectField
                  label="Relation"
                  name="emergencyRelation"
                  control={control}
                  options={['Mother', 'Father', 'Brother', 'Uncle'].map((value) => ({ value, label: value }))}
                />
                <FormField label="Emergency phone" required error={errors.emergencyPhone?.message}>
                  <Input {...register('emergencyPhone')} placeholder="0300-1234567" aria-label="Emergency phone" />
                </FormField>
              </>
            )}

            {step.key === 'university' && (
              <>
                <SelectField
                  label="University"
                  name="university"
                  control={control}
                  options={UNIVERSITIES.map((value) => ({ value, label: value }))}
                />
                <SelectField
                  label="Department"
                  name="department"
                  control={control}
                  options={DEPARTMENTS.map((value) => ({ value, label: value }))}
                />
                <SelectField
                  label="Semester"
                  name="semester"
                  control={control}
                  options={SEMESTERS.map((value) => ({ value, label: value }))}
                />
                <FormField label="Registration number" required error={errors.registrationNo?.message}>
                  <Input {...register('registrationNo')} placeholder="FA24-BCS-123" aria-label="Registration number" />
                </FormField>
                <SelectField
                  label="Mess plan"
                  name="messPlan"
                  control={control}
                  options={MESS_PLANS.map((value) => ({ value, label: value }))}
                />
                <FormField label="Monthly fee (PKR)" required error={errors.monthlyFee?.message}>
                  <Input {...register('monthlyFee')} type="number" min={0} aria-label="Monthly fee" />
                </FormField>
              </>
            )}

            {step.key === 'room' && (
              <div className="sm:col-span-2">
                <RoomBedPicker
                  value={roomSelection}
                  showBuilding
                  onChange={(patch) => {
                    const next = { ...roomSelection, ...patch }
                    setValue('buildingId', next.buildingId)
                    setValue('floor', next.floor)
                    setValue('roomId', next.roomId)
                    setValue('bedId', next.bedId)
                    trigger(['floor', 'roomId', 'bedId'])
                  }}
                />
              </div>
            )}

            {step.key === 'documents' && (
              <div className="flex flex-col gap-4 sm:col-span-2">
                <button
                  type="button"
                  className="flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 px-4 py-8 text-center transition-colors hover:border-primary/35 hover:bg-accent/30 focus-visible:ring-3 focus-visible:ring-primary/40 focus-visible:outline-none"
                  onClick={() => setValue('documents', [...new Set([...getValues('documents'), ...SUGGESTED_DOCUMENTS])])}
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-primary shadow-sm ring-1 ring-black/5">
                    <CloudUpload className="h-5 w-5" />
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    Click to upload documents
                  </span>
                  <span className="text-xs text-gray-400">
                    CNIC, bonafide, university card, admission form — PDF, JPG or PNG
                  </span>
                </button>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {SUGGESTED_DOCUMENTS.map((document) => {
                    const selected = watch('documents').includes(document)
                    return (
                      <button
                        key={document}
                        type="button"
                        onClick={() => {
                          const docs = getValues('documents')
                          setValue(
                            'documents',
                            selected ? docs.filter((doc) => doc !== document) : [...docs, document],
                            { shouldValidate: true },
                          )
                        }}
                        className={cn(
                          'flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-all focus-visible:ring-3 focus-visible:ring-primary/40 focus-visible:outline-none',
                          selected
                            ? 'border-primary/35 bg-accent/60 font-medium text-primary'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-primary/25',
                        )}
                      >
                        <FileText className="h-4 w-4 shrink-0 text-gray-400" />
                        <span className="min-w-0 flex-1 truncate">{document}</span>
                        <span
                          className={cn(
                            'flex h-4 w-4 items-center justify-center rounded border text-[10px] font-bold',
                            selected
                              ? 'border-primary bg-primary text-white'
                              : 'border-gray-300 text-transparent',
                          )}
                        >
                          ✓
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div>
          {stepIndex > 0 && (
            <Button variant="outline" onClick={() => setStepIndex((index) => index - 1)}>
              <ArrowLeft className="mr-1 h-3.5 w-3.5" />
              Back
            </Button>
          )}
        </div>
        {submitError && (
          <p className="flex-1 text-right text-sm text-rose-600" role="alert">
            {submitError}
          </p>
        )}
        <Button
          onClick={handleContinue}
          disabled={isSubmitting}
          className="min-w-28"
        >
          {isLastStep
            ? mode === 'add'
              ? 'Register student'
              : 'Save changes'
            : 'Continue'}
          {!isLastStep && <ArrowRight className="ml-1 h-3.5 w-3.5" />}
        </Button>
      </div>
    </div>
  )
}
