-- ==============================================================================
-- HACKER CITY // MIGRAÇÃO 20261119: FASE 2 — CONTRATOS DINÂMICOS & INFINITOS
-- 1. Tabela dynamic_contracts (Feed procedural das 3 Facções com expiração)
-- 2. Tabela user_active_contracts (Contratos aceitos pelos jogadores)
-- 3. RPCs de geração procedural e coleta de recompensa
-- ==============================================================================

-- 1. TABELA DE CONTRATOS DINÂMICOS PROCEDURAIS
CREATE TABLE IF NOT EXISTS public.dynamic_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  faction TEXT NOT NULL CHECK (faction IN ('corporate', 'syndicate', 'bounty')),
  title TEXT NOT NULL,
  client_name TEXT NOT NULL,
  difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard', 'nightmare')),
  target_ip TEXT NOT NULL,
  target_hostname TEXT NOT NULL,
  required_actions JSONB NOT NULL DEFAULT '[]'::jsonb,
  reward_cash NUMERIC NOT NULL CHECK (reward_cash >= 0),
  reward_btc NUMERIC DEFAULT 0 CHECK (reward_btc >= 0),
  reputation_gain INT DEFAULT 25,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '45 minutes'),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dynamic_contracts_faction ON public.dynamic_contracts (faction);
CREATE INDEX IF NOT EXISTS idx_dynamic_contracts_expires_at ON public.dynamic_contracts (expires_at);

-- 2. TABELA DE CONTRATOS ATIVOS DO JOGADOR
CREATE TABLE IF NOT EXISTS public.user_active_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  contract_id UUID REFERENCES public.dynamic_contracts(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'claimed', 'expired')),
  progress_state JSONB DEFAULT '{}'::jsonb,
  accepted_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_user_active_contracts_user ON public.user_active_contracts (user_id, status);

-- Habilita RLS
ALTER TABLE public.dynamic_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_active_contracts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir leitura de contratos dinâmicos" ON public.dynamic_contracts;
CREATE POLICY "Permitir leitura de contratos dinâmicos" ON public.dynamic_contracts
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir alteração de contratos ativos" ON public.user_active_contracts;
CREATE POLICY "Permitir alteração de contratos ativos" ON public.user_active_contracts
  FOR ALL USING (true) WITH CHECK (true);

-- 3. RPC: GERAR CONTRATOS PROCEDURAIS
CREATE OR REPLACE FUNCTION public.generate_hourly_dynamic_contracts()
RETURNS JSONB AS $$
DECLARE
  v_inserted INT := 0;
BEGIN
  -- Remove contratos expirados há mais de 10 minutos
  DELETE FROM public.dynamic_contracts WHERE expires_at < (now() - interval '10 minutes');

  -- Se houver menos de 6 contratos ativos no quadro global, gera novos
  IF (SELECT count(*) FROM public.dynamic_contracts WHERE expires_at > now()) < 6 THEN
    INSERT INTO public.dynamic_contracts (
      faction, title, client_name, difficulty, target_ip, target_hostname,
      required_actions, reward_cash, reward_btc, reputation_gain, expires_at
    ) VALUES
      (
        'corporate', 'Auditoria de Vulnerabilidade SSH', 'BioHealth MedTech S.A.', 'easy',
        '194.22.80.11', 'biohealth-srv01.corp.hc',
        jsonb_build_array(
          jsonb_build_object('id', 'break_pass', 'label', 'Quebrar senha de acesso root'),
          jsonb_build_object('id', 'wipe_log', 'label', 'Limpar registros de auditoria em /var/log/syslog')
        ),
        8500, 0.02, 35, now() + interval '60 minutes'
      ),
      (
        'syndicate', 'Sabotagem de Mineradora Rival', 'Anon_77 Dark Syndicate', 'hard',
        '200.112.5.90', 'crypto-mining-rig04.under.hc',
        jsonb_build_array(
          jsonb_build_object('id', 'break_pass', 'label', 'Infiltrar terminal root'),
          jsonb_build_object('id', 'install_malware', 'label', 'Subir Trojan Miner.vminer'),
          jsonb_build_object('id', 'leave_taunt', 'label', 'Deixar aviso com a farpa da guilda na log')
        ),
        32000, 0.25, 75, now() + interval '45 minutes'
      ),
      (
        'bounty', 'Caça a Fugitivo do FBI', 'Gabinete de Recompensas de Saint Louis', 'nightmare',
        '10.110.3.22', 'zeroday-valkyrie.hacker.hc',
        jsonb_build_array(
          jsonb_build_object('id', 'port_scan', 'label', 'Mapear portas e serviços'),
          jsonb_build_object('id', 'ddos_takedown', 'label', 'Derrubar o servidor via ataque DDoS sobrecarregado')
        ),
        55000, 0.45, 120, now() + interval '90 minutes'
      );
    v_inserted := 3;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'inserted', v_inserted,
    'total_active', (SELECT count(*) FROM public.dynamic_contracts WHERE expires_at > now())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.generate_hourly_dynamic_contracts TO anon, authenticated;

-- 4. RPC: COLETAR RECOMPENSA DE CONTRATO
CREATE OR REPLACE FUNCTION public.claim_dynamic_contract_reward(
  p_contract_id UUID,
  p_user_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_contract RECORD;
  v_active RECORD;
BEGIN
  SELECT * INTO v_contract FROM public.dynamic_contracts WHERE id = p_contract_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Contrato não encontrado.');
  END IF;

  SELECT * INTO v_active FROM public.user_active_contracts
  WHERE contract_id = p_contract_id AND user_id = p_user_id;

  IF NOT FOUND THEN
    -- Aceita e conclui se requisitos validados no client
    INSERT INTO public.user_active_contracts (user_id, contract_id, status, completed_at)
    VALUES (p_user_id, p_contract_id, 'claimed', now());
  ELSE
    UPDATE public.user_active_contracts
    SET status = 'claimed', completed_at = now()
    WHERE id = v_active.id;
  END IF;

  -- Se houver perfil Supabase Auth, adiciona saldo
  IF p_user_id IS NOT NULL THEN
    UPDATE public.wallets
    SET balance = balance + v_contract.reward_cash
    WHERE user_id = p_user_id;

    UPDATE public.profiles
    SET reputation = reputation + v_contract.reputation_gain
    WHERE id = p_user_id;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'payout_cash', v_contract.reward_cash,
    'payout_btc', v_contract.reward_btc,
    'rep_gain', v_contract.reputation_gain,
    'contract_title', v_contract.title
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.claim_dynamic_contract_reward TO anon, authenticated;
