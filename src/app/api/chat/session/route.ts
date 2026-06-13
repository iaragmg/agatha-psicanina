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

    return NextResponse.json({ sessionId: session.id, anonymousId })
  } catch (err) {
    console.error('[POST /api/chat/session]', err)
    return NextResponse.json({ error: 'Erro ao criar sessão' }, { status: 500 })
  }
}
