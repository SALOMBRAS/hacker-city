-- ============================================================================
-- HACKER CITY // MIGRATION UNIFICADA ONLINE: CLOUD SAVE, DIRETÓRIO PVP & RPC
-- Sincroniza 100% do estado da conta (F5/Multi-PC) + Eventos PvP em Tempo Real
-- ============================================================================

-- 1. Tabela de Cloud Save e Diretório Público de Operadores (IP, Defesas, Clã)
CREATE TABLE IF NOT EXISTS public.player_cloud_saves (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  hacker_tag TEXT NOT NULL,
  public_ip TEXT UNIQUE NOT NULL,
  specialty TEXT NOT NULL DEFAULT 'exploiter',
  reputation INT NOT NULL DEFAULT 100,
  heat_level INT NOT NULL DEFAULT 1,
  wallet_balance NUMERIC(14,2) NOT NULL DEFAULT 500.00 CHECK (wallet_balance >= 0),
  best_soft_ver NUMERIC(5,1) NOT NULL DEFAULT 1.0,
  ddos_gbps NUMERIC(8,2) NOT NULL DEFAULT 0.0,
  firewall_ver NUMERIC(5,1) NOT NULL DEFAULT 1.0,
  hasher_ver NUMERIC(5,1) NOT NULL DEFAULT 1.0,
  antivirus_ver NUMERIC(5,1) NOT NULL DEFAULT 1.0,
  cpu_mhz INT NOT NULL DEFAULT 800,
  net_mbps INT NOT NULL DEFAULT 1,
  clan_tag TEXT,
  save_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  last_seen_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.player_cloud_saves ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Qualquer operador autenticado consulta diretorio publico" ON public.player_cloud_saves;
CREATE POLICY "Qualquer operador autenticado consulta diretorio publico"
  ON public.player_cloud_saves FOR SELECT
  TO authenticated, anon
  USING (true);

DROP POLICY IF EXISTS "Dono grava seu proprio cloud save" ON public.player_cloud_saves;
CREATE POLICY "Dono grava seu proprio cloud save"
  ON public.player_cloud_saves FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Dono atualiza seu proprio cloud save" ON public.player_cloud_saves;
CREATE POLICY "Dono atualiza seu proprio cloud save"
  ON public.player_cloud_saves FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

GRANT SELECT ON public.player_cloud_saves TO authenticated, anon;
GRANT INSERT, UPDATE ON public.player_cloud_saves TO authenticated;

-- 2. Fila Persistente de Eventos PvP, Logs Remotos, Vírus Hostis & Mail P2P
CREATE TABLE IF NOT EXISTS public.pvp_network_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  sender_tag TEXT NOT NULL,
  sender_visible_ip TEXT NOT NULL,
  target_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_tag TEXT,
  target_ip TEXT,
  event_kind TEXT NOT NULL CHECK (event_kind IN ('PVP_INTRUSION', 'PVP_VIRUS_PLANT', 'PVP_WIPE_LOG', 'PVP_DRAIN_WALLET', 'P2P_MAIL', 'CLAN_WAR_STRIKE')),
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  consumed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_pvp_events_target_user ON public.pvp_network_events(target_user_id, consumed);
CREATE INDEX IF NOT EXISTS idx_pvp_events_target_ip ON public.pvp_network_events(target_ip, consumed);

ALTER TABLE public.pvp_network_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Operador envia evento PvP" ON public.pvp_network_events;
CREATE POLICY "Operador envia evento PvP"
  ON public.pvp_network_events FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);

DROP POLICY IF EXISTS "Destinatario le seus eventos PvP" ON public.pvp_network_events;
CREATE POLICY "Destinatario le seus eventos PvP"
  ON public.pvp_network_events FOR SELECT
  TO authenticated
  USING (auth.uid() = target_user_id OR auth.uid() = sender_id OR target_user_id IS NULL);

DROP POLICY IF EXISTS "Destinatario marca evento como processado" ON public.pvp_network_events;
CREATE POLICY "Destinatario marca evento como processado"
  ON public.pvp_network_events FOR UPDATE
  TO authenticated
  USING (auth.uid() = target_user_id);

GRANT SELECT, INSERT, UPDATE ON public.pvp_network_events TO authenticated;

-- 3. Stored Procedure Segura para Sincronizar Saldo, Reputação, Heat e Cloud Save
CREATE OR REPLACE FUNCTION public.sync_account_snapshot(
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
  p_clan_tag TEXT,
  p_save_payload JSONB
) RETURNS JSONB AS $$
DECLARE
  v_prof public.profiles%ROWTYPE;
  v_safe_bal NUMERIC(14,2);
  v_safe_rep INT;
  v_safe_heat INT;
BEGIN
  SELECT * INTO v_prof FROM public.profiles WHERE id = auth.uid() FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Sessão inválida.');
  END IF;

  v_safe_bal := GREATEST(0, LEAST(999999999, COALESCE(p_wallet_balance, 0)));
  v_safe_rep := GREATEST(0, LEAST(99999999, COALESCE(p_reputation, v_prof.reputation)));
  v_safe_heat := GREATEST(1, LEAST(5, COALESCE(p_heat_level, v_prof.heat_level)));

  UPDATE public.wallets
  SET balance = v_safe_bal
  WHERE user_id = auth.uid();

  UPDATE public.profiles
  SET reputation = v_safe_rep,
      heat_level = v_safe_heat,
      updated_at = now()
  WHERE id = auth.uid();

  INSERT INTO public.player_cloud_saves (
    user_id, hacker_tag, public_ip, specialty, reputation, heat_level, wallet_balance,
    best_soft_ver, ddos_gbps, firewall_ver, hasher_ver, antivirus_ver,
    cpu_mhz, net_mbps, clan_tag, save_payload, last_seen_at, updated_at
  ) VALUES (
    auth.uid(), v_prof.hacker_tag, p_public_ip, v_prof.specialty, v_safe_rep, v_safe_heat, v_safe_bal,
    COALESCE(p_best_soft_ver, 1.0), COALESCE(p_ddos_gbps, 0), COALESCE(p_firewall_ver, 1.0),
    COALESCE(p_hasher_ver, 1.0), COALESCE(p_antivirus_ver, 1.0), COALESCE(p_cpu_mhz, 800),
    COALESCE(p_net_mbps, 1), p_clan_tag, COALESCE(p_save_payload, '{}'::jsonb), now(), now()
  )
  ON CONFLICT (user_id) DO UPDATE SET
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
    clan_tag = EXCLUDED.clan_tag,
    save_payload = EXCLUDED.save_payload,
    last_seen_at = now(),
    updated_at = now();

  RETURN jsonb_build_object('success', true, 'synced_balance', v_safe_bal, 'synced_rep', v_safe_rep);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
