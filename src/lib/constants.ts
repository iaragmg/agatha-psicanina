export const SESSION_CONFIG = {
  MIN_QUESTIONS: 5,
  MAX_QUESTIONS: 8,
  MAX_TOKENS_PER_TURN: 500,
  TIMEOUT_MS: 10_000,
} as const

export const SENSITIVE_REDIRECT = {
  CVV_PHONE: '188',
  CVV_SITE: 'https://www.cvv.org.br',
  MESSAGE:
    'Agatha percebeu que isso é algo sério. Por favor, fale com alguém de confiança ou ligue para o CVV: 188 (24h, gratuito).',
} as const

export const AGATHA_CATCHPHRASES = [
  'Curioso...',
  'Os humanos são fascinantes.',
  'Talvez você precise de um sachê emocional.',
  'Nem eu que corro atrás do próprio rabo faria isso por tanto tempo.',
] as const
