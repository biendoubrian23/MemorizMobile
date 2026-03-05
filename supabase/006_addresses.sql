-- ═══════════════════════════════════════════════════════════════
-- MEMORIZ - Migration 006: Table Addresses
-- Adresses de livraison des utilisateurs
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.addresses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  label TEXT NOT NULL DEFAULT 'Domicile',
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  street TEXT NOT NULL,
  street2 TEXT,
  postal_code TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'France',
  phone TEXT,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index
CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON public.addresses(user_id);

-- Activer RLS
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
CREATE POLICY "Les utilisateurs peuvent voir leurs adresses"
  ON public.addresses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent créer des adresses"
  ON public.addresses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent modifier leurs adresses"
  ON public.addresses FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent supprimer leurs adresses"
  ON public.addresses FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger updated_at
CREATE TRIGGER on_addresses_updated
  BEFORE UPDATE ON public.addresses
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
