import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { ProntuarioClient, type ConsultaItem } from './ProntuarioClient'
import { RARITY_META, type Rarity } from '@/lib/certificate-indicators'
import { checkAchievements } from '@/lib/checkAchievements'

export const metadata: Metadata = {
  title: 'Meu Prontuário PsiCanino | Agatha PsiCanina',
  description: 'Todas as suas consultas, diagnósticos e certificados emocionais — arquivados pela Dra. Agatha PsiCanina.',
}

function formatCertNumber(n: number, date: Date): string {
  return `PSC-${date.getFullYear()}-${String(n).padStart(6, '0')}`
}

async function getHistorico(anonymousId: string): Promise<ConsultaItem[]> {
  const patient = await prisma.patient.findUnique({
    where: { anonymousId },
    include: {
      sessions: {
        where: { diagnosis: { isNot: null } },
        include: {
          diagnosis: {
            include: { certificate: true },
          },
        },
        orderBy: { startedAt: 'desc' },
      },
    },
  })

  if (!patient) return []

  const items: ConsultaItem[] = []

  for (const session of patient.sessions) {
    const d = session.diagnosis
    if (!d) continue

    const cert = d.certificate
    const validRarities: Rarity[] = ['COMUM', 'RARO', 'EPICO', 'LENDARIO']
    const rarity: Rarity = cert && validRarities.includes(cert.rarity as Rarity)
      ? (cert.rarity as Rarity)
      : 'COMUM'

    items.push({
      sessionId: session.id,
      diagnosis: {
        id: d.id,
        shareToken: d.shareToken,
        arquetipoCanino: d.arquetipoCanino,
        nivelDrama: d.nivelDrama,
        fraseCompartilhavel: d.fraseCompartilhavel,
        diagnostico: d.title,
        prescricao: d.prescription,
        resumoAfetivo: d.resumoAfetivo,
        sintomas: d.sintomas,
        createdAt: d.createdAt.toISOString(),
      },
      certificate: cert
        ? {
            id: cert.id,
            certificateNumber: formatCertNumber(cert.certificateNumber, cert.createdAt),
            patientName: cert.patientName,
            rarity,
            rarityLabel: (RARITY_META[rarity] ?? RARITY_META.COMUM).label,
            rarityStars: (RARITY_META[rarity] ?? RARITY_META.COMUM).stars,
            rarityColor: (RARITY_META[rarity] ?? RARITY_META.COMUM).color,
            compatibilidadePaoQueijo: cert.compatibilidadePaoQueijo,
            chanceEstudarMadrugada: cert.chanceEstudarMadrugada,
            riscoAdotarOutroCachorro: cert.riscoAdotarOutroCachorro,
            createdAt: cert.createdAt.toISOString(),
          }
        : null,
    })
  }

  return items
}

export default async function ProntuarioPage() {
  const cookieStore = await cookies()
  const anonymousId = cookieStore.get('agatha_patient_id')?.value ?? null

  // Rodar as duas operações em paralelo: histórico + reconciliação de conquistas
  const [consultas, achievements] = await Promise.all([
    anonymousId ? getHistorico(anonymousId) : Promise.resolve([] as ConsultaItem[]),
    anonymousId
      ? checkAchievements(anonymousId).catch(() => ({ unlockedIds: [] as string[], newlyUnlockedIds: [] as string[] }))
      : Promise.resolve({ unlockedIds: [] as string[], newlyUnlockedIds: [] as string[] }),
  ])

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0d0d1a 0%, #130d26 50%, #0d0d1a 100%)',
        fontFamily: 'var(--font-geist-sans, system-ui, sans-serif)',
      }}
    >
      <ProntuarioClient
        consultas={consultas}
        hasPatient={!!anonymousId}
        unlockedIds={achievements.unlockedIds}
        newlyUnlockedIds={achievements.newlyUnlockedIds}
      />
    </main>
  )
}
