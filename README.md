# DocNow

A clean, responsive writing workspace powered by React, Vite, and Supabase.

## Features

- Email/password sign-up and sign-in
- Email confirmation and password-reset flows
- Personal document dashboard with search
- Create, edit, autosave, and delete documents
- Markdown-friendly writing toolbar and word/character counts
- Responsive desktop and mobile layout
- Row-level security so each account can access only its own documents

## Getting started

1. Install Node.js 22.12 or newer.
2. Copy the file named .env.example to .env.
3. Add the DocNow Supabase project URL and publishable key to the environment file.
4. Install packages with npm install.
5. Start the local server with npm run dev.
6. Open the URL printed by Vite.

Never put a Supabase service-role key in a browser app. The VITE_SUPABASE_PUBLISHABLE_KEY value must be the project's publishable (public client) key.

## Supabase setup

The database migration is in supabase/migrations/20261017000000_create_documents_table.sql. It has already been applied to the connected DocNow Supabase project.

For email confirmation links, set your Supabase Auth Site URL to the deployed DocNow URL and add that URL (and your local development URL) to the allowed redirect URLs. Email/password sign-in is managed by Supabase Auth.

## Deploy

Build the static site using npm run build, then host the dist directory on a static hosting provider. Configure the same two Vite environment variables in that provider's project settings before building.
