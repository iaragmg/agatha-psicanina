import { z } from 'zod'
import { SESSION_CONFIG } from '@/lib/constants'

export const createSessionSchema = z.object({
  patientId: z.string().cuid('ID de paciente inválido'),
  locale: z.string().default('pt-BR'),
})

export const updateSessionSchema = z.object({
  status: z.enum(['ACTIVE', 'COMPLETED', 'ABANDONED']),
  endedAt: z.iso.datetime().optional(),
})

export const createMessageSchema = z.object({
  sessionId: z.string().cuid('ID de sessão inválido'),
  turnNumber: z
    .number()
    .int()
    .min(1)
    .max(SESSION_CONFIG.MAX_QUESTIONS * 2, 'Número de turno excedido'),
  role: z.enum(['bot', 'user']),
  content: z
    .string()
    .min(1, 'Mensagem não pode ser vazia')
    .max(4000, 'Mensagem muito longa'),
  flaggedSensitive: z.boolean().default(false),
})

export type CreateSessionInput = z.infer<typeof createSessionSchema>
export type UpdateSessionInput = z.infer<typeof updateSessionSchema>
export type CreateMessageInput = z.infer<typeof createMessageSchema>
