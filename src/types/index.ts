export type SessionStatus = 'active' | 'completed' | 'abandoned'
export type TurnRole = 'bot' | 'user'
export type ShareChannel = 'whatsapp' | 'instagram' | 'copy'

export interface ChatTurn {
  role: TurnRole
  content: string
  turnNumber: number
  flaggedSensitive?: boolean
}

export interface DiagnosisResult {
  title: string
  description: string
  prescription: string
  archetypeTags: string[]
}
