-- =============================================================================
-- Hacker City // Migration: 9 Approved Deep Ecosystem Mechanics
-- 1. Empresas de Lavagem de Dinheiro (3 Portes: $50K/$150K/$400K, Limites $5K/$15K/$50K,
--    Ciclo 15 min reais, Fila de 15 Vagas [3h] por $10.000 Limpos, Taxa >= 17% sem teto)
-- 2. Mercado Clandestino P2P de Licenças do Lab (24h/48h/72h DRM, Taxa 12%-20%, Piso/Teto)
-- 3. Temporadas Mensais de Ranking (30 dias) + Hall da Fama Imutável (Zero Reset!)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.laundering_companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  owner_tag text NOT NULL,
  company_name text NOT NULL CHECK (char_length(company_name) BETWEEN 3 AND 48),
  tier smallint NOT NULL DEFAULT 1 CHECK (tier IN (1, 2, 3)),
  max_batch_usd numeric(14,2) NOT NULL DEFAULT 5000.00,
  fee_pct numeric(5,2) NOT NULL DEFAULT 20.00 CHECK (fee_pct >= 17.00),
  total_laundered_usd numeric(16,2) NOT NULL DEFAULT 0,
  owner_profits_usd numeric(16,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (owner_id)
);

CREATE TABLE IF NOT EXISTS public.laundering_ad_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.laundering_companies(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  hour_bucket timestamptz NOT NULL,
  slot_index smallint NOT NULL CHECK (slot_index BETWEEN 1 AND 15),
  ad_fee_paid numeric(12,2) NOT NULL DEFAULT 10000.00,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_laundering_ad_bucket ON public.laundering_ad_queue(hour_bucket);

CREATE TABLE IF NOT EXISTS public.laundering_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  company_name text NOT NULL,
  gross_dirty_usd numeric(14,2) NOT NULL CHECK (gross_dirty_usd > 0),
  fee_pct numeric(5,2) NOT NULL CHECK (fee_pct >= 0),
  net_clean_usd numeric(14,2) NOT NULL,
  owner_cut_usd numeric(14,2) NOT NULL DEFAULT 0,
  started_at timestamptz NOT NULL DEFAULT now(),
  completes_at timestamptz NOT NULL DEFAULT (now() + interval '15 minutes'),
  claimed boolean NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS public.p2p_strain_licenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  seller_tag text NOT NULL,
  strain_name text NOT NULL,
  virus_family text NOT NULL CHECK (virus_family IN ('vminer', 'vspam', 'vwarez', 'vbank', 'vddos')),
  version_int smallint NOT NULL CHECK (version_int BETWEEN 6 AND 100),
  fit_grade text NOT NULL DEFAULT 'A',
  duration_hours smallint NOT NULL DEFAULT 48 CHECK (duration_hours IN (24, 48, 72)),
  price_clean_usd numeric(14,2) NOT NULL CHECK (price_clean_usd >= 300),
  burn_tax_pct numeric(5,2) NOT NULL DEFAULT 15.00,
  sold_to_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  sold_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.season_monthly_scores (
  season_key text NOT NULL, -- ex: '2026-11'
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  hacker_tag text NOT NULL,
  clan_tag text,
  season_points integer NOT NULL DEFAULT 0,
  division text NOT NULL DEFAULT 'Operador',
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (season_key, user_id)
);

CREATE TABLE IF NOT EXISTS public.season_hall_of_fame (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  season_key text NOT NULL,
  rank_pos smallint NOT NULL CHECK (rank_pos BETWEEN 1 AND 3),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  hacker_tag text NOT NULL,
  clan_tag text,
  final_points integer NOT NULL,
  archived_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (season_key, rank_pos)
);

ALTER TABLE public.laundering_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.laundering_ad_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.laundering_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.p2p_strain_licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.season_monthly_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.season_hall_of_fame ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read laundering companies" ON public.laundering_companies;
CREATE POLICY "Public read laundering companies" ON public.laundering_companies FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read ad queue" ON public.laundering_ad_queue;
CREATE POLICY "Public read ad queue" ON public.laundering_ad_queue FOR SELECT USING (true);

DROP POLICY IF EXISTS "Own laundering jobs read" ON public.laundering_jobs;
CREATE POLICY "Own laundering jobs read" ON public.laundering_jobs FOR SELECT USING (auth.uid() = client_id OR auth.uid() = company_owner_id);

DROP POLICY IF EXISTS "Public read open p2p licenses" ON public.p2p_strain_licenses;
CREATE POLICY "Public read open p2p licenses" ON public.p2p_strain_licenses FOR SELECT USING (sold_to_id IS NULL OR auth.uid() = seller_id OR auth.uid() = sold_to_id);

DROP POLICY IF EXISTS "Public read season scores" ON public.season_monthly_scores;
CREATE POLICY "Public read season scores" ON public.season_monthly_scores FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read hall of fame" ON public.season_hall_of_fame;
CREATE POLICY "Public read hall of fame" ON public.season_hall_of_fame FOR SELECT USING (true);
