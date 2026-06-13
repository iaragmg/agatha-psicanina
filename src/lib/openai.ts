import 'server-only'
import OpenAI from 'openai'

// Singleton — uma única instância reutilizada entre invocações na mesma instância do servidor.
// A flag `server-only` garante que este módulo nunca seja importado pelo bundle do cliente.
let _client: OpenAI | null = null

export function getOpenAIClient(): OpenAI {
  if (_client) return _client

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error(
      'OPENAI_API_KEY não está definida. ' +
        'Adicione-a ao .env.local e nunca a exponha com o prefixo NEXT_PUBLIC_.',
    )
  }

  _client = new OpenAI({ apiKey })
  return _client
}
