-- ========================================================
-- HACKER CITY // SUPABASE HARDENED SCHEMA & ANTI-CHEAT ENGINE
-- Segurança Extrema & Proteção Contra Exploits de Jogadores
-- ========================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABELA DE PERFIS DE HACKERS (PROFILES)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  hacker_tag TEXT UNIQUE NOT NULL,
  email TEXT,
  specialty TEXT NOT NULL DEFAULT 'exploiter',
  reputation INT NOT NULL DEFAULT 100,
  heat_level INT NOT NULL DEFAULT 1,
  computer_tier TEXT NOT NULL DEFAULT 'pentium_standard',
  avatar_url TEXT DEFAULT '👾',
  is_in_prison BOOLEAN NOT NULL DEFAULT false,
  prison_release_at TIMESTAMPTZ,
  last_hack_at TIMESTAMPTZ,
  last_chat_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. TABELA DE CARTEIRAS DIGITAIS (WALLETS)
CREATE TABLE IF NOT EXISTS public.wallets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  account_number TEXT UNIQUE NOT NULL,
  balance NUMERIC(12, 2) NOT NULL DEFAULT 500.00,
  is_frozen BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. CONSTRAINTS DE SEGURANÇA E INTEGRIDADE
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_positive_balance') THEN
    ALTER TABLE public.wallets ADD CONSTRAINT check_positive_balance CHECK (balance >= 0);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_valid_hacker_tag') THEN
    ALTER TABLE public.profiles ADD CONSTRAINT check_valid_hacker_tag CHECK (hacker_tag ~ '^[a-zA-Z0-9_]{3,20}$');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_valid_heat') THEN
    ALTER TABLE public.profiles ADD CONSTRAINT check_valid_heat CHECK (heat_level >= 1 AND heat_level <= 5);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_valid_reputation') THEN
    ALTER TABLE public.profiles ADD CONSTRAINT check_valid_reputation CHECK (reputation >= 0);
  END IF;
END $$;

-- 4. TABELA DE TRANSAÇÕES FINANCEIRAS (TRANSACTIONS)
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  from_account TEXT NOT NULL,
  to_account TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  description TEXT NOT NULL,
  tx_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. TABELA DE ALVOS & SERVIDORES DA CIDADE (NETWORK_TARGETS)
CREATE TABLE IF NOT EXISTS public.network_targets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ip_address TEXT UNIQUE NOT NULL,
  hostname TEXT NOT NULL,
  service_port TEXT NOT NULL,
  vulnerability TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  bounty NUMERIC(10, 2) NOT NULL DEFAULT 150.00,
  required_reputation INT NOT NULL DEFAULT 0,
  last_hacked_by UUID REFERENCES public.profiles(id),
  last_hacked_at TIMESTAMPTZ
);

-- 6. TABELA DO CHAT IRC CLANDESTINO (CHAT_MESSAGES)
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE DEFAULT auth.uid() NOT NULL,
  hacker_tag TEXT NOT NULL,
  message TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT 'global',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. REVOGAÇÃO DE PRIVILÉGIOS DIRETOS (ANTI-CHEAT RADICAL)
REVOKE INSERT, UPDATE, DELETE ON public.wallets FROM authenticated, anon;
GRANT SELECT ON public.wallets TO authenticated;

REVOKE INSERT, UPDATE, DELETE ON public.transactions FROM authenticated, anon;
GRANT SELECT ON public.transactions TO authenticated;

REVOKE UPDATE ON public.profiles FROM authenticated, anon;
GRANT SELECT ON public.profiles TO authenticated, anon;
GRANT UPDATE (avatar_url) ON public.profiles TO authenticated;

-- 8. TRIGGER DE CRIAÇÃO AUTOMÁTICA DE PERFIL E CARTEIRA
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_tag TEXT;
  v_spec TEXT;
  v_acc TEXT;
  v_initial_balance NUMERIC(12,2);
BEGIN
  v_tag := COALESCE(new.raw_user_meta_data->>'hacker_tag', 'Operador_' || substr(new.id::text, 1, 5));
  v_spec := COALESCE(new.raw_user_meta_data->>'specialty', 'exploiter');
  
  IF v_spec = 'carder' THEN
    v_initial_balance := 750.00;
  ELSE
    v_initial_balance := 500.00;
  END IF;

  v_acc := 'HC-' || (1000 + floor(random() * 9000))::text || '-' || (10 + floor(random() * 89))::text;

  INSERT INTO public.profiles (id, hacker_tag, email, specialty, reputation, heat_level, computer_tier)
  VALUES (new.id, v_tag, new.email, v_spec, 100, 1, 'pentium_standard')
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

  INSERT INTO public.wallets (user_id, account_number, balance)
  VALUES (new.id, v_acc, v_initial_balance)
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.transactions (from_account, to_account, amount, description, tx_type)
  VALUES ('HC-MAINFRAME', v_acc, v_initial_balance, 'Bônus de Registro Darknet', 'bonus');

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 9. STORED PROCEDURE SEGURA: TRANSFERÊNCIA BANCÁRIA P2P (COM ROW LOCK)
CREATE OR REPLACE FUNCTION public.p2p_transfer(
  p_target_account TEXT,
  p_amount NUMERIC
) RETURNS JSONB AS $$
DECLARE
  v_sender_wallet public.wallets%ROWTYPE;
  v_target_wallet public.wallets%ROWTYPE;
BEGIN
  IF p_amount <= 0 THEN
    RETURN jsonb_build_object('success', false, 'message', 'Valor precisa ser maior que zero.');
  END IF;

  SELECT * INTO v_sender_wallet FROM public.wallets WHERE user_id = auth.uid() FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Sua carteira não foi encontrada.');
  END IF;

  IF v_sender_wallet.balance < p_amount THEN
    RETURN jsonb_build_object('success', false, 'message', 'Saldo insuficiente para transferir.');
  END IF;

  IF v_sender_wallet.account_number = p_target_account THEN
    RETURN jsonb_build_object('success', false, 'message', 'Não é possível transferir para si mesmo.');
  END IF;

  SELECT * INTO v_target_wallet FROM public.wallets WHERE account_number = p_target_account FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Conta de destino não existe.');
  END IF;

  UPDATE public.wallets SET balance = balance - p_amount WHERE id = v_sender_wallet.id;
  UPDATE public.wallets SET balance = balance + p_amount WHERE id = v_target_wallet.id;

  INSERT INTO public.transactions (from_account, to_account, amount, description, tx_type)
  VALUES (v_sender_wallet.account_number, p_target_account, p_amount, 'Transferência P2P Clandestina', 'transfer');

  RETURN jsonb_build_object(
    'success', true, 
    'message', 'Transferência de $' || p_amount || ' HC efetuada com sucesso!', 
    'new_balance', (v_sender_wallet.balance - p_amount)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 10. STORED PROCEDURE SEGURA: HACK DE SERVIDOR ALVO (COM ANTI-FLOOD)
CREATE OR REPLACE FUNCTION public.hack_network_target(
  p_ip_address TEXT
) RETURNS JSONB AS $$
DECLARE
  v_user_profile public.profiles%ROWTYPE;
  v_user_wallet public.wallets%ROWTYPE;
  v_target public.network_targets%ROWTYPE;
  v_reward NUMERIC(10,2);
  v_heat_increase INT := 1;
  v_rep_gain INT := 25;
BEGIN
  SELECT * INTO v_user_profile FROM public.profiles WHERE id = auth.uid() FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Perfil não autenticado.');
  END IF;

  IF v_user_profile.last_hack_at IS NOT NULL AND (now() - v_user_profile.last_hack_at) < INTERVAL '4 seconds' THEN
    RETURN jsonb_build_object('success', false, 'message', 'COOLDOWN DE CPU: Buffer saturado! Aguarde 4s entre invasões.');
  END IF;

  SELECT * INTO v_target FROM public.network_targets WHERE ip_address = p_ip_address;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Alvo não localizado.');
  END IF;

  IF v_user_profile.reputation < v_target.required_reputation THEN
    RETURN jsonb_build_object('success', false, 'message', 'Reputação insuficiente. Exige: ' || v_target.required_reputation || ' REP.');
  END IF;

  SELECT * INTO v_user_wallet FROM public.wallets WHERE user_id = auth.uid() FOR UPDATE;

  v_reward := v_target.bounty;
  IF v_user_profile.specialty = 'carder' THEN
    v_reward := v_reward * 1.25;
  END IF;

  -- Cyber Sentinel: exatamente 30% de chance de evitar rastreamento policial (Heat)
  IF v_user_profile.specialty = 'sentinel' AND (random() < 0.30) THEN
    v_heat_increase := 0;
  END IF;

  UPDATE public.wallets SET balance = balance + v_reward WHERE id = v_user_wallet.id;

  UPDATE public.profiles 
  SET reputation = reputation + v_rep_gain,
      heat_level = LEAST(5, heat_level + v_heat_increase),
      last_hack_at = now(),
      updated_at = now()
  WHERE id = v_user_profile.id;

  UPDATE public.network_targets 
  SET last_hacked_by = auth.uid(),
      last_hacked_at = now()
  WHERE ip_address = p_ip_address;

  INSERT INTO public.transactions (from_account, to_account, amount, description, tx_type)
  VALUES (v_target.hostname, v_user_wallet.account_number, v_reward, 'Exploit no IP ' || p_ip_address, 'hack_reward');

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Alvo ' || v_target.hostname || ' invadido!',
    'reward', v_reward,
    'rep_gain', v_rep_gain,
    'heat_level', LEAST(5, v_user_profile.heat_level + v_heat_increase),
    'new_balance', v_user_wallet.balance + v_reward
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 11. TRIGGER ANTI-XSS & ANTI-SPAM NO CHAT IRC
CREATE OR REPLACE FUNCTION public.sanitize_chat_message()
RETURNS TRIGGER AS $$
DECLARE
  v_last_chat TIMESTAMPTZ;
BEGIN
  SELECT last_chat_at INTO v_last_chat FROM public.profiles WHERE id = auth.uid();
  IF v_last_chat IS NOT NULL AND (now() - v_last_chat) < INTERVAL '1.5 seconds' THEN
    RAISE EXCEPTION 'FLOOD_CONTROL: Aguarde 1.5s antes de transmitir outra mensagem.';
  END IF;

  new.message := substring(trim(regexp_replace(new.message, '<[^>]*>', '', 'g')), 1, 250);
  
  IF length(new.message) = 0 THEN
    RAISE EXCEPTION 'Mensagem não pode ser vazia.';
  END IF;

  UPDATE public.profiles SET last_chat_at = now() WHERE id = auth.uid();
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_sanitize_chat ON public.chat_messages;
CREATE TRIGGER trg_sanitize_chat
  BEFORE INSERT ON public.chat_messages
  FOR EACH ROW EXECUTE FUNCTION public.sanitize_chat_message();
