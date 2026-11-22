-- ============================================================================
-- HACKER CITY WEB — MIGRATION: 8 PROGRESSION LOCKS & TOP 10 ELITE MECHANICS
-- Created: 2026-11-22
-- ============================================================================

-- 1. Seized Server Auctions ("Storage Wars Hacker" — 1 lot every 2h real time)
CREATE TABLE IF NOT EXISTS public.hc_seized_server_auctions (
  lot_bucket BIGINT PRIMARY KEY,
  lot_code TEXT NOT NULL,
  seized_origin TEXT NOT NULL,
  highest_bid_clean NUMERIC(14, 2) NOT NULL DEFAULT 8000,
  highest_bidder_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  highest_bidder_tag TEXT NOT NULL DEFAULT 'kr0n0s_apt',
  resolved BOOLEAN NOT NULL DEFAULT FALSE,
  outcome_kind TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. P2P Mercenary Escrow Contracts (Forum Darknet Notary — 15% non-refundable fee)
CREATE TABLE IF NOT EXISTS public.hc_mercenary_escrow_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hirer_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  hirer_tag TEXT NOT NULL,
  objective_kind TEXT NOT NULL CHECK (objective_kind IN ('crack_root', 'disable_cctv', 'ddos_wanted')),
  target_ip TEXT NOT NULL,
  target_label TEXT NOT NULL,
  reward_amount NUMERIC(14, 2) NOT NULL CHECK (reward_amount >= 2000 AND reward_amount <= 25000),
  notary_fee_burned NUMERIC(14, 2) NOT NULL,
  mercenary_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  mercenary_tag TEXT,
  reserved_until TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'reserved', 'completed', 'expired')),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Clan Corporate Sponsorships ($30,000 Clean SLA Deposit + 3-Front War Ledger)
CREATE TABLE IF NOT EXISTS public.hc_clan_corp_sponsorships (
  clan_id TEXT PRIMARY KEY,
  corp_symbol TEXT NOT NULL,
  sla_deposit_clean NUMERIC(14, 2) NOT NULL DEFAULT 30000,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'breached_forfeited', 'cancelled')),
  signed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Swiss Offshore Physical Vault Repatriation Queue (30m real-time SWIFT lockup)
CREATE TABLE IF NOT EXISTS public.hc_swiss_vault_repatriations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_clean NUMERIC(14, 2) NOT NULL CHECK (amount_clean > 0),
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  available_at TIMESTAMPTZ NOT NULL,
  claimed BOOLEAN NOT NULL DEFAULT FALSE
);

ALTER TABLE public.hc_seized_server_auctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hc_mercenary_escrow_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hc_clan_corp_sponsorships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hc_swiss_vault_repatriations ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'hc_auctions_read_all') THEN
    CREATE POLICY hc_auctions_read_all ON public.hc_seized_server_auctions FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'hc_escrow_read_all') THEN
    CREATE POLICY hc_escrow_read_all ON public.hc_mercenary_escrow_contracts FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'hc_sponsorship_read_all') THEN
    CREATE POLICY hc_sponsorship_read_all ON public.hc_clan_corp_sponsorships FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'hc_swiss_own_rows') THEN
    CREATE POLICY hc_swiss_own_rows ON public.hc_swiss_vault_repatriations
      FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;
