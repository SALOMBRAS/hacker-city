-- ============================================================================
-- HACKER CITY WEB — BLINDAGEM DE SEGURANÇA DAS CONTAS, AUDITORIA ANTI-CHEAT
-- SERVER-SIDE COMPLETA, TRAVA DE 24H DO LABORATÓRIO & RPCs SEGURAS DE FÓRUM
-- ============================================================================

-- 1. Colunas de Posse da Conta, Telemetria Bitcoin e Cooldown Server-Side do Laboratório (24h = 1 Mês/Dia)
ALTER TABLE public.player_cloud_saves
  ADD COLUMN IF NOT EXISTS write_secret TEXT,
  ADD COLUMN IF NOT EXISTS last_btc_sats BIGINT NOT NULL DEFAULT 25000,
  ADD COLUMN IF NOT EXISTS total_lab_compiles INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_virus_lab_at TIMESTAMPTZ;

-- 2. Tabela Forense Imutável de Auditoria Anti-Cheat (nenhum cliente pode apagar ou adulterar)
CREATE TABLE IF NOT EXISTS public.security_cheat_audit_log (
  id BIGSERIAL PRIMARY KEY,
  operator_key TEXT NOT NULL,
  auth_uid UUID,
  violation_code TEXT NOT NULL,
  attempted_detail JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_security_audit_operator ON public.security_cheat_audit_log(operator_key, created_at DESC);
ALTER TABLE public.security_cheat_audit_log ENABLE ROW LEVEL SECURITY;
-- Sem políticas de INSERT/UPDATE/DELETE para anon/authenticated -> 100% blindado via SECURITY DEFINER!

-- 3. CORREÇÃO CRÍTICA DE PRIVACIDADE DAS CONTAS:
-- Remove leitura pública direta da tabela player_cloud_saves para que NINGUÉM possa dar
-- SELECT em save_payload (senhas root, chaves BTC, contas bancárias) ou write_secret de outros jogadores!
DROP POLICY IF EXISTS "Public read MMO directory" ON public.player_cloud_saves;
DROP POLICY IF EXISTS "Diretorio publico de jogadores online e offline" ON public.player_cloud_saves;
DROP POLICY IF EXISTS "Qualquer operador autenticado consulta diretorio publico" ON public.player_cloud_saves;
DROP POLICY IF EXISTS "Owner only read own cloud save" ON public.player_cloud_saves;

CREATE POLICY "Owner only read own cloud save"
  ON public.player_cloud_saves FOR SELECT
  USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- 4. RPC Pública Segura de Diretório MMO (NUNCA retorna save_payload nem write_secret!)
CREATE OR REPLACE FUNCTION public.get_public_mmo_directory(p_limit INT DEFAULT 60)
RETURNS TABLE (
  operator_key TEXT,
  user_id UUID,
  hacker_tag TEXT,
  public_ip TEXT,
  specialty TEXT,
  reputation INT,
  heat_level INT,
  best_soft_ver NUMERIC,
  ddos_gbps NUMERIC,
  firewall_ver NUMERIC,
  hasher_ver NUMERIC,
  antivirus_ver NUMERIC,
  cpu_mhz INT,
  net_mbps INT,
  hardware_health_pct INT,
  virus_lab_level INT,
  discovered_sets_count INT,
  clan_tag TEXT,
  last_seen_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.operator_key,
    s.user_id,
    s.hacker_tag,
    s.public_ip,
    s.specialty,
    s.reputation,
    s.heat_level,
    s.best_soft_ver,
    s.ddos_gbps,
    s.firewall_ver,
    s.hasher_ver,
    s.antivirus_ver,
    s.cpu_mhz,
    s.net_mbps,
    s.hardware_health_pct,
    s.virus_lab_level,
    s.discovered_sets_count,
    s.clan_tag,
    s.last_seen_at
  FROM public.player_cloud_saves s
  ORDER BY s.last_seen_at DESC
  LIMIT GREATEST(1, LEAST(120, COALESCE(p_limit, 60)));
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.get_public_mmo_directory TO anon, authenticated;

-- 5. RPC Segura para Carregar APENAS o Próprio Save (exige auth.uid() do dono OU segredo de posse)
CREATE OR REPLACE FUNCTION public.load_my_account_snapshot_secure(
  p_operator_key TEXT,
  p_write_secret TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  v_row public.player_cloud_saves%ROWTYPE;
BEGIN
  SELECT * INTO v_row FROM public.player_cloud_saves WHERE operator_key = p_operator_key;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'code', 'NOT_FOUND');
  END IF;

  -- Conta vinculada ao Supabase Auth: exige JWT exato do proprietário!
  IF v_row.user_id IS NOT NULL THEN
    IF auth.uid() IS DISTINCT FROM v_row.user_id THEN
      INSERT INTO public.security_cheat_audit_log (operator_key, auth_uid, violation_code, attempted_detail)
      VALUES (p_operator_key, auth.uid(), 'UNAUTHORIZED_READ_ATTEMPT', jsonb_build_object('expected_uid', v_row.user_id));
      RETURN jsonb_build_object('success', false, 'code', 'FORBIDDEN_NOT_OWNER');
    END IF;
  ELSIF v_row.write_secret IS NOT NULL THEN
    -- Conta rápida: exige segredo criptográfico local criado pelo dono!
    IF COALESCE(p_write_secret, '') <> v_row.write_secret THEN
      INSERT INTO public.security_cheat_audit_log (operator_key, auth_uid, violation_code, attempted_detail)
      VALUES (p_operator_key, auth.uid(), 'SECRET_READ_MISMATCH', '{}'::jsonb);
      RETURN jsonb_build_object('success', false, 'code', 'FORBIDDEN_BAD_SECRET');
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'wallet_balance', v_row.wallet_balance,
    'reputation', v_row.reputation,
    'save_payload', v_row.save_payload
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.load_my_account_snapshot_secure TO anon, authenticated;

-- 6. RPC Principal de Sincronização com Verificação Anti-Roubo Multi-Camadas
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
  p_save_payload JSONB,
  p_write_secret TEXT DEFAULT NULL
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
  v_safe_soft_ver NUMERIC(5,1);
  v_incoming_sats BIGINT;
  v_safe_sats BIGINT;
  v_vlab_level INT;
  v_incoming_compiles INT;
  v_safe_compiles INT;
  v_safe_lab_at TIMESTAMPTZ;
  v_disc_sets INT;
  v_cctv_ops INT;
  v_billing_paused BOOLEAN;
  v_effective_secret TEXT;
  v_sanitized_payload JSONB;
  v_cheat_detected BOOLEAN := false;
  v_strikes INT := 0;
BEGIN
  IF p_operator_key IS NULL OR length(trim(p_operator_key)) < 4 THEN
    RETURN jsonb_build_object('success', false, 'code', 'INVALID_KEY');
  END IF;

  SELECT * INTO v_prev FROM public.player_cloud_saves WHERE operator_key = p_operator_key FOR UPDATE;

  v_safe_heat := GREATEST(1, LEAST(5, COALESCE(p_heat_level, 1)));
  v_safe_health := GREATEST(15, LEAST(100, COALESCE(p_hardware_health_pct, 100)));
  v_incoming_sats := GREATEST(0, COALESCE((p_save_payload #>> '{btc,balanceSats}')::BIGINT, 25000));
  v_vlab_level := GREATEST(1, LEAST(10, COALESCE((p_save_payload #>> '{virusLabState,level}')::INT, 1)));
  v_incoming_compiles := GREATEST(0, COALESCE((p_save_payload #>> '{virusLabState,totalCompiled}')::INT, 0));
  v_disc_sets := GREATEST(0, LEAST(54, COALESCE(jsonb_array_length(COALESCE(p_save_payload #> '{virusLabState,discoveredSets}', '[]'::jsonb)), 0)));
  v_cctv_ops := GREATEST(0, COALESCE(jsonb_array_length(COALESCE(p_save_payload #> '{cctvState,capturedClips}', '[]'::jsonb)), 0));
  v_billing_paused := COALESCE((p_save_payload #>> '{quitineteBilling,cycle,pausedUntilLogin}')::BOOLEAN, false);
  v_sanitized_payload := COALESCE(p_save_payload, '{}'::jsonb);

  IF FOUND THEN
    -- A) VERIFICAÇÃO DE POSSE DA CONTA (IMPEDE INVADIR/SOBRESCREVER CONTA DE OUTRO JOGADOR!)
    IF v_prev.user_id IS NOT NULL AND auth.uid() IS DISTINCT FROM v_prev.user_id THEN
      INSERT INTO public.security_cheat_audit_log (operator_key, auth_uid, violation_code, attempted_detail)
      VALUES (p_operator_key, auth.uid(), 'ACCOUNT_OWNERSHIP_SPOOF', jsonb_build_object('owner_uid', v_prev.user_id));
      RETURN jsonb_build_object('success', false, 'code', 'ACCOUNT_OWNERSHIP_DENIED');
    END IF;

    IF v_prev.user_id IS NULL AND v_prev.write_secret IS NOT NULL AND COALESCE(p_write_secret, '') <> v_prev.write_secret THEN
      INSERT INTO public.security_cheat_audit_log (operator_key, auth_uid, violation_code, attempted_detail)
      VALUES (p_operator_key, auth.uid(), 'WRITE_SECRET_MISMATCH', '{}'::jsonb);
      RETURN jsonb_build_object('success', false, 'code', 'WRITE_SECRET_DENIED');
    END IF;

    v_effective_secret := COALESCE(v_prev.write_secret, p_write_secret);
    v_elapsed_sec := GREATEST(4, EXTRACT(EPOCH FROM (now() - v_prev.last_seen_at)));
    v_max_allowed_bal := v_prev.wallet_balance + 25000 + (v_elapsed_sec * 450);
    v_max_allowed_rep := v_prev.reputation + 1500 + FLOOR(v_elapsed_sec * 35)::INT;
    v_strikes := v_prev.cheat_strikes;

    -- B) VERIFICAÇÃO DE DINHEIRO & REPUTAÇÃO
    IF COALESCE(p_wallet_balance, 0) > v_max_allowed_bal OR COALESCE(p_reputation, 0) > v_max_allowed_rep THEN
      v_cheat_detected := true;
      v_strikes := v_strikes + 1;
      v_safe_bal := v_prev.wallet_balance;
      v_safe_rep := v_prev.reputation;
      INSERT INTO public.security_cheat_audit_log (operator_key, auth_uid, violation_code, attempted_detail)
      VALUES (p_operator_key, auth.uid(), 'WALLET_OR_REP_VELOCITY', jsonb_build_object('bal', p_wallet_balance, 'max_bal', v_max_allowed_bal, 'rep', p_reputation));
    ELSE
      v_safe_bal := GREATEST(0, COALESCE(p_wallet_balance, v_prev.wallet_balance));
      v_safe_rep := GREATEST(0, COALESCE(p_reputation, v_prev.reputation));
    END IF;

    -- C) VERIFICAÇÃO DE BITCOIN (SATOSHIS)
    IF v_incoming_sats > (v_prev.last_btc_sats + 50000000 + FLOOR(v_elapsed_sec * 25000)::BIGINT) THEN
      v_cheat_detected := true;
      v_strikes := v_strikes + 1;
      v_safe_sats := v_prev.last_btc_sats;
      v_sanitized_payload := jsonb_set(v_sanitized_payload, '{btc,balanceSats}', to_jsonb(v_safe_sats), true);
      INSERT INTO public.security_cheat_audit_log (operator_key, auth_uid, violation_code, attempted_detail)
      VALUES (p_operator_key, auth.uid(), 'BTC_SATS_SPIKE', jsonb_build_object('attempted_sats', v_incoming_sats, 'kept_sats', v_safe_sats));
    ELSE
      v_safe_sats := v_incoming_sats;
    END IF;

    -- D) VERIFICAÇÃO SERVER-SIDE DO LABORATÓRIO DE VÍRUS (LIMITE DE 1X A CADA 24H REAIS = 1 MÊS!)
    v_safe_compiles := v_prev.total_lab_compiles;
    v_safe_lab_at := v_prev.last_virus_lab_at;
    IF v_incoming_compiles > v_prev.total_lab_compiles THEN
      IF v_incoming_compiles > v_prev.total_lab_compiles + 1 OR
         (v_prev.last_virus_lab_at IS NOT NULL AND now() < (v_prev.last_virus_lab_at + interval '23 hours 55 minutes')) THEN
        v_cheat_detected := true;
        v_strikes := v_strikes + 1;
        v_vlab_level := v_prev.virus_lab_level;
        INSERT INTO public.security_cheat_audit_log (operator_key, auth_uid, violation_code, attempted_detail)
        VALUES (p_operator_key, auth.uid(), 'VIRUS_LAB_24H_BYPASS', jsonb_build_object('prev_compiles', v_prev.total_lab_compiles, 'attempted', v_incoming_compiles, 'last_at', v_prev.last_virus_lab_at));
      ELSE
        v_safe_compiles := v_incoming_compiles;
        v_safe_lab_at := now();
      END IF;
    END IF;
  ELSE
    -- Nova conta: trava saldo, reputação e BTC iniciais dentro do limite justo
    v_effective_secret := p_write_secret;
    IF COALESCE(p_wallet_balance, 500) > 30000 OR COALESCE(p_reputation, 100) > 5000 OR v_incoming_sats > 50000000 THEN
      v_cheat_detected := true;
      v_strikes := 1;
      v_safe_bal := 500.00;
      v_safe_rep := 100;
      v_safe_sats := 25000;
      INSERT INTO public.security_cheat_audit_log (operator_key, auth_uid, violation_code, attempted_detail)
      VALUES (p_operator_key, auth.uid(), 'NEW_ACCOUNT_FORGED_START', jsonb_build_object('bal', p_wallet_balance, 'rep', p_reputation, 'sats', v_incoming_sats));
    ELSE
      v_safe_bal := GREATEST(0, COALESCE(p_wallet_balance, 500.00));
      v_safe_rep := GREATEST(0, COALESCE(p_reputation, 100));
      v_safe_sats := v_incoming_sats;
    END IF;
    v_safe_compiles := LEAST(1, v_incoming_compiles);
    v_safe_lab_at := CASE WHEN v_safe_compiles > 0 THEN now() ELSE NULL END;
  END IF;

  -- E) TETO PLAUSÍVEL DE VERSÃO DE SOFTWARE (máx 10.0)
  v_safe_soft_ver := LEAST(10.0, GREATEST(1.0, COALESCE(p_best_soft_ver, 1.0)));

  IF auth.uid() IS NOT NULL THEN
    BEGIN
      UPDATE public.wallets SET balance = v_safe_bal WHERE user_id = auth.uid();
      UPDATE public.profiles SET reputation = v_safe_rep, heat_level = v_safe_heat, updated_at = now() WHERE id = auth.uid();
    EXCEPTION WHEN undefined_table THEN
      NULL;
    END;
  END IF;

  INSERT INTO public.player_cloud_saves (
    operator_key, user_id, write_secret, hacker_tag, public_ip, specialty, reputation, heat_level, wallet_balance,
    last_btc_sats, best_soft_ver, ddos_gbps, firewall_ver, hasher_ver, antivirus_ver,
    cpu_mhz, net_mbps, hdd_total_mb, ram_total_mb, hardware_health_pct,
    virus_lab_level, total_lab_compiles, last_virus_lab_at, discovered_sets_count, cctv_ops_count, billing_paused,
    clan_tag, custom_web_page, public_syslog, save_payload, cheat_strikes, last_seen_at, updated_at
  ) VALUES (
    p_operator_key, auth.uid(), v_effective_secret, COALESCE(p_hacker_tag, 'Operador'), p_public_ip, COALESCE(p_specialty, 'exploiter'),
    v_safe_rep, v_safe_heat, v_safe_bal, v_safe_sats,
    v_safe_soft_ver,
    LEAST(500.0, GREATEST(0.0, COALESCE(p_ddos_gbps, 0.0))),
    LEAST(10.0, GREATEST(0.0, COALESCE(p_firewall_ver, 1.0))),
    LEAST(10.0, GREATEST(0.0, COALESCE(p_hasher_ver, 1.0))),
    LEAST(10.0, GREATEST(0.0, COALESCE(p_antivirus_ver, 0.0))),
    COALESCE(p_cpu_mhz, 800), COALESCE(p_net_mbps, 1), COALESCE(p_hdd_total_mb, 350), COALESCE(p_ram_total_mb, 256),
    v_safe_health, v_vlab_level, v_safe_compiles, v_safe_lab_at, v_disc_sets, v_cctv_ops, v_billing_paused,
    p_clan_tag, left(COALESCE(p_custom_web_page, ''), 240),
    COALESCE(p_public_syslog, '[]'::jsonb), v_sanitized_payload,
    v_strikes, now(), now()
  )
  ON CONFLICT (operator_key) DO UPDATE SET
    user_id = COALESCE(public.player_cloud_saves.user_id, EXCLUDED.user_id),
    write_secret = COALESCE(public.player_cloud_saves.write_secret, EXCLUDED.write_secret),
    public_ip = EXCLUDED.public_ip,
    reputation = EXCLUDED.reputation,
    heat_level = EXCLUDED.heat_level,
    wallet_balance = EXCLUDED.wallet_balance,
    last_btc_sats = EXCLUDED.last_btc_sats,
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
    total_lab_compiles = EXCLUDED.total_lab_compiles,
    last_virus_lab_at = EXCLUDED.last_virus_lab_at,
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
    'synced_sats', v_safe_sats,
    'hardware_health_pct', v_safe_health,
    'virus_lab_level', v_vlab_level,
    'discovered_sets_count', v_disc_sets
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.sync_account_snapshot_secure TO anon, authenticated;

-- 7. RPCs Seguras para o Fórum Global (Sanitização de Tamanho + Funcionamento p/ Auth & Operadores Rápidos)
CREATE OR REPLACE FUNCTION public.publish_forum_thread_secure(
  p_author_tag TEXT,
  p_category TEXT,
  p_title TEXT,
  p_content TEXT
) RETURNS JSONB AS $$
DECLARE
  v_tid UUID;
  v_cat TEXT;
  v_clean_title TEXT;
  v_clean_body TEXT;
BEGIN
  v_clean_title := trim(left(COALESCE(p_title, ''), 140));
  v_clean_body := trim(left(COALESCE(p_content, ''), 2000));
  IF length(v_clean_title) < 3 OR length(v_clean_body) < 3 THEN
    RETURN jsonb_build_object('success', false, 'code', 'TOO_SHORT');
  END IF;

  v_cat := CASE WHEN p_category IN ('geral', 'exploits', 'recrutamento', 'farpas', 'mercado') THEN p_category ELSE 'geral' END;

  INSERT INTO public.darknet_forum_threads (author_id, author_tag, category, title, upvotes, view_count)
  VALUES (auth.uid(), left(COALESCE(p_author_tag, 'Operador'), 32), v_cat, v_clean_title, 1, 1)
  RETURNING id INTO v_tid;

  INSERT INTO public.darknet_forum_posts (thread_id, author_id, author_tag, content, upvotes)
  VALUES (v_tid, auth.uid(), left(COALESCE(p_author_tag, 'Operador'), 32), v_clean_body, 1);

  RETURN jsonb_build_object('success', true, 'thread_id', v_tid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.publish_forum_thread_secure TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.reply_forum_thread_secure(
  p_thread_id UUID,
  p_author_tag TEXT,
  p_content TEXT
) RETURNS JSONB AS $$
DECLARE
  v_pid UUID;
  v_clean_body TEXT;
BEGIN
  v_clean_body := trim(left(COALESCE(p_content, ''), 2000));
  IF length(v_clean_body) < 2 THEN
    RETURN jsonb_build_object('success', false, 'code', 'TOO_SHORT');
  END IF;

  INSERT INTO public.darknet_forum_posts (thread_id, author_id, author_tag, content, upvotes)
  VALUES (p_thread_id, auth.uid(), left(COALESCE(p_author_tag, 'Operador'), 32), v_clean_body, 0)
  RETURNING id INTO v_pid;

  UPDATE public.darknet_forum_threads SET updated_at = now(), view_count = view_count + 1 WHERE id = p_thread_id;
  RETURN jsonb_build_object('success', true, 'post_id', v_pid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.reply_forum_thread_secure TO anon, authenticated;
