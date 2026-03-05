-- ═══════════════════════════════════════════════════════════════
-- MEMORIZ - Migration 003: Mise à jour enum paper_type
-- Ajoute 'lisse_satin' et 'doux', migre 'cream_satin' → 'lisse_satin'
-- ⚠️  EXÉCUTER EN 2 ÉTAPES SÉPARÉES dans l'éditeur SQL de Supabase
-- (PostgreSQL exige un COMMIT entre ADD VALUE et son utilisation)
-- ═══════════════════════════════════════════════════════════════

-- ═══ ÉTAPE 1 : Exécuter ceci en premier ═══
ALTER TYPE paper_type ADD VALUE IF NOT EXISTS 'lisse_satin';
ALTER TYPE paper_type ADD VALUE IF NOT EXISTS 'doux';

-- ═══ ÉTAPE 2 : Exécuter ceci SÉPARÉMENT après l'étape 1 ═══
-- UPDATE public.projects
--   SET paper_type = 'lisse_satin'
--   WHERE paper_type = 'cream_satin';
