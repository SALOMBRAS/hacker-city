-- Limite Semanal de 3 IPs Comprados + Valor Escalonado ($ 2.500 -> $ 10.000 -> $ 35.000) + Reset na Virada da Semana
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS ip_week_key TEXT,
  ADD COLUMN IF NOT EXISTS ip_weekly_paid_count INTEGER NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION public.reset_player_ip(
  p_force_paid BOOLEAN DEFAULT true
) RETURNS JSONB AS $$
DECLARE
  v_prof public.profiles%ROWTYPE;
  v_wallet public.wallets%ROWTYPE;
  v_next_week TIMESTAMPTZ := date_trunc('week', now()) + INTERVAL '7 days';
  v_week_key TEXT := to_char(date_trunc('week', now()) AT TIME ZONE 'UTC', 'YYYY-MM-DD');
  v_used INT := 0;
  v_cost NUMERIC(12,2) := 2500;
  v_old_ip TEXT;
  v_new_ip TEXT;
BEGIN
  SELECT * INTO v_prof FROM public.profiles WHERE id = auth.uid() FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Perfil não autenticado.');
  END IF;

  v_old_ip := v_prof.public_ip;
  IF v_prof.ip_week_key = v_week_key THEN
    v_used := COALESCE(v_prof.ip_weekly_paid_count, 0);
  ELSE
    v_used := 0;
  END IF;

  IF v_used >= 3 THEN
    RETURN jsonb_build_object('success', false, 'code', 'WEEKLY_LIMIT_REACHED', 'used_this_week', v_used, 'max_per_week', 3, 'next_week_at', v_next_week, 'message', 'Limite semanal atingido (3/3 IPs comprados nesta semana)! O limite e o valor só voltam ao inicial quando virar a semana.');
  END IF;

  v_cost := CASE v_used WHEN 0 THEN 2500 WHEN 1 THEN 10000 ELSE 35000 END;

  SELECT * INTO v_wallet FROM public.wallets WHERE user_id = auth.uid() FOR UPDATE;
  IF v_wallet.balance < v_cost THEN
    RETURN jsonb_build_object('success', false, 'code', 'INSUFFICIENT_FUNDS', 'required_cost', v_cost, 'used_this_week', v_used, 'message', 'Saldo insuficiente para comprar novo IP ($ ' || v_cost || ' HC — compra ' || (v_used + 1) || '/3 da semana).');
  END IF;

  UPDATE public.wallets SET balance = balance - v_cost WHERE id = v_wallet.id;
  INSERT INTO public.transactions (from_account, to_account, amount, description, tx_type)
  VALUES (v_wallet.account_number, 'HC-TELECOM-ISP', v_cost, 'Compra Semanal Escalonada de IP (' || (v_used + 1) || '/3)', 'isp_reset');

  v_new_ip := public.generate_unique_public_ip();

  UPDATE public.profiles
  SET public_ip = v_new_ip,
      ip_resets_count = COALESCE(ip_resets_count, 0) + 1,
      ip_week_key = v_week_key,
      ip_weekly_paid_count = v_used + 1,
      reputation = reputation + 50,
      updated_at = now()
  WHERE id = auth.uid();

  IF v_old_ip IS NOT NULL THEN
    DELETE FROM public.hacked_hosts WHERE target_ip = v_old_ip AND owner_id <> auth.uid();
  END IF;

  RETURN jsonb_build_object('success', true, 'was_free', false, 'cost', v_cost, 'used_this_week', v_used + 1, 'max_per_week', 3, 'week_key', v_week_key, 'next_week_at', v_next_week, 'old_ip', v_old_ip, 'new_ip', v_new_ip, 'rep_gain', 50, 'new_balance', (v_wallet.balance - v_cost));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
