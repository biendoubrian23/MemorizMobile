-- ═══════════════════════════════════════════════════════════════
-- MEMORIZ - Migration 007: Rattrapage des éléments manquants
-- ⚠️  EXÉCUTER EN 2 ÉTAPES dans l'éditeur SQL de Supabase
-- ═══════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════
-- ÉTAPE 1 : Exécuter ceci EN PREMIER, puis cliquer "Run"
-- ═══════════════════════════════════════════════════════════════

-- 1. Ajouter la colonne theme_id à projects (si manquante)
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS theme_id TEXT DEFAULT NULL;

-- 2. Ajouter les nouvelles valeurs à l'enum paper_type
ALTER TYPE paper_type ADD VALUE IF NOT EXISTS 'lisse_satin';
ALTER TYPE paper_type ADD VALUE IF NOT EXISTS 'doux';


-- ═══════════════════════════════════════════════════════════════
-- ÉTAPE 2 : Exécuter ceci SÉPARÉMENT après l'étape 1
-- (les nouvelles valeurs d'enum doivent être commitées avant usage)
-- ═══════════════════════════════════════════════════════════════

-- UPDATE public.projects
--   SET paper_type = 'lisse_satin'
--   WHERE paper_type = 'cream_satin';
