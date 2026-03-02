-- ═══════════════════════════════════════════════════════════════
-- MEMORIZ - Migration 003: Cart & Photos
-- Exécuter dans l'éditeur SQL de Supabase APRÈS 002
-- ═══════════════════════════════════════════════════════════════

-- Table du panier
CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON public.cart_items(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_cart_items_user_project 
  ON public.cart_items(user_id, project_id);

-- RLS
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Les utilisateurs peuvent voir leur panier"
  ON public.cart_items FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent ajouter au panier"
  ON public.cart_items FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent modifier leur panier"
  ON public.cart_items FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent supprimer du panier"
  ON public.cart_items FOR DELETE USING (auth.uid() = user_id);


-- Table des photos de projet
CREATE TABLE IF NOT EXISTS public.project_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  storage_path TEXT NOT NULL,
  page_index INTEGER,
  slot_index INTEGER,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index
CREATE INDEX IF NOT EXISTS idx_project_photos_project_id ON public.project_photos(project_id);
CREATE INDEX IF NOT EXISTS idx_project_photos_page ON public.project_photos(project_id, page_index);

-- RLS (via projects)
ALTER TABLE public.project_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Les utilisateurs peuvent voir les photos de leurs projets"
  ON public.project_photos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_photos.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Les utilisateurs peuvent ajouter des photos à leurs projets"
  ON public.project_photos FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_photos.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Les utilisateurs peuvent modifier les photos de leurs projets"
  ON public.project_photos FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_photos.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Les utilisateurs peuvent supprimer les photos de leurs projets"
  ON public.project_photos FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_photos.project_id
      AND projects.user_id = auth.uid()
    )
  );
