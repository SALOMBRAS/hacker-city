-- ========================================================
-- BLOCO 1 MMO: IP PÚBLICO ÚNICO POR JOGADOR, RESET GRÁTIS 1X/SEMANA
-- & HACKED DATABASE SINCRONIZADO (ANTI-CHEAT)
-- ========================================================

-- 1. Colunas de Identidade de Rede em public.profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS public_ip TEXT UNIQUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS root_password TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ip_resets_count INT NOT NULL DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_free_ip_reset_at TIMESTAMPTZ;

-- 2. Gerador Seguro de IPv4 Público Único (exclui faixas privadas/reservadas e bots 10.*)
CREATE OR REPLACE FUNCTION public.generate_unique_public_ip()
RETURNS TEXT AS $$
DECLARE
  v_o1 INT;
  v_o2 INT;
  v_o3 INT;
  v_o4 INT;
  v_ip TEXT;
  v_attempts INT := 0;
BEGIN
  LOOP
    v_attempts := v_attempts + 1;
    v_o1 := 11 + floor(random() * 212)::int; -- 11..222
    IF v_o1 IN (10, 127, 169, 172, 192, 198, 203, 71, 33, 77, 133, 185, 109) THEN
      CONTINUE;
    END IF;
    v_o2 := 1 + floor(random() * 253)::int;
    v_o3 := 1 + floor(random() * 253)::int;
    v_o4 := 2 + floor(random() * 252)::int;
    v_ip := v_o1 || '.' || v_o2 || '.' || v_o3 || '.' || v_o4;

    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.profiles WHERE public_ip = v_ip)
          AND NOT EXISTS (SELECT 1 FROM public.network_targets WHERE ip_address = v_ip);

    IF v_attempts > 200 THEN
      RAISE EXCEPTION 'Não foi possível alocar um IPv4 único no momento.';
    END IF;
  END LOOP;

  RETURN v_ip;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. Gerador de Senha Root de 8 Caracteres
CREATE OR REPLACE FUNCTION public.generate_root_password()
RETURNS TEXT AS $$
DECLARE
  v_chars TEXT := 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  v_res TEXT := '';
  i INT;
BEGIN
  FOR i IN 1..8 LOOP
    v_res := v_res || substr(v_chars, 1 + floor(random() * length(v_chars))::int, 1);
  END LOOP;
  RETURN v_res;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 4. Backfill automático para contas já existentes sem IP ou senha root
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT id FROM public.profiles WHERE public_ip IS NULL OR root_password IS NULL LOOP
    UPDATE public.profiles
    SET public_ip = COALESCE(public_ip, public.generate_unique_public_ip()),
        root_password = COALESCE(root_password, public.generate_root_password())
    WHERE id = r.id;
  END LOOP;
END $$;

-- 5. Atualizar Trigger de Novo Usuário para atribuir IP único + senha root no cadastro
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_tag TEXT;
  v_spec TEXT;
  v_acc TEXT;
  v_initial_balance NUMERIC(12,2);
  v_ip TEXT;
  v_pwd TEXT;
BEGIN
  v_tag := COALESCE(new.raw_user_meta_data->>'hacker_tag', 'Operador_' || substr(new.id::text, 1, 5));
  v_spec := COALESCE(new.raw_user_meta_data->>'specialty', 'exploiter');

  IF v_spec = 'carder' THEN
    v_initial_balance := 750.00;
  ELSE
    v_initial_balance := 500.00;
  END IF;

  v_acc := 'HC-' || (1000 + floor(random() * 9000))::text || '-' || (10 + floor(random() * 89))::text;
  v_ip := public.generate_unique_public_ip();
  v_pwd := public.generate_root_password();

  INSERT INTO public.profiles (id, hacker_tag, email, specialty, reputation, heat_level, computer_tier, public_ip, root_password)
  VALUES (new.id, v_tag, new.email, v_spec, 100, 1, 'pentium_standard', v_ip, v_pwd)
  ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        public_ip = COALESCE(public.profiles.public_ip, EXCLUDED.public_ip),
        root_password = COALESCE(public.profiles.root_password, EXCLUDED.root_password);

  INSERT INTO public.wallets (user_id, account_number, balance)
  VALUES (new.id, v_acc, v_initial_balance)
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.transactions (from_account, to_account, amount, description, tx_type)
  VALUES ('HC-MAINFRAME', v_acc, v_initial_balance, 'Bônus de Registro Darknet', 'bonus');

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 6. Tabela Hacked Database (Caderno de Servidores Invadidos por Jogador)
CREATE TABLE IF NOT EXISTS public.hacked_hosts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  target_ip TEXT NOT NULL,
  hostname TEXT NOT NULL,
  host_kind TEXT NOT NULL DEFAULT 'bot',
  access_method TEXT NOT NULL DEFAULT 'password',
  known_password TEXT,
  cpu_spec TEXT,
  notes TEXT DEFAULT '',
  ip_changed_alert BOOLEAN NOT NULL DEFAULT false,
  hacked_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(owner_id, target_ip)
);

ALTER TABLE public.hacked_hosts ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'hacked_hosts' AND policyname = 'own_hacked_hosts_all') THEN
    CREATE POLICY own_hacked_hosts_all ON public.hacked_hosts
      FOR ALL USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
  END IF;
END $$;

-- 7. RPC Anti-Cheat: Troca de IP (1x Grátis por Semana = 7 dias; ou Taxa Emergencial)
CREATE OR REPLACE FUNCTION public.reset_player_ip(
  p_force_paid BOOLEAN DEFAULT false
) RETURNS JSONB AS $$
DECLARE
  v_prof public.profiles%ROWTYPE;
  v_wallet public.wallets%ROWTYPE;
  v_is_free BOOLEAN;
  v_next_free TIMESTAMPTZ;
  v_cost NUMERIC(12,2) := 0;
  v_old_ip TEXT;
  v_new_ip TEXT;
BEGIN
  SELECT * INTO v_prof FROM public.profiles WHERE id = auth.uid() FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Perfil não autenticado.');
  END IF;

  v_old_ip := v_prof.public_ip;
  v_is_free := (v_prof.last_free_ip_reset_at IS NULL)
               OR (now() >= v_prof.last_free_ip_reset_at + INTERVAL '7 days');

  IF NOT v_is_free THEN
    v_next_free := v_prof.last_free_ip_reset_at + INTERVAL '7 days';
    -- Taxa emergencial pesada: $ 50.000 HC na 1ª emergência, +$ 25.000 por reincidência (teto $ 250.000 HC)
    v_cost := LEAST(250000, 50000 + (25000 * GREATEST(0, v_prof.ip_resets_count - 1)));

    IF NOT p_force_paid THEN
      RETURN jsonb_build_object(
        'success', false,
        'code', 'COOLDOWN_ACTIVE',
        'message', 'Sua troca gratuita semanal já foi usada. Aguarde o prazo ou pague a taxa emergencial do provedor.',
        'required_cost', v_cost,
        'next_free_at', v_next_free
      );
    END IF;

    SELECT * INTO v_wallet FROM public.wallets WHERE user_id = auth.uid() FOR UPDATE;
    IF v_wallet.balance < v_cost THEN
      RETURN jsonb_build_object(
        'success', false,
        'code', 'INSUFFICIENT_FUNDS',
        'message', 'Saldo insuficiente para renovação emergencial de IP ($ ' || v_cost || ' HC).'
      );
    END IF;

    UPDATE public.wallets SET balance = balance - v_cost WHERE id = v_wallet.id;
    INSERT INTO public.transactions (from_account, to_account, amount, description, tx_type)
    VALUES (v_wallet.account_number, 'HC-TELECOM-ISP', v_cost, 'Renovação Emergencial de IP Público', 'isp_reset');
  END IF;

  v_new_ip := public.generate_unique_public_ip();

  UPDATE public.profiles
  SET public_ip = v_new_ip,
      ip_resets_count = ip_resets_count + 1,
      last_free_ip_reset_at = CASE WHEN v_is_free THEN now() ELSE last_free_ip_reset_at END,
      reputation = reputation + 50,
      updated_at = now()
  WHERE id = auth.uid();

  -- Invalidar o IP antigo no Hacked Database de outros jogadores (igual ao HE Legacy!)
  IF v_old_ip IS NOT NULL THEN
    DELETE FROM public.hacked_hosts WHERE target_ip = v_old_ip AND owner_id <> auth.uid();
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'was_free', v_is_free,
    'cost', v_cost,
    'old_ip', v_old_ip,
    'new_ip', v_new_ip,
    'rep_gain', 50,
    'next_free_at', CASE WHEN v_is_free THEN now() + INTERVAL '7 days' ELSE v_prof.last_free_ip_reset_at + INTERVAL '7 days' END,
    'new_balance', CASE WHEN v_is_free THEN NULL ELSE (v_wallet.balance - v_cost) END
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
