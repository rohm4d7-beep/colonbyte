export type StudentStatus =
  | 'Active'
  | 'Graduated'
  | 'Check-in Pending'
  | 'Notice Served'
  | 'Inactive'

export type FeeStatus = 'Paid' | 'Pending' | 'Overdue'

export type StudentGender = 'Male' | 'Female'

export type DocumentStatus = 'Verified' | 'Pending' | 'Expired'

export type StudentDocument = {
  id: string
  name: string
  category: string
  size: string
  uploadedAt: string
  status: DocumentStatus
}

export type Guardian = {
  name: string
  relation: string
  phone: string
  occupation: string
}

export type EmergencyContact = {
  name: string
  relation: string
  phone: string
}

export type Student = {
  id: string
  name: string
  cnic: string
  gender: StudentGender
  dateOfBirth: string
  phone: string
  email: string
  address: string
  bloodGroup: string
  medicalNotes: string
  university: string
  department: string
  semester: string
  registrationNo: string
  admissionDate: string
  status: StudentStatus
  feeStatus: FeeStatus
  monthlyFee: number
  outstandingDues: number
  roomId: string | null
  bedId: string | null
  messPlan: string
  guardian: Guardian
  emergencyContact: EmergencyContact
  documents: StudentDocument[]
}

export type Building = {
  id: string
  name: string
  floors: number
}

export type RoomType = 'Single' | 'Twin' | 'Triple' | 'Quad' | 'Dorm'

export type RoomStatus = 'Occupied' | 'Vacant' | 'Cleaning' | 'Maintenance'

export type CleaningStatus = 'Clean' | 'Needs Cleaning' | 'In Progress'

export type MaintenanceStatus = 'None' | 'Scheduled' | 'In Progress' | 'Overdue'

export type Room = {
  id: string
  number: string
  building: string
  floor: number
  capacity: number
  type: RoomType
  ac: boolean
  attachedBathroom: boolean
  furniture: string[]
  status: RoomStatus
  cleaningStatus: CleaningStatus
  maintenanceStatus: MaintenanceStatus
  rentPerBed: number
  hue: number
  beds?: Bed[]
}

export type BedStatus = 'Occupied' | 'Vacant' | 'Reserved' | 'Maintenance'

export type Bed = {
  id: string
  roomId: string
  label: string
  status: BedStatus
  studentId: string | null
}

export type TimelineType =
  | 'admitted'
  | 'room_allocated'
  | 'fee_received'
  | 'complaint'
  | 'maintenance'
  | 'mess_plan'
  | 'documents'

export type TimelineEvent = {
  id: string
  studentId: string
  type: TimelineType
  title: string
  description: string
  date: string
  actor: string
}

export type PaymentRecord = {
  id: string
  studentId: string
  invoiceNo: string
  amount: number
  method: string
  date: string
  status: 'Completed' | 'Pending' | 'Failed'
}

export type MaintenanceEntry = {
  id: string
  roomId: string
  title: string
  date: string
  status: 'Resolved' | 'In Progress' | 'Scheduled' | 'Overdue'
}
