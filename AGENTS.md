<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:psicanina-conventions -->
# Convenções PsiCanina

## Textos e i18n

Todo texto novo exibido ao usuário deve ser concentrado em um objeto
`TEXTS` no topo do arquivo — nunca strings literais espalhadas no JSX.

```ts
// ✅ correto
const TEXTS = {
  title: 'Meu Prontuário PsiCanino',
  emptyState: {
    heading: 'Nenhum prontuário encontrado',
    cta: 'Iniciar Primeira Consulta',
  },
}

// ❌ errado
<h1>Meu Prontuário PsiCanino</h1>
```

**Objetivo:** facilitar futura migração para PT-BR / EN / ES sem
precisar caçar strings espalhadas pelo JSX.

**Não instalar biblioteca de i18n ainda.** Apenas manter os textos
organizados em `TEXTS` para tornar a migração trivial quando chegar.

**Não refatorar arquivos existentes proativamente.** Aplicar apenas
em código novo criado a partir de agora.
<!-- END:psicanina-conventions -->
