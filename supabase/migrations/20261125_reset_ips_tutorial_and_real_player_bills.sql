-- ============================================================================
-- Migration: 20261125_reset_ips_tutorial_and_real_player_bills.sql
-- Objetivo:
--   1. Rotacionar 100% dos IPs públicos e senhas root de todos os jogadores reais
--   2. Reiniciar o Tutorial / Tour Guiado do zero para todos os jogadores reais
--   3. Zerar todas as despesas pendentes (Quitinete) de todos os jogadores reais
--   4. Limpar beacons antigos de diretório (hc_dir) com IPs obsoletos
-- ============================================================================

DO $$
DECLARE
  v_now_ms BIGINT := (EXTRACT(EPOCH FROM clock_timestamp()) * 1000)::BIGINT;
  r RECORD;
  v_o1 INT;
  v_new_ip TEXT;
  v_new_pwd TEXT;
  v_reserved INT[] := ARRAY[0,10,33,71,77,100,109,127,133,155,169,172,185,192,194,198,203,224,240,255];
BEGIN
  -- 1. Rotacionar todos os perfis em public.profiles
  FOR r IN SELECT id FROM public.profiles LOOP
    LOOP
      v_o1 := 14 + floor(random() * 205)::INT;
      EXIT WHEN NOT (v_o1 = ANY(v_reserved));
    END LOOP;
    v_new_ip := v_o1 || '.' || (11 + floor(random() * 240)::INT) || '.' || (11 + floor(random() * 240)::INT) || '.' || (12 + floor(random() * 240)::INT);
    v_new_pwd := substr(md5(random()::TEXT || clock_timestamp()::TEXT), 1, 8);

    UPDATE public.profiles
    SET public_ip = v_new_ip,
        root_password = v_new_pwd,
        ip_resets_count = 0,
        last_free_ip_reset_at = NULL,
        tutorial_step = 1,
        tutorial_completed = FALSE,
        updated_at = NOW()
    WHERE id = r.id;

    -- Sincronizar player_cloud_saves correspondente (por user_id ou operator_key)
    UPDATE public.player_cloud_saves
    SET public_ip = v_new_ip,
        billing_paused = FALSE,
        public_syslog = '[]'::JSONB,
        save_payload = CASE
          WHEN save_payload IS NOT NULL AND jsonb_typeof(save_payload) = 'object' THEN
            jsonb_set(
              jsonb_set(
                jsonb_set(
                  jsonb_set(
                    jsonb_set(
                      jsonb_set(save_payload, '{resetEpoch}', '"20261125_v2"'::JSONB, TRUE),
                      '{netId}',
                      jsonb_build_object(
                        'publicIp', v_new_ip,
                        'rootPassword', v_new_pwd,
                        'pwdEpoch', 2,
                        'resetsCount', 0,
                        'lastFreeResetAt', NULL,
                        'history', '[]'::JSONB
                      ),
                      TRUE
                    ),
                    '{tour}',
                    '{"done": null, "rewarded": null}'::JSONB,
                    TRUE
                  ),
                  '{tut}',
                  '{"step": 1, "completed": false, "hostHacked": false, "fileExtracted": false, "virusPlanted": false, "logsCleaned": false}'::JSONB,
                  TRUE
                ),
                '{billsPaid}',
                '{"power": true, "internet": true, "rent": true, "water": true}'::JSONB,
                TRUE
              ),
              '{quitineteBilling}',
              jsonb_build_object(
                'cycle', jsonb_build_object(
                  'lastEvalMs', v_now_ms,
                  'isPaused', FALSE,
                  'pausedAtMs', NULL,
                  'wasPausedWhileAway', FALSE,
                  'lastPlayerLoginMs', v_now_ms
                ),
                'months', '{"power": 0, "internet": 0, "rent": 0, "water": 0}'::JSONB
              ),
              TRUE
            )
          ELSE save_payload
        END,
        updated_at = NOW()
    WHERE user_id = r.id OR operator_key = r.id::TEXT;

    -- Sincronizar também auth.users raw_user_meta_data->hc_save_v2 se existir
    UPDATE auth.users
    SET raw_user_meta_data = jsonb_set(
      raw_user_meta_data,
      '{hc_save_v2}',
      jsonb_set(
        jsonb_set(
          jsonb_set(
            jsonb_set(
              jsonb_set(
                jsonb_set(raw_user_meta_data->'hc_save_v2', '{resetEpoch}', '"20261125_v2"'::JSONB, TRUE),
                '{netId}',
                jsonb_build_object(
                  'publicIp', v_new_ip,
                  'rootPassword', v_new_pwd,
                  'pwdEpoch', 2,
                  'resetsCount', 0,
                  'lastFreeResetAt', NULL,
                  'history', '[]'::JSONB
                ),
                TRUE
              ),
              '{tour}',
              '{"done": null, "rewarded": null}'::JSONB,
              TRUE
            ),
            '{tut}',
            '{"step": 1, "completed": false, "hostHacked": false, "fileExtracted": false, "virusPlanted": false, "logsCleaned": false}'::JSONB,
            TRUE
          ),
          '{billsPaid}',
          '{"power": true, "internet": true, "rent": true, "water": true}'::JSONB,
          TRUE
        ),
        '{quitineteBilling}',
        jsonb_build_object(
          'cycle', jsonb_build_object(
            'lastEvalMs', v_now_ms,
            'isPaused', FALSE,
            'pausedAtMs', NULL,
            'wasPausedWhileAway', FALSE,
            'lastPlayerLoginMs', v_now_ms
          ),
          'months', '{"power": 0, "internet": 0, "rent": 0, "water": 0}'::JSONB
        ),
        TRUE
      ),
      TRUE
    )
    WHERE id = r.id
      AND raw_user_meta_data IS NOT NULL
      AND raw_user_meta_data ? 'hc_save_v2'
      AND jsonb_typeof(raw_user_meta_data->'hc_save_v2') = 'object';
  END LOOP;

  -- 2. Rotacionar também saves 1-Clique em player_cloud_saves sem linha em profiles
  FOR r IN SELECT operator_key FROM public.player_cloud_saves WHERE user_id IS NULL LOOP
    LOOP
      v_o1 := 14 + floor(random() * 205)::INT;
      EXIT WHEN NOT (v_o1 = ANY(v_reserved));
    END LOOP;
    v_new_ip := v_o1 || '.' || (11 + floor(random() * 240)::INT) || '.' || (11 + floor(random() * 240)::INT) || '.' || (12 + floor(random() * 240)::INT);
    v_new_pwd := substr(md5(random()::TEXT || clock_timestamp()::TEXT), 1, 8);

    UPDATE public.player_cloud_saves
    SET public_ip = v_new_ip,
        billing_paused = FALSE,
        public_syslog = '[]'::JSONB,
        save_payload = CASE
          WHEN save_payload IS NOT NULL AND jsonb_typeof(save_payload) = 'object' THEN
            jsonb_set(
              jsonb_set(
                jsonb_set(
                  jsonb_set(
                    jsonb_set(
                      jsonb_set(save_payload, '{resetEpoch}', '"20261125_v2"'::JSONB, TRUE),
                      '{netId}',
                      jsonb_build_object('publicIp', v_new_ip, 'rootPassword', v_new_pwd, 'pwdEpoch', 2, 'resetsCount', 0, 'lastFreeResetAt', NULL, 'history', '[]'::JSONB),
                      TRUE
                    ),
                    '{tour}', '{"done": null, "rewarded": null}'::JSONB, TRUE
                  ),
                  '{tut}', '{"step": 1, "completed": false, "hostHacked": false, "fileExtracted": false, "virusPlanted": false, "logsCleaned": false}'::JSONB, TRUE
                ),
                '{billsPaid}', '{"power": true, "internet": true, "rent": true, "water": true}'::JSONB, TRUE
              ),
              '{quitineteBilling}',
              jsonb_build_object(
                'cycle', jsonb_build_object('lastEvalMs', v_now_ms, 'isPaused', FALSE, 'pausedAtMs', NULL, 'wasPausedWhileAway', FALSE, 'lastPlayerLoginMs', v_now_ms),
                'months', '{"power": 0, "internet": 0, "rent": 0, "water": 0}'::JSONB
              ),
              TRUE
            )
          ELSE save_payload
        END,
        updated_at = NOW()
    WHERE operator_key = r.operator_key;
  END LOOP;

  -- 3. Limpar beacons internos hc_dir antigos (que continham IPs obsoletos)
  DELETE FROM public.chat_messages WHERE channel = 'hc_dir';
END $$;
