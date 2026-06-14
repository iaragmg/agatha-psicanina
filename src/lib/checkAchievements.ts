import { prisma } from '@/lib/prisma'
import {
  calculatePatientStats,
  getUnlockedAchievements,
  type AchievementId,
} from '@/lib/achievements'

export async function checkAchievements(anonymousId: string): Promise<{
  unlockedIds: AchievementId[]
  newlyUnlockedIds: AchievementId[]
}> {
  const patient = await prisma.patient.findUnique({
    where: { anonymousId },
    select: {
      id: true,
      achievements: true,
      sessions: {
        select: {
          diagnosis: {
            select: {
              nivelDrama: true,
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

  const stats = calculatePatientStats(patient.sessions)
  const earned = getUnlockedAchievements(stats) as AchievementId[]

  const alreadyUnlocked = new Set(patient.achievements)
  const newlyUnlockedIds = earned.filter((id) => !alreadyUnlocked.has(id))

  if (newlyUnlockedIds.length > 0) {
    await prisma.patient.update({
      where: { id: patient.id },
      data: { achievements: { push: newlyUnlockedIds } },
    })
  }

  return {
    unlockedIds: [...(patient.achievements as AchievementId[]), ...newlyUnlockedIds],
    newlyUnlockedIds,
  }
}
