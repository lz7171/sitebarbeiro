// lib/sanitize.ts

/** Remove caracteres perigosos de strings */
export function sanitizeString(input: unknown): string {
  if (typeof input !== 'string') return ''
  return input
    .trim()
    .replace(/[<>{}[\]\\]/g, '') // remove HTML/injection chars
    .slice(0, 500) // limita tamanho
}

/** Sanitiza e valida nome (apenas letras, espaços, acentos) */
export function sanitizeName(input: unknown): string {
  const str = sanitizeString(input)
  return str.replace(/[^a-zA-ZÀ-ÿ\s'-]/g, '').slice(0, 100)
}

/** Sanitiza telefone: só dígitos */
export function sanitizePhone(input: unknown): string {
  const str = sanitizeString(input)
  return str.replace(/\D/g, '').slice(0, 15)
}

/** Valida formato de data YYYY-MM-DD */
export function isValidDate(date: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/
  if (!regex.test(date)) return false
  const d = new Date(date + 'T00:00:00')
  return !isNaN(d.getTime())
}

/** Valida formato de horário HH:MM */
export function isValidTime(time: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(time)
}

/** Valida telefone brasileiro (mínimo 10 dígitos) */
export function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '')
  return digits.length >= 10 && digits.length <= 13
}

/** Não permite datas no passado */
export function isFutureDate(date: string): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const d = new Date(date + 'T00:00:00')
  return d >= today
}
