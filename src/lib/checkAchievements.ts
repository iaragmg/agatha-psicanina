import { prisma } from '@/lib/prisma'
import { ACHIEVEMENTS, type UserStats } from '@/lib/achievements'

export async function checkAchievements(anonymousId: string): Promise<{
  unlockedIds: string[]
  newlyUnlockedIds: string[]
}> {
  const patient = await prisma.patient.findUnique({
    where: { anonymousId },
    select: {
      id: true,
      achievements: true,
      sessions: {
        where: { diagnosis: { isNot: null } },
        select: {
          diagnosis: {
            select: {
              certificate: {
                select: {
                  rarity: true,
                  compatibilidadePaoQueijo: true,
                  chanceEstudarMadrugada: true,
                  riscoAdotarOutroCachorro: true,
                },
              },
            },
          },
        },
      },
    },
  })

  if (!patient) return { unlockedIds: [], newlyUnlockedIds: [] }

  const certs = patient.sessions
    .map((s) => s.diagnosis?.certificate)
    .filter((c): c is NonNullable<typeof c> => c != null)

  const stats: UserStats = {
    totalSessions: patient.sessions.length,
    completedCertificates: certs.length,
    maxCompatibilidadePaoQueijo: certs.reduce((m, c) => Math.max(m, c.compatibilidadePaoQueijo), 0),
    maxChanceEstudarMadrugada: certs.reduce((m, c) => Math.max(m, c.chanceEstudarMadrugada), 0),
    maxRiscoAdotarOutroCachorro: certs.reduce((m, c) => Math.max(m, c.riscoAdotarOutroCachorro), 0),
    epicCertificates: certs.filter((c) => c.rarity === 'EPICO' || c.rarity === 'LENDARIO').length,
    legendaryCertificates: certs.filter((c) => c.rarity === 'LENDARIO').length,
    hasEpico: certs.some((c) => c.rarity === 'EPICO' || c.rarity === 'LENDARIO'),
    hasLendario: certs.some((c) => c.rarity === 'LENDARIO'),
  }

  const earned = ACHIEVEMENTS.filter((a) => a.check(stats)).map((a) => a.id)
  const alreadyUnlocked = new Set(patient.achievements)
  const newlyUnlockedIds = earned.filter((id) => !alreadyUnlocked.has(id))

  if (newlyUnlockedIds.length > 0) {
    await prisma.patient.update({
      where: { id: patient.id },
      data: { achievements: { push: newlyUnlockedIds } },
    })
  }

  return {
    unlockedIds: [...patient.achievements, ...newlyUnlockedIds],
    newlyUnlockedIds,
  }
}
