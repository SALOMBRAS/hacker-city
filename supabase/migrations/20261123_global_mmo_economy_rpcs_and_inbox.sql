-- =============================================================================
-- HACKER CITY WEB — MIGRATION: GLOBAL MMO SHARED ECONOMY, INBOX & CIRCUIT BREAKER
-- Created: 2026-11-23
-- =============================================================================

-- 1. Caixa de Recebimentos Assíncrona (Impede 100% sobrescrita de JSON entre jogadores!)
CREATE TABLE IF NOT EXISTS public.hc_wallet_inbox (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  sender_tag TEXT NOT NULL DEFAULT 'Sistema MMO',
  kind TEXT NOT NULL CHECK (kind IN ('LAUNDER_COMMISSION', 'AUCTION_OUTBID_REFUND', 'P2P_VIRUS_SALE', 'ESCROW_REFUND')),
  amount_clean NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (amount_clean >= 0),
  amount_dirty NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (amount_dirty >= 0),
  note TEXT NOT NULL,
  claimed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hc_wallet_inbox_recipient ON public.hc_wallet_inbox(recipient_id, claimed);

-- 2. Chave de Idempotência Contra Clique Duplo / Lag (client_tx_id)
CREATE TABLE IF NOT EXISTS public.hc_processed_tx_ids (
  tx_id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Trava Diária Anti-Conta-Fake (Máx. 3 lavagens/dia e 2 contratos/dia entre a mesma dupla!)
CREATE TABLE IF NOT EXISTS public.hc_pair_daily_limits (
  day_key DATE NOT NULL DEFAULT CURRENT_DATE,
  actor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  counterparty_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('launder_batch', 'escrow_contract')),
  hits SMALLINT NOT NULL DEFAULT 1,
  PRIMARY KEY (day_key, actor_id, counterparty_id, kind)
);

-- 4. Bolsa de Empresas Global Unificada (8 Ações c/ Piso 30%, Teto 220% e Circuit Breaker 10m!)
CREATE TABLE IF NOT EXISTS public.global_cyberstock_tickers (
  symbol TEXT PRIMARY KEY,
  company_name TEXT NOT NULL,
  host_ip TEXT NOT NULL,
  base_price NUMERIC(12, 2) NOT NULL,
  price NUMERIC(12, 2) NOT NULL,
  integrity NUMERIC(6, 1) NOT NULL DEFAULT 100.0,
  history_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  recent_drops_count SMALLINT NOT NULL DEFAULT 0,
  last_drop_window_at TIMESTAMPTZ,
  circuit_breaker_until TIMESTAMPTZ,
  last_actor_tag TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.global_cyberstock_tickers (symbol, company_name, host_ip, base_price, price, integrity, history_json)
VALUES
  ('FARO', 'Farofa Systems B2B',    '203.17.88.40',  42.00,  42.00, 100.0, '[42.00, 41.60, 42.30, 42.00]'::jsonb),
  ('MRDN', 'Meridian BioLabs',      '194.88.14.202', 68.50,  68.50, 100.0, '[68.50, 67.90, 69.10, 68.50]'::jsonb),
  ('AEGS', 'Aegis Security Corp',   '172.66.40.18',  54.00,  54.00, 100.0, '[54.00, 53.50, 54.40, 54.00]'::jsonb),
  ('CRVO', 'Corvo Cinza Logística', '58.40.12.9',    37.20,  37.20, 100.0, '[37.20, 36.90, 37.50, 37.20]'::jsonb),
  ('KRNO', 'KronoTech Sistemas',    '189.40.7.12',   92.00,  92.00, 100.0, '[92.00, 91.20, 92.80, 92.00]'::jsonb),
  ('OMNI', 'OmniDyne Defense',      '192.99.44.80', 148.00, 148.00, 100.0, '[148.00, 146.50, 149.20, 148.00]'::jsonb),
  ('HEBC', 'HEBC Clearing Bank',    '77.3.10.44',   116.00, 116.00, 100.0, '[116.00, 115.10, 116.90, 116.00]'::jsonb),
  ('EVIL', 'EvilCorp Conglomerate', '209.141.55.10',215.00, 215.00, 100.0, '[215.00, 213.40, 216.80, 215.00]'::jsonb)
ON CONFLICT (symbol) DO NOTHING;

-- 5. Suporte a Prorrogação Anti-Sniping (+30s, máx 5x) nos Leilões de 2h
ALTER TABLE public.hc_seized_server_auctions
  ADD COLUMN IF NOT EXISTS snipe_extensions SMALLINT NOT NULL DEFAULT 0;

-- 6. Row-Level Security (RLS)
ALTER TABLE public.hc_wallet_inbox ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hc_processed_tx_ids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hc_pair_daily_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_cyberstock_tickers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Own wallet inbox read" ON public.hc_wallet_inbox;
CREATE POLICY "Own wallet inbox read" ON public.hc_wallet_inbox
  FOR SELECT USING (auth.uid() = recipient_id);

DROP POLICY IF EXISTS "Public read global cyberstock" ON public.global_cyberstock_tickers;
CREATE POLICY "Public read global cyberstock" ON public.global_cyberstock_tickers
  FOR SELECT USING (true);
