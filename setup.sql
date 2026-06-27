-- =====================================================================
--  O'GRATOS — Réglages pour brancher l'appli (à coller dans SQL Editor)
-- =====================================================================

-- 1. Colonne qui portera le code livré au client (lisible sur SA propre ligne)
alter table public.paiements add column if not exists code_livre text;

-- 2. Politiques Storage : le client connecté dépose et relit SA capture
--    (chaque fichier est rangé dans un dossier à son nom : <id>/...)
create policy "captures - deposer la sienne"
  on storage.objects for insert to authenticated
  with check ( bucket_id = 'captures'
               and (storage.foldername(name))[1] = auth.uid()::text );

create policy "captures - lire la sienne"
  on storage.objects for select to authenticated
  using ( bucket_id = 'captures'
          and (storage.foldername(name))[1] = auth.uid()::text );

-- =====================================================================
--  FAIT. (Pense aussi à activer "Anonymous sign-ins" dans
--  Authentication > Sign In / Providers — voir le message.)
-- =====================================================================
