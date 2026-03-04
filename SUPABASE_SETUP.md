# Supabase Setup (Email/Password Login)

This app uses [Supabase](https://supabase.com) for secure email/password sign-in and to store saved data (properties and net worth) per user. Passwords are hashed and stored by Supabase; they never appear in your frontend code.

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and sign in or create an account.
2. Click **New project**, choose your organization, and set:
   - **Name** (e.g. `calculator-site`)
   - **Database password** (save it somewhere safe)
   - **Region**
3. Wait for the project to be created.

## 2. Get your project URL and anon key

1. In the Supabase dashboard, open **Settings** (gear) → **API**.
2. Copy:
   - **Project URL**
   - **anon public** key (under "Project API keys") — in the UI this may be labeled **Publishable** or **anon public**. Use that one (the one safe for the browser). Do **not** use the **service_role** (secret) key.

In `supabase-config.js`, set:

```javascript
const SUPABASE_URL = 'https://YOUR_PROJECT_REF.supabase.co';
const SUPABASE_ANON_KEY = 'your-publishable-or-anon-key-here';
```

## 3. Create the database tables

In the Supabase dashboard, go to **SQL Editor** and run:

```sql
-- Saved properties (one row per user, JSON array of properties)
create table if not exists public.saved_properties (
  user_id uuid primary key references auth.users(id) on delete cascade,
  properties jsonb not null default '[]',
  updated_at timestamptz not null default now()
);

-- Net worth data (one row per user, JSON object)
create table if not exists public.net_worth_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

-- Only allow users to read/write their own rows
alter table public.saved_properties enable row level security;
alter table public.net_worth_data enable row level security;

create policy "Users can manage own saved_properties"
  on public.saved_properties for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can manage own net_worth_data"
  on public.net_worth_data for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

## 4. Enable Email auth

1. Go to **Authentication** → **Providers**.
2. **Email** should be enabled by default.
3. Optionally turn off "Confirm email" under **Authentication** → **Settings** if you don’t want users to confirm their email before logging in (useful for development).

## 5. Deploy and test

1. Deploy your site (e.g. to GitHub Pages).
2. Open the site and click **Log in**.
3. Use **Create account** to sign up with an email and password, then log in.
4. Saved properties and net worth data will sync to Supabase when you’re signed in.

## Security notes

- Passwords are hashed and stored by Supabase; your app never sees the raw password.
- Row Level Security (RLS) ensures each user can only read and write their own rows.
- The **anon** key is safe to use in the browser; RLS and Supabase Auth enforce access control.
