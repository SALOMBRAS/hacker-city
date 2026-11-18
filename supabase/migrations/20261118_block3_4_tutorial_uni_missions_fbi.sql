-- ========================================================
-- BLOCOS 3 & 4 MMO: TUTORIAL GUIADO, UNIVERSIDADE/CERTIFICAÇÕES,
-- QUADRO DE MISSÕES, SAFENET/FBI BOUNTIES & BOTS VIVOS AUTÔNOMOS
-- ========================================================

-- 1. Progresso de Tutorial & Certificações da Universidade por Operador
CREATE TABLE IF NOT EXISTS public.player_certifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  cert_id INT NOT NULL CHECK (cert_id >= 1 AND cert_id <= 5),
  completed_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, cert_id)
);

ALTER TABLE public.player_certifications ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'player_certifications' AND policyname = 'own_certs_all') THEN
    CREATE POLICY own_certs_all ON public.player_certifications
      FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tutorial_step INT NOT NULL DEFAULT 1;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tutorial_completed BOOLEAN NOT NULL DEFAULT false;

-- 2. Contratos e Histórico do Quadro de Missões
CREATE TABLE IF NOT EXISTS public.player_missions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  mission_code TEXT NOT NULL,
  mission_type TEXT NOT NULL, -- delete_file | steal_data | check_balance | drain_funds | ddos_takedown
  tier INT NOT NULL DEFAULT 1 CHECK (tier >= 1 AND tier <= 3),
  hirer_name TEXT NOT NULL,
  target_ip TEXT NOT NULL,
  target_hostname TEXT NOT NULL,
  reward_cash NUMERIC(14,2) NOT NULL DEFAULT 500,
  reward_sats BIGINT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'aborted')),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  completed_at TIMESTAMPTZ
);

ALTER TABLE public.player_missions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'player_missions' AND policyname = 'own_missions_all') THEN
    CREATE POLICY own_missions_all ON public.player_missions
      FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- 3. Rastreio Safenet & Lista Pública de Procurados do FBI (Bounties)
CREATE TABLE IF NOT EXISTS public.safenet_tracking (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  suspect_ip TEXT UNIQUE NOT NULL,
  suspect_handle TEXT NOT NULL,
  suspect_kind TEXT NOT NULL DEFAULT 'bot', -- player | bot
  reason TEXT NOT NULL,
  severity INT NOT NULL DEFAULT 1,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.fbi_wanted (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  suspect_ip TEXT UNIQUE NOT NULL,
  suspect_handle TEXT NOT NULL,
  suspect_kind TEXT NOT NULL DEFAULT 'bot', -- player | bot
  crime TEXT NOT NULL,
  bounty_cash NUMERIC(14,2) NOT NULL CHECK (bounty_cash >= 500),
  bounty_sats BIGINT NOT NULL DEFAULT 0,
  defense_gbps NUMERIC(8,2) NOT NULL DEFAULT 4.0,
  active BOOLEAN NOT NULL DEFAULT true,
  captured_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.safenet_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fbi_wanted ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'safenet_tracking' AND policyname = 'public_read_safenet') THEN
    CREATE POLICY public_read_safenet ON public.safenet_tracking FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'fbi_wanted' AND policyname = 'public_read_fbi') THEN
    CREATE POLICY public_read_fbi ON public.fbi_wanted FOR SELECT USING (true);
  END IF;
END $$;
