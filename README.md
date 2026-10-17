# DocNow

A clean, responsive writing workspace powered by React, Vite, and Supabase, deployed on GitHub Pages.

## Features

- Email/password sign-up and sign-in
- Email confirmation and password-reset flows
- Personal document dashboard with search
- Create, edit, autosave, and delete documents
- Markdown-friendly writing toolbar and word/character counts
- Responsive desktop and mobile layout
- Row-level security so each account can access only their own documents

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

## Supabase setup

The schema is in `supabase/migrations/20261017000000_create_documents_table.sql` and has been applied to the connected DocNow project. Each database policy restricts access to the signed-in document owner.

In Supabase **Authentication → URL Configuration**, configure the Site URL and allow these redirect URLs:
- `https://bradleysouciercomputer.github.io/DocNow/`
- `http://localhost:5173/DocNow/`

Email confirmation and password recovery depend on these redirect settings.
