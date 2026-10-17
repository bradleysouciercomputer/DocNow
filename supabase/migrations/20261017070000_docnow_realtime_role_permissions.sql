-- Editors/owners can broadcast document mutations; Viewers may only publish
-- presence plus caret/sync-request events, never collaborative text updates.
drop policy if exists "DocNow collaborators can send realtime" on realtime.messages;
create policy "DocNow collaborators can send realtime"
  on realtime.messages for insert
  to authenticated
  with check (
    extension in ('broadcast', 'presence')
    and exists (
      select 1
      from public.documents d
      where d.id::text = split_part((select realtime.topic()), ':', 2)
        and (
          d.user_id = (select auth.uid())
          or exists (
            select 1
            from public.document_shares ds
            where ds.document_id = d.id
              and ds.shared_with_email = lower(((select auth.jwt()) ->> 'email'))
              and (
                extension = 'presence'
                or ds.role = 'editor'
                or event in ('caret', 'sync-request')
              )
          )
        )
    )
  );
