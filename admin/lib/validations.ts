// lib/validations.ts
import { z } from 'zod'

export const bookingSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter ao menos 2 caracteres')
    .max(100, 'Nome muito longo')
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Nome inválido'),
  phone: z
    .string()
    .min(10, 'Telefone inválido')
    .max(15, 'Telefone inválido')
    .regex(/^\d+$/, 'Telefone deve conter apenas números'),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida'),
  time: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Horário inválido'),
})

export const loginSchema = z.object({
  username: z.string().min(1).max(50),
  password: z.string().min(6).max(200),
})

export const slotSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida'),
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Horário inválido'),
})

export const announcementSchema = z.object({
  announcement: z.string().max(300).nullable(),
})

export const settingsSchema = z.object({
  is_open: z.boolean(),
  announcement: z.string().max(300).nullable().optional(),
})

export type BookingInput = z.infer<typeof bookingSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type SlotInput = z.infer<typeof slotSchema>
