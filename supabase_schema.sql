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

  -- Cooldown diferenciado de CPU: Infiltrador tem 25% menos tempo de espera (3s vs 4s)
  IF v_user_profile.specialty = 'exploiter' THEN
    IF v_user_profile.last_hack_at IS NOT NULL AND (now() - v_user_profile.last_hack_at) < INTERVAL '3 seconds' THEN
      RETURN jsonb_build_object('success', false, 'message', 'COOLDOWN DE CPU: Buffer Infiltrador saturado! Aguarde 3s entre invasões.');
    END IF;
  ELSE
    IF v_user_profile.last_hack_at IS NOT NULL AND (now() - v_user_profile.last_hack_at) < INTERVAL '4 seconds' THEN
      RETURN jsonb_build_object('success', false, 'message', 'COOLDOWN DE CPU: Buffer saturado! Aguarde 4s entre invasões.');
    END IF;
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


-- ========================================================
-- 12. BLOCO 1 MMO: IP PÚBLICO ÚNICO, RESET 1X/SEMANA & HACKED DB
-- (Sincronizado com supabase/migrations/20261118_block1_ip_internet_hacked_db.sql)
-- ========================================================
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS public_ip TEXT UNIQUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS root_password TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ip_resets_count INT NOT NULL DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_free_ip_reset_at TIMESTAMPTZ;

CREATE OR REPLACE FUNCTION public.generate_unique_public_ip()
RETURNS TEXT AS $$
DECLARE
  v_o1 INT; v_o2 INT; v_o3 INT; v_o4 INT; v_ip TEXT; v_attempts INT := 0;
BEGIN
  LOOP
    v_attempts := v_attempts + 1;
    v_o1 := 11 + floor(random() * 212)::int;
    IF v_o1 IN (10, 127, 169, 172, 192, 198, 203, 71, 33, 77, 133, 185, 109) THEN CONTINUE; END IF;
    v_o2 := 1 + floor(random() * 253)::int;
    v_o3 := 1 + floor(random() * 253)::int;
    v_o4 := 2 + floor(random() * 252)::int;
    v_ip := v_o1 || '.' || v_o2 || '.' || v_o3 || '.' || v_o4;
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.profiles WHERE public_ip = v_ip)
          AND NOT EXISTS (SELECT 1 FROM public.network_targets WHERE ip_address = v_ip);
    IF v_attempts > 200 THEN RAISE EXCEPTION 'Falha ao gerar IP único.'; END IF;
  END LOOP;
  RETURN v_ip;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- ========================================================
-- 13. BLOCO 2 MMO: SOFTWARES COM POTÊNCIAS, 5 VÍRUS & CARTEIRA BITCOIN
-- (Sincronizado com supabase/migrations/20261118_block2_viruses_softwares_bitcoin.sql)
-- ========================================================
CREATE TABLE IF NOT EXISTS public.btc_wallets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  btc_address TEXT UNIQUE NOT NULL,
  private_key_hash TEXT NOT NULL,
  balance_sats BIGINT NOT NULL DEFAULT 500000 CHECK (balance_sats >= 0),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

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


-- ========================================================
-- 14. BLOCOS 3 & 4 MMO: TUTORIAL, UNIVERSIDADE, MISSÕES, SAFENET & FBI
-- (Sincronizado com supabase/migrations/20261118_block3_4_tutorial_uni_missions_fbi.sql)
-- ========================================================
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tutorial_step INT NOT NULL DEFAULT 1;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tutorial_completed BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS public.player_certifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  cert_id INT NOT NULL CHECK (cert_id >= 1 AND cert_id <= 5),
  completed_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, cert_id)
);

CREATE TABLE IF NOT EXISTS public.player_missions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  mission_code TEXT NOT NULL,
  mission_type TEXT NOT NULL,
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

CREATE TABLE IF NOT EXISTS public.safenet_tracking (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  suspect_ip TEXT UNIQUE NOT NULL,
  suspect_handle TEXT NOT NULL,
  suspect_kind TEXT NOT NULL DEFAULT 'bot',
  reason TEXT NOT NULL,
  severity INT NOT NULL DEFAULT 1,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.fbi_wanted (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  suspect_ip TEXT UNIQUE NOT NULL,
  suspect_handle TEXT NOT NULL,
  suspect_kind TEXT NOT NULL DEFAULT 'bot',
  crime TEXT NOT NULL,
  bounty_cash NUMERIC(14,2) NOT NULL CHECK (bounty_cash >= 500),
  bounty_sats BIGINT NOT NULL DEFAULT 0,
  defense_gbps NUMERIC(8,2) NOT NULL DEFAULT 4.0,
  active BOOLEAN NOT NULL DEFAULT true,
  captured_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- ========================================================
-- 15. FASE 2 COMPLETA (SEM DOOM): TASK MANAGER, BOUNCE, XHD,
-- 5 BANCOS NPC, TRILHA DE ENIGMAS, CLÃS & MAIL
-- (Sincronizado com supabase/migrations/20261118_phase2_tasks_bounce_banks_clans_mail.sql)
-- ========================================================
CREATE TABLE IF NOT EXISTS public.player_processes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  target_ip TEXT NOT NULL DEFAULT 'localhost',
  queue_kind TEXT NOT NULL CHECK (queue_kind IN ('cpu', 'net')),
  category TEXT NOT NULL,
  work_total NUMERIC(12,2) NOT NULL CHECK (work_total > 0),
  work_done NUMERIC(12,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'running',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.bounce_chains (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  chain_name TEXT NOT NULL DEFAULT 'Rota Principal',
  hops JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS public.hacked_bank_accounts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  hacker_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  bank_ip TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  pin_password TEXT NOT NULL,
  last_known_balance NUMERIC(14,2) NOT NULL DEFAULT 0,
  UNIQUE(hacker_id, account_number)
);


-- ========================================================
-- 16. ONLINE MULTIPLAYER COMPLETO: CLOUD SAVE, PVP REALTIME & SYNC RPC
-- (Sincronizado com supabase/migrations/20261118_online_multiplayer_cloud_sync.sql)
-- ========================================================
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

CREATE TABLE IF NOT EXISTS public.pvp_network_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  sender_tag TEXT NOT NULL,
  sender_visible_ip TEXT NOT NULL,
  target_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_tag TEXT,
  target_ip TEXT,
  event_kind TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  consumed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);
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
