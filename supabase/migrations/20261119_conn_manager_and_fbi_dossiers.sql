-- ==============================================================================
-- HACKER CITY // MIGRAÇÃO 20261119: FASE 1 — CONNMANAGER & FBI DOSSIÊS
-- 1. Tabela active_peer_sessions (Telemetria de invasões ao vivo e Kill Session)
-- 2. Tabela criminal_dossiers (Dossiê Safenet/FBI com IPs mascarados 161.89.X.X)
-- 3. RPCs de Defesa Ativa, Expurgo de Ficha, Desmascaramento e Falsificação
-- ==============================================================================

-- 1. TABELA DE SESSÕES ATIVAS P2P / CONNMANAGER
CREATE TABLE IF NOT EXISTS public.active_peer_sessions (
  session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  origin_ip TEXT NOT NULL,
  origin_alias TEXT NOT NULL DEFAULT 'Invasor Anônimo',
  origin_user_id UUID,
  target_ip TEXT NOT NULL,
  target_alias TEXT DEFAULT 'Host Alvo',
  protocol TEXT DEFAULT 'SSH' CHECK (protocol IN ('SSH', 'FTP', 'HTTP', 'RAW', 'DDOS')),
  action_type TEXT DEFAULT 'bruteforce' CHECK (action_type IN ('connect', 'bruteforce', 'upload_malware', 'execute_virus', 'reading_logs', 'ddos')),
  action_label TEXT NOT NULL,
  progress_pct INT DEFAULT 0 CHECK (progress_pct BETWEEN 0 AND 100),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'terminated_by_host', 'completed', 'timed_out')),
  started_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_active_peer_sessions_target_ip ON public.active_peer_sessions (target_ip, status);
CREATE INDEX IF NOT EXISTS idx_active_peer_sessions_origin_ip ON public.active_peer_sessions (origin_ip, status);

-- 2. TABELA DE DOSSIÊS CRIMINAIS DO FBI & SAFENET
CREATE TABLE IF NOT EXISTS public.criminal_dossiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  suspect_ip TEXT NOT NULL UNIQUE,
  suspect_player_id UUID,
  alias TEXT NOT NULL DEFAULT 'Desconhecido',
  masked_display_ip TEXT NOT NULL DEFAULT '161.89.X.X',
  mask_clarity_tier INT DEFAULT 1 CHECK (mask_clarity_tier BETWEEN 1 AND 4),
  total_infractions INT DEFAULT 1,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'warrant_issued', 'expunged', 'raided')),
  bounty_cash NUMERIC DEFAULT 5000 CHECK (bounty_cash >= 0),
  bounty_btc NUMERIC DEFAULT 0.05 CHECK (bounty_btc >= 0),
  evidence_logs JSONB DEFAULT '[]'::jsonb,
  warrant_deadline TIMESTAMPTZ,
  framed_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_criminal_dossiers_status ON public.criminal_dossiers (status);
CREATE INDEX IF NOT EXISTS idx_criminal_dossiers_bounty ON public.criminal_dossiers (bounty_cash DESC);

-- Habilita RLS
ALTER TABLE public.active_peer_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.criminal_dossiers ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS
DROP POLICY IF EXISTS "Permitir leitura de sessões ativas" ON public.active_peer_sessions;
CREATE POLICY "Permitir leitura de sessões ativas" ON public.active_peer_sessions
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir upsert de sessões ativas" ON public.active_peer_sessions;
CREATE POLICY "Permitir upsert de sessões ativas" ON public.active_peer_sessions
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir leitura de dossiês criminais" ON public.criminal_dossiers;
CREATE POLICY "Permitir leitura de dossiês criminais" ON public.criminal_dossiers
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir alteração de dossiês" ON public.criminal_dossiers;
CREATE POLICY "Permitir alteração de dossiês" ON public.criminal_dossiers
  FOR ALL USING (true) WITH CHECK (true);

-- 3. RPC: REGISTRAR SESSÃO DE INTRUSÃO AO VIVO
CREATE OR REPLACE FUNCTION public.report_peer_intrusion_session(
  p_origin_ip TEXT,
  p_origin_alias TEXT,
  p_origin_user_id UUID,
  p_target_ip TEXT,
  p_target_alias TEXT,
  p_protocol TEXT,
  p_action_type TEXT,
  p_action_label TEXT,
  p_progress_pct INT
) RETURNS JSONB AS $$
DECLARE
  v_session_id UUID;
BEGIN
  -- Se já houver sessão ativa do mesmo invasor para o mesmo alvo, apenas atualiza progresso
  SELECT session_id INTO v_session_id
  FROM public.active_peer_sessions
  WHERE origin_ip = p_origin_ip AND target_ip = p_target_ip AND status = 'active'
  LIMIT 1;

  IF v_session_id IS NOT NULL THEN
    UPDATE public.active_peer_sessions
    SET progress_pct = COALESCE(p_progress_pct, progress_pct),
        action_type = COALESCE(p_action_type, action_type),
        action_label = COALESCE(p_action_label, action_label),
        updated_at = now()
    WHERE session_id = v_session_id;
  ELSE
    INSERT INTO public.active_peer_sessions (
      origin_ip, origin_alias, origin_user_id, target_ip, target_alias,
      protocol, action_type, action_label, progress_pct, status, started_at, updated_at
    ) VALUES (
      p_origin_ip, COALESCE(p_origin_alias, 'Invasor Anônimo'), p_origin_user_id,
      p_target_ip, COALESCE(p_target_alias, 'Host'),
      COALESCE(p_protocol, 'SSH'), COALESCE(p_action_type, 'bruteforce'),
      p_action_label, COALESCE(p_progress_pct, 0), 'active', now(), now()
    ) RETURNING session_id INTO v_session_id;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'session_id', v_session_id,
    'status', 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.report_peer_intrusion_session TO anon, authenticated;

-- 4. RPC: CORTAR CABO (KILL SESSION)
CREATE OR REPLACE FUNCTION public.kill_active_peer_session(
  p_session_id UUID,
  p_caller_ip TEXT
) RETURNS JSONB AS $$
DECLARE
  v_rec RECORD;
BEGIN
  SELECT * INTO v_rec FROM public.active_peer_sessions WHERE session_id = p_session_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Sessão não encontrada ou já encerrada.');
  END IF;

  -- Atualiza sessão para encerrada pelo host remoto
  UPDATE public.active_peer_sessions
  SET status = 'terminated_by_host',
      updated_at = now()
  WHERE session_id = p_session_id;

  -- Registra log de defesa frustrada
  INSERT INTO public.pvp_network_events (
    attacker_ip, victim_ip, event_type, details
  ) VALUES (
    v_rec.origin_ip, v_rec.target_ip, 'session_killed',
    jsonb_build_object(
      'message', 'O defensor acionou o botão de Cortar Cabo e encerrou a sessão forçadamente.',
      'action_interrupted', v_rec.action_label,
      'progress_at_cut', v_rec.progress_pct,
      'protocol', v_rec.protocol
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Cabo cortado com sucesso! A conexão remota foi abortada.',
    'origin_ip', v_rec.origin_ip
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.kill_active_peer_session TO anon, authenticated;

-- 5. RPC: ESCALAR OU CRIAR DOSSIÊ DO FBI (MÁSCARA 161.89.X.X PROGRESSIVA)
CREATE OR REPLACE FUNCTION public.escalate_or_create_dossier(
  p_suspect_ip TEXT,
  p_alias TEXT,
  p_player_id UUID,
  p_infraction_type TEXT,
  p_evidence_log TEXT
) RETURNS JSONB AS $$
DECLARE
  v_dossier RECORD;
  v_octets TEXT[];
  v_new_mask TEXT;
  v_tier INT;
  v_infractions INT;
  v_new_status TEXT;
  v_bounty_cash NUMERIC;
  v_bounty_btc NUMERIC;
BEGIN
  v_octets := string_to_array(p_suspect_ip, '.');
  IF array_length(v_octets, 1) < 4 THEN
    v_octets := ARRAY['192','168','0','1'];
  END IF;

  SELECT * INTO v_dossier FROM public.criminal_dossiers WHERE suspect_ip = p_suspect_ip;

  IF FOUND THEN
    v_tier := LEAST(4, v_dossier.mask_clarity_tier + 1);
    v_infractions := v_dossier.total_infractions + 1;
    v_bounty_cash := v_dossier.bounty_cash + 4500;
    v_bounty_btc := v_dossier.bounty_btc + 0.04;

    IF v_tier >= 3 THEN
      v_new_status := 'warrant_issued';
    ELSE
      v_new_status := 'open';
    END IF;

    -- Constrói máscara visual
    IF v_tier = 1 THEN
      v_new_mask := v_octets[1] || '.' || v_octets[2] || '.X.X';
    ELSIF v_tier = 2 THEN
      v_new_mask := v_octets[1] || '.' || v_octets[2] || '.' || v_octets[3] || '.X';
    ELSIF v_tier = 3 THEN
      v_new_mask := v_octets[1] || '.' || v_octets[2] || '.' || v_octets[3] || '.' || left(v_octets[4], 1) || '?';
    ELSE
      v_new_mask := p_suspect_ip;
    END IF;

    UPDATE public.criminal_dossiers
    SET mask_clarity_tier = v_tier,
        masked_display_ip = v_new_mask,
        total_infractions = v_infractions,
        bounty_cash = v_bounty_cash,
        bounty_btc = v_bounty_btc,
        status = v_new_status,
        evidence_logs = COALESCE(evidence_logs, '[]'::jsonb) || jsonb_build_object(
          'at', now(), 'type', p_infraction_type, 'log', p_evidence_log
        ),
        warrant_deadline = CASE WHEN v_new_status = 'warrant_issued' THEN now() + interval '8 hours' ELSE warrant_deadline END,
        updated_at = now()
    WHERE suspect_ip = p_suspect_ip;

  ELSE
    v_tier := 1;
    v_new_mask := v_octets[1] || '.' || v_octets[2] || '.X.X';
    v_bounty_cash := 7500;
    v_bounty_btc := 0.05;

    INSERT INTO public.criminal_dossiers (
      suspect_ip, suspect_player_id, alias, masked_display_ip, mask_clarity_tier,
      total_infractions, status, bounty_cash, bounty_btc, evidence_logs, created_at, updated_at
    ) VALUES (
      p_suspect_ip, p_player_id, COALESCE(p_alias, 'Operador Anônimo'),
      v_new_mask, v_tier, 1, 'open', v_bounty_cash, v_bounty_btc,
      jsonb_build_array(jsonb_build_object('at', now(), 'type', p_infraction_type, 'log', p_evidence_log)),
      now(), now()
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'suspect_ip', p_suspect_ip,
    'masked_display', v_new_mask,
    'tier', v_tier,
    'status', v_new_status
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.escalate_or_create_dossier TO anon, authenticated;

-- 6. RPC: EXPURGAR FICHA CRIMINAL NO MAINFRAME DO FBI
CREATE OR REPLACE FUNCTION public.expunge_fbi_criminal_dossier(
  p_target_ip TEXT,
  p_operator_alias TEXT
) RETURNS JSONB AS $$
DECLARE
  v_rec RECORD;
BEGIN
  SELECT * INTO v_rec FROM public.criminal_dossiers WHERE suspect_ip = p_target_ip;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Dossiê não localizado no mainframe.');
  END IF;

  UPDATE public.criminal_dossiers
  SET status = 'expunged',
      mask_clarity_tier = 1,
      masked_display_ip = '0.0.0.0 (EXPURGADO)',
      bounty_cash = 0,
      bounty_btc = 0,
      evidence_logs = jsonb_build_array(
        jsonb_build_object('at', now(), 'type', 'cleared', 'log', 'Registros expurgados pelo operador ' || COALESCE(p_operator_alias, 'Root'))
      ),
      updated_at = now()
  WHERE suspect_ip = p_target_ip;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Dossiê ' || p_target_ip || ' expurgado com sucesso do Mainframe Federal.',
    'cleared_ip', p_target_ip
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.expunge_fbi_criminal_dossier TO anon, authenticated;

-- 7. RPC: DESMASCARAR IP NO FBI (DECRYPT MASK)
CREATE OR REPLACE FUNCTION public.decrypt_fbi_masked_ip(
  p_target_ip TEXT
) RETURNS JSONB AS $$
DECLARE
  v_rec RECORD;
BEGIN
  SELECT * INTO v_rec FROM public.criminal_dossiers WHERE suspect_ip = p_target_ip;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Alvo não localizado nos registros federais.');
  END IF;

  UPDATE public.criminal_dossiers
  SET mask_clarity_tier = 4,
      masked_display_ip = p_target_ip,
      updated_at = now()
  WHERE suspect_ip = p_target_ip;

  RETURN jsonb_build_object(
    'success', true,
    'full_ip', p_target_ip,
    'alias', v_rec.alias,
    'total_infractions', v_rec.total_infractions,
    'bounty_cash', v_rec.bounty_cash
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.decrypt_fbi_masked_ip TO anon, authenticated;

-- 8. RPC: FALSIFICAR EVIDÊNCIAS NO FBI (FRAME RIVAL)
CREATE OR REPLACE FUNCTION public.frame_rival_fbi_dossier(
  p_source_ip TEXT,
  p_framed_ip TEXT,
  p_framing_alias TEXT
) RETURNS JSONB AS $$
DECLARE
  v_source RECORD;
BEGIN
  SELECT * INTO v_source FROM public.criminal_dossiers WHERE suspect_ip = p_source_ip;

  -- Transfere registros ou escala o inocente/rival
  PERFORM public.escalate_or_create_dossier(
    p_framed_ip,
    'Rival Infiltrado',
    NULL,
    'falsified_log',
    'Evidência transferida pelo operador ' || COALESCE(p_framing_alias, 'Fantasma') || ' de ' || p_source_ip
  );

  -- Reduz calor do acusador original
  IF FOUND THEN
    UPDATE public.criminal_dossiers
    SET mask_clarity_tier = GREATEST(1, mask_clarity_tier - 1),
        bounty_cash = GREATEST(1000, bounty_cash - 3000),
        framed_by = p_source_ip,
        updated_at = now()
    WHERE suspect_ip = p_source_ip;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Evidências manipuladas com sucesso! Suspeito ' || p_framed_ip || ' agora está na mira do FBI.',
    'framed_ip', p_framed_ip
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.frame_rival_fbi_dossier TO anon, authenticated;
