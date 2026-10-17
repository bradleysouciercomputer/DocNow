-- Email-based document collaboration for DocNow.
-- Invitations are stored by normalized email so recipients can receive access
-- before they create an account; RLS grants access only after signing in as that email.

alter table public.documents
  add constraint documents_id_user_id_unique unique (id, user_id);

create table if not exists public.document_shares (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  shared_with_email text not null
    check (
      shared_with_email = lower(btrim(shared_with_email))
      and shared_with_email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    ),
  role text not null default 'viewer' check (role in ('viewer', 'editor')),
  created_at timestamptz not null default now(),
  constraint document_shares_document_owner_fkey
    foreign key (document_id, owner_id)
    references public.documents (id, user_id) on delete cascade,
  constraint document_shares_document_email_key unique (document_id, shared_with_email),
  constraint document_shares_not_owner_email check (shared_with_email <> '')
);

create index if not exists document_shares_email_idx
  on public.document_shares (shared_with_email);
create index if not exists document_shares_document_idx
  on public.document_shares (document_id);

alter table public.document_shares enable row level security;
revoke all on table public.document_shares from anon, authenticated;
grant select, insert, update, delete on table public.document_shares to authenticated;

drop policy if exists "Users can read their own documents" on public.documents;
create policy "Owners and invited users can read documents"
  on public.documents for select to authenticated
  using (
    user_id = (select auth.uid())
    or exists (
      select 1
      from public.document_shares ds
      where ds.document_id = documents.id
        and ds.shared_with_email = (select lower(coalesce(auth.jwt() ->> 'email', '')))
    )
  );

drop policy if exists "Users can update their own documents" on public.documents;
create policy "Owners and editors can update documents"
  on public.documents for update to authenticated
  using (
    user_id = (select auth.uid())
    or exists (
      select 1
      from public.document_shares ds
      where ds.document_id = documents.id
        and ds.shared_with_email = (select lower(coalesce(auth.jwt() ->> 'email', '')))
        and ds.role = 'editor'
    )
  )
  with check (
    user_id = (select auth.uid())
    or exists (
      select 1
      from public.document_shares ds
      where ds.document_id = documents.id
        and ds.shared_with_email = (select lower(coalesce(auth.jwt() ->> 'email', '')))
        and ds.role = 'editor'
    )
  );

drop policy if exists "Users can read document shares they own or receive" on public.document_shares;
create policy "Users can read document shares they own or receive"
  on public.document_shares for select to authenticated
  using (
    owner_id = (select auth.uid())
    or shared_with_email = (select lower(coalesce(auth.jwt() ->> 'email', '')))
  );

drop policy if exists "Document owners can invite collaborators" on public.document_shares;
create policy "Document owners can invite collaborators"
  on public.document_shares for insert to authenticated
  with check (owner_id = (select auth.uid()));

drop policy if exists "Document owners can update collaborator roles" on public.document_shares;
create policy "Document owners can update collaborator roles"
  on public.document_shares for update to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

drop policy if exists "Document owners can revoke collaborator access" on public.document_shares;
create policy "Document owners can revoke collaborator access"
  on public.document_shares for delete to authenticated
  using (owner_id = (select auth.uid()));

create or replace function public.prevent_document_owner_change()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.user_id is distinct from old.user_id then
    raise exception 'Document ownership cannot be changed';
  end if;
  return new;
end;
$$;

revoke execute on function public.prevent_document_owner_change() from public, anon, authenticated;
drop trigger if exists prevent_document_owner_change on public.documents;
create trigger prevent_document_owner_change
before update of user_id on public.documents
for each row execute function public.prevent_document_owner_change();
