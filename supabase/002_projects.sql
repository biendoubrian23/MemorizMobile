-- ═══════════════════════════════════════════════════════════════
-- MEMORIZ - Migration 002: Table Projects
-- Exécuter dans l'éditeur SQL de Supabase APRÈS 001
-- ═══════════════════════════════════════════════════════════════

-- Enums
DO $$ BEGIN
  CREATE TYPE product_type AS ENUM ('album', 'magazine', 'wall_deco');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE binding_type AS ENUM ('hardcover', 'softcover', 'lay_flat');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE format_type AS ENUM ('a4_portrait', 'a4_landscape', 'square');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE paper_type AS ENUM ('standard', 'cream_satin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE lamination_type AS ENUM ('glossy', 'matte', 'soft_touch');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE color_mode AS ENUM ('color', 'black_white');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE project_status AS ENUM ('draft', 'ordered', 'delivered');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Table des projets
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL DEFAULT 'Mon Souvenir',
  cover_image_url TEXT,
  product_type product_type NOT NULL DEFAULT 'album',
  binding_type binding_type NOT NULL DEFAULT 'hardcover',
  format format_type NOT NULL DEFAULT 'square',
  paper_type paper_type NOT NULL DEFAULT 'standard',
  lamination lamination_type NOT NULL DEFAULT 'matte',
  color_mode color_mode NOT NULL DEFAULT 'color',
  page_count INTEGER NOT NULL DEFAULT 24,
  status project_status NOT NULL DEFAULT 'draft',
  pages_data JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON public.projects(updated_at DESC);

-- Activer RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
CREATE POLICY "Les utilisateurs peuvent voir leurs projets"
  ON public.projects
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent créer des projets"
  ON public.projects
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent modifier leurs projets"
  ON public.projects
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent supprimer leurs projets"
  ON public.projects
  FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger updated_at
CREATE TRIGGER on_projects_updated
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
