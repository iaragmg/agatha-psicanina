import { z } from 'zod'

const ageRangeValues = [
  'UNDER_18',
  'AGE_18_24',
  'AGE_25_34',
  'AGE_35_44',
  'AGE_45_54',
  'AGE_55_PLUS',
] as const

export const createPatientSchema = z.object({
  nickname: z
    .string()
    .min(1, 'Apelido obrigatório')
    .max(50, 'Apelido muito longo')
    .regex(/^[^\s].*[^\s]$|^[^\s]$/, 'Apelido não pode começar ou terminar com espaço'),
  anonymousId: z.string().min(1),
  email: z.email('E-mail inválido').optional().or(z.literal('')),
  ageRange: z.enum(ageRangeValues).optional(),
})

export type CreatePatientInput = z.infer<typeof createPatientSchema>
