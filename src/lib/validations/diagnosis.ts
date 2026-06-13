import { z } from 'zod'

// ─── Schema do JSON retornado pela OpenAI ─────────────────────────────────────
// Limites de comprimento são generosos: esta é saída do modelo, não entrada do
// usuário. Restrições muito apertadas causam falha silenciosa no parse.
// nivelDrama usa z.coerce para aceitar string "7" além de número 7.

export const diagnosisJsonSchema = z.object({
  tipo: z.literal('diagnostico'),
  diagnostico: z.string().min(3).max(400),
  arquetipoCanino: z.string().min(2).max(300),
  nivelDrama: z.coerce.number().int().min(1).max(10),
  sintomas: z.array(z.string().min(1).max(400)).min(2).max(10),
  prescricao: z.string().min(10).max(1500),
  fraseCompartilhavel: z.string().min(5).max(600),
  resumoAfetivo: z.string().min(10).max(1500),
})

export type DiagnosisJson = z.infer<typeof diagnosisJsonSchema>

// ─── Schema para criar no banco ───────────────────────────────────────────────

export const createDiagnosisSchema = z.object({
  sessionId: z.string().cuid('ID de sessão inválido'),
  title: z.string().min(3).max(400),
  description: z.string().min(10).max(2000),
  prescription: z.string().min(10).max(1500),
  archetypeTags: z
    .array(z.string().min(1).max(400))
    .min(1, 'Ao menos uma tag de arquétipo')
    .max(10, 'Máximo 10 tags'),
  arquetipoCanino: z.string().max(300).default(''),
  nivelDrama: z.coerce.number().int().min(1).max(10).default(5),
  sintomas: z.array(z.string().max(400)).default([]),
  fraseCompartilhavel: z.string().max(600).default(''),
  resumoAfetivo: z.string().max(1500).default(''),
  cardImageUrl: z.url('URL inválida').optional().or(z.literal('')),
})

export const shareEventSchema = z.object({
  diagnosisId: z.string().cuid('ID de diagnóstico inválido'),
  channel: z.enum(['whatsapp', 'instagram', 'copy']),
})

export type CreateDiagnosisInput = z.infer<typeof createDiagnosisSchema>
export type ShareEventInput = z.infer<typeof shareEventSchema>
