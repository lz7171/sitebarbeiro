// lib/mockdb.ts - Database em memória (Vercel compatible)

interface Appointment {
  id: string
  name: string
  phone: string
  date: string
  time: string
  service: string
  price: number
  created_at: string
}

interface AvailableSlot {
  id: string
  date: string
  time: string
  is_available: boolean
}

interface Settings {
  is_open: boolean
  announcement: string | null
}

// Storage em memória (reseta ao redeployed)
class MockDB {
  private appointments: Map<string, Appointment> = new Map()
  private slots: Map<string, AvailableSlot> = new Map()
  private settings: Settings = { is_open: true, announcement: null }

  constructor() {
    this.initializeSampleData()
  }

  private initializeSampleData() {
    // Próximos 30 dias com 5 slots cada
    const today = new Date()
    for (let i = 0; i < 30; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() + i)
      const dateStr = date.toISOString().split('T')[0]

      // Horários: 09:00, 10:00, 14:00, 15:00, 16:00
      const times = ['09:00', '10:00', '14:00', '15:00', '16:00']
      times.forEach(time => {
        const id = `${dateStr}-${time}`
        this.slots.set(id, {
          id,
          date: dateStr,
          time,
          is_available: true,
        })
      })
    }
  }

  // ============ SLOTS ============
  getSlots(date: string, takenTimes?: Set<string>) {
    const slots = Array.from(this.slots.values())
      .filter(s => s.date === date && s.is_available)
      .filter(s => !takenTimes?.has(s.time))
      .sort((a, b) => a.time.localeCompare(b.time))

    return slots
  }

  addSlot(date: string, time: string) {
    const id = `${date}-${time}`
    if (!this.slots.has(id)) {
      this.slots.set(id, {
        id,
        date,
        time,
        is_available: true,
      })
      return true
    }
    return false
  }

  deleteSlot(date: string, time: string) {
    const id = `${date}-${time}`
    return this.slots.delete(id)
  }

  // ============ APPOINTMENTS ============
  getAppointments(date?: string, filterDate?: string) {
    let appointments = Array.from(this.appointments.values())

    if (filterDate) {
      appointments = appointments.filter(a => a.date === filterDate)
    }

    return appointments.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
  }

  addAppointment(name: string, phone: string, date: string, time: string): Appointment {
    const id = `appt-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    const appointment: Appointment = {
      id,
      name,
      phone,
      date,
      time,
      service: 'Corte Masculino',
      price: 20.0,
      created_at: new Date().toISOString(),
    }
    this.appointments.set(id, appointment)
    return appointment
  }

  deleteAppointment(id: string) {
    return this.appointments.delete(id)
  }

  // ============ SETTINGS ============
  getSettings() {
    return this.settings
  }

  updateSettings(update: Partial<Settings>) {
    this.settings = { ...this.settings, ...update }
    return this.settings
  }

  toggleOpen() {
    this.settings.is_open = !this.settings.is_open
    return this.settings
  }

  // ============ STATS ============
  getStats() {
    const appointments = Array.from(this.appointments.values())
    const totalAppointments = appointments.length
    const totalRevenue = appointments.reduce((sum, a) => sum + a.price, 0)

    return {
      totalAppointments,
      totalRevenue,
      totalSlots: this.slots.size,
    }
  }
}

// Singleton instance
export const db = new MockDB()

export type { Appointment, AvailableSlot, Settings }
