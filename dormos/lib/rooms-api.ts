import { API_BASE, getToken } from '@/lib/api'
import type { Room, Bed, CleaningStatus, MaintenanceStatus } from '@/types/dorm'

export type RoomListResult = {
  items: Room[]
  total: number
  page: number
  limit: number
  pageCount: number
}

type ApiRoom = Record<string, unknown> & {
  id: string
  number: string
  floor: number
  capacity: number
  type: string
  status: string
  building?: { name?: string } | null
  beds?: ApiBed[]
}

type ApiBed = Record<string, unknown> & {
  id: string
  roomId: string
  label: string
  status: string
  studentId?: string | null
}

const CLEANING_MAP: Record<string, CleaningStatus> = {
  Clean: 'Clean',
  NeedsCleaning: 'Needs Cleaning',
  InProgress: 'In Progress',
}

const MAINTENANCE_MAP: Record<string, MaintenanceStatus> = {
  None: 'None',
  Scheduled: 'Scheduled',
  InProgress: 'In Progress',
  Overdue: 'Overdue',
}

function str(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function num(value: unknown): number {
  return typeof value === 'number' ? value : Number(value ?? 0) || 0
}

export function mapRoom(raw: ApiRoom): Room {
  return {
    id: raw.id,
    number: str(raw.number),
    building: raw.building?.name ?? '',
    floor: num(raw.floor) || 1,
    capacity: num(raw.capacity) || 1,
    type: (str(raw.type) as Room['type']) || 'Twin',
    ac: Boolean(raw.ac),
    attachedBathroom: Boolean(raw.attachedBathroom),
    furniture: Array.isArray(raw.furniture) ? raw.furniture.map(String) : [],
    status: (str(raw.status) as Room['status']) || 'Vacant',
    cleaningStatus: CLEANING_MAP[str(raw.cleaningStatus)] ?? 'Clean',
    maintenanceStatus: MAINTENANCE_MAP[str(raw.maintenanceStatus)] ?? 'None',
    rentPerBed: num(raw.rentPerBed),
    hue: num(raw.hue),
    beds: Array.isArray(raw.beds) ? raw.beds.map(mapBed) : undefined,
  }
}

export function mapBed(raw: ApiBed): Bed {
  return {
    id: raw.id,
    roomId: raw.roomId,
    label: str(raw.label),
    status: (str(raw.status) as Bed['status']) || 'Vacant',
    studentId: raw.studentId ?? null,
  }
}

export async function fetchRooms(
  hostelId: string,
  params?: Record<string, string>,
): Promise<RoomListResult> {
  const search = new URLSearchParams({ hostelId, limit: '200', ...params })
  const res = await fetch(`${API_BASE}/api/rooms?${search}`, {
    headers: getToken() ? { Authorization: `Bearer ${getToken()}` } : undefined,
    credentials: 'include',
  })
  if (!res.ok) {
    throw new Error(`Failed to load rooms (${res.status})`)
  }
  const json = await res.json()
  return {
    items: (json.items ?? []).map(mapRoom),
    total: json.total ?? 0,
    page: json.page ?? 1,
    limit: json.limit ?? 200,
    pageCount: json.pageCount ?? 0,
  }
}

export async function fetchRoom(id: string): Promise<{ room: Room; beds: Bed[] }> {
  const res = await fetch(`${API_BASE}/api/rooms/${id}`, {
    headers: getToken() ? { Authorization: `Bearer ${getToken()}` } : undefined,
    credentials: 'include',
  })
  if (!res.ok) {
    throw new Error(`Failed to load room (${res.status})`)
  }
  const json = await res.json()
  return { room: mapRoom(json), beds: (json.beds ?? []).map(mapBed) }
}

export async function createRoom(payload: Record<string, unknown>): Promise<Room> {
  const res = await fetch(`${API_BASE}/api/rooms`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
    },
    credentials: 'include',
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.message ?? 'Failed to create room')
  }
  return mapRoom(await res.json())
}

export async function updateRoom(id: string, payload: Record<string, unknown>): Promise<Room> {
  const res = await fetch(`${API_BASE}/api/rooms/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
    },
    credentials: 'include',
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.message ?? 'Failed to update room')
  }
  return mapRoom(await res.json())
}

export async function deleteRoom(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/rooms/${id}`, {
    method: 'DELETE',
    headers: getToken() ? { Authorization: `Bearer ${getToken()}` } : undefined,
    credentials: 'include',
  })
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.message ?? 'Failed to delete room')
  }
}
