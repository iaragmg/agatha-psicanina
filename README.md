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

| Variável | Obrigatória | Descrição | Exemplo |
|---|:---:|---|---|
| `DATABASE_URL` | ✅ | String de conexão PostgreSQL | `postgresql://user:pass@localhost:5432/agatha` |
| `OPENAI_API_KEY` | ✅ | Chave da OpenAI API (server-only, nunca use `NEXT_PUBLIC_`) | `sk-...` |
| `AUTH_SECRET` | ✅ | Segredo do NextAuth (gere com `openssl rand -base64 32`) | `abc123...` |
| `AUTH_URL` | ✅ | URL base do app (usada pelo NextAuth) | `http://localhost:3000` |
| `RATE_LIMIT_MAX` | — | Máximo de requisições por janela por IP (padrão: `20`) | `30` |
| `RATE_LIMIT_WINDOW_MS` | — | Duração da janela de rate limit em ms (padrão: `60000`) | `60000` |
| `NEXT_PUBLIC_APP_URL` | — | URL pública do app (client-side) | `http://localhost:3000` |
| `NEXT_PUBLIC_APP_NAME` | — | Nome do app (client-side) | `Agatha PsiCanina` |

> **Nunca** comite `.env.local`. Ele está no `.gitignore`. Use `.env.example` como template.

### Rate limiting

A rota `/api/chat` aplica um limite deslizante por IP. Com os padrões (`RATE_LIMIT_MAX=20`, `RATE_LIMIT_WINDOW_MS=60000`), cada IP pode fazer **20 requisições por minuto**. Quando excedido, a API retorna `HTTP 429` com os headers:

```
Retry-After: <segundos até o reset>
X-RateLimit-Limit: 20
X-RateLimit-Remaining: 0
X-RateLimit-Reset: <unix timestamp>
```

O limitador é in-memory (adequado para instância única / Vercel). Para ambientes multi-instância, substitua o `Map` em `src/lib/rate-limit.ts` por Redis (ex.: `@upstash/ratelimit`).

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
