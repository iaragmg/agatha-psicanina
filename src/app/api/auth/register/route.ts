import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { registerSchema } from '@/lib/validations/user'
import { nanoid } from '@/lib/utils'

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Body inválido.' }, { status: 400 })
  }

  const parsed = registerSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' },
      { status: 400 },
    )
  }

  const { name, email, password } = parsed.data

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: 'Este e-mail já está cadastrado.' }, { status: 409 })
  }

  const passwordHash = await bcrypt.hash(password, 12)

  // Cria User + Patient vinculado em transação atômica
  const user = await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: { name, email, passwordHash, role: 'USER', active: true },
      select: { id: true, name: true, email: true },
    })

    await tx.patient.create({
      data: {
        nickname: name,
        anonymousId: nanoid(),
        email,
        userId: newUser.id,
      },
    })

    return newUser
  })

  return NextResponse.json({ ok: true, userId: user.id }, { status: 201 })
}
