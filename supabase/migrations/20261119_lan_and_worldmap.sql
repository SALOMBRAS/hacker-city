-- ==============================================================================
-- HACKER CITY // MIGRAÇÃO 20261119: FASE 3 — LAN, SERVIDORES & MAPA-MÚNDI
-- 1. Tabela user_servers (Datacenter próprio, VPS, Dedicados e Honeypot Isca)
-- 2. Tabela lan_topologies (Grafo de nós locais e pivoting)
-- 3. Tabela world_regions (50+ regiões globais e disputa de influência de clãs)
-- ==============================================================================

-- 1. TABELA DE SERVIDORES PRÓPRIOS
CREATE TABLE IF NOT EXISTS public.user_servers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  server_ip TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  server_type TEXT NOT NULL CHECK (server_type IN ('desktop', 'vps', 'dedicated', 'mainframe')),
  is_gateway BOOLEAN DEFAULT false,
  is_honeypot BOOLEAN DEFAULT false,
  specs JSONB NOT NULL DEFAULT '{"cpuMhz": 2400, "netMbps": 100, "hddMb": 1024, "ramMb": 512}'::jsonb,
  firewall_ver NUMERIC DEFAULT 2.0 CHECK (firewall_ver BETWEEN 1.0 AND 10.0),
  services JSONB DEFAULT '["ssh", "mining"]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_servers_user_id ON public.user_servers (user_id);

-- 2. TABELA DE TOPOLOGIA DE REDE LOCAL (LAN)
CREATE TABLE IF NOT EXISTS public.lan_topologies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE,
  gateway_ip TEXT NOT NULL,
  nodes JSONB NOT NULL DEFAULT '[]'::jsonb,
  edges JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. TABELA DE REGIÕES GLOBAIS E GUERRA TERRITORIAL
CREATE TABLE IF NOT EXISTS public.world_regions (
  region_code VARCHAR(8) PRIMARY KEY,
  city_name TEXT NOT NULL,
  country_name TEXT NOT NULL,
  lat FLOAT NOT NULL,
  lng FLOAT NOT NULL,
  backbone_isp TEXT NOT NULL,
  controlling_clan_tag TEXT,
  influence_points BIGINT DEFAULT 0 CHECK (influence_points >= 0),
  regional_perk JSONB NOT NULL DEFAULT '{"type": "bandwidth_boost", "value": 0.15}'::jsonb,
  last_contested_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_world_regions_clan ON public.world_regions (controlling_clan_tag);

-- Habilita RLS
ALTER TABLE public.user_servers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lan_topologies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.world_regions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir leitura de servidores" ON public.user_servers;
CREATE POLICY "Permitir leitura de servidores" ON public.user_servers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir escrita de servidores" ON public.user_servers;
CREATE POLICY "Permitir escrita de servidores" ON public.user_servers FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir leitura de topologias LAN" ON public.lan_topologies;
CREATE POLICY "Permitir leitura de topologias LAN" ON public.lan_topologies FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir leitura de regioes globais" ON public.world_regions;
CREATE POLICY "Permitir leitura de regioes globais" ON public.world_regions FOR SELECT USING (true);

-- Popula regiões iniciais se tabela vazia
INSERT INTO public.world_regions (region_code, city_name, country_name, lat, lng, backbone_isp, controlling_clan_tag, influence_points, regional_perk)
VALUES
  ('SAO', 'São Paulo', 'Brasil', -23.5505, -46.6333, 'NIC.br / IX.br PTT', 'ZERO', 14200, '{"type": "tax_discount", "value": 0.05}'),
  ('FRA', 'Frankfurt', 'Alemanha', 50.1109, 8.6821, 'DE-CIX Backbone', 'RED', 28500, '{"type": "bandwidth_boost", "value": 0.20}'),
  ('REK', 'Reykjavik', 'Islândia', 64.1466, -21.9426, 'Thor Data Center Dark Vault', 'ANON', 34000, '{"type": "offshore_secrecy", "value": 0.35}'),
  ('TYO', 'Tóquio', 'Japão', 35.6762, 139.6503, 'NTT Communications IXP', 'CYBER', 19800, '{"type": "cracking_speed", "value": 0.25}'),
  ('NYC', 'Nova York', 'Estados Unidos', 40.7128, -74.0060, 'Equinix NY4 Secaucus', 'CORP', 41200, '{"type": "bounty_multiplier", "value": 0.15}'),
  ('SIN', 'Singapura', 'Singapura', 1.3521, 103.8198, 'SingTel Mega-POP Hub', 'VOID', 22100, '{"type": "mining_efficiency", "value": 0.30}')
ON CONFLICT (region_code) DO NOTHING;

-- 4. RPC: DEFINIR GATEWAY DE ENTRADA
CREATE OR REPLACE FUNCTION public.set_player_gateway_server(
  p_user_id UUID,
  p_server_ip TEXT
) RETURNS JSONB AS $$
BEGIN
  -- Reseta gateway atual
  UPDATE public.user_servers
  SET is_gateway = false
  WHERE user_id = p_user_id;

  -- Define novo gateway
  UPDATE public.user_servers
  SET is_gateway = true
  WHERE user_id = p_user_id AND server_ip = p_server_ip;

  UPDATE public.lan_topologies
  SET gateway_ip = p_server_ip, updated_at = now()
  WHERE user_id = p_user_id;

  RETURN jsonb_build_object('success', true, 'new_gateway_ip', p_server_ip);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.set_player_gateway_server TO anon, authenticated;

-- 5. RPC: INJETAR INFLUÊNCIA TERRITORIAL DE CLÃ
CREATE OR REPLACE FUNCTION public.inject_clan_territory_influence(
  p_region_code TEXT,
  p_clan_tag TEXT,
  p_points INT
) RETURNS JSONB AS $$
DECLARE
  v_rec RECORD;
  v_new_points BIGINT;
BEGIN
  SELECT * INTO v_rec FROM public.world_regions WHERE region_code = p_region_code;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Região geográfica não encontrada.');
  END IF;

  v_new_points := v_rec.influence_points + p_points;

  UPDATE public.world_regions
  SET influence_points = v_new_points,
      controlling_clan_tag = CASE WHEN p_points >= 2500 THEN p_clan_tag ELSE controlling_clan_tag END,
      last_contested_at = now()
  WHERE region_code = p_region_code;

  RETURN jsonb_build_object(
    'success', true,
    'region_code', p_region_code,
    'total_influence', v_new_points,
    'dominant_clan', CASE WHEN p_points >= 2500 THEN p_clan_tag ELSE v_rec.controlling_clan_tag END
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.inject_clan_territory_influence TO anon, authenticated;
