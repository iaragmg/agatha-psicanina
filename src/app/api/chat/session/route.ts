import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { nanoid } from '@/lib/utils'

export async function POST() {
  try {
    const anonymousId = nanoid()

    const patient = await prisma.patient.create({
      data: { nickname: 'Visitante', anonymousId },
    })

    const session = await prisma.session.create({
      data: { patientId: patient.id, status: 'ACTIVE' },
    })

    const response = NextResponse.json({ sessionId: session.id, anonymousId })

    // Persiste a identidade anônima do paciente por 1 ano.
    // Usado pela página /prontuario para listar o histórico de consultas.
    response.cookies.set('agatha_patient_id', anonymousId, {
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
      sameSite: 'lax',
      httpOnly: false, // legível pelo JS do cliente também
    })

    return response
  } catch (err) {
    console.error('[POST /api/chat/session]', err)
    return NextResponse.json({ error: 'Erro ao criar sessão' }, { status: 500 })
  }
}
