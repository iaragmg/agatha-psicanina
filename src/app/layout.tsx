import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { auth } from '@/lib/auth'
import { SessionProvider } from '@/components/SessionProvider'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Agatha PsiCanina — Consultório Interativo',
  description:
    'Uma Shih Tzu com óculos redondos que analisa humanos com humor e carinho. Entretenimento — não é psicologia real.',
  openGraph: {
    title: 'Agatha PsiCanina',
    description: 'Receba seu diagnóstico psicanino fictício. 🐾',
    type: 'website',
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await auth()

  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SessionProvider session={session}>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
