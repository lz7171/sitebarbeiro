// types/index.ts

export interface Appointment {
  id: string
  name: string
  phone: string
  date: string       // YYYY-MM-DD
  time: string       // HH:MM
  service: string
  price: number
  created_at: string
}

export interface AvailableSlot {
  id: string
  date: string
  time: string
  is_available: boolean
}

export interface Settings {
  id: string
  is_open: boolean
  announcement: string | null
}

export interface BookingFormData {
  name: string
  phone: string
  date: string
  time: string
}

export interface AdminSession {
  username: string
  iat: number
  exp: number
}
