# DocNow

A clean, responsive writing workspace powered by React, Vite, and Supabase.

## Features

- Email/password sign-up and sign-in
- Email confirmation and password-reset flows
- Personal document dashboard with search
- Create, edit, autosave, and delete documents
- Markdown-friendly writing toolbar and word/character counts
- Responsive desktop and mobile layout
- Row-level security so each account can access only their own documents

## Getting started

1. Install Node.js 22.12 or newer.
2. Install dependencies with npm install.
3. Start the local server with npm run dev.
4. Open the URL printed by Vite.

The app is configured to use the existing DocNow Supabase project by default. If you need to override it for another environment, copy .env.example to .env and change the values there. The publishable key is intended for browser use; never put a Supabase service-role key in a frontend app.

## Supabase setup

The database schema is in supabase/migrations/20261017000000_create_documents_table.sql and has been applied to the connected DocNow project.

For email confirmation and password-reset links, open Supabase Authentication URL Configuration, set the Site URL to the deployed DocNow URL, and add the local development URL (usually http://localhost:5173) and deployed URL to the allowed redirect URLs list. Email/password sign-in is managed by Supabase Auth.

## Deploy

Build the static site using npm run build, then host the dist directory on a static hosting provider. The default Supabase project connection works in the browser bundle; set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY as build environment variables only when overriding those defaults.
