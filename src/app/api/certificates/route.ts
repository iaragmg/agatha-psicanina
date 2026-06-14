import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { generateIndicators } from '@/lib/certificate-indicators'
import { checkAchievements } from '@/lib/checkAchievements'

const bodySchema = z.object({
  shareToken: z.string().min(1),
  patientName: z.string().min(1).max(120).default('Paciente Anônimo'),
})

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Body inválido.' }, { status: 400 })
  }

  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: 'Dados inválidos.', issues: parsed.error.issues }, { status: 400 })
  }

  const { shareToken, patientName } = parsed.data

  // Carrega diagnóstico com todos os campos necessários para os indicadores
  const diagnosis = await prisma.diagnosis.findUnique({
    where: { shareToken },
    select: {
      id: true,
      nivelDrama: true,
      arquetipoCanino: true,
      title: true,
      prescription: true,
      resumoAfetivo: true,
      certificate: true,
    },
  })

  if (!diagnosis) {
    return Response.json({ error: 'Diagnóstico não encontrado.' }, { status: 404 })
  }

  // ── Certificado já existe ───────────────────────────────────────────────────
  if (diagnosis.certificate) {
    const cert = diagnosis.certificate

    // Retrocompatibilidade: certificados antigos têm indicadores = 0 → gerar e persistir
    if (cert.compatibilidadePaoQueijo === 0) {
      const indicators = generateIndicators(
        diagnosis.id,
        diagnosis.nivelDrama,
        diagnosis.arquetipoCanino,
        diagnosis.title,
        diagnosis.prescription,
        diagnosis.resumoAfetivo,
      )

      const updated = await prisma.certificate.update({
        where: { id: cert.id },
        data: indicators,
      })

      return Response.json(buildResponse(updated))
    }

    return Response.json(buildResponse(cert))
  }

  // ── Novo certificado ────────────────────────────────────────────────────────
  const indicators = generateIndicators(
    diagnosis.id,
    diagnosis.nivelDrama,
    diagnosis.arquetipoCanino,
    diagnosis.title,
    diagnosis.prescription,
    diagnosis.resumoAfetivo,
  )

  const cert = await prisma.certificate.create({
    data: { diagnosisId: diagnosis.id, patientName, ...indicators },
  })

  // Reconciliação de conquistas: fire-and-forget (não bloqueia a resposta)
  const anonymousId = req.cookies.get('agatha_patient_id')?.value
  if (anonymousId) checkAchievements(anonymousId).catch(console.error)

  return Response.json(buildResponse(cert))
}

function formatCertNumber(n: number, date: Date): string {
  return `PSC-${date.getFullYear()}-${String(n).padStart(6, '0')}`
}

function buildResponse(cert: {
  certificateNumber: number
  patientName: string
  createdAt: Date
  rarity: string
  compatibilidadePaoQueijo: number
  chanceEstudarMadrugada: number
  riscoAdotarOutroCachorro: number
}) {
  return {
    certificateNumber: formatCertNumber(cert.certificateNumber, cert.createdAt),
    patientName: cert.patientName,
    createdAt: cert.createdAt.toISOString(),
    rarity: cert.rarity,
    compatibilidadePaoQueijo: cert.compatibilidadePaoQueijo,
    chanceEstudarMadrugada: cert.chanceEstudarMadrugada,
    riscoAdotarOutroCachorro: cert.riscoAdotarOutroCachorro,
  }
}
