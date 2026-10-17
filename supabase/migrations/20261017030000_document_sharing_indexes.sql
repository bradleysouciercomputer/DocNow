-- Cover document-sharing foreign keys with indexes for efficient lookups and cascades.
create index if not exists document_shares_document_owner_idx
  on public.document_shares (document_id, owner_id);

create index if not exists document_shares_owner_idx
  on public.document_shares (owner_id);
