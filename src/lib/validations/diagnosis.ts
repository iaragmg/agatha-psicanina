import { z } from 'zod'

// ─── Schema do JSON que a Agatha deve retornar ───────────────────────────────

export const diagnosisJsonSchema = z.object({
  tipo: z.literal('diagnostico'),
  diagnostico: z.string().min(3).max(120),
  arquetipoCanino: z.string().min(2).max(80),
  nivelDrama: z.number().int().min(1).max(10),
  sintomas: z.array(z.string().min(1).max(80)).min(2).max(6),
  prescricao: z.string().min(10).max(500),
  fraseCompartilhavel: z.string().min(5).max(200),
  resumoAfetivo: z.string().min(10).max(400),
})

export type DiagnosisJson = z.infer<typeof diagnosisJsonSchema>

// ─── Schema para criar no banco ───────────────────────────────────────────────

export const createDiagnosisSchema = z.object({
  sessionId: z.string().cuid('ID de sessão inválido'),
  title: z.string().min(3).max(120),
  description: z.string().min(10).max(1000),
  prescription: z.string().min(10).max(500),
  archetypeTags: z
    .array(z.string().min(1).max(40))
    .min(1, 'Ao menos uma tag de arquétipo')
    .max(6, 'Máximo 6 tags'),
  arquetipoCanino: z.string().max(80).default(''),
  nivelDrama: z.number().int().min(1).max(10).default(5),
  sintomas: z.array(z.string().max(80)).default([]),
  fraseCompartilhavel: z.string().max(200).default(''),
  resumoAfetivo: z.string().max(400).default(''),
  cardImageUrl: z.url('URL inválida').optional().or(z.literal('')),
})

export const shareEventSchema = z.object({
  diagnosisId: z.string().cuid('ID de diagnóstico inválido'),
  channel: z.enum(['whatsapp', 'instagram', 'copy']),
})

export type CreateDiagnosisInput = z.infer<typeof createDiagnosisSchema>
export type ShareEventInput = z.infer<typeof shareEventSchema>
