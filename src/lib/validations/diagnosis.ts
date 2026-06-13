import { z } from 'zod'

export const createDiagnosisSchema = z.object({
  sessionId: z.string().cuid('ID de sessão inválido'),
  title: z.string().min(3).max(120),
  description: z.string().min(10).max(1000),
  prescription: z.string().min(10).max(500),
  archetypeTags: z
    .array(z.string().min(1).max(40))
    .min(1, 'Ao menos uma tag de arquétipo')
    .max(6, 'Máximo 6 tags'),
  cardImageUrl: z.url('URL inválida').optional().or(z.literal('')),
})

export const shareEventSchema = z.object({
  diagnosisId: z.string().cuid('ID de diagnóstico inválido'),
  channel: z.enum(['whatsapp', 'instagram', 'copy']),
})

export type CreateDiagnosisInput = z.infer<typeof createDiagnosisSchema>
export type ShareEventInput = z.infer<typeof shareEventSchema>
