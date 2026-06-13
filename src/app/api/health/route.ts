import { prisma } from '@/lib/prisma'

export async function GET() {
  const timestamp = new Date().toISOString()

  try {
    await prisma.$queryRaw`SELECT 1`

    return Response.json(
      { status: 'ok', database: 'ok', timestamp },
      { status: 200 },
    )
  } catch {
    return Response.json(
      { status: 'error', database: 'unavailable', timestamp },
      { status: 500 },
    )
  }
}
