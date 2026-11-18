-- ========================================================
-- BLOCO 2 MMO: SOFTWARES COM POTÊNCIAS (v1.0..v10.0), 5 TIPOS DE VÍRUS
-- & CARTEIRA / CÂMBIO BITCOIN (PRECISÃO EM SATOSHIS)
-- ========================================================

-- 1. Carteiras Bitcoin por Operador (armazenadas em satoshis inteiros: 1 BTC = 100.000.000 sats)
CREATE TABLE IF NOT EXISTS public.btc_wallets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  btc_address TEXT UNIQUE NOT NULL,
  private_key_hash TEXT NOT NULL,
  balance_sats BIGINT NOT NULL DEFAULT 500000 CHECK (balance_sats >= 0),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.btc_wallets ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'btc_wallets' AND policyname = 'own_btc_wallet_select') THEN
    CREATE POLICY own_btc_wallet_select ON public.btc_wallets
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

-- 2. Inventário de Softwares e Vírus do Operador (version_int: 10 = v1.0, 25 = v2.5, 50 = v5.0)
CREATE TABLE IF NOT EXISTS public.player_softwares (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  soft_key TEXT NOT NULL,
  soft_type TEXT NOT NULL,
  version_int INT NOT NULL DEFAULT 10 CHECK (version_int >= 10 AND version_int <= 200),
  installed BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, soft_key)
);

ALTER TABLE public.player_softwares ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'player_softwares' AND policyname = 'own_softwares_all') THEN
    CREATE POLICY own_softwares_all ON public.player_softwares
      FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- 3. Vírus Instalados em Máquinas Remotas (.vspam, .vwarez, .vminer, .vbank, .vddos)
CREATE TABLE IF NOT EXISTS public.installed_viruses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  installer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  target_ip TEXT NOT NULL,
  target_hostname TEXT NOT NULL,
  virus_key TEXT NOT NULL,
  version_int INT NOT NULL DEFAULT 10,
  target_tier INT NOT NULL DEFAULT 1,
  installed_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  last_collected_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(installer_id, target_ip, virus_key)
);

ALTER TABLE public.installed_viruses ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'installed_viruses' AND policyname = 'own_installed_viruses_all') THEN
    CREATE POLICY own_installed_viruses_all ON public.installed_viruses
      FOR ALL USING (auth.uid() = installer_id) WITH CHECK (auth.uid() = installer_id);
  END IF;
END $$;
