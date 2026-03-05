-- ═══════════════════════════════════════════════════════════════
-- MEMORIZ - Migration 005: Champs supplémentaires Profiles
-- Ajoute phone et birth_date au profil utilisateur
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS birth_date DATE;
