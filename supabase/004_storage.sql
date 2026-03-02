-- ═══════════════════════════════════════════════════════════════
-- MEMORIZ - Migration 004: Storage Buckets
-- Exécuter dans l'éditeur SQL de Supabase APRÈS 003
-- ═══════════════════════════════════════════════════════════════

-- Créer le bucket pour les photos de projets
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-photos', 'project-photos', false)
ON CONFLICT (id) DO NOTHING;

-- Créer le bucket pour les avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Politiques de stockage pour project-photos
CREATE POLICY "Les utilisateurs auth peuvent upload des photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'project-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Les utilisateurs peuvent voir leurs photos"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'project-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Les utilisateurs peuvent supprimer leurs photos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'project-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Politiques pour avatars (publics)
CREATE POLICY "Avatar upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Avatar visible par tous"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Avatar supprimable par le propriétaire"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
