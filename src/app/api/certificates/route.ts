import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

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

  const diagnosis = await prisma.diagnosis.findUnique({
    where: { shareToken },
    select: { id: true, certificate: true },
  })

  if (!diagnosis) {
    return Response.json({ error: 'Diagnóstico não encontrado.' }, { status: 404 })
  }

  // Reutiliza certificado existente para este diagnóstico
  if (diagnosis.certificate) {
    return Response.json({
      certificateNumber: formatCertNumber(
        diagnosis.certificate.certificateNumber,
        diagnosis.certificate.createdAt,
      ),
      patientName: diagnosis.certificate.patientName,
      createdAt: diagnosis.certificate.createdAt.toISOString(),
    })
  }

  // Cria novo certificado
  const cert = await prisma.certificate.create({
    data: { diagnosisId: diagnosis.id, patientName },
  })

  return Response.json({
    certificateNumber: formatCertNumber(cert.certificateNumber, cert.createdAt),
    patientName: cert.patientName,
    createdAt: cert.createdAt.toISOString(),
  })
}

function formatCertNumber(n: number, date: Date): string {
  const year = date.getFullYear()
  return `PSC-${year}-${String(n).padStart(6, '0')}`
}
