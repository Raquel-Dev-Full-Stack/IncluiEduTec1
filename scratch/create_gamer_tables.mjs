/**
 * IncluiGamer — Referência de Criação de Tabelas SQL e RLS do Supabase
 * 
 * Este arquivo documenta a estrutura exata das tabelas do Supabase
 * criadas para suportar o módulo IncluiGamer com políticas de multi-tenancy (RLS).
 * 
 * Você pode copiar e executar este script SQL diretamente no painel "SQL Editor" do seu Supabase.
 */

const SQL_MIGRATION = `
-- =====================================================================
-- 1. TABELA DE COMPATIBILIDADE E MAPEAMENTO DA BNCC (GAME_BNCC_MAPPING)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.game_bncc_mapping (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id VARCHAR(100) NOT NULL,
    faixa_etaria VARCHAR(50) NOT NULL, -- '0-1.5', '1.5-3', '4-5', 'fundamental_iniciais', 'fundamental_finais'
    etapa_ensino VARCHAR(100) NOT NULL, -- 'Educação Infantil', 'Ensino Fundamental I', 'Ensino Fundamental II'
    habilidade_bncc VARCHAR(50) NOT NULL,
    descricao_bncc TEXT NOT NULL,
    campo_experiencia VARCHAR(255), -- Educação Infantil (opcional)
    subject VARCHAR(255), -- Ensino Fundamental (opcional)
    eixo_cognitivo VARCHAR(100) NOT NULL, -- 'Alfabetização', 'Raciocínio Lógico', 'Socioemocional', etc.
    nivel_dificuldade VARCHAR(50) NOT NULL, -- 'Fácil', 'Médio', 'Difícil', 'Adaptativo'
    tags_pedagogicas TEXT[] DEFAULT '{}'::text[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(game_id, habilidade_bncc)
);

-- =====================================================================
-- 2. TABELA DE PROGRESSO DO ALUNO (GAME_PROGRESS)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.game_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    game_id VARCHAR(100) NOT NULL,
    current_level INT DEFAULT 1 NOT NULL,
    stars_earned INT DEFAULT 0 NOT NULL,
    completed BOOLEAN DEFAULT false NOT NULL,
    last_played_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    municipio_id UUID NOT NULL, -- FK Multi-Tenant implícita
    school_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(student_id, game_id)
);

-- Habilitar RLS
ALTER TABLE public.game_progress ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS Multi-Tenant para game_progress
CREATE POLICY "Permitir leitura de progresso por municipio" ON public.game_progress
    FOR SELECT TO authenticated
    USING (municipio_id = (auth.jwt() -> 'user_metadata' ->> 'municipio_id')::uuid);

CREATE POLICY "Permitir escrita de progresso por municipio" ON public.game_progress
    FOR ALL TO authenticated
    USING (municipio_id = (auth.jwt() -> 'user_metadata' ->> 'municipio_id')::uuid)
    WITH CHECK (municipio_id = (auth.jwt() -> 'user_metadata' ->> 'municipio_id')::uuid);

-- =====================================================================
-- 3. TABELA DE LOGS DE COMPORTAMENTO EM TEMPO REAL (PLAYER_BEHAVIOR_LOGS)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.player_behavior_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    game_id VARCHAR(100) NOT NULL,
    session_id UUID NOT NULL,
    event_type VARCHAR(100) NOT NULL, -- 'clique', 'erro', 'acerto', 'sessao_concluida'
    event_data JSONB DEFAULT '{}'::jsonb NOT NULL, -- Tempo de resposta, etc.
    created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE SET NULL,
    municipio_id UUID NOT NULL,
    school_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.player_behavior_logs ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS Multi-Tenant para player_behavior_logs
CREATE POLICY "Permitir leitura de logs por municipio" ON public.player_behavior_logs
    FOR SELECT TO authenticated
    USING (municipio_id = (auth.jwt() -> 'user_metadata' ->> 'municipio_id')::uuid);

CREATE POLICY "Permitir inserção de logs por municipio" ON public.player_behavior_logs
    FOR INSERT TO authenticated
    WITH CHECK (municipio_id = (auth.jwt() -> 'user_metadata' ->> 'municipio_id')::uuid);

-- =====================================================================
-- 4. TABELA DE Analytics E SCORES COGNITIVOS (COGNITIVE_SCORES)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.cognitive_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID UNIQUE NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    foco INT DEFAULT 50 NOT NULL,
    autonomia INT DEFAULT 50 NOT NULL,
    emocional INT DEFAULT 50 NOT NULL,
    coordenacao INT DEFAULT 50 NOT NULL,
    engajamento INT DEFAULT 50 NOT NULL,
    desenvolvimento_pedagogico INT DEFAULT 0 NOT NULL,
    total_play_time INT DEFAULT 0 NOT NULL, -- Segundos acumulados
    skills_developed JSONB DEFAULT '[]'::jsonb NOT NULL, -- Habilidades BNCC desenvolvidas
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    municipio_id UUID NOT NULL,
    school_id UUID NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.cognitive_scores ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS Multi-Tenant para cognitive_scores
CREATE POLICY "Permitir leitura de scores por municipio" ON public.cognitive_scores
    FOR SELECT TO authenticated
    USING (municipio_id = (auth.jwt() -> 'user_metadata' ->> 'municipio_id')::uuid);

CREATE POLICY "Permitir escrita de scores por municipio" ON public.cognitive_scores
    FOR ALL TO authenticated
    USING (municipio_id = (auth.jwt() -> 'user_metadata' ->> 'municipio_id')::uuid)
    WITH CHECK (municipio_id = (auth.jwt() -> 'user_metadata' ->> 'municipio_id')::uuid);

-- =====================================================================
-- 5. CRIAÇÃO DE ÍNDICES PARA ALTA PERFORMANCE
-- =====================================================================
CREATE INDEX IF NOT EXISTS idx_game_progress_student ON public.game_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_behavior_logs_student ON public.player_behavior_logs(student_id);
CREATE INDEX IF NOT EXISTS idx_behavior_logs_session ON public.player_behavior_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_cognitive_scores_student ON public.cognitive_scores(student_id);
`;

console.log("==========================================================================");
console.log("IncluiGamer — Script de Referência de Criação de Tabelas SQL e RLS");
console.log("==========================================================================");
console.log("O SQL a seguir descreve a estrutura exata a ser criada no painel Supabase:");
console.log(SQL_MIGRATION);
console.log("==========================================================================");
console.log("Script finalizado. Você pode copiar as consultas acima para o seu Supabase.");
