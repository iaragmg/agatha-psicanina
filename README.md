# 🐾 Agatha PsiCanina — Consultório Interativo

> Uma Shih Tzu preta e branca, de óculos redondos e gravata borboleta, que analisa humanos com humor, carinho e inteligência. **Entretenimento — não é psicologia real.**

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 15 (App Router) |
| Linguagem | TypeScript |
| Estilo | Tailwind CSS + Glassmorphism |
| ORM | Prisma |
| Banco | PostgreSQL |
| AI | Claude API (Anthropic) |
| Deploy | Vercel (recomendado) |

---

## Pré-requisitos

- Node.js 18+
- PostgreSQL 14+ rodando localmente (ou instância na nuvem)
- Chave de API da Anthropic

---

## Setup rápido

```bash
# 1. Clone e instale dependências
git clone <repo>
cd agatha-psicanina
npm install

# 2. Configure as variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com seus valores reais

# 3. Crie o banco e rode as migrations
npx prisma migrate dev --name init

# 4. (Opcional) Abra o Prisma Studio
npx prisma studio

# 5. Rode em desenvolvimento
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

---

## Variáveis de ambiente

| Variável | Descrição | Exemplo |
|---|---|---|
| `DATABASE_URL` | String de conexão PostgreSQL | `postgresql://user:pass@localhost:5432/agatha` |
| `ANTHROPIC_API_KEY` | Chave da Claude API | `sk-ant-...` |
| `NEXT_PUBLIC_APP_URL` | URL pública do app | `http://localhost:3000` |
| `NEXT_PUBLIC_APP_NAME` | Nome do app (client-side) | `Agatha PsiCanina` |

> **Nunca** comite `.env.local`. Ele está no `.gitignore`. Use `.env.example` como template.

---

## Estrutura de pastas

```
agatha-psicanina/
├── prisma/
│   ├── schema.prisma        # Modelo de dados (Session, Turn, Diagnosis, ShareEvent)
│   └── migrations/          # Gerado pelo Prisma
├── src/
│   ├── app/
│   │   ├── layout.tsx       # Layout base com metadados e fonte
│   │   ├── page.tsx         # Splash / tela inicial
│   │   └── globals.css      # Tokens de design + glassmorphism
│   ├── lib/
│   │   ├── prisma.ts        # Singleton do PrismaClient
│   │   └── constants.ts     # Configurações de sessão, CVV, bordões
│   └── types/
│       └── index.ts         # Tipos TypeScript compartilhados
├── .env.example             # Template de variáveis (seguro para commitar)
├── .env.local               # Variáveis reais (NÃO commitar)
└── README.md
```

---

## Banco de dados

```bash
# Criar / atualizar schema
npx prisma migrate dev --name <nome_da_migration>

# Sincronizar sem migration (dev rápido)
npx prisma db push

# Visualizar dados
npx prisma studio

# Regenerar o client após mudanças no schema
npx prisma generate
```

---

## Regras de negócio importantes

- **Disclaimer obrigatório** antes de qualquer interação
- **Conteúdo grave** (crise, suicídio) → Agatha redireciona para CVV **188**
- Agatha nunca usa termos clínicos reais como diagnóstico definitivo
- Sessão: mínimo **5**, máximo **8** perguntas
- Logs não armazenam dados pessoais identificáveis (LGPD)

---

## Scripts disponíveis

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build de produção
npm run start        # Servidor de produção
npm run lint         # ESLint
npx prisma studio    # Interface visual do banco
```

---

*"Os humanos são fascinantes." — Agatha PsiCanina* 🐾
