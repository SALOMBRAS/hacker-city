-- ============================================================================
-- HACKER CITY WEB — MASTER PRODUCTION CONSOLIDATION MIGRATION
-- Unifica colunas de Laboratório de Vírus (60 Blocos / 54 Conjuntos / Nv.1..10),
-- Operações CFTV/DVR, Pausa de Contas (Limite 3 Meses às 12:00), Índices, RLS
-- e RPC Segura Anti-Cheat sync_account_snapshot_secure + Leaderboard de Vírus.
-- ============================================================================

-- 1. Garantir tabela central de Cloud Saves MMO & adicionar colunas de telemetria
CREATE TABLE IF NOT EXISTS public.player_cloud_saves (
  operator_key TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  hacker_tag TEXT NOT NULL,
  public_ip TEXT,
  specialty TEXT DEFAULT 'exploiter',
  reputation INT NOT NULL DEFAULT 100,
  heat_level INT NOT NULL DEFAULT 1,
  wallet_balance NUMERIC(14,2) NOT NULL DEFAULT 500.00,
  best_soft_ver NUMERIC(5,1) NOT NULL DEFAULT 1.0,
  ddos_gbps NUMERIC(8,2) NOT NULL DEFAULT 0.00,
  firewall_ver NUMERIC(5,1) NOT NULL DEFAULT 1.0,
  hasher_ver NUMERIC(5,1) NOT NULL DEFAULT 1.0,
  antivirus_ver NUMERIC(5,1) NOT NULL DEFAULT 0.0,
  cpu_mhz INT NOT NULL DEFAULT 800,
  net_mbps INT NOT NULL DEFAULT 1,
  hdd_total_mb INT NOT NULL DEFAULT 350,
  ram_total_mb INT NOT NULL DEFAULT 256,
  hardware_health_pct INT NOT NULL DEFAULT 100,
  clan_tag TEXT,
  custom_web_page TEXT DEFAULT '',
  public_syslog JSONB NOT NULL DEFAULT '[]'::jsonb,
  save_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  cheat_strikes INT NOT NULL DEFAULT 0,
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.player_cloud_saves
  ADD COLUMN IF NOT EXISTS virus_lab_level INT NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS discovered_sets_count INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cctv_ops_count INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS billing_paused BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_player_cloud_saves_ip ON public.player_cloud_saves(public_ip);
CREATE INDEX IF NOT EXISTS idx_player_cloud_saves_rep ON public.player_cloud_saves(reputation DESC);
CREATE INDEX IF NOT EXISTS idx_player_cloud_saves_vlab ON public.player_cloud_saves(virus_lab_level DESC, discovered_sets_count DESC);

ALTER TABLE public.player_cloud_saves ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'player_cloud_saves' AND policyname = 'Public read MMO directory'
  ) THEN
    CREATE POLICY "Public read MMO directory"
      ON public.player_cloud_saves FOR SELECT
      USING (true);
  END IF;
END $$;

-- 2. RPC Anti-Cheat Atualizada (extrai estado do Laboratório de Vírus, CFTV e Pausa de Contas direto de p_save_payload)
CREATE OR REPLACE FUNCTION public.sync_account_snapshot_secure(
  p_operator_key TEXT,
  p_hacker_tag TEXT,
  p_specialty TEXT,
  p_wallet_balance NUMERIC,
  p_reputation INT,
  p_heat_level INT,
  p_public_ip TEXT,
  p_best_soft_ver NUMERIC,
  p_ddos_gbps NUMERIC,
  p_firewall_ver NUMERIC,
  p_hasher_ver NUMERIC,
  p_antivirus_ver NUMERIC,
  p_cpu_mhz INT,
  p_net_mbps INT,
  p_hdd_total_mb INT,
  p_ram_total_mb INT,
  p_hardware_health_pct INT,
  p_clan_tag TEXT,
  p_custom_web_page TEXT,
  p_public_syslog JSONB,
  p_save_payload JSONB
) RETURNS JSONB AS $$
DECLARE
  v_prev public.player_cloud_saves%ROWTYPE;
  v_elapsed_sec NUMERIC;
  v_max_allowed_bal NUMERIC(14,2);
  v_max_allowed_rep INT;
  v_safe_bal NUMERIC(14,2);
  v_safe_rep INT;
  v_safe_heat INT;
  v_safe_health INT;
  v_vlab_level INT;
  v_disc_sets INT;
  v_cctv_ops INT;
  v_billing_paused BOOLEAN;
  v_cheat_detected BOOLEAN := false;
  v_strikes INT := 0;
BEGIN
  IF p_operator_key IS NULL OR length(trim(p_operator_key)) < 4 THEN
    RETURN jsonb_build_object('success', false, 'code', 'INVALID_KEY');
  END IF;

  SELECT * INTO v_prev FROM public.player_cloud_saves WHERE operator_key = p_operator_key FOR UPDATE;

  v_safe_heat := GREATEST(1, LEAST(5, COALESCE(p_heat_level, 1)));
  v_safe_health := GREATEST(15, LEAST(100, COALESCE(p_hardware_health_pct, 100)));

  -- Extração segura da telemetria de Laboratório de Vírus, CFTV e Contas dentro do JSONB
  v_vlab_level := GREATEST(1, LEAST(10, COALESCE((p_save_payload #>> '{virusLabState,level}')::INT, 1)));
  v_disc_sets := GREATEST(0, LEAST(54, COALESCE(jsonb_array_length(COALESCE(p_save_payload #> '{virusLabState,discoveredSets}', '[]'::jsonb)), 0)));
  v_cctv_ops := GREATEST(0, COALESCE(jsonb_array_length(COALESCE(p_save_payload #> '{cctvState,capturedClips}', '[]'::jsonb)), 0));
  v_billing_paused := COALESCE((p_save_payload #>> '{quitineteBilling,cycle,pausedUntilLogin}')::BOOLEAN, false);

  IF FOUND THEN
    v_elapsed_sec := GREATEST(4, EXTRACT(EPOCH FROM (now() - v_prev.last_seen_at)));
    v_max_allowed_bal := v_prev.wallet_balance + 25000 + (v_elapsed_sec * 450);
    v_max_allowed_rep := v_prev.reputation + 1500 + FLOOR(v_elapsed_sec * 35)::INT;
    v_strikes := v_prev.cheat_strikes;

    IF COALESCE(p_wallet_balance, 0) > v_max_allowed_bal OR COALESCE(p_reputation, 0) > v_max_allowed_rep THEN
      v_cheat_detected := true;
      v_strikes := v_strikes + 1;
      v_safe_bal := v_prev.wallet_balance;
      v_safe_rep := v_prev.reputation;
    ELSE
      v_safe_bal := GREATEST(0, COALESCE(p_wallet_balance, v_prev.wallet_balance));
      v_safe_rep := GREATEST(0, COALESCE(p_reputation, v_prev.reputation));
    END IF;
  ELSE
    IF COALESCE(p_wallet_balance, 500) > 30000 OR COALESCE(p_reputation, 100) > 5000 THEN
      v_cheat_detected := true;
      v_strikes := 1;
      v_safe_bal := 500.00;
      v_safe_rep := 100;
    ELSE
      v_safe_bal := GREATEST(0, COALESCE(p_wallet_balance, 500.00));
      v_safe_rep := GREATEST(0, COALESCE(p_reputation, 100));
    END IF;
  END IF;

  IF auth.uid() IS NOT NULL THEN
    BEGIN
      UPDATE public.wallets SET balance = v_safe_bal WHERE user_id = auth.uid();
      UPDATE public.profiles SET reputation = v_safe_rep, heat_level = v_safe_heat, updated_at = now() WHERE id = auth.uid();
    EXCEPTION WHEN undefined_table THEN
      NULL;
    END;
  END IF;

  INSERT INTO public.player_cloud_saves (
    operator_key, user_id, hacker_tag, public_ip, specialty, reputation, heat_level, wallet_balance,
    best_soft_ver, ddos_gbps, firewall_ver, hasher_ver, antivirus_ver,
    cpu_mhz, net_mbps, hdd_total_mb, ram_total_mb, hardware_health_pct,
    virus_lab_level, discovered_sets_count, cctv_ops_count, billing_paused,
    clan_tag, custom_web_page, public_syslog, save_payload, cheat_strikes, last_seen_at, updated_at
  ) VALUES (
    p_operator_key, auth.uid(), COALESCE(p_hacker_tag, 'Operador'), p_public_ip, COALESCE(p_specialty, 'exploiter'),
    v_safe_rep, v_safe_heat, v_safe_bal,
    LEAST(10.0, GREATEST(1.0, COALESCE(p_best_soft_ver, 1.0))),
    LEAST(500.0, GREATEST(0.0, COALESCE(p_ddos_gbps, 0.0))),
    LEAST(10.0, GREATEST(0.0, COALESCE(p_firewall_ver, 1.0))),
    LEAST(10.0, GREATEST(0.0, COALESCE(p_hasher_ver, 1.0))),
    LEAST(10.0, GREATEST(0.0, COALESCE(p_antivirus_ver, 0.0))),
    COALESCE(p_cpu_mhz, 800), COALESCE(p_net_mbps, 1), COALESCE(p_hdd_total_mb, 350), COALESCE(p_ram_total_mb, 256),
    v_safe_health, v_vlab_level, v_disc_sets, v_cctv_ops, v_billing_paused,
    p_clan_tag, left(COALESCE(p_custom_web_page, ''), 240),
    COALESCE(p_public_syslog, '[]'::jsonb), COALESCE(p_save_payload, '{}'::jsonb),
    v_strikes, now(), now()
  )
  ON CONFLICT (operator_key) DO UPDATE SET
    public_ip = EXCLUDED.public_ip,
    reputation = EXCLUDED.reputation,
    heat_level = EXCLUDED.heat_level,
    wallet_balance = EXCLUDED.wallet_balance,
    best_soft_ver = EXCLUDED.best_soft_ver,
    ddos_gbps = EXCLUDED.ddos_gbps,
    firewall_ver = EXCLUDED.firewall_ver,
    hasher_ver = EXCLUDED.hasher_ver,
    antivirus_ver = EXCLUDED.antivirus_ver,
    cpu_mhz = EXCLUDED.cpu_mhz,
    net_mbps = EXCLUDED.net_mbps,
    hdd_total_mb = EXCLUDED.hdd_total_mb,
    ram_total_mb = EXCLUDED.ram_total_mb,
    hardware_health_pct = EXCLUDED.hardware_health_pct,
    virus_lab_level = EXCLUDED.virus_lab_level,
    discovered_sets_count = EXCLUDED.discovered_sets_count,
    cctv_ops_count = EXCLUDED.cctv_ops_count,
    billing_paused = EXCLUDED.billing_paused,
    clan_tag = EXCLUDED.clan_tag,
    custom_web_page = EXCLUDED.custom_web_page,
    public_syslog = EXCLUDED.public_syslog,
    save_payload = EXCLUDED.save_payload,
    cheat_strikes = EXCLUDED.cheat_strikes,
    last_seen_at = now(),
    updated_at = now();

  RETURN jsonb_build_object(
    'success', true,
    'cheat_blocked', v_cheat_detected,
    'synced_balance', v_safe_bal,
    'synced_rep', v_safe_rep,
    'hardware_health_pct', v_safe_health,
    'virus_lab_level', v_vlab_level,
    'discovered_sets_count', v_disc_sets
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.sync_account_snapshot_secure TO anon, authenticated;

-- 3. RPC Pública de Ranking de Engenheiros de Vírus (Top Operadores por Nível de Lab & Conjuntos Descobertos)
CREATE OR REPLACE FUNCTION public.get_virus_lab_leaderboard(p_limit INT DEFAULT 25)
RETURNS TABLE (
  hacker_tag TEXT,
  clan_tag TEXT,
  virus_lab_level INT,
  discovered_sets_count INT,
  best_soft_ver NUMERIC,
  reputation INT,
  last_seen_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.hacker_tag,
    s.clan_tag,
    s.virus_lab_level,
    s.discovered_sets_count,
    s.best_soft_ver,
    s.reputation,
    s.last_seen_at
  FROM public.player_cloud_saves s
  ORDER BY s.virus_lab_level DESC, s.discovered_sets_count DESC, s.best_soft_ver DESC, s.reputation DESC
  LIMIT GREATEST(1, LEAST(100, COALESCE(p_limit, 25)));
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.get_virus_lab_leaderboard TO anon, authenticated;

-- 4. Garantir tabela na publicação Realtime idempotentemente
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'player_cloud_saves'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.player_cloud_saves;
    END IF;
  END IF;
END $$;
