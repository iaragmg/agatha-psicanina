import type { Metadata } from 'next'
import { ChatClient } from './ChatClient'

export const metadata: Metadata = {
  title: 'Consultório | Agatha PsiCanina',
  description: 'Sua sessão psicanina com Agatha. Entretenimento — não é psicologia real.',
}

export default function ChatPage() {
  return <ChatClient />
}
