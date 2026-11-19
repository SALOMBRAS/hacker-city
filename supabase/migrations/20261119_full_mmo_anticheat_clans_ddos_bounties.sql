-- ============================================================================
-- HACKER CITY // MIGRATION COMPLETA MMO ONLINE (ANTI-CHEAT + PVP OFFLINE +
-- CONTA 1-CLIQUE GLOBAL + CLÃS GLOBAIS + DANO DDOS + RECOMPENSAS POR NICK)
-- Idempotente: pode ser executada com segurança em qualquer estado do banco.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. DIRETÓRIO PÚBLICO & CLOUD SAVE GLOBAL (SUPORTA AUTH E OPERADORES 1-CLIQUE)
CREATE TABLE IF NOT EXISTS public.player_cloud_saves (
  operator_key TEXT PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  hacker_tag TEXT NOT NULL,
  public_ip TEXT UNIQUE NOT NULL,
  specialty TEXT NOT NULL DEFAULT 'exploiter',
  reputation INT NOT NULL DEFAULT 100 CHECK (reputation >= 0),
  heat_level INT NOT NULL DEFAULT 1 CHECK (heat_level >= 1 AND heat_level <= 5),
  wallet_balance NUMERIC(14,2) NOT NULL DEFAULT 500.00 CHECK (wallet_balance >= 0),
  best_soft_ver NUMERIC(5,1) NOT NULL DEFAULT 1.0,
  ddos_gbps NUMERIC(8,2) NOT NULL DEFAULT 0.0,
  firewall_ver NUMERIC(5,1) NOT NULL DEFAULT 1.0,
  hasher_ver NUMERIC(5,1) NOT NULL DEFAULT 1.0,
  antivirus_ver NUMERIC(5,1) NOT NULL DEFAULT 1.0,
  cpu_mhz INT NOT NULL DEFAULT 800,
  net_mbps INT NOT NULL DEFAULT 1,
  hdd_total_mb INT NOT NULL DEFAULT 350,
  ram_total_mb INT NOT NULL DEFAULT 256,
  hardware_health_pct INT NOT NULL DEFAULT 100 CHECK (hardware_health_pct >= 15 AND hardware_health_pct <= 100),
  clan_tag TEXT,
  custom_web_page TEXT,
  public_syslog JSONB NOT NULL DEFAULT '[]'::jsonb,
  save_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  cheat_strikes INT NOT NULL DEFAULT 0,
  last_seen_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_cloud_saves_tag ON public.player_cloud_saves(lower(hacker_tag));
CREATE INDEX IF NOT EXISTS idx_cloud_saves_ip ON public.player_cloud_saves(public_ip);

ALTER TABLE public.player_cloud_saves ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Diretorio publico de jogadores online e offline" ON public.player_cloud_saves;
CREATE POLICY "Diretorio publico de jogadores online e offline"
  ON public.player_cloud_saves FOR SELECT
  TO authenticated, anon
  USING (true);

-- Escrita bloqueada via tabela direta: somente pela RPC Anti-Cheat sync_account_snapshot_secure!
REVOKE INSERT, UPDATE, DELETE ON public.player_cloud_saves FROM anon, authenticated;
GRANT SELECT ON public.player_cloud_saves TO anon, authenticated;


-- 2. FILA PERSISTENTE DE EVENTOS PVP ASSÍNCRONOS (JOGADOR OFFLINE & ONLINE)
CREATE TABLE IF NOT EXISTS public.pvp_network_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sender_key TEXT NOT NULL,
  sender_tag TEXT NOT NULL,
  sender_visible_ip TEXT NOT NULL,
  target_operator_key TEXT,
  target_tag TEXT,
  target_ip TEXT,
  event_kind TEXT NOT NULL CHECK (event_kind IN (
    'PVP_INTRUSION',
    'PVP_VIRUS_PLANT',
    'PVP_VIRUS_HIDE',
    'PVP_AV_PURGED',
    'PVP_WIPE_LOG',
    'PVP_EDIT_LOG',
    'PVP_DRAIN_WALLET',
    'PVP_DDOS_DAMAGE',
    'P2P_MAIL',
    'CLAN_WAR_STRIKE',
    'CLAN_CHAT_MSG',
    'BOUNTY_CLAIMED'
  )),
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  consumed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_pvp_events_target_ip_pending ON public.pvp_network_events(target_ip, consumed);
CREATE INDEX IF NOT EXISTS idx_pvp_events_target_tag_pending ON public.pvp_network_events(lower(target_tag), consumed);

ALTER TABLE public.pvp_network_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Leitura de eventos PvP pendentes" ON public.pvp_network_events;
CREATE POLICY "Leitura de eventos PvP pendentes"
  ON public.pvp_network_events FOR SELECT
  TO authenticated, anon
  USING (true);

DROP POLICY IF EXISTS "Envio de eventos PvP" ON public.pvp_network_events;
CREATE POLICY "Envio de eventos PvP"
  ON public.pvp_network_events FOR INSERT
  TO authenticated, anon
  WITH CHECK (length(sender_tag) >= 2 AND length(event_kind) >= 4);

DROP POLICY IF EXISTS "Confirmacao de leitura de eventos PvP" ON public.pvp_network_events;
CREATE POLICY "Confirmacao de leitura de eventos PvP"
  ON public.pvp_network_events FOR UPDATE
  TO authenticated, anon
  USING (true)
  WITH CHECK (consumed = true);

GRANT SELECT, INSERT, UPDATE ON public.pvp_network_events TO anon, authenticated;


-- 3. CLÃS GLOBAIS COMPARTILHADOS NA NUVEM + CHAT PRIVADO DO CLÃ
CREATE TABLE IF NOT EXISTS public.global_clans (
  id TEXT PRIMARY KEY,
  tag TEXT UNIQUE NOT NULL CHECK (char_length(tag) BETWEEN 2 AND 5),
  name TEXT NOT NULL,
  leader_tag TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  server_ip TEXT UNIQUE NOT NULL,
  treasury NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (treasury >= 0),
  power_score INT NOT NULL DEFAULT 500,
  wars_won INT NOT NULL DEFAULT 0,
  members JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.clan_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  clan_tag TEXT NOT NULL,
  sender_tag TEXT NOT NULL,
  message TEXT NOT NULL CHECK (char_length(message) BETWEEN 1 AND 280),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_clan_messages_tag_time ON public.clan_messages(clan_tag, created_at DESC);

ALTER TABLE public.global_clans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clan_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Clans visiveis para todos" ON public.global_clans;
CREATE POLICY "Clans visiveis para todos" ON public.global_clans FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Criar e atualizar clans" ON public.global_clans;
CREATE POLICY "Criar e atualizar clans" ON public.global_clans FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Mensagens do cla" ON public.clan_messages;
CREATE POLICY "Mensagens do cla" ON public.clan_messages FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

GRANT SELECT, INSERT, UPDATE ON public.global_clans TO anon, authenticated;
GRANT SELECT, INSERT ON public.clan_messages TO anon, authenticated;


-- 4. QUADRO DE RECOMPENSAS ENTRE JOGADORES (VINGANÇA POR NICK / BOUNTY P2P)
CREATE TABLE IF NOT EXISTS public.player_bounties (
  id TEXT PRIMARY KEY,
  poster_key TEXT NOT NULL,
  poster_tag TEXT NOT NULL,
  target_tag TEXT NOT NULL,
  reason TEXT NOT NULL DEFAULT 'Deixou farpa na minha log e apagou o IP!',
  reward_cash NUMERIC(14,2) NOT NULL CHECK (reward_cash >= 300 AND reward_cash <= 5000000),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'claimed', 'cancelled')),
  claimed_by_tag TEXT,
  claimed_target_ip TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  claimed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_player_bounties_status ON public.player_bounties(status, created_at DESC);

ALTER TABLE public.player_bounties ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Quadro publico de recompensas P2P" ON public.player_bounties;
CREATE POLICY "Quadro publico de recompensas P2P" ON public.player_bounties FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

GRANT SELECT, INSERT, UPDATE ON public.player_bounties TO anon, authenticated;


-- 5. STORED PROCEDURE ANTI-CHEAT (BLOQUEIA SALTOS ILEGAIS DE F12 NO SERVIDOR!)
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
  v_cheat_detected BOOLEAN := false;
  v_strikes INT := 0;
BEGIN
  IF p_operator_key IS NULL OR length(trim(p_operator_key)) < 4 THEN
    RETURN jsonb_build_object('success', false, 'code', 'INVALID_KEY');
  END IF;

  SELECT * INTO v_prev FROM public.player_cloud_saves WHERE operator_key = p_operator_key FOR UPDATE;

  v_safe_heat := GREATEST(1, LEAST(5, COALESCE(p_heat_level, 1)));
  v_safe_health := GREATEST(15, LEAST(100, COALESCE(p_hardware_health_pct, 100)));

  IF FOUND THEN
    v_elapsed_sec := GREATEST(4, EXTRACT(EPOCH FROM (now() - v_prev.last_seen_at)));
    -- Teto generoso para missões/bounties reais, mas que barra 100% edições F12 de milhões!
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
    -- Primeiro registro da conta: limita saldo inicial máximo plausível (evita criar já com $ 99.999.999)
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

  -- Se o usuário estiver autenticado via Supabase Auth, sincroniza também profiles e wallets!
  IF auth.uid() IS NOT NULL THEN
    UPDATE public.wallets SET balance = v_safe_bal WHERE user_id = auth.uid();
    UPDATE public.profiles SET reputation = v_safe_rep, heat_level = v_safe_heat, updated_at = now() WHERE id = auth.uid();
  END IF;

  INSERT INTO public.player_cloud_saves (
    operator_key, user_id, hacker_tag, public_ip, specialty, reputation, heat_level, wallet_balance,
    best_soft_ver, ddos_gbps, firewall_ver, hasher_ver, antivirus_ver,
    cpu_mhz, net_mbps, hdd_total_mb, ram_total_mb, hardware_health_pct,
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
    v_safe_health, p_clan_tag, left(COALESCE(p_custom_web_page, ''), 240),
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
    'hardware_health_pct', v_safe_health
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.sync_account_snapshot_secure TO anon, authenticated;
