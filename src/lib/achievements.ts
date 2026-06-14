// ─── Tipos públicos ───────────────────────────────────────────────────────────

export type AchievementId =
  | 'primeira_consulta'
  | 'veterana_psicanina'
  | 'exploradora'
  | 'mestre_pao_queijo'
  | 'estudiosa_noturna'
  | 'nao_resisti'
  | 'alma_lendaria'
  | 'colecao_epica'
  | 'drama_queen'
  | 'caso_raro'

export type AchievementCategory =
  | 'jornada'
  | 'certificados'
  | 'raridade'
  | 'perfil'
  | 'drama'
  | 'secreta'

export type Achievement = {
  id: AchievementId
  emoji: string
  title: string
  description: string
  lockedHint: string   // Frase irônica da Agatha quando bloqueado
  category: AchievementCategory
  prestige: number     // 1 (mais fácil) → 10 (mais raro)
  secret?: boolean     // Se true, título/emoji ficam ocultos até desbloquear
}

export type PatientAchievementStats = {
  totalSessions: number
  totalCertificates: number
  legendaryCertificates: number
  epicCertificates: number
  maxDrama: number                      // nivelDrama máximo (escala 1–10)
  maxCompatibilidadePaoQueijo: number
  maxChanceEstudarMadrugada: number
  maxRiscoAdotarOutroCachorro: number
}

// Tipo de entrada para calculatePatientStats — sem dependência de Prisma
export type RawSession = {
  diagnosis: {
    nivelDrama: number
    certificate: {
      rarity: string
      compatibilidadePaoQueijo: number
      chanceEstudarMadrugada: number
      riscoAdotarOutroCachorro: number
    } | null
  } | null
}

// ─── Lógica de verificação (interna) ─────────────────────────────────────────

const ACHIEVEMENT_CHECKS: Record<AchievementId, (s: PatientAchievementStats) => boolean> = {
  primeira_consulta:  (s) => s.totalSessions >= 1,
  veterana_psicanina: (s) => s.totalSessions >= 3,
  exploradora:        (s) => s.totalSessions >= 7,
  mestre_pao_queijo:  (s) => s.maxCompatibilidadePaoQueijo >= 90,
  estudiosa_noturna:  (s) => s.maxChanceEstudarMadrugada >= 90,
  nao_resisti:        (s) => s.maxRiscoAdotarOutroCachorro >= 95,
  alma_lendaria:      (s) => s.legendaryCertificates >= 1,
  colecao_epica:      (s) => s.epicCertificates >= 3,
  drama_queen:        (s) => s.maxDrama >= 9,
  // Secreta: drama extremo E compatibilidade máxima de pão de queijo
  caso_raro:          (s) => s.maxDrama >= 9 && s.maxCompatibilidadePaoQueijo >= 95,
}

// ─── Catálogo oficial ─────────────────────────────────────────────────────────

export const ACHIEVEMENTS: Achievement[] = [
  // Jornada
  {
    id: 'primeira_consulta',
    emoji: '🛋️',
    title: 'Primeira Sessão',
    description: 'A primeira lambida diagnóstica.',
    lockedHint: 'Realize sua primeira consulta com a Agatha.',
    category: 'jornada',
    prestige: 1,
  },
  {
    id: 'veterana_psicanina',
    emoji: '🏅',
    title: 'Veterana PsiCanina',
    description: 'A Agatha já decorou seu cheiro.',
    lockedHint: 'Realize 3 consultas com a Agatha.',
    category: 'jornada',
    prestige: 2,
  },
  {
    id: 'exploradora',
    emoji: '🌙',
    title: 'Exploradora da Psique',
    description: 'Sete sessões de autoconhecimento profundo.',
    lockedHint: 'Realize 7 consultas com a Agatha.',
    category: 'jornada',
    prestige: 3,
  },
  // Perfil — indicadores PsiCaninos
  {
    id: 'mestre_pao_queijo',
    emoji: '🥐',
    title: 'Mestre do Pão de Queijo',
    description: 'Seu sangue é 90% queijo curado.',
    lockedHint: 'Alcance 90% de compatibilidade com pão de queijo em algum certificado.',
    category: 'perfil',
    prestige: 4,
  },
  {
    id: 'estudiosa_noturna',
    emoji: '📚',
    title: 'Estudiosa Noturna',
    description: 'A coruja honorária da clínica.',
    lockedHint: 'Alcance 90% de chance de estudar até tarde em algum certificado.',
    category: 'perfil',
    prestige: 4,
  },
  {
    id: 'nao_resisti',
    emoji: '🐶',
    title: 'Não Resisti',
    description: 'Mais um pet a caminho, eu sinto o cheiro.',
    lockedHint: 'Alcance 95% de risco de adotar outro cachorro em algum certificado.',
    category: 'perfil',
    prestige: 5,
  },
  // Drama
  {
    id: 'drama_queen',
    emoji: '🎭',
    title: 'Drama Queen',
    description: 'Nem novela mexicana te supera.',
    lockedHint: 'Atinja nível de drama 9 ou 10 em algum diagnóstico.',
    category: 'drama',
    prestige: 5,
  },
  // Raridade — certificados
  {
    id: 'colecao_epica',
    emoji: '🎖️',
    title: 'Coleção Épica',
    description: 'O olimpo canino te aguarda.',
    lockedHint: 'Acumule 3 certificados com raridade ÉPICO ou LENDÁRIO.',
    category: 'raridade',
    prestige: 7,
  },
  {
    id: 'alma_lendaria',
    emoji: '⭐',
    title: 'Alma Lendária',
    description: 'Agatha está de patas caídas. Raro. Mítico. Lendário.',
    lockedHint: 'Obtenha um certificado de raridade LENDÁRIO.',
    category: 'raridade',
    prestige: 8,
  },
  // Secreta
  {
    id: 'caso_raro',
    emoji: '🧬',
    title: 'Caso Raro',
    description: 'Você é estatisticamente improvável. A Agatha vai escrever um artigo sobre você.',
    lockedHint: '????',
    category: 'secreta',
    prestige: 10,
    secret: true,
  },
]

// ─── Funções públicas puras ───────────────────────────────────────────────────

export function calculatePatientStats(sessions: RawSession[]): PatientAchievementStats {
  const completedSessions = sessions.filter((s) => s.diagnosis !== null)
  const certs = completedSessions
    .map((s) => s.diagnosis?.certificate)
    .filter((c): c is NonNullable<typeof c> => c != null)

  return {
    totalSessions: completedSessions.length,
    totalCertificates: certs.length,
    legendaryCertificates: certs.filter((c) => c.rarity === 'LENDARIO').length,
    epicCertificates: certs.filter((c) => c.rarity === 'EPICO' || c.rarity === 'LENDARIO').length,
    maxDrama: completedSessions.reduce(
      (m, s) => Math.max(m, s.diagnosis?.nivelDrama ?? 0), 0
    ),
    maxCompatibilidadePaoQueijo: certs.reduce((m, c) => Math.max(m, c.compatibilidadePaoQueijo), 0),
    maxChanceEstudarMadrugada:   certs.reduce((m, c) => Math.max(m, c.chanceEstudarMadrugada), 0),
    maxRiscoAdotarOutroCachorro: certs.reduce((m, c) => Math.max(m, c.riscoAdotarOutroCachorro), 0),
  }
}

export function getUnlockedAchievements(stats: PatientAchievementStats): AchievementId[] {
  return ACHIEVEMENTS
    .filter((a) => ACHIEVEMENT_CHECKS[a.id](stats))
    .map((a) => a.id)
}
