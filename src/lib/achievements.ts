// ─── Tipos públicos ───────────────────────────────────────────────────────────

export type AchievementId =
  | 'primeira_consulta'
  | 'veterana_psicanina'
  | 'exploradora'
  | 'paciente_dedicada'
  | 'paciente_vip'
  | 'colecionadora'
  | 'amiga_oficial'
  | 'arquivista_emocional'
  | 'estrela_epica'
  | 'alma_lendaria'
  | 'colecao_epica'
  | 'colecao_completa'
  | 'mestre_pao_queijo'
  | 'estudiosa_noturna'
  | 'protetora_de_pets'

export type AchievementCategory =
  | 'jornada'
  | 'certificados'
  | 'raridade'
  | 'perfil'

export type Achievement = {
  id: AchievementId
  emoji: string
  title: string
  description: string
  lockedHint: string
  category: AchievementCategory
  prestige: number   // 1 (mais fácil) → 10 (mais raro)
  secret?: boolean
}

export type PatientAchievementStats = {
  totalSessions: number
  totalCertificates: number
  legendaryCertificates: number
  epicOrLegendaryCertificates: number
  hasAllRarities: boolean       // tem ao menos 1 de cada: COMUM, RARO, EPICO, LENDARIO
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
  // Jornada
  primeira_consulta:    (s) => s.totalSessions >= 1,
  veterana_psicanina:   (s) => s.totalSessions >= 3,
  exploradora:          (s) => s.totalSessions >= 7,
  paciente_dedicada:    (s) => s.totalSessions >= 10,
  paciente_vip:         (s) => s.totalSessions >= 20,
  // Certificados
  colecionadora:        (s) => s.totalCertificates >= 3,
  amiga_oficial:        (s) => s.totalCertificates >= 5,
  arquivista_emocional: (s) => s.totalCertificates >= 10,
  // Raridade
  estrela_epica:        (s) => s.epicOrLegendaryCertificates >= 1,
  alma_lendaria:        (s) => s.legendaryCertificates >= 1,
  colecao_epica:        (s) => s.epicOrLegendaryCertificates >= 3,
  colecao_completa:     (s) => s.hasAllRarities,
  // Perfil PsiCanino
  mestre_pao_queijo:    (s) => s.maxCompatibilidadePaoQueijo >= 95,
  estudiosa_noturna:    (s) => s.maxChanceEstudarMadrugada >= 90,
  protetora_de_pets:    (s) => s.maxRiscoAdotarOutroCachorro >= 85,
}

// ─── Catálogo oficial v1 — 15 conquistas ─────────────────────────────────────

export const ACHIEVEMENTS: Achievement[] = [
  // ── Jornada (5) ─────────────────────────────────────────────────────────────
  {
    id: 'primeira_consulta',
    emoji: '📕',
    title: 'Primeira Consulta',
    description: 'A primeira lambida diagnóstica da Agatha. Ela vai guardar seu cheiro.',
    lockedHint: 'Realize sua primeira consulta com a Dra. Agatha.',
    category: 'jornada',
    prestige: 1,
  },
  {
    id: 'veterana_psicanina',
    emoji: '🥇',
    title: 'Veterana PsiCanina',
    description: 'Três visitas. A Agatha já tem uma teoria sobre você.',
    lockedHint: 'Realize 3 consultas com a Agatha.',
    category: 'jornada',
    prestige: 2,
  },
  {
    id: 'exploradora',
    emoji: '🌙',
    title: 'Exploradora Emocional',
    description: 'Sete sessões de autoconhecimento. Ou sete fugas da realidade. A Agatha não julga.',
    lockedHint: 'Realize 7 consultas com a Agatha.',
    category: 'jornada',
    prestige: 3,
  },
  {
    id: 'paciente_dedicada',
    emoji: '📬',
    title: 'Paciente Dedicada',
    description: 'Dez sessões. A Agatha comprou uma cadeirinha especial para você.',
    lockedHint: 'Realize 10 consultas com a Agatha.',
    category: 'jornada',
    prestige: 5,
  },
  {
    id: 'paciente_vip',
    emoji: '🏥',
    title: 'Paciente VIP',
    description: 'Vinte sessões. Você agora tem prioridade no divã dourado da Agatha.',
    lockedHint: 'Realize 20 consultas com a Agatha.',
    category: 'jornada',
    prestige: 8,
  },
  // ── Certificados (3) ─────────────────────────────────────────────────────────
  {
    id: 'colecionadora',
    emoji: '📋',
    title: 'Colecionadora',
    description: 'Três diagnósticos certificados. Uma coleção respeitável de neuroses documentadas.',
    lockedHint: 'Emita 3 certificados PsiCaninos.',
    category: 'certificados',
    prestige: 2,
  },
  {
    id: 'amiga_oficial',
    emoji: '🐾',
    title: 'Amiga Oficial da Agatha',
    description: 'Cinco certificados. A Agatha menciona seu nome nas entrevistas.',
    lockedHint: 'Emita 5 certificados PsiCaninos.',
    category: 'certificados',
    prestige: 4,
  },
  {
    id: 'arquivista_emocional',
    emoji: '📜',
    title: 'Arquivista Emocional',
    description: 'Dez certificados. Seu prontuário é uma obra de arte do caos humano.',
    lockedHint: 'Emita 10 certificados PsiCaninos.',
    category: 'certificados',
    prestige: 7,
  },
  // ── Raridade (4) ─────────────────────────────────────────────────────────────
  {
    id: 'estrela_epica',
    emoji: '✨',
    title: 'Estrela Épica',
    description: 'Um diagnóstico épico ou lendário. A Agatha está impressionada.',
    lockedHint: 'Obtenha 1 certificado ÉPICO ou LENDÁRIO.',
    category: 'raridade',
    prestige: 4,
  },
  {
    id: 'alma_lendaria',
    emoji: '⭐',
    title: 'Alma Lendária',
    description: 'Um certificado lendário. Agatha está de patas caídas. Raro. Mítico.',
    lockedHint: 'Obtenha 1 certificado LENDÁRIO.',
    category: 'raridade',
    prestige: 7,
  },
  {
    id: 'colecao_epica',
    emoji: '🎖️',
    title: 'Coleção Épica',
    description: 'Três certificados épicos ou lendários. O olimpo canino te aguarda.',
    lockedHint: 'Acumule 3 certificados ÉPICO ou LENDÁRIO.',
    category: 'raridade',
    prestige: 8,
  },
  {
    id: 'colecao_completa',
    emoji: '🏆',
    title: 'Coleção Completa',
    description: 'Todos os quatro tipos de raridade. A Agatha pediu autógrafo.',
    lockedHint: 'Possua ao menos 1 certificado de cada raridade: COMUM, RARO, ÉPICO e LENDÁRIO.',
    category: 'raridade',
    prestige: 10,
  },
  // ── Perfil PsiCanino (3) ─────────────────────────────────────────────────────
  {
    id: 'mestre_pao_queijo',
    emoji: '🥐',
    title: 'Mestre do Pão de Queijo',
    description: 'Seu sangue é 95% queijo curado. A Agatha quer fazer exames.',
    lockedHint: 'Alcance 95% de compatibilidade com pão de queijo em algum certificado.',
    category: 'perfil',
    prestige: 5,
  },
  {
    id: 'estudiosa_noturna',
    emoji: '📚',
    title: 'Estudiosa Noturna',
    description: 'A coruja honorária da clínica. Dorme quando o sol nasce.',
    lockedHint: 'Alcance 90% de chance de estudar até tarde em algum certificado.',
    category: 'perfil',
    prestige: 4,
  },
  {
    id: 'protetora_de_pets',
    emoji: '👻',
    title: 'Protetora de Pets',
    description: 'Mais um peludo a caminho. A Agatha fareja o inevitável.',
    lockedHint: 'Alcance 85% de risco de adotar outro cachorro em algum certificado.',
    category: 'perfil',
    prestige: 4,
  },
]

// ─── Funções públicas puras ───────────────────────────────────────────────────

export function calculatePatientStats(sessions: RawSession[]): PatientAchievementStats {
  const completedSessions = sessions.filter((s) => s.diagnosis !== null)
  const certs = completedSessions
    .map((s) => s.diagnosis?.certificate)
    .filter((c): c is NonNullable<typeof c> => c != null)

  const raritySet = new Set(certs.map((c) => c.rarity))

  return {
    totalSessions: completedSessions.length,
    totalCertificates: certs.length,
    legendaryCertificates: certs.filter((c) => c.rarity === 'LENDARIO').length,
    epicOrLegendaryCertificates: certs.filter((c) => c.rarity === 'EPICO' || c.rarity === 'LENDARIO').length,
    hasAllRarities:
      raritySet.has('COMUM') &&
      raritySet.has('RARO') &&
      raritySet.has('EPICO') &&
      raritySet.has('LENDARIO'),
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
