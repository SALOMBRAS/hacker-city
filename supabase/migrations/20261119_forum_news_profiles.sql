-- =========================================================================
-- MIGRAÇÃO HACKER CITY // PILAR 7: DARKNET FÓRUM, THE CYBER CHRONICLE & PERFIL PÚBLICO
-- =========================================================================

-- 1. Fórum da Darknet (Tópicos e Respostas)
CREATE TABLE IF NOT EXISTS public.darknet_forum_threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    author_tag TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'geral' CHECK (category IN ('geral', 'exploits', 'recrutamento', 'farpas', 'mercado')),
    title TEXT NOT NULL,
    pinned BOOLEAN DEFAULT FALSE,
    locked BOOLEAN DEFAULT FALSE,
    view_count INT DEFAULT 1,
    upvotes INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.darknet_forum_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID NOT NULL REFERENCES public.darknet_forum_threads(id) ON DELETE CASCADE,
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    author_tag TEXT NOT NULL,
    content TEXT NOT NULL,
    upvotes INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Jornal The Cyber Chronicle (Notícias dinâmicas geradas pelo metagame)
CREATE TABLE IF NOT EXISTS public.cyber_chronicle_news (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    edition_date DATE DEFAULT CURRENT_DATE,
    headline TEXT NOT NULL,
    lead_paragraph TEXT NOT NULL,
    body_text TEXT NOT NULL,
    category TEXT DEFAULT 'manchete' CHECK (category IN ('manchete', 'crime', 'mercado', 'territorios', 'fbi')),
    related_actor TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Índices para performance
CREATE INDEX IF NOT EXISTS idx_forum_threads_category ON public.darknet_forum_threads(category, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_posts_thread_id ON public.darknet_forum_posts(thread_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_cyber_news_edition ON public.cyber_chronicle_news(edition_date DESC, created_at DESC);

-- 4. RLS (Row Level Security)
ALTER TABLE public.darknet_forum_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.darknet_forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cyber_chronicle_news ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leitura pública de tópicos do fórum"
    ON public.darknet_forum_threads FOR SELECT
    USING (true);

CREATE POLICY "Criação de tópicos para usuários autenticados"
    ON public.darknet_forum_threads FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Leitura pública de posts do fórum"
    ON public.darknet_forum_posts FOR SELECT
    USING (true);

CREATE POLICY "Criação de posts para usuários autenticados"
    ON public.darknet_forum_posts FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Leitura pública do jornal Cyber Chronicle"
    ON public.cyber_chronicle_news FOR SELECT
    USING (true);

-- 5. RPC: Obter Perfil Público de Jogador por Tag ou ID
CREATE OR REPLACE FUNCTION public.get_public_player_profile(p_target TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_profile RECORD;
    v_clan TEXT;
    v_bounties_count INT;
    v_result JSONB;
BEGIN
    -- Busca por UUID ou por Hacker Tag
    SELECT p.id, p.hacker_tag, p.specialty, p.reputation, p.heat_level, p.created_at
    INTO v_profile
    FROM public.profiles p
    WHERE p.id::text = p_target OR LOWER(p.hacker_tag) = LOWER(p_target)
    LIMIT 1;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Operador não encontrado na rede.');
    END IF;

    -- Busca clã
    SELECT c.name INTO v_clan
    FROM public.clans c
    JOIN public.clan_members cm ON cm.clan_id = c.id
    WHERE cm.user_id = v_profile.id
    LIMIT 1;

    -- Bounties abertas
    SELECT COUNT(*) INTO v_bounties_count
    FROM public.bounties b
    WHERE LOWER(b.target_tag) = LOWER(v_profile.hacker_tag) AND b.claimed = false;

    v_result := jsonb_build_object(
        'success', true,
        'user_id', v_profile.id,
        'hacker_tag', v_profile.hacker_tag,
        'specialty', COALESCE(v_profile.specialty, 'exploiter'),
        'reputation', COALESCE(v_profile.reputation, 0),
        'heat_level', COALESCE(v_profile.heat_level, 0),
        'clan', COALESCE(v_clan, 'Lobo Solitário'),
        'active_bounties', v_bounties_count,
        'member_since', v_profile.created_at
    );

    RETURN v_result;
END;
$$;
