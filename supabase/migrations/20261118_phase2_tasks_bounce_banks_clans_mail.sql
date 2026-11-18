-- ========================================================
-- FASE 2 COMPLETA (BLOCOS 5 A 8 — SEM DOOM):
-- TASK MANAGER, BOUNCE PROXY, HD EXTERNO (XHD), HIDER/SEEKER,
-- TRILHA DE ENIGMAS, 5 BANCOS NPC, CLÃS & GUERRA, MAIL & BADGES
-- ========================================================

-- 1. Fila Central de Processos (Task Manager com divisão de CPU / Rede)
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
  status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'cancelled')),
  meta JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Cadeias de Proxy / Bounce (Saltos por Servidores Invadidos)
CREATE TABLE IF NOT EXISTS public.bounce_chains (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  chain_name TEXT NOT NULL DEFAULT 'Rota Principal',
  hops JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. HD Externo (XHD) p/ Backup Seguro de Softwares
CREATE TABLE IF NOT EXISTS public.player_xhd (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  capacity_mb INT NOT NULL DEFAULT 0,
  stored_softwares JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Contas nos 5 Bancos NPC + Caderno de Contas Bancárias Hackeadas
CREATE TABLE IF NOT EXISTS public.bank_accounts_multi (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  bank_ip TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  account_number TEXT UNIQUE NOT NULL,
  pin_password TEXT NOT NULL,
  balance NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (balance >= 0),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.hacked_bank_accounts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  hacker_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  bank_ip TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  pin_password TEXT NOT NULL,
  last_known_balance NUMERIC(14,2) NOT NULL DEFAULT 0,
  hacked_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(hacker_id, account_number)
);

-- 5. Trilha de Enigmas (First Puzzle)
CREATE TABLE IF NOT EXISTS public.puzzle_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  puzzle_index INT NOT NULL CHECK (puzzle_index >= 1),
  solved_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, puzzle_index)
);

-- 6. Clãs, Servidores de Clã & Guerras de Clã + Caixa de Entrada Mail
CREATE TABLE IF NOT EXISTS public.clans (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tag VARCHAR(4) UNIQUE NOT NULL,
  name VARCHAR(32) UNIQUE NOT NULL,
  leader_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  server_ip TEXT UNIQUE NOT NULL,
  power_score BIGINT NOT NULL DEFAULT 0,
  treasury NUMERIC(14,2) NOT NULL DEFAULT 0,
  wars_won INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.clan_wars (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  clan_a_tag VARCHAR(4) NOT NULL,
  clan_b_tag VARCHAR(4) NOT NULL,
  score_a BIGINT NOT NULL DEFAULT 0,
  score_b BIGINT NOT NULL DEFAULT 0,
  bounty_pool NUMERIC(14,2) NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  started_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.player_mails (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  sender_label TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);
