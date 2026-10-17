-- Cache the JWT email claim once per statement in RLS permission checks.
alter policy "Owners and invited users can read documents" on public.documents
using (
  user_id = (select auth.uid())
  or exists (
    select 1 from public.document_shares ds
    where ds.document_id = documents.id
      and ds.shared_with_email = lower((select auth.jwt() ->> 'email'))
  )
);

alter policy "Owners and editors can update documents" on public.documents
using (
  user_id = (select auth.uid())
  or exists (
    select 1 from public.document_shares ds
    where ds.document_id = documents.id
      and ds.shared_with_email = lower((select auth.jwt() ->> 'email'))
      and ds.role = 'editor'
  )
)
with check (
  user_id = (select auth.uid())
  or exists (
    select 1 from public.document_shares ds
    where ds.document_id = documents.id
      and ds.shared_with_email = lower((select auth.jwt() ->> 'email'))
      and ds.role = 'editor'
  )
);

alter policy "Users can read document shares they own or receive" on public.document_shares
using (
  owner_id = (select auth.uid())
  or shared_with_email = lower((select auth.jwt() ->> 'email'))
);
