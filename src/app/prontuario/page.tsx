import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { auth } from '@/lib/auth'
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

// Resolve a identidade do visitante: userId (auth) tem prioridade sobre cookie (anônimo)
async function resolvePatientIdentity(): Promise<
  { kind: 'userId'; value: string } | { kind: 'anonymousId'; value: string } | null
> {
  const session = await auth()
  if (session?.user?.id) return { kind: 'userId', value: session.user.id }

  const cookieStore = await cookies()
  const anonymousId = cookieStore.get('agatha_patient_id')?.value
  if (anonymousId) return { kind: 'anonymousId', value: anonymousId }

  return null
}

async function getHistorico(identity: { kind: string; value: string }): Promise<ConsultaItem[]> {
  const where = identity.kind === 'userId'
    ? { userId: identity.value }
    : { anonymousId: identity.value }

  const patient = await prisma.patient.findUnique({
    where,
    include: {
      sessions: {
        where: { diagnosis: { isNot: null } },
        include: { diagnosis: { include: { certificate: true } } },
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

async function getAnonymousId(identity: { kind: string; value: string }): Promise<string | null> {
  if (identity.kind === 'anonymousId') return identity.value
  const patient = await prisma.patient.findUnique({
    where: { userId: identity.value },
    select: { anonymousId: true },
  })
  return patient?.anonymousId ?? null
}

export default async function ProntuarioPage() {
  const identity = await resolvePatientIdentity()

  const [consultas, achievements] = await Promise.all([
    identity ? getHistorico(identity) : Promise.resolve([] as ConsultaItem[]),
    identity
      ? getAnonymousId(identity).then((anonId) =>
          anonId
            ? checkAchievements(anonId).catch(() => ({ unlockedIds: [] as string[], newlyUnlockedIds: [] as string[] }))
            : { unlockedIds: [] as string[], newlyUnlockedIds: [] as string[] }
        )
      : Promise.resolve({ unlockedIds: [] as string[], newlyUnlockedIds: [] as string[] }),
  ])

  return (
    <main
      className="page-root"
      style={{ fontFamily: 'var(--font-geist-sans, system-ui, sans-serif)' }}
    >
      <ProntuarioClient
        consultas={consultas}
        hasPatient={!!identity}
        unlockedIds={achievements.unlockedIds}
        newlyUnlockedIds={achievements.newlyUnlockedIds}
      />
    </main>
  )
}
