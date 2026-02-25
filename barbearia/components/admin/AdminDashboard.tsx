'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Power, Calendar, Plus, Trash2, Users, Megaphone,
  Loader2, CheckCircle, AlertCircle, LogOut, Clock, Scissors
} from 'lucide-react'

interface Appointment {
  id: string; name: string; phone: string
  date: string; time: string; service: string; price: number; created_at: string
}
interface Slot { id: string; date: string; time: string; is_available: boolean }
interface Settings { is_open: boolean; announcement: string | null }

type Tab = 'appointments' | 'slots' | 'settings'

function formatDateBR(d: string) {
  const [y, m, day] = d.split('-')
  return `${day}/${m}/${y}`
}

function getTodayStr() {
  return new Date().toISOString().split('T')[0]
}

export default function AdminDashboard() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('appointments')
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [slots, setSlots] = useState<Slot[]>([])
  const [settings, setSettings] = useState<Settings>({ is_open: false, announcement: null })
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)
  const [filterDate, setFilterDate] = useState(getTodayStr())

  // New slot form
  const [newSlotDate, setNewSlotDate] = useState(getTodayStr())
  const [newSlotTime, setNewSlotTime] = useState('09:00')

  // Announcement
  const [announcement, setAnnouncement] = useState('')

  const showToast = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const apiFetch = useCallback(async (url: string, opts?: RequestInit) => {
    const res = await fetch(url, opts)
    if (res.status === 401) {
      router.push('/admin-login-secreto-nao-divulgar')
      return null
    }
    return res
  }, [router])

  const loadAppointments = useCallback(async () => {
    setLoading(true)
    const res = await apiFetch(`/api/admin/appointments?date=${filterDate}`)
    if (res?.ok) {
      const data = await res.json()
      setAppointments(data.appointments ?? [])
    }
    setLoading(false)
  }, [apiFetch, filterDate])

  const loadSlots = useCallback(async () => {
    const res = await apiFetch(`/api/admin/slots?date=${newSlotDate}`)
    if (res?.ok) {
      const data = await res.json()
      setSlots(data.slots ?? [])
    }
  }, [apiFetch, newSlotDate])

  const loadSettings = useCallback(async () => {
    const res = await apiFetch('/api/admin/settings')
    if (res?.ok) {
      const data = await res.json()
      setSettings(data)
      setAnnouncement(data.announcement ?? '')
    }
  }, [apiFetch])

  useEffect(() => { loadSettings() }, [loadSettings])
  useEffect(() => { if (tab === 'appointments') loadAppointments() }, [tab, loadAppointments])
  useEffect(() => { if (tab === 'slots') loadSlots() }, [tab, loadSlots, newSlotDate])

  const toggleOpen = async () => {
    const res = await apiFetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_open: !settings.is_open }),
    })
    if (res?.ok) {
      setSettings(s => ({ ...s, is_open: !s.is_open }))
      showToast(settings.is_open ? 'Barbearia fechada' : 'Barbearia aberta')
    }
  }

  const saveAnnouncement = async () => {
    const res = await apiFetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_open: settings.is_open, announcement: announcement || null }),
    })
    if (res?.ok) showToast('Anúncio salvo!')
    else showToast('Erro ao salvar', 'err')
  }

  const addSlot = async () => {
    const res = await apiFetch('/api/admin/slots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: newSlotDate, time: newSlotTime }),
    })
    if (res?.ok) {
      loadSlots()
      showToast('Horário adicionado!')
    } else {
      const d = await res?.json()
      showToast(d?.error ?? 'Erro ao adicionar', 'err')
    }
  }

  const deleteSlot = async (id: string) => {
    const res = await apiFetch(`/api/admin/slots?id=${id}`, { method: 'DELETE' })
    if (res?.ok) { loadSlots(); showToast('Horário removido') }
    else showToast('Erro ao remover', 'err')
  }

  const cancelAppointment = async (id: string) => {
    if (!confirm('Cancelar este agendamento?')) return
    const res = await apiFetch(`/api/admin/appointments?id=${id}`, { method: 'DELETE' })
    if (res?.ok) { loadAppointments(); showToast('Agendamento cancelado') }
    else showToast('Erro ao cancelar', 'err')
  }

  const handleLogout = async () => {
    await fetch('/api/admin/settings', { method: 'DELETE' })
    router.push('/admin-login-secreto-nao-divulgar')
  }

  return (
    <main className="min-h-screen bg-[#0f0f0f]">
      {/* Header */}
      <header className="border-b border-white/[0.06] px-4 py-4 sticky top-0 bg-[#0f0f0f]/95 backdrop-blur z-10">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center">
              <Scissors className="w-3.5 h-3.5 text-gold" />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-white/90">Painel Admin</p>
              <p className="text-[10px] text-white/30">Barbearia Premium</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleOpen}
              className={`flex items-center gap-1.5 text-[12px] font-medium px-3 py-1.5 rounded-lg border transition-all duration-200 ${
                settings.is_open
                  ? 'border-green-500/30 text-green-400 bg-green-500/10 hover:bg-green-500/20'
                  : 'border-red-500/30 text-red-400 bg-red-500/10 hover:bg-red-500/20'
              }`}
            >
              <Power className="w-3 h-3" />
              {settings.is_open ? 'Aberto' : 'Fechado'}
            </button>
            <button onClick={handleLogout} className="text-white/30 hover:text-white/60 transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-white/[0.06] px-4">
        <div className="max-w-3xl mx-auto flex gap-1">
          {([
            ['appointments', Users, 'Agendamentos'],
            ['slots', Clock, 'Horários'],
            ['settings', Megaphone, 'Anúncio'],
          ] as const).map(([id, Icon, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 px-4 py-3 text-[13px] font-medium border-b-2 transition-colors ${
                tab === id
                  ? 'border-gold text-gold'
                  : 'border-transparent text-white/40 hover:text-white/70'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">

        {/* TAB: APPOINTMENTS */}
        {tab === 'appointments' && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <input
                type="date"
                className="input-dark max-w-[180px]"
                value={filterDate}
                onChange={e => setFilterDate(e.target.value)}
              />
              <button className="btn-ghost px-4 py-2 text-sm" onClick={loadAppointments}>
                Filtrar
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-5 h-5 text-gold animate-spin" />
              </div>
            ) : appointments.length === 0 ? (
              <div className="card-dark text-center py-12">
                <Calendar className="w-8 h-8 text-white/20 mx-auto mb-3" />
                <p className="text-white/40 text-sm">Nenhum agendamento nesta data</p>
              </div>
            ) : (
              <div className="space-y-3">
                {appointments.map(a => (
                  <div key={a.id} className="card-dark flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-white text-sm truncate">{a.name}</p>
                      <p className="text-[12px] text-white/40 mt-0.5">
                        📱 {a.phone} · {formatDateBR(a.date)} às {a.time}
                      </p>
                      <p className="text-[11px] text-gold/70 mt-0.5">{a.service} · R$ {a.price.toFixed(2)}</p>
                    </div>
                    <button
                      onClick={() => cancelAppointment(a.id)}
                      className="text-white/20 hover:text-red-400 transition-colors shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <p className="text-[11px] text-white/25 text-right">
                  {appointments.length} agendamento{appointments.length !== 1 ? 's' : ''} ·
                  Total: R$ {appointments.reduce((s, a) => s + a.price, 0).toFixed(2)}
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB: SLOTS */}
        {tab === 'slots' && (
          <div>
            <div className="card-dark mb-6">
              <p className="text-[11px] text-white/40 uppercase tracking-wider mb-4">Adicionar horário</p>
              <div className="flex gap-3 flex-wrap">
                <input
                  type="date"
                  className="input-dark flex-1 min-w-[150px]"
                  value={newSlotDate}
                  onChange={e => setNewSlotDate(e.target.value)}
                />
                <input
                  type="time"
                  className="input-dark w-32"
                  value={newSlotTime}
                  onChange={e => setNewSlotTime(e.target.value)}
                />
                <button className="btn-gold gap-1.5" onClick={addSlot}>
                  <Plus className="w-4 h-4" /> Adicionar
                </button>
              </div>
            </div>

            <p className="text-[11px] text-white/40 uppercase tracking-wider mb-3">
              Horários em {formatDateBR(newSlotDate)}
            </p>

            {slots.length === 0 ? (
              <div className="card-dark text-center py-8">
                <p className="text-white/40 text-sm">Nenhum horário cadastrado nesta data</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {slots.map(slot => (
                  <div
                    key={slot.id}
                    className="card-dark flex items-center justify-between gap-2 py-2 px-3"
                  >
                    <span className="text-sm font-medium text-white">{slot.time}</span>
                    <button
                      onClick={() => deleteSlot(slot.id)}
                      className="text-white/20 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: SETTINGS / ANNOUNCEMENT */}
        {tab === 'settings' && (
          <div className="space-y-4">
            <div className="card-dark">
              <p className="text-[11px] text-white/40 uppercase tracking-wider mb-4">Anúncio público</p>
              <p className="text-[12px] text-white/40 mb-3">
                Aparece no topo do site para todos os clientes. Deixe vazio para ocultar.
              </p>
              <textarea
                className="input-dark resize-none"
                rows={3}
                placeholder="Ex: Hoje fechado devido a feriado. Voltamos amanhã! 🎉"
                value={announcement}
                onChange={e => setAnnouncement(e.target.value.slice(0, 300))}
                maxLength={300}
              />
              <div className="flex items-center justify-between mt-3">
                <span className="text-[11px] text-white/25">{announcement.length}/300</span>
                <button className="btn-gold" onClick={saveAnnouncement}>Salvar anúncio</button>
              </div>
            </div>

            <div className="card-dark">
              <p className="text-[11px] text-white/40 uppercase tracking-wider mb-4">Status da barbearia</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white font-medium">
                    {settings.is_open ? '🟢 Aberta para agendamentos' : '🔴 Fechada'}
                  </p>
                  <p className="text-[12px] text-white/40 mt-1">
                    Quando fechada, o botão de agendar fica desativado
                  </p>
                </div>
                <button
                  onClick={toggleOpen}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                    settings.is_open
                      ? 'border-red-500/30 text-red-400 hover:bg-red-500/10'
                      : 'border-green-500/30 text-green-400 hover:bg-green-500/10'
                  }`}
                >
                  {settings.is_open ? 'Fechar' : 'Abrir'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 flex items-center gap-2 px-4 py-3 rounded-xl border shadow-xl text-sm font-medium animate-slide-down z-50 ${
          toast.type === 'ok'
            ? 'bg-green-500/10 border-green-500/20 text-green-400'
            : 'bg-red-500/10 border-red-500/20 text-red-400'
        }`}>
          {toast.type === 'ok'
            ? <CheckCircle className="w-4 h-4" />
            : <AlertCircle className="w-4 h-4" />
          }
          {toast.msg}
        </div>
      )}
    </main>
  )
}
