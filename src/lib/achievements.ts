export type UserStats = {
  totalSessions: number
  completedCertificates: number
  maxCompatibilidadePaoQueijo: number
  maxChanceEstudarMadrugada: number
  maxRiscoAdotarOutroCachorro: number
  epicCertificates: number
  legendaryCertificates: number
  hasEpico: boolean
  hasLendario: boolean
}

export type Achievement = {
  id: string
  emoji: string
  title: string
  description: string
  unlockHint: string
  check: (stats: UserStats) => boolean
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'primeira_consulta',
    emoji: '🛋️',
    title: 'Primeira Sessão',
    description: 'Sua jornada começa aqui',
    unlockHint: 'Realize sua primeira consulta com a Agatha',
    check: (s) => s.totalSessions >= 1,
  },
  {
    id: 'veterana_psicanina',
    emoji: '🏅',
    title: 'Veterana PsiCanina',
    description: '3 consultas realizadas',
    unlockHint: 'Realize 3 consultas com a Agatha',
    check: (s) => s.totalSessions >= 3,
  },
  {
    id: 'colecionadora',
    emoji: '📜',
    title: 'Colecionadora de Diagnósticos',
    description: '3 certificados emitidos pela Agatha',
    unlockHint: 'Gere 3 certificados oficiais',
    check: (s) => s.completedCertificates >= 3,
  },
  {
    id: 'amiga_oficial',
    emoji: '🐾',
    title: 'Amiga Oficial da Agatha',
    description: '5 consultas com certificado',
    unlockHint: 'Gere 5 certificados',
    check: (s) => s.completedCertificates >= 5,
  },
  {
    id: 'mestre_pao_queijo',
    emoji: '🥐',
    title: 'Mestre do Pão de Queijo',
    description: 'Compatibilidade com pão de queijo acima de 95%',
    unlockHint: 'Alcance 95% de compatibilidade com pão de queijo em algum certificado',
    check: (s) => s.maxCompatibilidadePaoQueijo >= 95,
  },
  {
    id: 'estudiosa_noturna',
    emoji: '📚',
    title: 'Estudiosa Noturna',
    description: 'Chance de estudar até tarde acima de 90%',
    unlockHint: 'Alcance 90% de chance de estudar até tarde em algum certificado',
    check: (s) => s.maxChanceEstudarMadrugada >= 90,
  },
  {
    id: 'protetora_de_pets',
    emoji: '🐶',
    title: 'Protetora de Pets',
    description: 'Risco de adotar outro cachorro acima de 85%',
    unlockHint: 'Alcance 85% de risco de adotar outro cachorro em algum certificado',
    check: (s) => s.maxRiscoAdotarOutroCachorro >= 85,
  },
  {
    id: 'alma_lendaria',
    emoji: '⭐',
    title: 'Alma Lendária',
    description: 'Conquistou um certificado LENDÁRIO',
    unlockHint: 'Obtenha um certificado de raridade LENDÁRIO',
    check: (s) => s.hasLendario,
  },
  {
    id: 'colecao_epica',
    emoji: '🎖️',
    title: 'Coleção Épica',
    description: 'Possui três certificados ÉPICO ou LENDÁRIO',
    unlockHint: 'Acumule 3 certificados com raridade ÉPICO ou LENDÁRIO',
    check: (s) => s.epicCertificates >= 3,
  },
  {
    id: 'paciente_dedicada',
    emoji: '💌',
    title: 'Paciente Dedicada',
    description: 'Completou dez consultas com a Agatha',
    unlockHint: 'Realize 10 consultas',
    check: (s) => s.totalSessions >= 10,
  },
  // ── Conquistas extras temáticas ──────────────────────────────────────────────
  {
    id: 'exploradora',
    emoji: '🌙',
    title: 'Exploradora da Psique',
    description: 'Sete sessões de autoconhecimento',
    unlockHint: 'Realize 7 consultas com a Agatha',
    check: (s) => s.totalSessions >= 7,
  },
  {
    id: 'estrela_epica',
    emoji: '✨',
    title: 'Estrela Épica',
    description: 'Primeiro certificado de raridade ÉPICO',
    unlockHint: 'Obtenha um certificado de raridade ÉPICO ou LENDÁRIO',
    check: (s) => s.hasEpico,
  },
]
