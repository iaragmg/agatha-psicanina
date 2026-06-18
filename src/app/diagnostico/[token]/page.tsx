import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { calculateRarityScore } from '@/lib/ranking-analytics'
import { DiagnosisPageClient } from './DiagnosisPageClient'
import type { DiagnosisPayload } from '@/hooks/useChatSession'

interface Props {
  params: Promise<{ token: string }>
}

async function getDiagnosis(token: string) {
  return prisma.diagnosis.findUnique({
    where: { shareToken: token },
    select: {
      shareToken: true,
      title: true,
      arquetipoCanino: true,
      nivelDrama: true,
      sintomas: true,
      prescription: true,
      fraseCompartilhavel: true,
      resumoAfetivo: true,
    },
  })
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params
  const d = await getDiagnosis(token)

  if (!d) {
    return { title: 'Diagnóstico não encontrado | Agatha PsiCanina' }
  }

  const description = `"${d.fraseCompartilhavel}" — Diagnóstico Psicanino por Agatha 🐾`

  return {
    title: `${d.title} | Agatha PsiCanina`,
    description,
    openGraph: {
      title: d.title,
      description,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: d.title,
      description,
    },
  }
}

export default async function DiagnosisPage({ params }: Props) {
  const { token } = await params
  const [d, ] = await Promise.all([getDiagnosis(token)])

  if (!d) notFound()

  // Rarity calculado server-side para não expor a lógica ao cliente
  const rarityData = await calculateRarityScore(d.arquetipoCanino)

  const diagnosis: DiagnosisPayload = {
    tipo: 'diagnostico',
    diagnostico: d.title,
    arquetipoCanino: d.arquetipoCanino,
    nivelDrama: d.nivelDrama,
    sintomas: d.sintomas,
    prescricao: d.prescription,
    fraseCompartilhavel: d.fraseCompartilhavel,
    resumoAfetivo: d.resumoAfetivo,
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0d0d1a 0%, #130d26 50%, #0d0d1a 100%)',
        fontFamily: 'var(--font-geist-sans, system-ui, sans-serif)',
      }}
    >
      <DiagnosisPageClient
        diagnosis={diagnosis}
        shareToken={d.shareToken}
        rarityData={rarityData}
      />
    </main>
  )
}
