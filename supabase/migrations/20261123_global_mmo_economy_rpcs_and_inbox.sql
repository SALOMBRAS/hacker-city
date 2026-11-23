-- =============================================================================
-- HACKER CITY WEB — MIGRATION: GLOBAL MMO SHARED ECONOMY, INBOX & CIRCUIT BREAKER
-- Created: 2026-11-23
-- =============================================================================

-- 1. Caixa de Recebimentos Assíncrona (Impede 100% sobrescrita de JSON entre jogadores!)
CREATE TABLE IF NOT EXISTS public.hc_wallet_inbox (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  sender_tag TEXT NOT NULL DEFAULT 'Sistema MMO',
  kind TEXT NOT NULL CHECK (kind IN ('LAUNDER_COMMISSION', 'AUCTION_OUTBID_REFUND', 'P2P_VIRUS_SALE', 'ESCROW_REFUND')),
  amount_clean NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (amount_clean >= 0),
  amount_dirty NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (amount_dirty >= 0),
  note TEXT NOT NULL,
  claimed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hc_wallet_inbox_recipient ON public.hc_wallet_inbox(recipient_id, claimed);

-- 2. Chave de Idempotência Contra Clique Duplo / Lag (client_tx_id)
CREATE TABLE IF NOT EXISTS public.hc_processed_tx_ids (
  tx_id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Trava Diária Anti-Conta-Fake (Máx. 3 lavagens/dia e 2 contratos/dia entre a mesma dupla!)
CREATE TABLE IF NOT EXISTS public.hc_pair_daily_limits (
  day_key DATE NOT NULL DEFAULT CURRENT_DATE,
  actor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  counterparty_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('launder_batch', 'escrow_contract')),
  hits SMALLINT NOT NULL DEFAULT 1,
  PRIMARY KEY (day_key, actor_id, counterparty_id, kind)
);

-- 4. Bolsa de Empresas Global Unificada (8 Ações c/ Piso 30%, Teto 220% e Circuit Breaker 10m!)
CREATE TABLE IF NOT EXISTS public.global_cyberstock_tickers (
  symbol TEXT PRIMARY KEY,
  company_name TEXT NOT NULL,
  host_ip TEXT NOT NULL,
  base_price NUMERIC(12, 2) NOT NULL,
  price NUMERIC(12, 2) NOT NULL,
  integrity NUMERIC(6, 1) NOT NULL DEFAULT 100.0,
  history_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  recent_drops_count SMALLINT NOT NULL DEFAULT 0,
  last_drop_window_at TIMESTAMPTZ,
  circuit_breaker_until TIMESTAMPTZ,
  last_actor_tag TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.global_cyberstock_tickers (symbol, company_name, host_ip, base_price, price, integrity, history_json)
VALUES
  ('FARO', 'Farofa Systems B2B',    '203.17.88.40',  42.00,  42.00, 100.0, '[42.00, 41.60, 42.30, 42.00]'::jsonb),
  ('MRDN', 'Meridian BioLabs',      '194.88.14.202', 68.50,  68.50, 100.0, '[68.50, 67.90, 69.10, 68.50]'::jsonb),
  ('AEGS', 'Aegis Security Corp',   '172.66.40.18',  54.00,  54.00, 100.0, '[54.00, 53.50, 54.40, 54.00]'::jsonb),
  ('CRVO', 'Corvo Cinza Logística', '58.40.12.9',    37.20,  37.20, 100.0, '[37.20, 36.90, 37.50, 37.20]'::jsonb),
  ('KRNO', 'KronoTech Sistemas',    '189.40.7.12',   92.00,  92.00, 100.0, '[92.00, 91.20, 92.80, 92.00]'::jsonb),
  ('OMNI', 'OmniDyne Defense',      '192.99.44.80', 148.00, 148.00, 100.0, '[148.00, 146.50, 149.20, 148.00]'::jsonb),
  ('HEBC', 'HEBC Clearing Bank',    '77.3.10.44',   116.00, 116.00, 100.0, '[116.00, 115.10, 116.90, 116.00]'::jsonb),
  ('EVIL', 'EvilCorp Conglomerate', '209.141.55.10',215.00, 215.00, 100.0, '[215.00, 213.40, 216.80, 215.00]'::jsonb)
ON CONFLICT (symbol) DO NOTHING;

-- 5. Suporte a Prorrogação Anti-Sniping (+30s, máx 5x) nos Leilões de 2h
ALTER TABLE public.hc_seized_server_auctions
  ADD COLUMN IF NOT EXISTS snipe_extensions SMALLINT NOT NULL DEFAULT 0;

-- 6. Row-Level Security (RLS)
ALTER TABLE public.hc_wallet_inbox ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hc_processed_tx_ids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hc_pair_daily_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_cyberstock_tickers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Own wallet inbox read" ON public.hc_wallet_inbox;
CREATE POLICY "Own wallet inbox read" ON public.hc_wallet_inbox
  FOR SELECT USING (auth.uid() = recipient_id);

DROP POLICY IF EXISTS "Public read global cyberstock" ON public.global_cyberstock_tickers;
CREATE POLICY "Public read global cyberstock" ON public.global_cyberstock_tickers
  FOR SELECT USING (true);

-- =============================================================================
-- 7. STORED PROCEDURES ATÔMICAS (RELÓGIO DO SERVIDOR + ANTI-RACE-CONDITION)
-- =============================================================================

-- 7.1 Resgatar todos os cheques pendentes da Caixa de Recebimentos (hc_wallet_inbox)
CREATE OR REPLACE FUNCTION public.rpc_claim_wallet_inbox()
RETURNS JSONB AS $$
DECLARE
  v_clean_sum NUMERIC(14,2) := 0;
  v_dirty_sum NUMERIC(14,2) := 0;
  v_items JSONB := '[]'::jsonb;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Não autenticado.');
  END IF;

  WITH claimed_rows AS (
    UPDATE public.hc_wallet_inbox
    SET claimed = TRUE
    WHERE recipient_id = auth.uid() AND claimed = FALSE
    RETURNING id, sender_tag, kind, amount_clean, amount_dirty, note, created_at
  )
  SELECT
    COALESCE(SUM(amount_clean), 0),
    COALESCE(SUM(amount_dirty), 0),
    COALESCE(jsonb_agg(row_to_json(claimed_rows)), '[]'::jsonb)
  INTO v_clean_sum, v_dirty_sum, v_items
  FROM claimed_rows;

  IF v_clean_sum > 0 THEN
    UPDATE public.wallets
    SET balance = balance + v_clean_sum
    WHERE user_id = auth.uid();
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'clean_added', v_clean_sum,
    'dirty_added', v_dirty_sum,
    'items', v_items,
    'server_now', NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 7.2 Aplicar Impacto Global na Bolsa CyberStock c/ Circuit Breaker (Piso 30%, Teto 220%, 10m Cooldown)
CREATE OR REPLACE FUNCTION public.rpc_apply_global_stock_impact(
  p_symbol TEXT,
  p_delta_pct NUMERIC, -- ex: -0.18 para queda de 18%, +0.11 para defesa White-Hat
  p_actor_tag TEXT DEFAULT 'Operador'
) RETURNS JSONB AS $$
DECLARE
  v_row public.global_cyberstock_tickers%ROWTYPE;
  v_eff_delta NUMERIC;
  v_new_price NUMERIC(12,2);
  v_new_integrity NUMERIC(6,1);
  v_hist JSONB;
BEGIN
  SELECT * INTO v_row FROM public.global_cyberstock_tickers WHERE symbol = UPPER(p_symbol) FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Empresa inválida.');
  END IF;

  v_eff_delta := p_delta_pct;
  IF p_delta_pct < 0 THEN
    IF v_row.circuit_breaker_until IS NOT NULL AND v_row.circuit_breaker_until > NOW() THEN
      RETURN jsonb_build_object(
        'success', false,
        'code', 'CIRCUIT_BREAKER_ACTIVE',
        'price', v_row.price,
        'integrity', v_row.integrity,
        'message', 'Circuit Breaker ativo: negociação protegida temporariamente após quedas bruscas!'
      );
    END IF;

    IF v_row.last_drop_window_at IS NULL OR v_row.last_drop_window_at < (NOW() - INTERVAL '10 minutes') THEN
      v_row.recent_drops_count := 1;
      v_row.last_drop_window_at := NOW();
    ELSE
      v_row.recent_drops_count := v_row.recent_drops_count + 1;
      IF v_row.recent_drops_count = 2 THEN
        v_eff_delta := p_delta_pct * 0.50; -- 2ª queda em 10m amortecida em 50%!
      ELSIF v_row.recent_drops_count >= 3 THEN
        UPDATE public.global_cyberstock_tickers
        SET circuit_breaker_until = NOW() + INTERVAL '10 minutes',
            recent_drops_count = v_row.recent_drops_count
        WHERE symbol = v_row.symbol;
        RETURN jsonb_build_object(
          'success', false,
          'code', 'CIRCUIT_BREAKER_TRIGGERED',
          'price', v_row.price,
          'integrity', v_row.integrity,
          'message', '3º ataque seguido em 10 min disparou o Circuit Breaker da Bolsa!'
        );
      END IF;
    END IF;
  END IF;

  v_new_price := ROUND(GREATEST(v_row.base_price * 0.30, LEAST(v_row.base_price * 2.20, v_row.price * (1 + v_eff_delta))), 2);
  v_new_integrity := ROUND(GREATEST(20.0, LEAST(125.0, v_row.integrity + (v_eff_delta * 100))), 1);
  v_hist := (COALESCE(v_row.history_json, '[]'::jsonb) || to_jsonb(v_new_price));

  UPDATE public.global_cyberstock_tickers
  SET price = v_new_price,
      integrity = v_new_integrity,
      history_json = v_hist,
      recent_drops_count = v_row.recent_drops_count,
      last_drop_window_at = v_row.last_drop_window_at,
      last_actor_tag = p_actor_tag,
      updated_at = NOW()
  WHERE symbol = v_row.symbol;

  RETURN jsonb_build_object(
    'success', true,
    'symbol', v_row.symbol,
    'old_price', v_row.price,
    'new_price', v_new_price,
    'integrity', v_new_integrity
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 7.3 Dar Lance Atômico no Leilão de 2h c/ Estorno Instantâneo + Anti-Sniping (+30s, máx 5x)
CREATE OR REPLACE FUNCTION public.rpc_place_global_auction_bid(
  p_lot_bucket BIGINT,
  p_lot_code TEXT,
  p_origin TEXT,
  p_bid_clean NUMERIC,
  p_bidder_tag TEXT,
  p_tx_id TEXT
) RETURNS JSONB AS $$
DECLARE
  v_lot public.hc_seized_server_auctions%ROWTYPE;
  v_wallet_bal NUMERIC(14,2);
  v_prev_bidder UUID;
  v_prev_amount NUMERIC(14,2);
  v_snipe_added BOOLEAN := FALSE;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Não autenticado.');
  END IF;

  INSERT INTO public.hc_processed_tx_ids (tx_id, user_id) VALUES (p_tx_id, auth.uid())
  ON CONFLICT (tx_id) DO NOTHING;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'code', 'DUPLICATE_TX', 'message', 'Clique já processado.');
  END IF;

  INSERT INTO public.hc_seized_server_auctions (lot_bucket, lot_code, seized_origin, highest_bid_clean, highest_bidder_tag, expires_at)
  VALUES (p_lot_bucket, p_lot_code, p_origin, 8000, 'kr0n0s_apt', to_timestamp((p_lot_bucket + 1) * 7200))
  ON CONFLICT (lot_bucket) DO NOTHING;

  SELECT * INTO v_lot FROM public.hc_seized_server_auctions WHERE lot_bucket = p_lot_bucket FOR UPDATE;
  IF v_lot.resolved OR v_lot.expires_at <= NOW() THEN
    RETURN jsonb_build_object('success', false, 'code', 'AUCTION_CLOSED', 'message', 'Este leilão já encerrou!');
  END IF;
  IF v_lot.highest_bidder_id = auth.uid() THEN
    RETURN jsonb_build_object('success', false, 'code', 'SELF_OUTBID_BLOCKED', 'message', 'Você já detém o maior lance atual!');
  END IF;
  IF p_bid_clean < v_lot.highest_bid_clean + 1500 THEN
    RETURN jsonb_build_object('success', false, 'code', 'BID_TOO_LOW', 'min_required', v_lot.highest_bid_clean + 1500);
  END IF;

  SELECT balance INTO v_wallet_bal FROM public.wallets WHERE user_id = auth.uid() FOR UPDATE;
  IF v_wallet_bal < p_bid_clean THEN
    RETURN jsonb_build_object('success', false, 'code', 'INSUFFICIENT_CLEAN_FUNDS');
  END IF;

  UPDATE public.wallets SET balance = balance - p_bid_clean WHERE user_id = auth.uid();

  v_prev_bidder := v_lot.highest_bidder_id;
  v_prev_amount := v_lot.highest_bid_clean;
  IF v_prev_bidder IS NOT NULL THEN
    INSERT INTO public.hc_wallet_inbox (recipient_id, sender_id, sender_tag, kind, amount_clean, note)
    VALUES (
      v_prev_bidder,
      auth.uid(),
      p_bidder_tag,
      'AUCTION_OUTBID_REFUND',
      v_prev_amount,
      format('Seu lance no lote %s foi coberto por @%s — estorno integral!', v_lot.lot_code, p_bidder_tag)
    );
  END IF;

  -- Regra Anti-Sniping: faltando < 30s, prorroga +30s (máx 5 vezes)!
  IF v_lot.expires_at - NOW() < INTERVAL '30 seconds' AND v_lot.snipe_extensions < 5 THEN
    v_lot.expires_at := v_lot.expires_at + INTERVAL '30 seconds';
    v_lot.snipe_extensions := v_lot.snipe_extensions + 1;
    v_snipe_added := TRUE;
  END IF;

  UPDATE public.hc_seized_server_auctions
  SET highest_bid_clean = p_bid_clean,
      highest_bidder_id = auth.uid(),
      highest_bidder_tag = p_bidder_tag,
      expires_at = v_lot.expires_at,
      snipe_extensions = v_lot.snipe_extensions
  WHERE lot_bucket = p_lot_bucket;

  RETURN jsonb_build_object(
    'success', true,
    'highest_bid_clean', p_bid_clean,
    'expires_at', v_lot.expires_at,
    'snipe_extended', v_snipe_added
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 7.4 Compra Atômica de Licença de Vírus P2P (Zero Clonagem + Crédito via Inbox ao Criador)
CREATE OR REPLACE FUNCTION public.rpc_buy_p2p_license_atomic(
  p_license_id UUID,
  p_buyer_tag TEXT,
  p_tx_id TEXT
) RETURNS JSONB AS $$
DECLARE
  v_lic public.p2p_strain_licenses%ROWTYPE;
  v_bal NUMERIC(14,2);
  v_net_seller NUMERIC(14,2);
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Não autenticado.');
  END IF;

  INSERT INTO public.hc_processed_tx_ids (tx_id, user_id) VALUES (p_tx_id, auth.uid())
  ON CONFLICT (tx_id) DO NOTHING;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'code', 'DUPLICATE_TX');
  END IF;

  SELECT * INTO v_lic FROM public.p2p_strain_licenses WHERE id = p_license_id FOR UPDATE;
  IF NOT FOUND OR v_lic.sold_to_id IS NOT NULL THEN
    RETURN jsonb_build_object('success', false, 'code', 'ALREADY_SOLD', 'message', 'Outro jogador alugou este vírus 1 segundo antes — nada foi cobrado de você!');
  END IF;
  IF v_lic.seller_id = auth.uid() THEN
    RETURN jsonb_build_object('success', false, 'code', 'SELF_BUY_BLOCKED', 'message', 'Você não pode alugar seu próprio anúncio!');
  END IF;

  SELECT balance INTO v_bal FROM public.wallets WHERE user_id = auth.uid() FOR UPDATE;
  IF v_bal < v_lic.price_clean_usd THEN
    RETURN jsonb_build_object('success', false, 'code', 'INSUFFICIENT_CLEAN_FUNDS');
  END IF;

  UPDATE public.wallets SET balance = balance - v_lic.price_clean_usd WHERE user_id = auth.uid();

  UPDATE public.p2p_strain_licenses
  SET sold_to_id = auth.uid(),
      sold_at = NOW(),
      expires_at = NOW() + make_interval(hours => v_lic.duration_hours)
  WHERE id = p_license_id;

  v_net_seller := ROUND(v_lic.price_clean_usd * (1 - (v_lic.burn_tax_pct / 100.0)), 2);
  INSERT INTO public.hc_wallet_inbox (recipient_id, sender_id, sender_tag, kind, amount_clean, note)
  VALUES (
    v_lic.seller_id,
    auth.uid(),
    p_buyer_tag,
    'P2P_VIRUS_SALE',
    v_net_seller,
    format('@%s alugou seu vírus "%s" (%sh)!', p_buyer_tag, v_lic.strain_name, v_lic.duration_hours)
  );

  RETURN jsonb_build_object('success', true, 'license', row_to_json(v_lic), 'net_seller', v_net_seller);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
