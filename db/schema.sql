-- TafsirFlow database. Safe to re-run.
--   sudo -u postgres psql -d tafsirflow -f db/schema.sql

-- Quran.com responses kept locally so the site does not depend on it at runtime
CREATE TABLE IF NOT EXISTS api_cache (
  path        text PRIMARY KEY,
  payload     jsonb NOT NULL,
  fetched_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS users (
  id            bigserial PRIMARY KEY,
  email         text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  name          text,
  role          text NOT NULL DEFAULT 'user',      -- user | admin
  plan          text NOT NULL DEFAULT 'free',      -- free | premium (payments later)
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sessions (
  token_hash text PRIMARY KEY,                     -- sha256 of the cookie token
  user_id    bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS sessions_user ON sessions(user_id);

ALTER TABLE users ADD COLUMN IF NOT EXISTS city text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS country text;

-- password reset links (token itself is only e-mailed; we keep its hash)
CREATE TABLE IF NOT EXISTS password_resets (
  token_hash text PRIMARY KEY,
  user_id    bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL
);

-- per-user learning state synced from the browser: progress, bookmarks, spaced repetition, streak days
CREATE TABLE IF NOT EXISTS user_data (
  user_id    bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  key        text NOT NULL,
  value      jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, key)
);

CREATE TABLE IF NOT EXISTS settings (
  key   text PRIMARY KEY,
  value jsonb NOT NULL
);

-- own tafsir / commentary (German editor, AI drafts need approval before publishing)
CREATE TABLE IF NOT EXISTS tafsir_entries (
  id              bigserial PRIMARY KEY,
  language        text NOT NULL,
  source          text NOT NULL DEFAULT 'TafsirFlow',
  surah           int  NOT NULL,
  verse_from      int  NOT NULL,
  verse_to        int  NOT NULL,
  html            text NOT NULL,
  status          text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','approved')),
  generated_by_ai boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS tafsir_entries_lookup ON tafsir_entries(language, surah, status);

-- anonymous tafsir usage per day (freemium gate)
CREATE TABLE IF NOT EXISTS usage_verses (
  day       int  NOT NULL,
  subject   text NOT NULL,                         -- hash of IP + anonymous cookie
  verse_key text NOT NULL,
  PRIMARY KEY (day, subject, verse_key)
);

GRANT ALL ON ALL TABLES IN SCHEMA public TO tafsirflow;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO tafsirflow;
