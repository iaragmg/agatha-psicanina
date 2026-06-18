import 'server-only'
import { Prisma } from '@prisma/client'
import { prisma } from './prisma'
import { ACHIEVEMENTS } from './achievements'

// ─── Return types ─────────────────────────────────────────────────────────────

export interface ClinicStats {
  totalSessions: number
  totalCertificates: number
  avgDrama: number
  avgPaoDeQueijo: number
  totalUniqueArchetypes: number
  totalAchievementsUnlocked: number
}

export interface ArchetypeEntry {
  name: string
  count: number
}

export interface RareArchetypeEntry {
  name: string
  createdAt: Date
}

export interface PaoEntry {
  arquetipoCanino: string
  avgPao: number
}

export interface RarityCount {
  rarity: string
  count: number
  percent: number
}

export interface DramaEntry {
  arquetipoCanino: string
  nivelDrama: number
  fraseCompartilhavel: string
  createdAt: Date
}

export interface Insight {
  emoji: string
  text: string
}

export interface AchievementRank {
  id: string
  emoji: string
  title: string
  count: number
}

export interface ArchetypeStatus {
  title: string
  description: string
}

export interface RarityResult {
  rarityScore: number
  archetypeCount: number
  totalCertificates: number
  label: string
  emoji: string
  color: string
  title: string
  description: string
}

export function getArchetypeStatus(percentage: number): ArchetypeStatus {
  if (percentage === 100) {
    return {
      title: 'Lendário',
      description:
        'Você é um caso único na história desta clínica. A Dra. Agatha está cogitando publicar um artigo científico só sobre você.',
    }
  }
  if (percentage >= 81) {
    return {
      title: 'Anomalia PsiCanina',
      description:
        'Você é um caso fascinante! Você faz parte de um grupo extremamente restrito que desafia os manuais da clínica.',
    }
  }
  if (percentage >= 51) {
    return {
      title: 'Espécie Rara',
      description:
        'Opa! Alerta de perfil curioso. A Dra. Agatha teve que ajustar os óculos para te analisar melhor.',
    }
  }
  if (percentage >= 26) {
    return {
      title: 'Observador Atento',
      description:
        'Você já apresenta traços interessantes. O diagnóstico já está em fase de aprofundamento.',
    }
  }
  return {
    title: 'Explorador Comum',
    description:
      'Um espécime perfeitamente dentro da média. A Dra. Agatha agradece por sua normalidade terapêutica.',
  }
}

// ─── Totais gerais ────────────────────────────────────────────────────────────

export async function getClinicStats(): Promise<ClinicStats> {
  const [
    totalSessions,
    totalCertificates,
    dramaAgg,
    paoAgg,
    uniqueArchResult,
    achievResult,
  ] = await Promise.all([
    prisma.session.count({ where: { status: 'COMPLETED' } }),
    prisma.certificate.count(),
    prisma.diagnosis.aggregate({
      where: { certificate: { isNot: null } },
      _avg: { nivelDrama: true },
    }),
    prisma.certificate.aggregate({ _avg: { compatibilidadePaoQueijo: true } }),
    prisma.$queryRaw<[{ count: bigint }]>(
      Prisma.sql`
        SELECT COUNT(DISTINCT d."arquetipoCanino") as count
        FROM diagnoses d
        INNER JOIN certificates c ON c."diagnosisId" = d.id
        WHERE d."arquetipoCanino" != ''
      `,
    ),
    prisma.$queryRaw<[{ total: bigint }]>(
      Prisma.sql`
        SELECT COALESCE(SUM(array_length(achievements, 1)), 0) as total
        FROM patients
        WHERE array_length(achievements, 1) > 0
      `,
    ),
  ])

  return {
    totalSessions,
    totalCertificates,
    avgDrama: Math.round((dramaAgg._avg.nivelDrama ?? 0) * 10) / 10,
    avgPaoDeQueijo: Math.round(paoAgg._avg.compatibilidadePaoQueijo ?? 0),
    totalUniqueArchetypes: Number(uniqueArchResult[0]?.count ?? 0),
    totalAchievementsUnlocked: Number(achievResult[0]?.total ?? 0),
  }
}

// ─── Top arquétipos por frequência ───────────────────────────────────────────

export async function getTopArchetypes(n = 10): Promise<ArchetypeEntry[]> {
  const results = await prisma.diagnosis.groupBy({
    by: ['arquetipoCanino'],
    where: {
      certificate: { isNot: null },
      arquetipoCanino: { not: '' },
    },
    _count: { arquetipoCanino: true },
    orderBy: { _count: { arquetipoCanino: 'desc' } },
    take: n,
  })

  return results.map((r) => ({ name: r.arquetipoCanino, count: r._count.arquetipoCanino }))
}

// ─── Arquétipos raros (count === 1) ──────────────────────────────────────────

export async function getRareArchetypes(n = 10): Promise<RareArchetypeEntry[]> {
  // Agrega no banco; filtra count===1 no resultado agregado (não nos registros brutos)
  const groups = await prisma.diagnosis.groupBy({
    by: ['arquetipoCanino'],
    where: {
      certificate: { isNot: null },
      arquetipoCanino: { not: '' },
    },
    _count: { arquetipoCanino: true },
  })

  const rareNames = groups.filter((g) => g._count.arquetipoCanino === 1).map((g) => g.arquetipoCanino)
  if (rareNames.length === 0) return []

  const diagnoses = await prisma.diagnosis.findMany({
    where: { arquetipoCanino: { in: rareNames }, certificate: { isNot: null } },
    select: { arquetipoCanino: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
    take: n,
  })

  return diagnoses.map((d) => ({ name: d.arquetipoCanino, createdAt: d.createdAt }))
}

// ─── Hall da Fama do Pão de Queijo ───────────────────────────────────────────

export async function getPaoDeQueijo(n = 8): Promise<PaoEntry[]> {
  const results = await prisma.$queryRaw<{ arquetipoCanino: string; avgPao: number }[]>(
    Prisma.sql`
      SELECT d."arquetipoCanino",
             ROUND(AVG(c."compatibilidadePaoQueijo"))::integer as "avgPao"
      FROM diagnoses d
      INNER JOIN certificates c ON c."diagnosisId" = d.id
      WHERE d."arquetipoCanino" != ''
      GROUP BY d."arquetipoCanino"
      ORDER BY "avgPao" DESC
      LIMIT ${n}
    `,
  )

  return results.map((r) => ({
    arquetipoCanino: r.arquetipoCanino,
    avgPao: Number(r.avgPao),
  }))
}

// ─── Distribuição de raridades ────────────────────────────────────────────────

export async function getRarityDistribution(): Promise<RarityCount[]> {
  const groups = await prisma.certificate.groupBy({
    by: ['rarity'],
    _count: { rarity: true },
    orderBy: { _count: { rarity: 'desc' } },
  })

  const total = groups.reduce((s, g) => s + g._count.rarity, 0)

  return groups.map((g) => ({
    rarity: g.rarity,
    count: g._count.rarity,
    percent: total > 0 ? Math.round((g._count.rarity / total) * 100) : 0,
  }))
}

// ─── Ranking de Drama ─────────────────────────────────────────────────────────

export async function getDramaRanking(n = 10): Promise<DramaEntry[]> {
  return prisma.diagnosis.findMany({
    where: { certificate: { isNot: null } },
    select: {
      arquetipoCanino: true,
      nivelDrama: true,
      fraseCompartilhavel: true,
      createdAt: true,
    },
    orderBy: { nivelDrama: 'desc' },
    take: n,
  })
}

// ─── Curiosidades dinâmicas ───────────────────────────────────────────────────

export async function getInsights(): Promise<Insight[]> {
  const [total, highDrama, lendario, paoAgg] = await Promise.all([
    prisma.diagnosis.count({ where: { certificate: { isNot: null } } }),
    prisma.diagnosis.count({
      where: { certificate: { isNot: null }, nivelDrama: { gte: 7 } },
    }),
    prisma.certificate.count({ where: { rarity: 'LENDARIO' } }),
    prisma.certificate.aggregate({ _avg: { compatibilidadePaoQueijo: true } }),
  ])

  const highPct = total > 0 ? Math.round((highDrama / total) * 100) : 0
  const avgPao = Math.round(paoAgg._avg.compatibilidadePaoQueijo ?? 0)
  const s = (n: number, word: string) => `${n} ${word}${n !== 1 ? 's' : ''}`

  return [
    {
      emoji: '🎭',
      text: `${highPct}% dos pacientes exibem nível de drama acima de 7. A Dra. Agatha está preocupada com a humanidade.`,
    },
    {
      emoji: '👑',
      text: `Apenas ${s(lendario, 'paciente')} atingiu${lendario !== 1 ? 'ram' : ''} raridade LENDÁRIO. São casos raros e fascinantes.`,
    },
    {
      emoji: '🥐',
      text: `A compatibilidade média com pão de queijo da clínica é ${avgPao}%. A Dra. Agatha considera isso clinicamente relevante.`,
    },
    {
      emoji: '🐾',
      text: `${s(total, 'diagnóstico')} emitido${total !== 1 ? 's' : ''} até hoje. A lista de espera da clínica só cresce.`,
    },
  ]
}

// ─── Top conquistas desbloqueadas ─────────────────────────────────────────────

export async function getTopAchievements(n = 6): Promise<AchievementRank[]> {
  const results = await prisma.$queryRaw<{ achievementId: string; count: bigint }[]>(
    Prisma.sql`
      SELECT unnest(achievements) as "achievementId", COUNT(*) as count
      FROM patients
      WHERE array_length(achievements, 1) > 0
      GROUP BY "achievementId"
      ORDER BY count DESC
      LIMIT ${n}
    `,
  )

  return results.map((r) => {
    const meta = ACHIEVEMENTS.find((a) => a.id === r.achievementId)
    return {
      id: r.achievementId,
      emoji: meta?.emoji ?? '🏅',
      title: meta?.title ?? r.achievementId,
      count: Number(r.count),
    }
  })
}

// ─── Raridade relativa do arquétipo ──────────────────────────────────────────

export async function calculateRarityScore(archetype: string): Promise<RarityResult> {
  const [total, archetypeCount] = await Promise.all([
    prisma.certificate.count(),
    prisma.diagnosis.count({
      where: { certificate: { isNot: null }, arquetipoCanino: archetype },
    }),
  ])

  // Se não há certificados ainda, o usuário é o único — 100% raro
  const rarityScore =
    total === 0 ? 100 : Math.round((1 - archetypeCount / total) * 100)

  let label: string
  let emoji: string
  let color: string

  if (rarityScore === 100) {
    label = 'Único no universo'
    emoji = '👑'
    color = '#e8c776'
  } else if (rarityScore >= 81) {
    label = 'Extremamente raro'
    emoji = '💜'
    color = '#c39bd3'
  } else if (rarityScore >= 51) {
    label = 'Acima da média'
    emoji = '💎'
    color = '#4a90d9'
  } else if (rarityScore >= 26) {
    label = 'Personalidade distinta'
    emoji = '🔭'
    color = '#5dade2'
  } else {
    label = 'Clássico da clínica'
    emoji = '🔮'
    color = '#8e99a4'
  }

  const { title, description } = getArchetypeStatus(rarityScore)

  return { rarityScore, archetypeCount, totalCertificates: total, label, emoji, color, title, description }
}
