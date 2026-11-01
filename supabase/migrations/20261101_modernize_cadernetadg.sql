-- ============================================================================
-- Caderneta Digital v2.0 - Migração Segura e Retrocompatível (Zero Perda de Dados)
-- Pode ser executada no SQL Editor do Supabase com segurança (idempotente).
-- Nenhuma coluna existente é removida ou renomeada, preservando 100% dos dados
-- dos usuários ativos.
-- ============================================================================

BEGIN;

-- 1. Função automática para manter updated_at atualizado em todas as edições
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Colunas aditivas para suporte a todos os meses e controle de concorrência
ALTER TABLE public.registered_users
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.current_balance
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.kept_balance
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.fixed_receipts
  ADD COLUMN IF NOT EXISTS monthly_status JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.fixed_debts
  ADD COLUMN IF NOT EXISTS monthly_status JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.extra_debts
  ADD COLUMN IF NOT EXISTS start_month VARCHAR(7),
  ADD COLUMN IF NOT EXISTS monthly_status JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.debtors
  ADD COLUMN IF NOT EXISTS phone VARCHAR(32),
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.debts
  ADD COLUMN IF NOT EXISTS start_month VARCHAR(7),
  ADD COLUMN IF NOT EXISTS monthly_status JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.extra_receipts
  ADD COLUMN IF NOT EXISTS target_month VARCHAR(7),
  ADD COLUMN IF NOT EXISTS received BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.credit_cards
  ADD COLUMN IF NOT EXISTS closing_day INTEGER,
  ADD COLUMN IF NOT EXISTS due_day INTEGER,
  ADD COLUMN IF NOT EXISTS card_limit DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS color VARCHAR(24),
  ADD COLUMN IF NOT EXISTS monthly_invoices JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 3. Nova tabela para compras detalhadas e parceladas nos cartões de crédito
CREATE TABLE IF NOT EXISTS public.credit_card_purchases (
  id VARCHAR PRIMARY KEY,
  user_uuid UUID NOT NULL,
  card_id VARCHAR NOT NULL REFERENCES public.credit_cards(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL DEFAULT '',
  category VARCHAR(64),
  purchase_date VARCHAR(20),
  value DOUBLE PRECISION NOT NULL DEFAULT 0,
  total_value DOUBLE PRECISION,
  installments INTEGER NOT NULL DEFAULT 1,
  start_month VARCHAR(7) NOT NULL,
  is_recurring BOOLEAN NOT NULL DEFAULT FALSE,
  end_month VARCHAR(7),
  disabled_months JSONB NOT NULL DEFAULT '{}'::jsonb,
  source VARCHAR(32) NOT NULL DEFAULT 'manual',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cc_purchases_user_uuid
  ON public.credit_card_purchases(user_uuid);

CREATE INDEX IF NOT EXISTS idx_cc_purchases_card_id
  ON public.credit_card_purchases(card_id);

-- 4. Row Level Security (RLS) na nova tabela credit_card_purchases
ALTER TABLE public.credit_card_purchases ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'credit_card_purchases'
      AND policyname = 'Users can select own credit_card_purchases'
  ) THEN
    CREATE POLICY "Users can select own credit_card_purchases"
      ON public.credit_card_purchases FOR SELECT
      USING (auth.uid() = user_uuid);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'credit_card_purchases'
      AND policyname = 'Users can insert own credit_card_purchases'
  ) THEN
    CREATE POLICY "Users can insert own credit_card_purchases"
      ON public.credit_card_purchases FOR INSERT
      WITH CHECK (auth.uid() = user_uuid);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'credit_card_purchases'
      AND policyname = 'Users can update own credit_card_purchases'
  ) THEN
    CREATE POLICY "Users can update own credit_card_purchases"
      ON public.credit_card_purchases FOR UPDATE
      USING (auth.uid() = user_uuid)
      WITH CHECK (auth.uid() = user_uuid);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'credit_card_purchases'
      AND policyname = 'Users can delete own credit_card_purchases'
  ) THEN
    CREATE POLICY "Users can delete own credit_card_purchases"
      ON public.credit_card_purchases FOR DELETE
      USING (auth.uid() = user_uuid);
  END IF;
END $$;

-- 5. Triggers de updated_at
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'registered_users',
    'current_balance',
    'kept_balance',
    'fixed_receipts',
    'fixed_debts',
    'extra_debts',
    'debtors',
    'debts',
    'extra_receipts',
    'credit_cards',
    'credit_card_purchases'
  ]
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_%I_updated_at ON public.%I;', t, t);
    EXECUTE format(
      'CREATE TRIGGER trg_%I_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();',
      t, t
    );
  END LOOP;
END $$;

-- 6. Habilita Realtime nas tabelas financeiras para sincronização instantânea entre dispositivos
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'current_balance',
    'kept_balance',
    'fixed_receipts',
    'fixed_debts',
    'extra_debts',
    'debtors',
    'debts',
    'extra_receipts',
    'credit_cards',
    'credit_card_purchases'
  ]
  LOOP
    BEGIN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I;', t);
    EXCEPTION
      WHEN duplicate_object THEN NULL;
      WHEN undefined_object THEN NULL;
    END;
  END LOOP;
END $$;

COMMIT;
