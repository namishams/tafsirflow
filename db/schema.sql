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

ALTER TABLE users ADD COLUMN IF NOT EXISTS rank_hidden boolean NOT NULL DEFAULT false;  -- hidden from the ranking by the admin

-- baby names: how often families saved a name as favourite ("most loved by families" on /names)
CREATE TABLE IF NOT EXISTS name_favs (name_id text PRIMARY KEY, n bigint NOT NULL DEFAULT 0);

-- Premium bought in the iOS app (StoreKit), linked to the account it was confirmed for (users.plan = 'premium')
CREATE TABLE IF NOT EXISTS iap_purchases (
  original_transaction_id text NOT NULL,
  user_id     bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id  text NOT NULL,
  environment text NOT NULL,
  purchased_at timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (original_transaction_id, user_id)
);

-- Quran Masterclass Pro (monthly subscription in the app): Pro is active while pro_until lies in the future;
-- plan = 'premium' with pro_until NULL is a lasting Premium (first one-time purchase or set by the admin)
ALTER TABLE users ADD COLUMN IF NOT EXISTS pro_until timestamptz;
ALTER TABLE iap_purchases ADD COLUMN IF NOT EXISTS transaction_id text;
ALTER TABLE iap_purchases ADD COLUMN IF NOT EXISTS expires_at timestamptz;
ALTER TABLE iap_purchases ADD COLUMN IF NOT EXISTS revoked_at timestamptz;
ALTER TABLE iap_purchases ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- personal duas written with AI, bought in the app (consumables): every transaction counts once
CREATE TABLE IF NOT EXISTS iap_consumables (
  transaction_id text PRIMARY KEY,
  user_id     bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id  text NOT NULL,
  credits     integer NOT NULL,
  environment text NOT NULL,
  refunded_at timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS ai_credits (
  user_id    bigint PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  dua        integer NOT NULL DEFAULT 0 CHECK (dua >= 0),
  updated_at timestamptz NOT NULL DEFAULT now()
);
-- personal name reports of the baby-name finder (app, consumable com.quranmasterclass.app.names); not part of Pro
ALTER TABLE ai_credits ADD COLUMN IF NOT EXISTS names integer NOT NULL DEFAULT 0 CHECK (names >= 0);
-- what Pro includes per month (personal duas); month = 'YYYY-MM'
CREATE TABLE IF NOT EXISTS ai_usage (
  user_id bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind    text NOT NULL,
  month   text NOT NULL,
  n       integer NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, kind, month)
);

-- reciters community (mini): profiles, follows, blocks, reports for the admin
CREATE TABLE IF NOT EXISTS community_profiles (
  user_id      bigint PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  username     text NOT NULL CHECK (username ~ '^[a-z0-9_.]{3,20}$'),
  display_name text NOT NULL DEFAULT '',
  bio          text NOT NULL DEFAULT '' CHECK (char_length(bio) <= 160),
  country      text,
  role         text NOT NULL DEFAULT 'learner' CHECK (role IN ('learner','reciter','teacher')),
  style        text NOT NULL DEFAULT '',
  has_ijaza    boolean NOT NULL DEFAULT false,
  public       boolean NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS community_profiles_username ON community_profiles(username);
-- sharer ("Verbreiter") status: shares counted in the app, sent by the member (status only, unlocks nothing)
ALTER TABLE community_profiles ADD COLUMN IF NOT EXISTS shares_total integer NOT NULL DEFAULT 0 CHECK (shares_total >= 0);
ALTER TABLE community_profiles ADD COLUMN IF NOT EXISTS shares_week integer NOT NULL DEFAULT 0 CHECK (shares_week >= 0);
ALTER TABLE community_profiles ADD COLUMN IF NOT EXISTS shares_week_day integer NOT NULL DEFAULT 0;
CREATE INDEX IF NOT EXISTS community_profiles_shares_week ON community_profiles(shares_week_day, shares_week DESC);
CREATE TABLE IF NOT EXISTS community_follows (
  follower_id bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  followee_id bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (follower_id, followee_id),
  CHECK (follower_id <> followee_id)
);
CREATE INDEX IF NOT EXISTS community_follows_followee ON community_follows(followee_id);
CREATE TABLE IF NOT EXISTS community_blocks (
  blocker_id bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blocked_id bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (blocker_id, blocked_id)
);
CREATE TABLE IF NOT EXISTS community_reports (
  id          bigserial PRIMARY KEY,
  reporter_id bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reported_id bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason      text NOT NULL DEFAULT '',
  status      text NOT NULL DEFAULT 'open',
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- feed offer funnel from the app (anonymous daily aggregates: no user id, only variant, offer and counts per day)
CREATE TABLE IF NOT EXISTS feed_offer_stats (
  day     date   NOT NULL,
  variant text   NOT NULL,
  offer   text   NOT NULL,
  imp     bigint NOT NULL DEFAULT 0,
  tap     bigint NOT NULL DEFAULT 0,
  buy     bigint NOT NULL DEFAULT 0,
  PRIMARY KEY (day, variant, offer)
);

-- Quran Talents network (extends the reciters community; nothing above is changed or removed)
-- age: birth year stays in users.birth_year; age_confirmed_at = the member confirmed the year for the community
ALTER TABLE users ADD COLUMN IF NOT EXISTS age_confirmed_at timestamptz;
ALTER TABLE community_profiles ADD COLUMN IF NOT EXISTS rewaya text NOT NULL DEFAULT '';
ALTER TABLE community_profiles ADD COLUMN IF NOT EXISTS maqam text NOT NULL DEFAULT '';
ALTER TABLE community_profiles ADD COLUMN IF NOT EXISTS ijazah_chain text NOT NULL DEFAULT '';
ALTER TABLE community_profiles ADD COLUMN IF NOT EXISTS level text NOT NULL DEFAULT 'talent';
ALTER TABLE community_profiles ADD COLUMN IF NOT EXISTS verified boolean NOT NULL DEFAULT false;
ALTER TABLE community_profiles ADD COLUMN IF NOT EXISTS verified_by bigint REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE community_profiles ADD COLUMN IF NOT EXISTS verified_at timestamptz;
ALTER TABLE community_profiles ADD COLUMN IF NOT EXISTS master_invite_id bigint;
-- progress the member chooses to show (sent by the app, status only)
ALTER TABLE community_profiles ADD COLUMN IF NOT EXISTS show_progress boolean NOT NULL DEFAULT false;
ALTER TABLE community_profiles ADD COLUMN IF NOT EXISTS tree_stage smallint NOT NULL DEFAULT 0;
ALTER TABLE community_profiles ADD COLUMN IF NOT EXISTS tree_type text NOT NULL DEFAULT '';
ALTER TABLE community_profiles ADD COLUMN IF NOT EXISTS cert_juz smallint[] NOT NULL DEFAULT '{}';
-- suspended by an admin: hidden from lists, cannot write
ALTER TABLE community_profiles ADD COLUMN IF NOT EXISTS suspended boolean NOT NULL DEFAULT false;
DO $$ BEGIN
  ALTER TABLE community_profiles ADD CONSTRAINT community_profiles_level CHECK (level IN ('talent','rising','master','sheikh'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE community_profiles ADD CONSTRAINT community_profiles_chain_len CHECK (char_length(ijazah_chain) <= 600);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS community_profiles_level ON community_profiles(level) WHERE public;
-- reports: what was reported (profile, message, post) and how it was handled
ALTER TABLE community_reports ADD COLUMN IF NOT EXISTS target_type text NOT NULL DEFAULT 'profile';
ALTER TABLE community_reports ADD COLUMN IF NOT EXISTS target_id bigint;
ALTER TABLE community_reports ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT '';
ALTER TABLE community_reports ADD COLUMN IF NOT EXISTS handled_by bigint REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE community_reports ADD COLUMN IF NOT EXISTS handled_at timestamptz;
CREATE INDEX IF NOT EXISTS community_reports_open ON community_reports(created_at) WHERE status = 'open';
-- connections: a request that the other member accepts or declines; one row per pair
CREATE TABLE IF NOT EXISTS community_connections (
  id           bigserial PRIMARY KEY,
  requester_id bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  addressee_id bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status       text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','declined')),
  note         text NOT NULL DEFAULT '' CHECK (char_length(note) <= 200),
  created_at   timestamptz NOT NULL DEFAULT now(),
  responded_at timestamptz,
  CHECK (requester_id <> addressee_id)
);
CREATE UNIQUE INDEX IF NOT EXISTS community_connections_pair ON community_connections (LEAST(requester_id, addressee_id), GREATEST(requester_id, addressee_id));
CREATE INDEX IF NOT EXISTS community_connections_addressee ON community_connections(addressee_id, status);
-- 1:1 conversations (user_a < user_b) and their messages (text only for now)
CREATE TABLE IF NOT EXISTS community_conversations (
  id              bigserial PRIMARY KEY,
  user_a          bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_b          bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  a_read_id       bigint NOT NULL DEFAULT 0,
  b_read_id       bigint NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now(),
  last_message_at timestamptz,
  CHECK (user_a < user_b),
  UNIQUE (user_a, user_b)
);
CREATE INDEX IF NOT EXISTS community_conversations_b ON community_conversations(user_b);
CREATE TABLE IF NOT EXISTS community_messages (
  id              bigserial PRIMARY KEY,
  conversation_id bigint NOT NULL REFERENCES community_conversations(id) ON DELETE CASCADE,
  sender_id       bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body            text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 1000),
  created_at      timestamptz NOT NULL DEFAULT now(),
  removed_at      timestamptz           -- removed by an admin after a report
);
CREATE INDEX IF NOT EXISTS community_messages_conv ON community_messages(conversation_id, id DESC);
-- every moderation step of an admin (who, what, on whom)
CREATE TABLE IF NOT EXISTS community_admin_actions (
  id             bigserial PRIMARY KEY,
  admin_id       bigint REFERENCES users(id) ON DELETE SET NULL,
  action         text NOT NULL,
  target_user_id bigint REFERENCES users(id) ON DELETE SET NULL,
  report_id      bigint REFERENCES community_reports(id) ON DELETE SET NULL,
  detail         jsonb NOT NULL DEFAULT '{}',
  created_at     timestamptz NOT NULL DEFAULT now()
);
-- master invite codes: an admin creates them (only the hash is stored); redeeming makes the member a verified master
CREATE TABLE IF NOT EXISTS community_master_invites (
  id         bigserial PRIMARY KEY,
  code_hash  text NOT NULL UNIQUE,
  hint       text NOT NULL DEFAULT '',            -- last 4 characters, to recognise a code in the list
  note       text NOT NULL DEFAULT '',
  level      text NOT NULL DEFAULT 'master' CHECK (level IN ('rising','master','sheikh')),
  max_uses   integer NOT NULL DEFAULT 1 CHECK (max_uses BETWEEN 1 AND 100),
  uses       integer NOT NULL DEFAULT 0,
  created_by bigint REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  revoked_at timestamptz
);
CREATE TABLE IF NOT EXISTS community_master_invite_uses (
  invite_id bigint NOT NULL REFERENCES community_master_invites(id) ON DELETE CASCADE,
  user_id   bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  used_at   timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (invite_id, user_id)
);
-- posts and stories (next step: media upload). Nothing is shown before an admin approves it; stories expire.
CREATE TABLE IF NOT EXISTS community_posts (
  id            bigserial PRIMARY KEY,
  author_id     bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type          text NOT NULL CHECK (type IN ('story','post')),
  media_url     text,
  media_kind    text CHECK (media_kind IN ('video','image','audio')),
  duration_ms   integer CHECK (duration_ms IS NULL OR duration_ms BETWEEN 0 AND 600000),
  caption       text NOT NULL DEFAULT '' CHECK (char_length(caption) <= 500),
  surah         smallint,                          -- optional: which verses are recited
  verse_from    smallint,
  verse_to      smallint,
  status        text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','removed')),
  reviewed_by   bigint REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at   timestamptz,
  reject_reason text NOT NULL DEFAULT '',
  created_at    timestamptz NOT NULL DEFAULT now(),
  expires_at    timestamptz                        -- stories: created_at + 24 h
);
CREATE INDEX IF NOT EXISTS community_posts_queue ON community_posts(created_at) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS community_posts_author ON community_posts(author_id, created_at DESC);

-- Exams and verifiable certificates ("keine Schummler"; nothing above is changed). The app runs the exam, the server
-- opens the attempt (start time, nonce, cooldown, weekly limit), checks the timing of the result and signs it (HMAC);
-- certificates are issued only from these rows. Highest certificates wait for a review of the recording.
CREATE TABLE IF NOT EXISTS exam_attempts (
  id           bigserial PRIMARY KEY,
  user_id      bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  exam         text NOT NULL CHECK (exam IN ('rp-level','juz','surah','vocab','weekly','ar-unit')),
  ref          text NOT NULL DEFAULT '' CHECK (char_length(ref) <= 20),
  nonce        text NOT NULL,                       -- seed for the question pool and option order of this attempt
  status       text NOT NULL DEFAULT 'running' CHECK (status IN ('running','submitted','void')),
  started_at   timestamptz NOT NULL DEFAULT now(),
  submitted_at timestamptz,
  score        integer CHECK (score IS NULL OR score >= 0),
  total        integer CHECK (total IS NULL OR total BETWEEN 0 AND 500),
  word_score   real CHECK (word_score IS NULL OR word_score BETWEEN 0 AND 1),
  duration_ms  integer,
  flags        text[] NOT NULL DEFAULT '{}',        -- background, timeout, too_fast, late, offline …
  passed       boolean NOT NULL DEFAULT false,
  platform     text NOT NULL DEFAULT '',
  sig          text                                 -- HMAC over the result (lib.ts resultMsg)
);
CREATE INDEX IF NOT EXISTS exam_attempts_user ON exam_attempts(user_id, exam, ref, started_at DESC);
-- examination centre (Markaz al-Imtihanat): mock exams per stage use exam = 'qbank' (the check is widened, never narrowed)
ALTER TABLE exam_attempts DROP CONSTRAINT IF EXISTS exam_attempts_exam_check;
ALTER TABLE exam_attempts ADD CONSTRAINT exam_attempts_exam_check CHECK (exam IN ('rp-level','juz','surah','vocab','weekly','ar-unit','qbank'));
CREATE TABLE IF NOT EXISTS certificates (
  id          bigserial PRIMARY KEY,
  code        text UNIQUE NOT NULL,                 -- QMC-XXXX-XXXX, printed with a QR to /verify/<code>
  user_id     bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  attempt_id  bigint REFERENCES exam_attempts(id) ON DELETE SET NULL,
  course      text NOT NULL,                        -- rp-level:10, juz:30, ar-level:C1 …
  holder_name text NOT NULL DEFAULT '' CHECK (char_length(holder_name) <= 80),
  pct         smallint NOT NULL CHECK (pct BETWEEN 0 AND 100),
  status      text NOT NULL DEFAULT 'valid' CHECK (status IN ('valid','pending','rejected','revoked')),
  issued_at   timestamptz NOT NULL DEFAULT now(),
  decided_at  timestamptz,
  sig         text NOT NULL,                        -- HMAC over code, holder, course, pct, date (lib.ts certMsg)
  UNIQUE (user_id, course)
);
CREATE TABLE IF NOT EXISTS review_queue (
  id                   bigserial PRIMARY KEY,
  certificate_id       bigint NOT NULL REFERENCES certificates(id) ON DELETE CASCADE,
  attempt_id           bigint REFERENCES exam_attempts(id) ON DELETE SET NULL,
  recording_path       text,                        -- private folder outside the web root, deleted after 90 days
  recording_mime       text NOT NULL DEFAULT '',
  recording_bytes      integer,
  recording_deleted_at timestamptz,
  status               text NOT NULL DEFAULT 'open' CHECK (status IN ('open','approved','rejected')),
  reviewer_id          bigint REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at          timestamptz,
  note                 text NOT NULL DEFAULT '' CHECK (char_length(note) <= 500),
  created_at           timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS review_queue_open ON review_queue(created_at) WHERE status = 'open';

-- Quran Talents: recitation clips (owner decision 21.10.2026). Only verified members (16+, Pro, learning level, see
-- posting in src/lib/feed/config.json) may post; recorded in the app only; nothing is shown before an admin approves.
ALTER TABLE community_profiles ADD COLUMN IF NOT EXISTS reciter_level smallint NOT NULL DEFAULT 0;  -- Reciter Path level passed, reported by the app
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS verse_key text;              -- "surah:verse" or "surah:from-to"
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS media_path text;             -- file name inside MEDIA_DIR (never a public URL)
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS media_mime text;
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS has_video boolean NOT NULL DEFAULT false;
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS waveform smallint[] NOT NULL DEFAULT '{}';  -- 0..100 loudness bars for the visual
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS word_check smallint;         -- share of verse words heard on the device, 0..100
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS like_count integer NOT NULL DEFAULT 0;
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS deleted_at timestamptz;      -- deleted by the author or expired (story)
CREATE INDEX IF NOT EXISTS community_posts_live ON community_posts(created_at DESC) WHERE status = 'approved' AND deleted_at IS NULL;
CREATE TABLE IF NOT EXISTS community_post_likes (
  post_id    bigint NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id    bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (post_id, user_id)
);
-- verification applications: real name and teacher details are seen by admins only; the voice sample is deleted
-- from MEDIA_DIR when the application is decided
CREATE TABLE IF NOT EXISTS community_verifications (
  id            bigserial PRIMARY KEY,
  user_id       bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  real_name     text NOT NULL CHECK (char_length(real_name) BETWEEN 2 AND 100),
  country       text,
  rewaya        text NOT NULL DEFAULT '',
  teacher       text NOT NULL DEFAULT '' CHECK (char_length(teacher) <= 300),
  ijazah_info   text NOT NULL DEFAULT '' CHECK (char_length(ijazah_info) <= 1000),
  sample_path   text,
  sample_mime   text,
  status        text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  reject_reason text NOT NULL DEFAULT '',
  reviewed_by   bigint REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at   timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS community_verifications_open ON community_verifications(user_id) WHERE status = 'pending';

-- Quran Talents social layer (owner decision 21.10.2026: all social features are free): comments, saved clips,
-- story highlights, notifications
CREATE TABLE IF NOT EXISTS community_post_comments (
  id         bigserial PRIMARY KEY,
  post_id    bigint NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  author_id  bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body       text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 500),
  created_at timestamptz NOT NULL DEFAULT now(),
  removed_at timestamptz
);
CREATE INDEX IF NOT EXISTS community_post_comments_post ON community_post_comments(post_id, id);
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS comment_count integer NOT NULL DEFAULT 0;
CREATE TABLE IF NOT EXISTS community_post_saves (
  post_id    bigint NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id    bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, post_id)
);
CREATE TABLE IF NOT EXISTS community_highlights (
  id         bigserial PRIMARY KEY,
  owner_id   bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title      text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 30),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS community_highlight_items (
  highlight_id bigint NOT NULL REFERENCES community_highlights(id) ON DELETE CASCADE,
  post_id      bigint NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  position     smallint NOT NULL DEFAULT 0,
  PRIMARY KEY (highlight_id, post_id)
);
CREATE TABLE IF NOT EXISTS community_notifications (
  id         bigserial PRIMARY KEY,
  user_id    bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind       text NOT NULL CHECK (kind IN ('follow','like','comment','post_approved','post_rejected','connect_request','connect_accepted','verified','verification_rejected')),
  actor_id   bigint REFERENCES users(id) ON DELETE CASCADE,
  post_id    bigint REFERENCES community_posts(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  read_at    timestamptz
);
CREATE INDEX IF NOT EXISTS community_notifications_user ON community_notifications(user_id, id DESC);

-- Quran Talents profile settings: avatar (file in MEDIA_DIR/avatars), private account (new followers need approval,
-- clips and lists only for followers), who may message, acceptance of terms and community guidelines
ALTER TABLE community_profiles ADD COLUMN IF NOT EXISTS avatar_path text;
ALTER TABLE community_profiles ADD COLUMN IF NOT EXISTS avatar_version integer NOT NULL DEFAULT 0;
ALTER TABLE community_profiles ADD COLUMN IF NOT EXISTS private boolean NOT NULL DEFAULT false;
ALTER TABLE community_profiles ADD COLUMN IF NOT EXISTS message_policy text NOT NULL DEFAULT 'connections';
DO $$ BEGIN
  ALTER TABLE community_profiles ADD CONSTRAINT community_profiles_message_policy CHECK (message_policy IN ('connections','nobody'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
ALTER TABLE community_profiles ADD COLUMN IF NOT EXISTS guidelines_accepted_at timestamptz;
CREATE TABLE IF NOT EXISTS community_follow_requests (
  requester_id bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_id    bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at   timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (requester_id, target_id),
  CHECK (requester_id <> target_id)
);
CREATE INDEX IF NOT EXISTS community_follow_requests_target ON community_follow_requests(target_id);
DO $$ BEGIN
  ALTER TABLE community_notifications DROP CONSTRAINT IF EXISTS community_notifications_kind_check;
  ALTER TABLE community_notifications ADD CONSTRAINT community_notifications_kind_check CHECK (kind IN ('follow','follow_request','like','comment','post_approved','post_rejected','connect_request','connect_accepted','verified','verification_rejected'));
EXCEPTION WHEN others THEN NULL; END $$;

-- Quran Talents badges (owner decision 21.10.2026, no manual work): emerald check (automatic: e-mail confirmed, 16+,
-- profile complete, guidelines accepted; phone by SMS once an SMS provider exists), gold check "Masterclass Reciter"
-- (automatic: Reciter Path level certificate from the exam module + emerald), official star (YouTube channel proven
-- with Google OAuth and enough subscribers, or an invite code; admins can override). Stored for fast lists,
-- recomputed by src/lib/talentBadges.ts.
ALTER TABLE community_profiles ADD COLUMN IF NOT EXISTS badge text NOT NULL DEFAULT 'none';
DO $$ BEGIN
  ALTER TABLE community_profiles ADD CONSTRAINT community_profiles_badge CHECK (badge IN ('none','emerald','gold'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
ALTER TABLE community_profiles ADD COLUMN IF NOT EXISTS official boolean NOT NULL DEFAULT false;
ALTER TABLE community_profiles ADD COLUMN IF NOT EXISTS official_source text;          -- youtube | invite | admin
ALTER TABLE community_profiles ADD COLUMN IF NOT EXISTS official_channel text;         -- public channel title (YouTube)
ALTER TABLE community_profiles ADD COLUMN IF NOT EXISTS official_channel_id text;
ALTER TABLE community_profiles ADD COLUMN IF NOT EXISTS official_subscribers integer;
ALTER TABLE community_profiles ADD COLUMN IF NOT EXISTS official_at timestamptz;
ALTER TABLE community_profiles ADD COLUMN IF NOT EXISTS badge_override text;           -- admin: 'none' blocks automatic badges
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_verified_at timestamptz;              -- set once SMS verification exists
-- one-time tickets that carry the signed-in member from the app into the Google OAuth flow (only the hash)
CREATE TABLE IF NOT EXISTS community_oauth_tickets (
  ticket_hash text PRIMARY KEY,
  user_id     bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target      text NOT NULL DEFAULT 'app' CHECK (target IN ('app','web')),
  locale      text NOT NULL DEFAULT 'en',
  expires_at  timestamptz NOT NULL,
  used_at     timestamptz
);

-- Sijill (academic record, owner decision 21.10.2026): the social side shows learning achievements only (posting is
-- switched off in src/lib/feed/config.json, the clip tables above stay). The app sends a compact summary of aggregates
-- computed on the device (no raw data); server-verified items (certificates, exam attempts) are read from their tables.
-- Every section is hidden until the member switches it on (sijill_privacy: section -> true). Leaderboards are opt-in.
ALTER TABLE community_profiles ADD COLUMN IF NOT EXISTS achievements jsonb NOT NULL DEFAULT '{}';
ALTER TABLE community_profiles ADD COLUMN IF NOT EXISTS achievements_updated_at timestamptz;
ALTER TABLE community_profiles ADD COLUMN IF NOT EXISTS sijill_privacy jsonb NOT NULL DEFAULT '{}';
ALTER TABLE community_profiles ADD COLUMN IF NOT EXISTS leaderboard_opt_in boolean NOT NULL DEFAULT false;
-- copies of a few summary values for discovery, study buddies and leaderboards (set by the sync endpoint)
ALTER TABLE community_profiles ADD COLUMN IF NOT EXISTS study_stage text NOT NULL DEFAULT '';
ALTER TABLE community_profiles ADD COLUMN IF NOT EXISTS study_focus text NOT NULL DEFAULT '';
ALTER TABLE community_profiles ADD COLUMN IF NOT EXISTS study_level smallint NOT NULL DEFAULT 0;
ALTER TABLE community_profiles ADD COLUMN IF NOT EXISTS study_minutes smallint NOT NULL DEFAULT 0;
ALTER TABLE community_profiles ADD COLUMN IF NOT EXISTS current_surah smallint;
ALTER TABLE community_profiles ADD COLUMN IF NOT EXISTS memorised_verses integer NOT NULL DEFAULT 0;
ALTER TABLE community_profiles ADD COLUMN IF NOT EXISTS week_monday integer NOT NULL DEFAULT 0;
ALTER TABLE community_profiles ADD COLUMN IF NOT EXISTS week_xp integer NOT NULL DEFAULT 0;
ALTER TABLE community_profiles ADD COLUMN IF NOT EXISTS week_active smallint NOT NULL DEFAULT 0;
ALTER TABLE community_profiles ADD COLUMN IF NOT EXISTS streak_days integer NOT NULL DEFAULT 0;
CREATE INDEX IF NOT EXISTS community_profiles_study ON community_profiles(study_stage, study_level) WHERE public AND NOT suspended;
-- achievement moments: generated by the system from the sync (never written by members), one per member, kind and ref
CREATE TABLE IF NOT EXISTS community_moments (
  id             bigserial PRIMARY KEY,
  user_id        bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind           text NOT NULL CHECK (kind IN ('certificate','exam','level','juz','tree','sticker','streak','course','hifz')),
  ref            text NOT NULL DEFAULT '' CHECK (char_length(ref) <= 40),
  data           jsonb NOT NULL DEFAULT '{}',
  reaction_count integer NOT NULL DEFAULT 0,
  created_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, kind, ref)
);
CREATE INDEX IF NOT EXISTS community_moments_user ON community_moments(user_id, id DESC);
-- reactions: a gold heart or one of three preset encouragements, one per person and moment (no free text)
CREATE TABLE IF NOT EXISTS community_moment_reactions (
  moment_id  bigint NOT NULL REFERENCES community_moments(id) ON DELETE CASCADE,
  user_id    bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reaction   text NOT NULL CHECK (reaction IN ('like','mashallah','barakallah','barik')),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (moment_id, user_id)
);
ALTER TABLE community_notifications ADD COLUMN IF NOT EXISTS moment_id bigint REFERENCES community_moments(id) ON DELETE CASCADE;
ALTER TABLE community_notifications ADD COLUMN IF NOT EXISTS reaction text;
DO $$ BEGIN
  ALTER TABLE community_notifications DROP CONSTRAINT IF EXISTS community_notifications_kind_check;
  ALTER TABLE community_notifications ADD CONSTRAINT community_notifications_kind_check CHECK (kind IN ('follow','follow_request','like','comment','post_approved','post_rejected','connect_request','connect_accepted','verified','verification_rejected','moment_reaction'));
EXCEPTION WHEN others THEN NULL; END $$;

-- keep last: the app user needs rights on every table above
GRANT ALL ON ALL TABLES IN SCHEMA public TO tafsirflow;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO tafsirflow;

-- every plan change an admin makes on /admin/users (who, on whom, what)
CREATE TABLE IF NOT EXISTS admin_user_actions (
  id             bigserial PRIMARY KEY,
  admin_id       bigint REFERENCES users(id) ON DELETE SET NULL,
  target_user_id bigint REFERENCES users(id) ON DELETE SET NULL,
  action         text NOT NULL,      -- grant_premium | grant_pro_until | revoke
  detail         jsonb NOT NULL DEFAULT '{}',
  created_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS admin_user_actions_target ON admin_user_actions(target_user_id, id DESC);

-- rewards for encouragement: one row per counted reaction (a reaction counts once per giver and moment, even if it is
-- removed and given again), capped per giver and receiver, per receiver and per giver per day (see src/lib/sijill.ts)
CREATE TABLE IF NOT EXISTS community_reaction_credits (
  moment_id   bigint NOT NULL REFERENCES community_moments(id) ON DELETE CASCADE,
  giver_id    bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day         date   NOT NULL DEFAULT (now() AT TIME ZONE 'UTC')::date,
  PRIMARY KEY (moment_id, giver_id)
);
CREATE INDEX IF NOT EXISTS community_reaction_credits_receiver ON community_reaction_credits(receiver_id, day);
CREATE INDEX IF NOT EXISTS community_reaction_credits_giver ON community_reaction_credits(giver_id, day);
GRANT ALL ON ALL TABLES IN SCHEMA public TO tafsirflow;

-- Worldwide rankings (opt-in, privacy-safe; src/lib/rankings.ts). Names appear only for members who switched leaderboards
-- on, accepted the worldwide listing (rankings_world) and are 16+; count_country lets any member count anonymously into
-- the country totals. The snapshot is rebuilt at most every 10 minutes; seasons keep the history (hall of fame).
ALTER TABLE community_profiles ADD COLUMN IF NOT EXISTS rankings_world boolean NOT NULL DEFAULT false;
ALTER TABLE community_profiles ADD COLUMN IF NOT EXISTS count_country boolean NOT NULL DEFAULT false;
CREATE TABLE IF NOT EXISTS ranking_meta (
  key        text PRIMARY KEY,
  value      text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS ranking_snapshot (
  user_id        bigint PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  username       text NOT NULL,
  display_name   text NOT NULL DEFAULT '',
  avatar_path    text,
  avatar_version integer NOT NULL DEFAULT 0,
  country        text,
  badge          text,
  level          text NOT NULL DEFAULT 'talent',
  named          boolean NOT NULL DEFAULT false,   -- may appear by name in the worldwide lists
  circle         boolean NOT NULL DEFAULT false,   -- on the leaderboards among people who follow each other
  is_public      boolean NOT NULL DEFAULT true,
  counted        boolean NOT NULL DEFAULT false,   -- counts into the country totals (anonymous)
  xp_week        integer NOT NULL DEFAULT 0,
  xp_total       bigint  NOT NULL DEFAULT 0,
  streak         integer NOT NULL DEFAULT 0,
  verses         integer NOT NULL DEFAULT 0,
  verses_week    integer NOT NULL DEFAULT 0,
  stickers       integer NOT NULL DEFAULT 0,
  stickers_week  integer NOT NULL DEFAULT 0,
  mashaallah     integer NOT NULL DEFAULT 0,
  active7        boolean NOT NULL DEFAULT false,
  active30       boolean NOT NULL DEFAULT false
);
CREATE INDEX IF NOT EXISTS ranking_snapshot_country ON ranking_snapshot(country) WHERE named;
CREATE TABLE IF NOT EXISTS ranking_countries (
  period   text NOT NULL CHECK (period IN ('week','all')),
  country  text NOT NULL,
  members  integer NOT NULL,   -- members counted (only countries with enough members are stored)
  active   integer NOT NULL,   -- active this week (week) or in the last 30 days (all)
  xp       bigint NOT NULL DEFAULT 0,
  stickers bigint NOT NULL DEFAULT 0,
  verses   bigint NOT NULL DEFAULT 0,
  PRIMARY KEY (period, country)
);
-- XP of every closed week and the sticker/verse counts at the start of the week (for weekly gains and monthly/yearly sums)
CREATE TABLE IF NOT EXISTS ranking_week_xp (
  week_monday integer NOT NULL,
  user_id     bigint  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  xp          integer NOT NULL,
  PRIMARY KEY (week_monday, user_id)
);
CREATE TABLE IF NOT EXISTS ranking_week_base (
  week_monday integer NOT NULL,
  user_id     bigint  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stickers    integer NOT NULL DEFAULT 0,
  verses      integer NOT NULL DEFAULT 0,
  PRIMARY KEY (week_monday, user_id)
);
-- seasons: week (key = Monday), month (2026-10), ramadan (hijri year), year (2026); results stay forever
CREATE TABLE IF NOT EXISTS ranking_seasons (
  id           bigserial PRIMARY KEY,
  kind         text NOT NULL CHECK (kind IN ('week','month','ramadan','year')),
  key          text NOT NULL,
  starts_on    date NOT NULL,
  ends_on      date NOT NULL,
  participants integer NOT NULL DEFAULT 0,
  closed_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (kind, key)
);
CREATE TABLE IF NOT EXISTS ranking_results (
  season_id bigint  NOT NULL REFERENCES ranking_seasons(id) ON DELETE CASCADE,
  metric    text    NOT NULL,   -- xp_season | xp_total | streak | verses | stickers | mashaallah
  pos       integer NOT NULL,   -- 1..100 (row order)
  rank      integer NOT NULL,   -- competition rank (ties share it)
  user_id   bigint  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  score     bigint  NOT NULL,
  country   text,
  PRIMARY KEY (season_id, metric, pos)
);
CREATE INDEX IF NOT EXISTS ranking_results_user ON ranking_results(user_id, season_id);
CREATE TABLE IF NOT EXISTS ranking_country_results (
  season_id bigint  NOT NULL REFERENCES ranking_seasons(id) ON DELETE CASCADE,
  metric    text    NOT NULL CHECK (metric IN ('xp','stickers','verses')),
  mode      text    NOT NULL CHECK (mode IN ('total','per_capita')),
  pos       integer NOT NULL,
  rank      integer NOT NULL,
  country   text    NOT NULL,
  members   integer NOT NULL,
  active    integer NOT NULL,
  score     numeric(16,2) NOT NULL,
  PRIMARY KEY (season_id, metric, mode, pos)
);
-- ===== Mishary track (21.10.2026): mentoring (text + audio review, no video) and talent seasons =====
-- Mentoring is connection-based: a member asks a verified master (level master/sheikh, gold or official badge) whom
-- they are connected with; the master accepts. Recordings are audio only (30–60 s, recorded in the app), private in
-- MEDIA_DIR/mentoring and deleted 60 days after upload (files first, then the row keeps the feedback).
CREATE TABLE IF NOT EXISTS mentoring_links (
  id           bigserial PRIMARY KEY,
  master_id    bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  student_id   bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status       text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','declined','ended')),
  note         text NOT NULL DEFAULT '' CHECK (char_length(note) <= 200),
  created_at   timestamptz NOT NULL DEFAULT now(),
  responded_at timestamptz,
  UNIQUE (master_id, student_id),
  CHECK (master_id <> student_id)
);
CREATE INDEX IF NOT EXISTS mentoring_links_student ON mentoring_links(student_id, status);
CREATE INDEX IF NOT EXISTS mentoring_links_master ON mentoring_links(master_id, status);
-- talent seasons: monthly / Ramadan / special challenges on a verse range; results feed the Hall of Fame and rankings
CREATE TABLE IF NOT EXISTS talent_seasons (
  id               bigserial PRIMARY KEY,
  slug             text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9-]{3,40}$'),
  kind             text NOT NULL CHECK (kind IN ('month','ramadan','special')),
  title            text NOT NULL DEFAULT '' CHECK (char_length(title) <= 80),
  verses           text NOT NULL,                      -- "67:1-5" (one surah, a verse range)
  starts_on        date NOT NULL,
  ends_on          date NOT NULL,
  max_seconds      integer NOT NULL DEFAULT 180 CHECK (max_seconds BETWEEN 30 AND 300),
  reward_mythic    text NOT NULL,                      -- new sticker id for the winner (never reuses an existing id)
  reward_legendary text NOT NULL,                      -- new sticker id for places 2 and 3
  status           text NOT NULL DEFAULT 'open' CHECK (status IN ('open','judging','closed')),
  published_at     timestamptz,
  created_by       bigint REFERENCES users(id) ON DELETE SET NULL,
  created_at       timestamptz NOT NULL DEFAULT now(),
  CHECK (ends_on >= starts_on)
);
CREATE TABLE IF NOT EXISTS mentoring_submissions (
  id          bigserial PRIMARY KEY,
  student_id  bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  master_id   bigint REFERENCES users(id) ON DELETE CASCADE,          -- mentoring: the master asked for feedback
  season_id   bigint REFERENCES talent_seasons(id) ON DELETE CASCADE, -- season: reviewed by masters and admins
  verse_key   text NOT NULL,
  duration_ms integer NOT NULL,
  note        text NOT NULL DEFAULT '' CHECK (char_length(note) <= 300),
  media_path  text,                                    -- inside MEDIA_DIR (never a public URL); null once deleted
  media_mime  text,
  status      text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','reviewed','withdrawn')),
  created_at  timestamptz NOT NULL DEFAULT now(),
  expires_at  timestamptz NOT NULL DEFAULT now() + interval '60 days',
  deleted_at  timestamptz,
  CHECK ((master_id IS NULL) <> (season_id IS NULL))
);
CREATE INDEX IF NOT EXISTS mentoring_submissions_student ON mentoring_submissions(student_id, created_at DESC);
CREATE INDEX IF NOT EXISTS mentoring_submissions_master ON mentoring_submissions(master_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS mentoring_submissions_season ON mentoring_submissions(season_id, status);
CREATE INDEX IF NOT EXISTS mentoring_submissions_expiry ON mentoring_submissions(expires_at) WHERE media_path IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS mentoring_submissions_one_entry ON mentoring_submissions(season_id, student_id) WHERE season_id IS NOT NULL AND status <> 'withdrawn';
-- structured feedback: rubric 1..5 per area plus a short text (checked by moderate()); one review per reviewer
CREATE TABLE IF NOT EXISTS mentoring_reviews (
  id            bigserial PRIMARY KEY,
  submission_id bigint NOT NULL REFERENCES mentoring_submissions(id) ON DELETE CASCADE,
  reviewer_id   bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  makharij      smallint NOT NULL CHECK (makharij BETWEEN 1 AND 5),
  tajweed       smallint NOT NULL CHECK (tajweed BETWEEN 1 AND 5),
  waqf          smallint NOT NULL CHECK (waqf BETWEEN 1 AND 5),
  pace          smallint NOT NULL CHECK (pace BETWEEN 1 AND 5),
  maqam         smallint NOT NULL CHECK (maqam BETWEEN 1 AND 5),
  body          text NOT NULL DEFAULT '' CHECK (char_length(body) <= 600),
  flagged       text,                                  -- soft hit of moderate(), for the admin
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (submission_id, reviewer_id)
);
-- published season results (hook for rankings: one row per placed member; score = average rubric total 5..25)
CREATE TABLE IF NOT EXISTS season_results (
  season_id    bigint NOT NULL REFERENCES talent_seasons(id) ON DELETE CASCADE,
  user_id      bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  place        smallint NOT NULL CHECK (place BETWEEN 1 AND 10),
  score        numeric(5,2) NOT NULL,
  sticker_id   text,                                   -- reward sticker (talent_seasons.reward_mythic / reward_legendary)
  rarity       text CHECK (rarity IN ('mythic','legendary')),
  published_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (season_id, user_id)
);
CREATE INDEX IF NOT EXISTS season_results_user ON season_results(user_id);
GRANT ALL ON ALL TABLES IN SCHEMA public TO tafsirflow;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO tafsirflow;
