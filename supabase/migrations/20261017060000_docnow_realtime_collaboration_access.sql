-- Authorize private DocNow collaboration rooms by document ownership or email share.
-- Topics use the format docnow:<document-uuid>.
drop policy if exists "DocNow collaborators can receive realtime" on realtime.messages;
create policy "DocNow collaborators can receive realtime"
  on realtime.messages for select
  to authenticated
  using (
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
          )
        )
    )
  );

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
          )
        )
    )
  );
