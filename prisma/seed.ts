import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Iniciando seed...')

  // ── 1. Usuário admin ──────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('Admin@1234', 12)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@agathapsicanina.com' },
    update: {},
    create: {
      name: 'Agatha Admin',
      email: 'admin@agathapsicanina.com',
      passwordHash: adminPassword,
      role: 'ADMIN',
      emailVerified: new Date(),
    },
  })
  console.log(`✅ Admin criado: ${admin.email}`)

  // ── 2. Usuário comum (operador) ───────────────────────────────────
  const userPassword = await bcrypt.hash('User@1234', 12)

  const operator = await prisma.user.upsert({
    where: { email: 'operador@agathapsicanina.com' },
    update: {},
    create: {
      name: 'Iara Operadora',
      email: 'operador@agathapsicanina.com',
      passwordHash: userPassword,
      role: 'USER',
      emailVerified: new Date(),
    },
  })
  console.log(`✅ Operador criado: ${operator.email}`)

  // ── 3. Paciente demo ──────────────────────────────────────────────
  const patient = await prisma.patient.upsert({
    where: { anonymousId: 'demo-patient-001' },
    update: {},
    create: {
      nickname: 'Usuário Demo',
      anonymousId: 'demo-patient-001',
      ageRange: 'AGE_25_34',
      createdById: operator.id,
    },
  })
  console.log(`✅ Paciente demo criado: ${patient.nickname}`)

  // ── 4. Sessão de exemplo (já concluída) ───────────────────────────
  const existingSession = await prisma.session.findFirst({
    where: { patientId: patient.id, status: 'COMPLETED' },
  })

  if (!existingSession) {
    const session = await prisma.session.create({
      data: {
        patientId: patient.id,
        status: 'COMPLETED',
        questionCount: 6,
        startedAt: new Date(Date.now() - 10 * 60 * 1000),
        endedAt: new Date(),
        messages: {
          createMany: {
            data: [
              {
                turnNumber: 1,
                role: 'bot',
                content:
                  'Au. Au. Bom dia! Quando você acorda de manhã, qual é o seu primeiro pensamento?',
              },
              {
                turnNumber: 2,
                role: 'user',
                content: 'Que horas são e se consigo dormir mais um pouco.',
              },
              {
                turnNumber: 3,
                role: 'bot',
                content:
                  'Curioso... Você procrastina ao acordar. E quando o prazo de algo importante chega, você é do tipo que age na última hora ou na penúltima?',
              },
              {
                turnNumber: 4,
                role: 'user',
                content: 'Na última, com certeza. Às vezes depois da última.',
              },
              {
                turnNumber: 5,
                role: 'bot',
                content:
                  'Os humanos são fascinantes. Quando você erra alguma coisa, fica se flagelando por dias ou parte para o próximo sachê emocional?',
              },
              {
                turnNumber: 6,
                role: 'user',
                content: 'Fico me lembrando pelo menos uma semana.',
              },
              {
                turnNumber: 7,
                role: 'bot',
                content:
                  'Interessante. Você prefere resolver conflitos na hora ou deixar esfriar e nunca resolver?',
              },
              {
                turnNumber: 8,
                role: 'user',
                content: 'Deixar esfriar. Às vezes evapora sozinho.',
              },
              {
                turnNumber: 9,
                role: 'bot',
                content:
                  'Nem eu que corro atrás do próprio rabo faria isso por tanto tempo. Última pergunta: você pede ajuda quando precisa ou sofre em silêncio com um sorriso?',
              },
              {
                turnNumber: 10,
                role: 'user',
                content: 'Sorriso, com certeza. Peço ajuda só em último caso.',
              },
            ],
          },
        },
      },
    })

    // ── 5. Diagnóstico da sessão demo ─────────────────────────────
    await prisma.diagnosis.create({
      data: {
        sessionId: session.id,
        title: 'Procrastinadoro Crônico com Potencial Não Liberado',
        description:
          'Você claramente tem mais camadas que um croissant quentinho numa manhã de domingo. ' +
          'Sua relação com o tempo é, digamos, criativa: você vê prazos como sugestões e a última hora como sua hora de ouro. ' +
          'Combinado com uma memória afetiva que guarda erros com carinho de museu, temos um quadro rico e fascinante.',
        prescription:
          'Receito: um sachê emocional por dia, uma caminhada no parque sem celular, ' +
          'e talvez uma conversa honesta com aquela pessoa com quem você tem um conflito "esfriando" desde 2022.',
        archetypeTags: [
          'procrastinador-ouro',
          'autocrítico',
          'evitador-de-conflito',
          'sorriso-corajoso',
        ],
      },
    })

    console.log(`✅ Sessão demo criada com diagnóstico`)
  } else {
    console.log(`⏭️  Sessão demo já existe, pulando`)
  }

  console.log('\n🐾 Seed concluído! Dados de acesso:')
  console.log('   Admin:    admin@agathapsicanina.com / Admin@1234')
  console.log('   Operador: operador@agathapsicanina.com / User@1234')
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
