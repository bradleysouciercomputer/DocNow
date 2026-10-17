-- Persist starred/favorite state for each user's documents.
alter table public.documents
  add column if not exists is_favorite boolean not null default false;