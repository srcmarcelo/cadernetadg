# Caderneta Digital v2.0

Aplicação web/PWA de controle financeiro pessoal para organizar ganhos, despesas fixas e extras, cartões de crédito detalhados com projeção de parcelas e gestão de devedores.

## Principais Recursos (v2.0)

- **Stack Modernizada (Pronta para Vercel)**: Next.js 16, React 19, Ant Design 6, Redux Toolkit 2, Styled Components 6 e `@supabase/supabase-js` v2.
- **Sincronização Multi-Dispositivo sem Perda de Dados**:
  - IDs únicos gerados com `crypto.randomUUID()` (eliminando colisões de IDs sequenciais entre dispositivos offline/desatualizados).
  - Atualizações atômicas por campo (`PATCH`) e deep-merge de mapas mensais JSONB buscando o estado mais recente no Supabase antes de gravar.
  - Sincronização silenciosa via **Supabase Realtime** (`postgres_changes`) e ao retomar o foco/visibilidade da aba (`visibilitychange`, `focus`, `online`).
- **Navegação por Todos os Meses (`YYYY-MM`)**:
  - Navegue livremente por qualquer mês passado, atual ou futuro com projeção automática em cascata de saldo previsto, parcelas ativas e dinheiro guardado — mantendo 100% de retrocompatibilidade com registros antigos dos usuários em produção.
- **Faturas Detalhadas de Cartão de Crédito e Projeção de Parcelas**:
  - Cadastro de compras à vista, parceladas (`X/N`) e assinaturas recorrentes mensais.
  - Gráfico/visão de projeção futura mostrando exatamente como a fatura evoluirá à medida que os parcelamentos terminam.
- **Importação Inteligente de Faturas com IA (`gpt-6-luna`)**:
  - Leitura automática de faturas em **PDF**, **Imagens (PNG/JPG/WEBP)** ou **CSV/OFX/TXT** via OpenAI Structured Outputs (`gpt-6-luna` por padrão).
  - Identifica emissor, vencimento, compras à vista, parcelamentos em andamento (calculando retroativamente o `start_month` para projetar as parcelas restantes nos próximos meses), assinaturas e estornos.
  - Privacidade total: o arquivo é processado apenas em memória e descartado imediatamente após a extração.
- **Exportação Mensal de Débitos por Devedor**:
  - Geração de resumo formatado para **WhatsApp** (copiar ou enviar direto via `wa.me`), **Imagem PNG (2x Retina)** e **PDF A4** com detalhamento de parcelas, status pago/pendente e totais.

---

## Variáveis de Ambiente

Copie `.env.example` para `.env.local` (e configure as mesmas chaves no painel da **Vercel** em *Project Settings → Environment Variables*):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key_publica
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-6-luna
```

---

## Migração Segura do Banco de Dados (Supabase)

O projeto possui fallback automático em tempo de execução para continuar funcionando mesmo antes da migração, mas para habilitar a persistência completa de múltiplos meses e compras detalhadas de cartão no banco:

1. Acesse o painel do **Supabase** → **SQL Editor**.
2. Abra o arquivo [`supabase/migrations/20261101_modernize_cadernetadg.sql`](./supabase/migrations/20261101_modernize_cadernetadg.sql), copie todo o conteúdo e clique em **Run**.

> O script é **100% aditivo e idempotente (`IF NOT EXISTS`)**: nenhuma tabela ou coluna existente é removida ou sobrescrita, preservando integralmente os dados dos usuários ativos.

---

## Comandos de Desenvolvimento

```bash
# Instalar dependências
npm install

# Rodar servidor de desenvolvimento
npm run dev

# Executar suíte de testes automatizados (Vitest)
npm test

# Verificar lint (ESLint 9)
npm run lint

# Gerar build de produção (Next.js 16)
npm run build
```