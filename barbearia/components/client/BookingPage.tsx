'use client'

import { useState, useEffect, useCallback } from 'react'
import { Scissors, Clock, CheckCircle, AlertCircle, Loader2, Calendar } from 'lucide-react'

interface Slot { id: string; time: string }
interface Settings { is_open: boolean; announcement: string | null }

type Step = 'service' | 'datetime' | 'info' | 'success'

const BARBEIRO_NOME = process.env.NEXT_PUBLIC_BARBEIRO_NOME ?? 'Barbearia Premium'
const WHATSAPP = process.env.NEXT_PUBLIC_BARBEIRO_WHATSAPP ?? '5511999999999'

function formatDateBR(date: string) {
  const [y, m, d] = date.split('-')
  return `${d}/${m}/${y}`
}

function getTodayStr() {
  return new Date().toISOString().split('T')[0]
}

function getNext30Days() {
  const dates = []
  for (let i = 0; i < 30; i++) {
    const d = new Date()
    d.setDate(d.getDate() + i)
    dates.push(d.toISOString().split('T')[0])
  }
  return dates
}

function getDayName(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')
}

export default function BookingPage() {
  const [step, setStep] = useState<Step>('service')
  const [settings, setSettings] = useState<Settings | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>(getTodayStr())
  const [slots, setSlots] = useState<Slot[]>([])
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [error, setError] = useState('')
  const [bookingResult, setBookingResult] = useState<{ name: string; date: string; time: string } | null>(null)

  // Carrega configurações
  useEffect(() => {
    fetch('/api/admin/settings')
      .then(r => r.json())
      .then(setSettings)
      .catch(() => setSettings({ is_open: false, announcement: null }))
  }, [])

  // Carrega slots ao mudar data
  const loadSlots = useCallback(async (date: string) => {
    setSlotsLoading(true)
    setSelectedSlot(null)
    try {
      const res = await fetch(`/api/slots?date=${date}`)
      const data = await res.json()
      setSlots(data.slots ?? [])
    } catch {
      setSlots([])
    } finally {
      setSlotsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (step === 'datetime') loadSlots(selectedDate)
  }, [selectedDate, step, loadSlots])

  // Formata telefone ao digitar
  const handlePhone = (v: string) => {
    const digits = v.replace(/\D/g, '').slice(0, 11)
    let formatted = digits
    if (digits.length > 2) formatted = `(${digits.slice(0, 2)}) ${digits.slice(2)}`
    if (digits.length > 7) formatted = `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
    setPhone(formatted)
  }

  const handleConfirm = async () => {
    if (!selectedSlot || !name.trim() || phone.replace(/\D/g, '').length < 10) {
      setError('Preencha todos os campos corretamente.')
      return
    }

    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.replace(/\D/g, ''),
          date: selectedDate,
          time: selectedSlot.time,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Erro ao agendar. Tente novamente.')
        return
      }

      setBookingResult({ name: name.trim(), date: selectedDate, time: selectedSlot.time })
      setStep('success')

      // WhatsApp redirect
      const msg = encodeURIComponent(
        `Olá, meu nome é ${name.trim()}. Agendei um corte no dia ${formatDateBR(selectedDate)} às ${selectedSlot.time}. Valor R$20.`
      )
      setTimeout(() => {
        window.open(`https://wa.me/${WHATSAPP}?text=${msg}`, '_blank')
      }, 1500)
    } catch {
      setError('Erro de conexão. Verifique sua internet.')
    } finally {
      setLoading(false)
    }
  }

  const dates = getNext30Days()

  return (
    <main className="min-h-screen bg-[#0f0f0f] flex flex-col">
      {/* Header */}
      <header className="border-b border-white/[0.06] py-6 px-4 animate-fade-in">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center">
            <Scissors className="w-4 h-4 text-gold" />
          </div>
          <div>
            <h1 className="text-[15px] font-semibold text-white/90">{BARBEIRO_NOME}</h1>
            <p className="text-[12px] text-white/40">Agendamento online</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${settings?.is_open ? 'bg-green-400 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-[11px] text-white/40">
              {settings === null ? '...' : settings.is_open ? 'Aberto' : 'Fechado'}
            </span>
          </div>
        </div>
      </header>

      {/* Anúncio */}
      {settings?.announcement && (
        <div className="bg-gold/[0.08] border-b border-gold/20 px-4 py-3 animate-slide-down">
          <div className="max-w-lg mx-auto flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 text-gold shrink-0" />
            <p className="text-[12px] text-gold/90">{settings.announcement}</p>
          </div>
        </div>
      )}

      <div className="flex-1 px-4 py-8">
        <div className="max-w-lg mx-auto">

          {/* STEP: SUCCESS */}
          {step === 'success' && bookingResult && (
            <div className="text-center animate-fade-up">
              <div className="w-16 h-16 rounded-full bg-green-400/10 border border-green-400/20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Agendado!</h2>
              <p className="text-white/50 text-sm mb-8">
                Redirecionando para o WhatsApp para confirmar...
              </p>
              <div className="card-dark text-left space-y-3 mb-8">
                <Row label="Serviço" value="Corte Masculino" />
                <Row label="Data" value={formatDateBR(bookingResult.date)} />
                <Row label="Horário" value={bookingResult.time} />
                <Row label="Valor" value="R$ 20,00" gold />
              </div>
              <button
                onClick={() => {
                  const msg = encodeURIComponent(
                    `Olá, meu nome é ${bookingResult.name}. Agendei um corte no dia ${formatDateBR(bookingResult.date)} às ${bookingResult.time}. Valor R$20.`
                  )
                  window.open(`https://wa.me/${WHATSAPP}?text=${msg}`, '_blank')
                }}
                className="btn-gold w-full"
              >
                Abrir WhatsApp
              </button>
            </div>
          )}

          {/* STEP: SERVICE */}
          {step === 'service' && (
            <div className="animate-fade-up">
              <StepHeader step={1} total={3} label="Escolha o serviço" />
              <div
                onClick={() => {
                  if (settings?.is_open === false) return
                  setStep('datetime')
                }}
                className={`card-dark cursor-pointer border transition-all duration-200 ${
                  settings?.is_open === false
                    ? 'opacity-40 cursor-not-allowed'
                    : 'hover:border-gold/30 hover:bg-black-700 active:scale-[0.99]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center">
                      <Scissors className="w-4 h-4 text-gold" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Corte Masculino</p>
                      <p className="text-sm text-white/40 mt-0.5">Corte profissional</p>
                    </div>
                  </div>
                  <p className="text-xl font-bold text-gold">R$&nbsp;20</p>
                </div>
              </div>
              {settings?.is_open === false && (
                <p className="text-center text-sm text-red-400/80 mt-4">
                  Barbearia fechada no momento. Volte mais tarde.
                </p>
              )}
            </div>
          )}

          {/* STEP: DATETIME */}
          {step === 'datetime' && (
            <div className="animate-fade-up">
              <StepHeader step={2} total={3} label="Escolha data e horário" />

              {/* Calendário horizontal */}
              <div className="mb-6">
                <p className="text-[11px] text-white/40 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Calendar className="w-3 h-3" /> Data
                </p>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {dates.map(d => {
                    const isSelected = d === selectedDate
                    const isToday = d === getTodayStr()
                    return (
                      <button
                        key={d}
                        onClick={() => setSelectedDate(d)}
                        className={`flex flex-col items-center min-w-[52px] py-2.5 px-2 rounded-lg border transition-all duration-150 ${
                          isSelected
                            ? 'bg-gold text-black border-gold'
                            : 'bg-black-800 border-white/[0.06] text-white/60 hover:border-white/20 hover:text-white/90'
                        }`}
                      >
                        <span className="text-[10px] uppercase">{getDayName(d)}</span>
                        <span className={`text-sm font-bold mt-0.5 ${isSelected ? 'text-black' : ''}`}>
                          {d.split('-')[2]}
                        </span>
                        {isToday && (
                          <div className={`w-1 h-1 rounded-full mt-1 ${isSelected ? 'bg-black/30' : 'bg-gold'}`} />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Horários */}
              <div className="mb-8">
                <p className="text-[11px] text-white/40 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Clock className="w-3 h-3" /> Horários disponíveis
                </p>
                {slotsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-5 h-5 text-gold animate-spin" />
                  </div>
                ) : slots.length === 0 ? (
                  <div className="card-dark text-center py-8">
                    <p className="text-white/40 text-sm">Sem horários disponíveis nesta data</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-2">
                    {slots.map(slot => {
                      const isSelected = selectedSlot?.id === slot.id
                      return (
                        <button
                          key={slot.id}
                          onClick={() => setSelectedSlot(slot)}
                          className={`py-2.5 rounded-lg text-sm font-medium border transition-all duration-150 ${
                            isSelected
                              ? 'bg-gold text-black border-gold shadow-gold'
                              : 'bg-black-800 border-white/[0.06] text-white/70 hover:border-gold/30 hover:text-white'
                          }`}
                        >
                          {slot.time}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button className="btn-ghost flex-1" onClick={() => setStep('service')}>Voltar</button>
                <button
                  className="btn-gold flex-1"
                  disabled={!selectedSlot}
                  onClick={() => setStep('info')}
                >
                  Continuar
                </button>
              </div>
            </div>
          )}

          {/* STEP: INFO */}
          {step === 'info' && (
            <div className="animate-fade-up">
              <StepHeader step={3} total={3} label="Seus dados" />

              {/* Resumo */}
              <div className="card-dark mb-6 text-sm space-y-2">
                <div className="flex justify-between text-white/50">
                  <span>Serviço</span>
                  <span className="text-white/80">Corte Masculino</span>
                </div>
                <div className="flex justify-between text-white/50">
                  <span>Data</span>
                  <span className="text-white/80">{formatDateBR(selectedDate)}</span>
                </div>
                <div className="flex justify-between text-white/50">
                  <span>Horário</span>
                  <span className="text-white/80">{selectedSlot?.time}</span>
                </div>
                <div className="h-px bg-white/[0.06]" />
                <div className="flex justify-between">
                  <span className="text-white/50">Total</span>
                  <span className="text-gold font-bold">R$ 20,00</span>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-[11px] text-white/40 uppercase tracking-wider block mb-2">
                    Nome completo *
                  </label>
                  <input
                    className="input-dark"
                    placeholder="João Silva"
                    value={name}
                    onChange={e => setName(e.target.value.replace(/[<>{}[\]\\]/g, ''))}
                    maxLength={100}
                    autoComplete="name"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-white/40 uppercase tracking-wider block mb-2">
                    Telefone *
                  </label>
                  <input
                    className="input-dark"
                    placeholder="(11) 99999-9999"
                    value={phone}
                    onChange={e => handlePhone(e.target.value)}
                    inputMode="tel"
                    autoComplete="tel"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 mb-4 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button className="btn-ghost flex-1" onClick={() => setStep('datetime')}>Voltar</button>
                <button
                  className="btn-gold flex-1"
                  disabled={loading || !name.trim() || phone.replace(/\D/g, '').length < 10}
                  onClick={handleConfirm}
                >
                  {loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Aguarde...</>
                  ) : (
                    'Confirmar Agendamento'
                  )}
                </button>
              </div>

              <p className="text-[11px] text-white/25 text-center mt-4">
                Ao confirmar, você será redirecionado ao WhatsApp para finalizar.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/[0.04] py-4 px-4 text-center">
        <p className="text-[11px] text-white/20">{BARBEIRO_NOME} · Agendamento online</p>
      </footer>
    </main>
  )
}

function StepHeader({ step, total, label }: { step: number; total: number; label: string }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-1 mb-3">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={`h-0.5 flex-1 rounded-full transition-all duration-300 ${
              i < step ? 'bg-gold' : 'bg-white/10'
            }`}
          />
        ))}
      </div>
      <p className="text-[11px] text-white/40 uppercase tracking-wider">Passo {step} de {total}</p>
      <h2 className="text-xl font-bold text-white mt-1">{label}</h2>
    </div>
  )
}

function Row({ label, value, gold }: { label: string; value: string; gold?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-white/50">{label}</span>
      <span className={`text-sm font-medium ${gold ? 'text-gold' : 'text-white/80'}`}>{value}</span>
    </div>
  )
}
