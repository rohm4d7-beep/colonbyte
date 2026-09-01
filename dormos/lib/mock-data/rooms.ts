import type {
  Building,
  Room,
  RoomType,
  Bed,
  RoomStatus,
  CleaningStatus,
  MaintenanceStatus,
} from '@/types/dorm'
import { mulberry32, shuffle } from './rng'

export const BUILDINGS: Building[] = [
  { id: 'block-a', name: 'Block A', floors: 4 },
]

export const FLOORS = [1, 2, 3, 4] as const

export const ROOMS_PER_FLOOR = 20

const FURNITURE_POOL = [
  'Study table',
  'Chair',
  'Wardrobe',
  'Bookshelf',
  'Ceiling fan',
  'Curtains',
  'Balcony',
  'Mini fridge',
  'Water cooler',
  'Wall-mounted mirror',
  'Dressing table',
  'Study lamp',
]

// Capacity layout per floor. Sums to 80 rooms / 320 beds.
const FLOOR_CAPACITIES: Record<number, number[]> = {
  1: [8, 8, 2, 2, 2, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
  2: [8, 8, 2, 2, 2, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
  3: [8, 2, 2, 2, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
  4: [8, 2, 2, 2, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
}

function capacityToType(capacity: number): RoomType {
  if (capacity === 1) return 'Single'
  if (capacity === 2) return 'Twin'
  if (capacity === 3) return 'Triple'
  if (capacity === 4) return 'Quad'
  return 'Dorm'
}

export function buildRooms(): Room[] {
  const rand = mulberry32(20260701)
  const rooms: Room[] = []

  for (const floor of FLOORS) {
    const capacities = shuffle(rand, FLOOR_CAPACITIES[floor])
    const maintenanceIndexes = new Set<number>()
    maintenanceIndexes.add(Math.floor(rand() * capacities.length))
    maintenanceIndexes.add(Math.floor(rand() * capacities.length))
    const cleaningIndexes = new Set<number>()
    while (cleaningIndexes.size < 2) {
      const idx = Math.floor(rand() * capacities.length)
      if (!maintenanceIndexes.has(idx)) cleaningIndexes.add(idx)
    }

    capacities.forEach((capacity, index) => {
      const number = `${floor}${String(index + 1).padStart(2, '0')}`
      const isMaintenance = maintenanceIndexes.has(index)
      const isCleaning = cleaningIndexes.has(index)
      const maintenanceRoll = rand()

      const maintenanceStatus: MaintenanceStatus = isMaintenance
        ? maintenanceRoll < 0.25
          ? 'Overdue'
          : maintenanceRoll < 0.6
            ? 'In Progress'
            : 'Scheduled'
        : 'None'
      const cleaningStatus: CleaningStatus = isCleaning
        ? rand() < 0.5
          ? 'In Progress'
          : 'Needs Cleaning'
        : rand() < 0.08
          ? 'Needs Cleaning'
          : 'Clean'
      const status: RoomStatus = isMaintenance
        ? 'Maintenance'
        : isCleaning
          ? 'Cleaning'
          : 'Vacant'

      const furnitureCount = Math.min(4, 2 + Math.floor(rand() * 3))
      const furniture = shuffle(rand, FURNITURE_POOL).slice(0, furnitureCount)

      rooms.push({
        id: number,
        number,
        building: 'block-a',
        floor,
        capacity,
        type: capacityToType(capacity),
        ac: rand() < 0.62,
        attachedBathroom: rand() < 0.72,
        furniture: capacity === 8 ? ['Bed', 'Study table', 'Chair', 'Wardrobe', 'Bookshelf', 'Ceiling fan', 'Balcony'] : furniture,
        status,
        cleaningStatus,
        maintenanceStatus,
        rentPerBed: 9000 + Math.floor(rand() * 7000),
        hue: Math.floor(rand() * 120) + 205,
      })
    })
  }

  return rooms
}

function bedLabelsFor(capacity: number): string[] {
  if (capacity === 8) {
    return ['A1', 'A2', 'A3', 'A4', 'B1', 'B2', 'B3', 'B4']
  }
  if (capacity === 2) {
    return ['A1', 'A2']
  }
  return ['A1', 'A2', 'B1', 'B2']
}

export function buildBeds(rooms: Room[]): Bed[] {
  const beds: Bed[] = []
  for (const room of rooms) {
    const status: Bed['status'] = room.status === 'Maintenance' ? 'Maintenance' : 'Vacant'
    for (const label of bedLabelsFor(room.capacity)) {
      beds.push({
        id: `${room.id}-${label}`,
        roomId: room.id,
        label,
        status,
        studentId: null,
      })
    }
  }
  return beds
}

export const ROOM_CAPACITIES = [2, 4, 8] as const
export const ROOM_STATUSES: RoomStatus[] = ['Occupied', 'Vacant', 'Cleaning', 'Maintenance']
export const CLEANING_STATUSES: CleaningStatus[] = ['Clean', 'Needs Cleaning', 'In Progress']
export const MAINTENANCE_STATUSES: MaintenanceStatus[] = ['None', 'Scheduled', 'In Progress', 'Overdue']
