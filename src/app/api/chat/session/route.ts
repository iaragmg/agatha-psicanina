import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { nanoid } from '@/lib/utils'

export async function POST() {
  try {
    const session = await auth()

    let patient

    if (session?.user?.id) {
      // Usuário autenticado: encontra ou cria o Patient vinculado ao userId
      const userId = session.user.id
      patient = await prisma.patient.findUnique({ where: { userId } })

      if (!patient) {
        patient = await prisma.patient.create({
          data: {
            nickname: session.user.name ?? 'Paciente',
            anonymousId: nanoid(),
            email: session.user.email ?? undefined,
            userId,
          },
        })
      }
    } else {
      // Fluxo anônimo: sempre cria novo Patient com nanoid
      const anonymousId = nanoid()
      patient = await prisma.patient.create({
        data: { nickname: 'Visitante', anonymousId },
      })
    }

    const chatSession = await prisma.session.create({
      data: { patientId: patient.id, status: 'ACTIVE' },
    })

    const response = NextResponse.json({
      sessionId: chatSession.id,
      anonymousId: patient.anonymousId,
    })

    // Cookie persiste a identidade anônima (útil mesmo para usuários autenticados
    // caso a sessão NextAuth expire antes do prontuário ser acessado)
    response.cookies.set('agatha_patient_id', patient.anonymousId, {
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
      sameSite: 'lax',
      httpOnly: false,
    })

    return response
  } catch (err) {
    console.error('[POST /api/chat/session]', err)
    return NextResponse.json({ error: 'Erro ao criar sessão' }, { status: 500 })
  }
}
