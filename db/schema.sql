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

-- profile data collected at sign-up (GDPR: purpose = account, learning support; marketing only with separate opt-in)
ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS country text;            -- ISO 3166-1 alpha-2
ALTER TABLE users ADD COLUMN IF NOT EXISTS goal text;               -- hifz | fahm | tilawa | kids | all
ALTER TABLE users ADD COLUMN IF NOT EXISTS locale text;             -- language chosen at sign-up
ALTER TABLE users ADD COLUMN IF NOT EXISTS marketing_opt_in boolean NOT NULL DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS terms_accepted_at timestamptz;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at timestamptz;

-- e-mail confirmation. Existing accounts (created before this column) count as confirmed once; new ones default to false.
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified boolean;
UPDATE users SET email_verified = true WHERE email_verified IS NULL;
ALTER TABLE users ALTER COLUMN email_verified SET DEFAULT false;
ALTER TABLE users ALTER COLUMN email_verified SET NOT NULL;

CREATE TABLE IF NOT EXISTS email_verifications (
  token_hash text PRIMARY KEY,
  user_id    bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL
);

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

-- reciters whose audio is on this server (folder = /srv/tafsirflow/audio/<folder>/<SSSAAA>.mp3)
CREATE TABLE IF NOT EXISTS reciters (
  folder   text PRIMARY KEY,
  slug     text NOT NULL,
  name     text NOT NULL,
  qc_id    int,                         -- Quran.com recitation id (only these have word timings)
  enabled  boolean NOT NULL DEFAULT true,
  sort     int NOT NULL DEFAULT 100
);
INSERT INTO reciters (folder, slug, name, qc_id, sort) VALUES
  ('Alafasy_128kbps', 'Alafasy', 'Mishary Alafasy', 7, 1),
  ('Abdul_Basit_Murattal_192kbps', 'AbdulBaset', 'AbdulBaset AbdulSamad', 2, 2),
  ('Husary_128kbps', 'Husary', 'Mahmoud Khalil Al-Husary', 6, 3),
  ('Minshawy_Murattal_128kbps', 'Minshawi', 'Mohamed Siddiq Al-Minshawi', 9, 4)
ON CONFLICT (folder) DO NOTHING;

-- social layer: likes, views, shares, moderated comments
ALTER TABLE users ADD COLUMN IF NOT EXISTS birth_year int;
ALTER TABLE users ADD COLUMN IF NOT EXISTS comment_banned boolean NOT NULL DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS comment_strikes int NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS verse_stats (
  verse_key text PRIMARY KEY,
  views     bigint NOT NULL DEFAULT 0,
  shares    bigint NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS verse_likes (
  user_id    bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  verse_key  text   NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, verse_key)
);
CREATE INDEX IF NOT EXISTS verse_likes_key ON verse_likes(verse_key);
CREATE TABLE IF NOT EXISTS verse_views (          -- one view per visitor, verse and day
  day       int  NOT NULL,
  subject   text NOT NULL,
  verse_key text NOT NULL,
  PRIMARY KEY (day, subject, verse_key)
);
-- every comment is held for review (status pending) unless the admin switches auto-approve on
CREATE TABLE IF NOT EXISTS comments (
  id            bigserial PRIMARY KEY,
  user_id       bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  verse_key     text   NOT NULL,
  parent_id     bigint REFERENCES comments(id) ON DELETE CASCADE,
  body          text   NOT NULL,
  status        text   NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  flagged       text,                              -- soft-filter note shown to the reviewer
  reject_reason text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  reviewed_at   timestamptz
);
CREATE INDEX IF NOT EXISTS comments_verse ON comments(verse_key, status, created_at);
CREATE INDEX IF NOT EXISTS comments_queue ON comments(status, created_at);
CREATE TABLE IF NOT EXISTS comment_reports (
  comment_id bigint NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  user_id    bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason     text,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (comment_id, user_id)
);

-- feedback board: feature and tafsir requests with votes (posts are reviewed before they appear)
CREATE TABLE IF NOT EXISTS feedback_posts (
  id         bigserial PRIMARY KEY,
  user_id    bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category   text NOT NULL CHECK (category IN ('feature','tafsir','translation','reciter','bug','content')),
  title      text NOT NULL,
  body       text NOT NULL DEFAULT '',
  status     text NOT NULL DEFAULT 'review' CHECK (status IN ('review','planned','progress','done','declined')),
  approved   boolean NOT NULL DEFAULT false,
  flagged    text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS feedback_list ON feedback_posts(approved, category, created_at);
CREATE TABLE IF NOT EXISTS feedback_votes (
  post_id bigint NOT NULL REFERENCES feedback_posts(id) ON DELETE CASCADE,
  user_id bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, user_id)
);


-- listening statistics (anonymous totals: no user id, only surah, reciter, seconds and verses per day)
CREATE TABLE IF NOT EXISTS listen_stats (
  day     int    NOT NULL,                         -- days since 1970-01-01 (UTC)
  surah   int    NOT NULL,
  reciter text   NOT NULL DEFAULT '',
  seconds bigint NOT NULL DEFAULT 0,
  verses  bigint NOT NULL DEFAULT 0,
  PRIMARY KEY (day, surah, reciter)
);
CREATE TABLE IF NOT EXISTS listen_people (         -- one row per visitor and day (hashed), for "listeners today"
  day     int  NOT NULL,
  subject text NOT NULL,
  PRIMARY KEY (day, subject)
);

-- ranking: points per member and day, taken from the synced learning record (capped per day)
CREATE TABLE IF NOT EXISTS user_points (
  user_id bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day     int    NOT NULL,
  points  int    NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, day)
);
CREATE INDEX IF NOT EXISTS user_points_day ON user_points(day);
ALTER TABLE users ADD COLUMN IF NOT EXISTS rank_public boolean NOT NULL DEFAULT false;  -- show the name in the ranking (opt-in)

-- keep last: the app user needs rights on every table above
GRANT ALL ON ALL TABLES IN SCHEMA public TO tafsirflow;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO tafsirflow;
