# DocNow

A clean, responsive writing workspace powered by React, Vite, and Supabase, deployed on GitHub Pages.

## Features

- Email/password sign-up and sign-in
- Email confirmation and password-reset flows
- Personal document dashboard with search
- Create, edit, autosave, and delete documents
- Markdown-friendly writing toolbar, rendered preview, and word/character counts
- Starred documents and sorting by title or date
- Duplicate documents and export as Markdown or plain text
- Responsive desktop and mobile layout
- Email-based document sharing with Viewer (read-only) and Editor (can edit) roles
- Collaborator role management, access revocation, and document-specific invitation links
- Real-time collaborators online/viewing status using Supabase Presence
- Live collaborative text updates using the Yjs CRDT over private Supabase Realtime channels
- Live remote text carets labeled by collaborator, with server-enforced room access rules
- Row-level security enforcing document ownership and shared access on every database request

## Run locally

1. Install Node.js 22 or newer.
2. Install dependencies with `npm install`.
3. Start the local server with `npm run dev`.
4. Open the URL printed by Vite.

The app is configured to use the existing DocNow Supabase project by default. To override it for another environment, copy `.env.example` to `.env` and change the values. The publishable key is intended for browser use; never put a Supabase service-role key in a frontend app.

## GitHub Pages deployment

The site is built with Vite and automatically deployed by `.github/workflows/build.yml` whenever changes are pushed to `main`.

1. Open **Settings → Pages** in this repository.
2. Under **Build and deployment → Source**, select **GitHub Actions**.
3. Check the **Actions** tab for the deployment status.
4. The expected website URL is https://bradleysouciercomputer.github.io/DocNow/.

The Vite base path is configured as `/DocNow/`, including the favicon and Supabase authentication redirects.

## Document-specific links

Every document has its own URL using the `?doc=<document-id>` query parameter. Opening a document updates the browser address, so it can be bookmarked, copied, opened in another tab, or restored after a refresh. The editor's **Copy link** button copies that URL. Links do not grant public access by themselves: the owner and collaborators explicitly invited by email can open the document when signed in, and invited collaborators must use the same email address that received access.

## Supabase setup

The base schema is in `supabase/migrations/20261017000000_create_documents_table.sql`, with collaboration rules in `supabase/migrations/20261017020000_document_sharing.sql`. Both have been applied to the connected DocNow project. Document shares are keyed by normalized email. Invited users must sign in to DocNow with that email address; the database permits Viewers to read and Editors to update document content/title. Only owners can invite people, change roles, revoke access, or delete documents. Real-time collaboration uses private Supabase Realtime channels with policies scoped to the document owner and invited email addresses. The editor uses Yjs for concurrent text edits and shows other active collaborators and their live caret positions. These presence/caret features require an authenticated session and a working Supabase Realtime connection; normal document autosave still functions if live collaboration is unavailable.

In Supabase **Authentication → URL Configuration**, configure the Site URL and allow these redirect URLs:
- `https://bradleysouciercomputer.github.io/DocNow/`
- `http://localhost:5173/DocNow/`

Email confirmation and password recovery depend on these redirect settings.
