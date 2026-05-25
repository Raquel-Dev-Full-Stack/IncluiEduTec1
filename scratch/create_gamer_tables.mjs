/**
 * IncluiGamer — Referência de Criação de Tabelas SQL e RLS do Supabase (Versão Definitiva)
 * 
 * Este arquivo documenta a estrutura exata das tabelas do Supabase
 * criadas para suportar a persistência completa do módulo IncluiGamer com RLS multi-tenant.
 * 
 * Você pode copiar e executar este script SQL diretamente no painel "SQL Editor" do seu Supabase.
 */

const SQL_MIGRATION = `
-- =====================================================================
-- 1. TABELA PEDAGÓGICA DA BNCC (GAME_BNCC_MAPPING)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.game_bncc_mapping (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id VARCHAR(100) NOT NULL,
    game_name VARCHAR(255) NOT NULL,
    age_group VARCHAR(50) NOT NULL, -- '0-3', '4-5', '6-8', '9-12', '13+'
    bncc_code VARCHAR(50) NOT NULL,
    bncc_description TEXT NOT NULL,
    learning_axis VARCHAR(255) NOT NULL, -- 'Alfabetização', 'Raciocínio Lógico', etc.
    field_of_experience VARCHAR(255) NOT NULL,
    difficulty_level VARCHAR(50) NOT NULL, -- 'Fácil', 'Médio', 'Difícil'
    disability_type VARCHAR(100), -- Tipo de deficiência (opcional, ex: 'TEA', 'TDAH')
    cognitive_goal TEXT,
    sensory_goal TEXT,
    motor_goal TEXT,
    emotional_goal TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS e permitir leitura para todos os usuários autenticados da rede
ALTER TABLE public.game_bncc_mapping ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura da BNCC por usuários autenticados" ON public.game_bncc_mapping
    FOR SELECT TO authenticated USING (true);

-- =====================================================================
-- 2. TABELA DE PROGRESSÃO E NÍVEIS (GAME_PROGRESSION)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.game_progression (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    game_id VARCHAR(100) NOT NULL,
    current_level INT DEFAULT 1 NOT NULL,
    max_level INT DEFAULT 3 NOT NULL,
    xp_total INT DEFAULT 0 NOT NULL,
    stars INT DEFAULT 0 NOT NULL,
    unlocked_worlds VARCHAR(255)[] DEFAULT '{}'::varchar[],
    last_played_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    municipio_id UUID NOT NULL, -- FK Multi-Tenant
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(student_id, game_id)
);

-- Habilitar RLS
ALTER TABLE public.game_progression ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS Multi-Tenant para game_progression
CREATE POLICY "Permitir leitura de progresso por municipio" ON public.game_progression
    FOR SELECT TO authenticated
    USING (municipio_id = (auth.jwt() -> 'user_metadata' ->> 'municipio_id')::uuid);

CREATE POLICY "Permitir escrita de progresso por municipio" ON public.game_progression
    FOR ALL TO authenticated
    USING (municipio_id = (auth.jwt() -> 'user_metadata' ->> 'municipio_id')::uuid)
    WITH CHECK (municipio_id = (auth.jwt() -> 'user_metadata' ->> 'municipio_id')::uuid);

-- =====================================================================
-- 3. TABELA HISTÓRICO DE JOGOS (GAME_SESSIONS)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.game_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES public.users(id) ON DELETE SET NULL,
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE SET NULL,
    game_id VARCHAR(100) NOT NULL,
    game_name VARCHAR(255) NOT NULL,
    game_category VARCHAR(100) NOT NULL, -- ex: 'alfabetizacao', 'sensorial'
    started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    finished_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    duration_seconds INT NOT NULL,
    score INT DEFAULT 0 NOT NULL,
    xp_earned INT DEFAULT 0 NOT NULL,
    level_reached INT DEFAULT 1 NOT NULL,
    cognitive_score INT DEFAULT 50 NOT NULL,
    emotional_score INT DEFAULT 50 NOT NULL,
    engagement_score INT DEFAULT 50 NOT NULL,
    focus_score INT DEFAULT 50 NOT NULL,
    frustration_score INT DEFAULT 50 NOT NULL,
    completed BOOLEAN DEFAULT false NOT NULL,
    municipio_id UUID NOT NULL, -- FK Multi-Tenant
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS Multi-Tenant para game_sessions
CREATE POLICY "Permitir leitura de sessoes por municipio" ON public.game_sessions
    FOR SELECT TO authenticated
    USING (municipio_id = (auth.jwt() -> 'user_metadata' ->> 'municipio_id')::uuid);

CREATE POLICY "Permitir inserção de sessoes por municipio" ON public.game_sessions
    FOR INSERT TO authenticated
    WITH CHECK (municipio_id = (auth.jwt() -> 'user_metadata' ->> 'municipio_id')::uuid);

-- =====================================================================
-- 4. TABELA DE PERFIL COGNITIVO PRÉ-JOGO (GAMER_PRE_PROFILES)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.gamer_pre_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES public.users(id) ON DELETE SET NULL,
    session_id UUID, -- Opcional
    is_verbal BOOLEAN NOT NULL,
    uses_aac BOOLEAN NOT NULL,
    understands_commands_level INT NOT NULL, -- 1 a 5
    echolalia BOOLEAN NOT NULL,
    sound_sensitivity BOOLEAN NOT NULL,
    visual_sensitivity BOOLEAN NOT NULL,
    stimulus_tolerance INT NOT NULL, -- 1 a 5
    fine_motor_level INT NOT NULL, -- 1 a 5
    input_preference VARCHAR(100) NOT NULL, -- 'mouse', 'touchscreen'
    knows_letters BOOLEAN NOT NULL,
    knows_numbers BOOLEAN NOT NULL,
    knows_shapes BOOLEAN NOT NULL,
    knows_colors BOOLEAN NOT NULL,
    logical_association BOOLEAN NOT NULL,
    focus_minutes INT NOT NULL, -- 1 a 15
    frustration_level VARCHAR(100) NOT NULL, -- 'alta', 'baixa' ou 'media'
    needs_positive_reinforcement BOOLEAN NOT NULL,
    autonomy_level INT NOT NULL, -- 1 a 5
    municipio_id UUID NOT NULL, -- FK Multi-Tenant
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.gamer_pre_profiles ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS Multi-Tenant para gamer_pre_profiles
CREATE POLICY "Permitir leitura de perfis por municipio" ON public.gamer_pre_profiles
    FOR SELECT TO authenticated
    USING (municipio_id = (auth.jwt() -> 'user_metadata' ->> 'municipio_id')::uuid);

CREATE POLICY "Permitir escrita de perfis por municipio" ON public.gamer_pre_profiles
    FOR ALL TO authenticated
    USING (municipio_id = (auth.jwt() -> 'user_metadata' ->> 'municipio_id')::uuid)
    WITH CHECK (municipio_id = (auth.jwt() -> 'user_metadata' ->> 'municipio_id')::uuid);

-- =====================================================================
-- 5. TABELA DE LOGS DO MOTOR ADAPTATIVO (ADAPTIVE_ENGINE_LOGS)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.adaptive_engine_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    session_id UUID NOT NULL,
    decision_type VARCHAR(100) NOT NULL, -- 'reduzir_opcoes', 'aumentar_alvo', 'reforco_positivo'
    previous_state JSONB NOT NULL,
    new_state JSONB NOT NULL,
    reason TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.adaptive_engine_logs ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS Multi-Tenant para logs (vinculados ao estudante cadastrado)
CREATE POLICY "Permitir leitura de logs do motor adaptativo por municipio" ON public.adaptive_engine_logs
    FOR SELECT TO authenticated
    USING (
        student_id IN (
            SELECT id FROM public.students 
            WHERE municipio_id = (auth.jwt() -> 'user_metadata' ->> 'municipio_id')::uuid
        )
    );

CREATE POLICY "Permitir inserção de logs do motor adaptativo por municipio" ON public.adaptive_engine_logs
    FOR INSERT TO authenticated
    WITH CHECK (
        student_id IN (
            SELECT id FROM public.students 
            WHERE municipio_id = (auth.jwt() -> 'user_metadata' ->> 'municipio_id')::uuid
        )
    );

-- =====================================================================
-- 6. CRIAÇÃO DE ÍNDICES DE ALTA PERFORMANCE
-- =====================================================================
CREATE INDEX IF NOT EXISTS idx_game_progression_student ON public.game_progression(student_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_student ON public.game_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_gamer_pre_profiles_student ON public.gamer_pre_profiles(student_id);
CREATE INDEX IF NOT EXISTS idx_adaptive_logs_student ON public.adaptive_engine_logs(student_id);
`;

console.log("==========================================================================");
console.log("IncluiGamer — Script Definitivo de Criação de Tabelas SQL e RLS");
console.log("==========================================================================");
console.log("O SQL a seguir descreve a estrutura a ser criada no painel Supabase:");
console.log(SQL_MIGRATION);
console.log("==========================================================================");
