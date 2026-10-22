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

-- live teacher–student link (Shams 2.0): the student invites an accepted connection / mentoring master as teacher and
-- consents to sharing an aggregate snapshot (plan, darajat, itqan per juz/surah, last 28 days, weak-spot counts; no
-- recordings, no answers). Revoking deletes the row and with it the server copy. 16+ or with the parental-consent flag.
CREATE TABLE IF NOT EXISTS teacher_shares (
  id            bigserial PRIMARY KEY,
  student_id    bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  teacher_id    bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status        text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','active')),
  consent_at    timestamptz NOT NULL DEFAULT now(),
  consent_ver   integer NOT NULL DEFAULT 1,
  parental      boolean NOT NULL DEFAULT false,
  snapshot      jsonb,
  synced_at     timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  accepted_at   timestamptz,
  UNIQUE (student_id, teacher_id),
  CHECK (student_id <> teacher_id)
);
CREATE INDEX IF NOT EXISTS teacher_shares_teacher ON teacher_shares(teacher_id, status);
CREATE INDEX IF NOT EXISTS teacher_shares_student ON teacher_shares(student_id, status);
-- gentle nudges (preset encouragement) and suggested portions; no free text
CREATE TABLE IF NOT EXISTS teacher_suggestions (
  id           bigserial PRIMARY KEY,
  share_id     bigint NOT NULL REFERENCES teacher_shares(id) ON DELETE CASCADE,
  kind         text NOT NULL CHECK (kind IN ('nudge','assign')),
  preset       text CHECK (preset IN ('keep_going','well_done','gentle_reminder','take_your_time')),
  surah        integer CHECK (surah BETWEEN 1 AND 114),
  from_verse   integer CHECK (from_verse BETWEEN 1 AND 286),
  to_verse     integer CHECK (to_verse BETWEEN 1 AND 286),
  status       text NOT NULL DEFAULT 'open' CHECK (status IN ('open','accepted','dismissed','done')),
  created_at   timestamptz NOT NULL DEFAULT now(),
  responded_at timestamptz,
  CHECK (kind <> 'assign' OR (surah IS NOT NULL AND from_verse IS NOT NULL AND to_verse >= from_verse)),
  CHECK (kind <> 'nudge' OR preset IS NOT NULL)
);
CREATE INDEX IF NOT EXISTS teacher_suggestions_share ON teacher_suggestions(share_id, status, created_at DESC);

-- Server feed corpus (owner request 21.10.2026): 100,000+ feed posts as REFERENCES only (verse keys, hadith
-- collection:number, tafsir id + verse key, name index, qbank question id, course lesson id, Wikipedia catalog title,
-- lemma, dua id, mutashabihat group, maqasid section). No Quran, hadith, tafsir or article text is stored; the clients
-- load every text from its source. Filled by scripts/feed-corpus.mjs (idempotent), served by /api/feed/page.
--   stream: kind plus bucket ("hadith:bukhari", "tafsir:en"); kseq is dense 0..n-1 inside a stream, so the API can
--   walk a per-install shuffled order with a permutation instead of ORDER BY random().
--   lang_tags: app locales that can show the item ('*' = all); tradition: all | sunni | shia.
CREATE TABLE IF NOT EXISTS feed_items (
  id         text PRIMARY KEY,
  kind       text NOT NULL,
  ref        jsonb NOT NULL,
  lang_tags  text[] NOT NULL DEFAULT '{*}',
  tradition  text NOT NULL DEFAULT 'all' CHECK (tradition IN ('all','sunni','shia')),
  topic      text NOT NULL DEFAULT '',
  weight     real NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE feed_items ADD COLUMN IF NOT EXISTS stream text;
ALTER TABLE feed_items ADD COLUMN IF NOT EXISTS kseq integer;
ALTER TABLE feed_items ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
CREATE INDEX IF NOT EXISTS feed_items_stream_seq ON feed_items(stream, kseq);
CREATE INDEX IF NOT EXISTS feed_items_kind ON feed_items(kind);
GRANT ALL ON ALL TABLES IN SCHEMA public TO tafsirflow;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO tafsirflow;

-- Profile extras (owner, 21.10.2026; app and website): learning goals (ids of the onboarding goals), a coarse city or
-- region (never an exact location), travel mode with an optional destination city, and who sees each of them
-- (extras_privacy: {"goals"|"city"|"travel": "everyone"|"followers"|"me"}; missing = goals everyone, others followers)
ALTER TABLE community_profiles ADD COLUMN IF NOT EXISTS learning_goals text[] NOT NULL DEFAULT '{}';
ALTER TABLE community_profiles ADD COLUMN IF NOT EXISTS city text NOT NULL DEFAULT '';
ALTER TABLE community_profiles ADD COLUMN IF NOT EXISTS travel_on boolean NOT NULL DEFAULT false;
ALTER TABLE community_profiles ADD COLUMN IF NOT EXISTS travel_city text NOT NULL DEFAULT '';
ALTER TABLE community_profiles ADD COLUMN IF NOT EXISTS extras_privacy jsonb NOT NULL DEFAULT '{}';

-- Sign-in with an e-mail code and passkeys (owner, 21.10.2026; app and website). Password sign-in stays as a second way.
-- email_codes: 6-digit one-time codes, only an HMAC with a random salt is stored ("salt$hash"), valid 10 minutes,
--   single use, at most 5 wrong attempts. purpose: signin (sign in or create the account) | confirm (a signed-in person
--   confirms a sensitive step or the address). Rows older than a day are removed by the code routes.
CREATE TABLE IF NOT EXISTS email_codes (
  id         bigserial PRIMARY KEY,
  email      text NOT NULL,
  purpose    text NOT NULL DEFAULT 'signin',
  code_hash  text NOT NULL,
  attempts   integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  used_at    timestamptz
);
CREATE INDEX IF NOT EXISTS email_codes_email ON email_codes(email, purpose, created_at DESC);
-- after a correct code for an address without an account: the short welcome form creates the account with this ticket
CREATE TABLE IF NOT EXISTS signup_tickets (
  token_hash text PRIMARY KEY,
  email      text NOT NULL,
  expires_at timestamptz NOT NULL
);
-- passkeys (WebAuthn, RP ID quranmasterclass.com): only the public key is stored
CREATE TABLE IF NOT EXISTS passkeys (
  id            bigserial PRIMARY KEY,
  user_id       bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  credential_id text UNIQUE NOT NULL,
  public_key    bytea NOT NULL,
  counter       bigint NOT NULL DEFAULT 0,
  transports    text[] NOT NULL DEFAULT '{}',
  device_type   text,
  backed_up     boolean NOT NULL DEFAULT false,
  aaguid        text,
  name          text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  last_used_at  timestamptz
);
CREATE INDEX IF NOT EXISTS passkeys_user ON passkeys(user_id);
-- random WebAuthn user handle per account (never the numeric id)
ALTER TABLE users ADD COLUMN IF NOT EXISTS webauthn_handle text;
-- one WebAuthn ceremony (challenge), single use, 5 minutes
CREATE TABLE IF NOT EXISTS webauthn_challenges (
  id         text PRIMARY KEY,
  challenge  text NOT NULL,
  purpose    text NOT NULL,
  user_id    bigint REFERENCES users(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL
);
-- the app signs in with a passkey through the system browser sheet (ASWebAuthenticationSession): the app holds the
-- secret, the browser only the id; kind login (done_user_id set by the browser) | register (user_id = signed-in account)
CREATE TABLE IF NOT EXISTS app_handoffs (
  id           text PRIMARY KEY,
  secret_hash  text NOT NULL,
  kind         text NOT NULL,
  user_id      bigint REFERENCES users(id) ON DELETE CASCADE,
  done_user_id bigint REFERENCES users(id) ON DELETE CASCADE,
  created_at   timestamptz NOT NULL DEFAULT now(),
  expires_at   timestamptz NOT NULL
);
-- sessions: when and how they started (security screen, "sign out other devices"); reauth_at = the last confirmation
-- with an e-mail code or password (sensitive steps need a sign-in or confirmation of the last 15 minutes)
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS method text;      -- password | code | passkey | register
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS client text;      -- web | ios | android
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS user_agent text;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS reauth_at timestamptz;
-- Progress profile and global leaderboards (owner 22.10.2026, additions only): monthly XP and verses, best streak and
-- passed exams per period in the rankings snapshot (src/lib/rankings.ts build), the month base for verse gains, and
-- partial indexes for the rank counts of the board (src/lib/careerStats.ts). Only members shown by name are indexed.
ALTER TABLE ranking_snapshot ADD COLUMN IF NOT EXISTS xp_month      bigint  NOT NULL DEFAULT 0;
ALTER TABLE ranking_snapshot ADD COLUMN IF NOT EXISTS verses_month  integer NOT NULL DEFAULT 0;
ALTER TABLE ranking_snapshot ADD COLUMN IF NOT EXISTS best_streak   integer NOT NULL DEFAULT 0;
ALTER TABLE ranking_snapshot ADD COLUMN IF NOT EXISTS exams_week    integer NOT NULL DEFAULT 0;
ALTER TABLE ranking_snapshot ADD COLUMN IF NOT EXISTS exams_month   integer NOT NULL DEFAULT 0;
ALTER TABLE ranking_snapshot ADD COLUMN IF NOT EXISTS exams_total   integer NOT NULL DEFAULT 0;
CREATE TABLE IF NOT EXISTS ranking_month_base (
  month_key integer NOT NULL,                      -- year * 100 + month (UTC)
  user_id   bigint  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  verses    integer NOT NULL DEFAULT 0,
  PRIMARY KEY (month_key, user_id)
);
CREATE INDEX IF NOT EXISTS ranking_snapshot_xp_week     ON ranking_snapshot(xp_week DESC)     WHERE named;
CREATE INDEX IF NOT EXISTS ranking_snapshot_xp_month    ON ranking_snapshot(xp_month DESC)    WHERE named;
CREATE INDEX IF NOT EXISTS ranking_snapshot_xp_total    ON ranking_snapshot(xp_total DESC)    WHERE named;
CREATE INDEX IF NOT EXISTS ranking_snapshot_verses      ON ranking_snapshot(verses DESC)      WHERE named;
CREATE INDEX IF NOT EXISTS ranking_snapshot_verses_week ON ranking_snapshot(verses_week DESC) WHERE named;
CREATE INDEX IF NOT EXISTS ranking_snapshot_verses_mon  ON ranking_snapshot(verses_month DESC) WHERE named;
CREATE INDEX IF NOT EXISTS ranking_snapshot_streak      ON ranking_snapshot(streak DESC)      WHERE named;
CREATE INDEX IF NOT EXISTS ranking_snapshot_best_streak ON ranking_snapshot(best_streak DESC) WHERE named;
CREATE INDEX IF NOT EXISTS ranking_snapshot_exams_week  ON ranking_snapshot(exams_week DESC)  WHERE named;
CREATE INDEX IF NOT EXISTS ranking_snapshot_exams_month ON ranking_snapshot(exams_month DESC) WHERE named;
CREATE INDEX IF NOT EXISTS ranking_snapshot_exams_total ON ranking_snapshot(exams_total DESC) WHERE named;
CREATE INDEX IF NOT EXISTS ranking_snapshot_username    ON ranking_snapshot(username);
CREATE INDEX IF NOT EXISTS exam_attempts_passed_user    ON exam_attempts(user_id, exam, ref) WHERE passed AND status = 'submitted' AND sig IS NOT NULL;
GRANT ALL ON ALL TABLES IN SCHEMA public TO tafsirflow;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO tafsirflow;

-- Together (gemeinsam lernen, owner 22.10.2026): friends today, weekly friend league, study circles (halaqa),
-- challenges between two friends, learn-together invitations, gentle preset nudges, community goals per country.
-- Every feature is opt-in per member (together_settings), 16+ on both sides; no free text between members
-- (circle names are checked with moderate()); report and block everywhere. Account deletion cascades.
CREATE TABLE IF NOT EXISTS together_settings (
  user_id        bigint PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  share_activity boolean NOT NULL DEFAULT false,  -- friends see "learned today" and the streak
  league         boolean NOT NULL DEFAULT false,  -- weekly league among friends
  circles        boolean NOT NULL DEFAULT false,  -- study circles (set when creating or joining one)
  challenges     boolean NOT NULL DEFAULT false,  -- friends may send challenges
  nudges         boolean NOT NULL DEFAULT false,  -- receive preset reminders from friends and circle members
  community      boolean NOT NULL DEFAULT false,  -- verses count for the country goal (sums only)
  best_list      boolean NOT NULL DEFAULT false,  -- may appear among the best learners of the month
  circle_gender  text CHECK (circle_gender IN ('brother','sister')), -- self-declared once, for brothers/sisters circles
  updated_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS together_settings_community ON together_settings(user_id) WHERE community;
-- weekly XP, active days and memorised verses as last seen (server week = mondayDay()); verses_start = the week's base
CREATE TABLE IF NOT EXISTS together_week_xp (
  week_monday  integer NOT NULL,
  user_id      bigint  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  xp           integer NOT NULL DEFAULT 0,
  active       smallint NOT NULL DEFAULT 0,
  verses_start integer NOT NULL DEFAULT 0,
  verses       integer NOT NULL DEFAULT 0,
  PRIMARY KEY (week_monday, user_id)
);
CREATE INDEX IF NOT EXISTS together_week_xp_user ON together_week_xp(user_id, week_monday DESC);
-- the member's tier in the friend league (1..6), settled lazily once per week
CREATE TABLE IF NOT EXISTS together_league (
  user_id     bigint PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  tier        smallint NOT NULL DEFAULT 1 CHECK (tier BETWEEN 1 AND 6),
  week_monday integer NOT NULL DEFAULT 0,
  last_result text NOT NULL DEFAULT '' CHECK (last_result IN ('','up','stay','down')),
  last_rank   smallint,
  last_size   smallint,
  best_tier   smallint NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS together_circles (
  id           bigserial PRIMARY KEY,
  name         text NOT NULL,
  kind         text NOT NULL CHECK (kind IN ('brothers','sisters','family','teacher')),
  owner_id     bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code         text UNIQUE NOT NULL,
  approval     boolean NOT NULL DEFAULT true,
  goal_kind    text NOT NULL DEFAULT 'days' CHECK (goal_kind IN ('days','xp','verses')),
  goal         integer NOT NULL DEFAULT 20 CHECK (goal > 0),
  max_members  smallint NOT NULL DEFAULT 20,
  suspended_at timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS together_circles_owner ON together_circles(owner_id);
CREATE TABLE IF NOT EXISTS together_circle_members (
  circle_id bigint NOT NULL REFERENCES together_circles(id) ON DELETE CASCADE,
  user_id   bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role      text NOT NULL DEFAULT 'member' CHECK (role IN ('leader','member')),
  status    text NOT NULL DEFAULT 'member' CHECK (status IN ('pending','member')),
  joined_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (circle_id, user_id)
);
CREATE INDEX IF NOT EXISTS together_circle_members_user ON together_circle_members(user_id);
-- the circle's weekly goal as last seen (group streak = reached weeks in a row)
CREATE TABLE IF NOT EXISTS together_circle_weeks (
  circle_id   bigint NOT NULL REFERENCES together_circles(id) ON DELETE CASCADE,
  week_monday integer NOT NULL,
  progress    integer NOT NULL DEFAULT 0,
  goal        integer NOT NULL DEFAULT 0,
  members     smallint NOT NULL DEFAULT 0,
  reached     boolean NOT NULL DEFAULT false,
  PRIMARY KEY (circle_id, week_monday)
);
-- challenges between two friends (both can succeed; no stakes, no winner takes all)
CREATE TABLE IF NOT EXISTS together_challenges (
  id           bigserial PRIMARY KEY,
  from_id      bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_id        bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind         text NOT NULL CHECK (kind IN ('surah','verses','streak')),
  target       integer NOT NULL CHECK (target > 0),
  days         smallint NOT NULL CHECK (days BETWEEN 3 AND 60),
  status       text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','active','declined','cancelled','ended')),
  created_at   timestamptz NOT NULL DEFAULT now(),
  starts_at    timestamptz,
  ends_at      timestamptz,
  from_base    integer NOT NULL DEFAULT 0,
  to_base      integer NOT NULL DEFAULT 0,
  from_done_at timestamptz,
  to_done_at   timestamptz
);
CREATE INDEX IF NOT EXISTS together_challenges_from ON together_challenges(from_id, created_at DESC);
CREATE INDEX IF NOT EXISTS together_challenges_to ON together_challenges(to_id, created_at DESC);
-- "learn together" invitations to one friend or to a circle: a topic and a time, answers yes/no
CREATE TABLE IF NOT EXISTS together_invites (
  id         bigserial PRIMARY KEY,
  from_id    bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_id      bigint REFERENCES users(id) ON DELETE CASCADE,
  circle_id  bigint REFERENCES together_circles(id) ON DELETE CASCADE,
  topic      text NOT NULL CHECK (topic IN ('surah','review','tafsir','arabic','tajweed')),
  surah      smallint CHECK (surah BETWEEN 1 AND 114),
  at         timestamptz NOT NULL,
  cancelled  boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK ((to_id IS NULL) <> (circle_id IS NULL))
);
CREATE INDEX IF NOT EXISTS together_invites_from ON together_invites(from_id, at DESC);
CREATE INDEX IF NOT EXISTS together_invites_to ON together_invites(to_id, at DESC) WHERE to_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS together_invites_circle ON together_invites(circle_id, at DESC) WHERE circle_id IS NOT NULL;
CREATE TABLE IF NOT EXISTS together_invite_answers (
  invite_id  bigint NOT NULL REFERENCES together_invites(id) ON DELETE CASCADE,
  user_id    bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  answer     text NOT NULL CHECK (answer IN ('yes','no')),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (invite_id, user_id)
);
-- preset nudges only (no free text), rate-limited per pair and per recipient
CREATE TABLE IF NOT EXISTS together_nudges (
  id         bigserial PRIMARY KEY,
  from_id    bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_id      bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind       text NOT NULL CHECK (kind IN ('miss_you','together_today','dua_ease','well_done','keep_streak')),
  circle_id  bigint REFERENCES together_circles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  read_at    timestamptz
);
CREATE INDEX IF NOT EXISTS together_nudges_to ON together_nudges(to_id, id DESC);
CREATE INDEX IF NOT EXISTS together_nudges_pair ON together_nudges(from_id, to_id, created_at DESC);
-- memorised verses at the start of a month (first seen), for the community goals
CREATE TABLE IF NOT EXISTS together_month_base (
  month   text   NOT NULL,
  user_id bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  verses  integer NOT NULL DEFAULT 0,
  PRIMARY KEY (month, user_id)
);
GRANT ALL ON ALL TABLES IN SCHEMA public TO tafsirflow;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO tafsirflow;

-- Together: the member's place on the weekly world XP board as last seen (once a day) for the "rank change" line of
-- the summary the AI tutor reads (GET /api/together/summary). Only the own numbers; nothing about other members.
CREATE TABLE IF NOT EXISTS together_rank_seen (
  user_id   bigint PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  day       integer NOT NULL,
  rank      integer,
  prev_day  integer,
  prev_rank integer
);
GRANT ALL ON ALL TABLES IN SCHEMA public TO tafsirflow;

-- Recordings for a teacher (Shams 3.0, owner 22.10.2026, additions only): over an ACTIVE teacher link (teacher_shares)
-- the student sends one recording (makhraj coach, talaqqi, recitation from memory, drill; 5 s–5 min, at most 10
-- waiting per link) with a structured summary (own rating, ear-training answers, words heard – never a pronunciation
-- score, no free text). Only the student and that teacher can open it; the file lives in MEDIA_DIR/teacher-rec and is
-- deleted after 60 days (or on withdrawal, report removal, account deletion – the orphan purge in
-- src/lib/teacherRecitations.ts). The teacher answers once (may correct it): rubric 1–5 per area (optional each),
-- marked word refs "s:v:p" inside the range, a short text checked with moderate(). Reports go to community_reports
-- (target_type 'teacher_recitation' / 'teacher_review'), blocks hide both sides (community_blocks).
CREATE TABLE IF NOT EXISTS teacher_recitations (
  id          bigserial PRIMARY KEY,
  share_id    bigint NOT NULL REFERENCES teacher_shares(id) ON DELETE CASCADE,
  student_id  bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  teacher_id  bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind        text NOT NULL CHECK (kind IN ('blind','talaqqi','drill','makhraj')),
  surah       integer CHECK (surah BETWEEN 1 AND 114),
  from_verse  integer CHECK (from_verse BETWEEN 1 AND 286),
  to_verse    integer CHECK (to_verse BETWEEN 1 AND 286),
  letter      text CHECK (letter IS NULL OR char_length(letter) <= 4),
  duration_ms integer NOT NULL CHECK (duration_ms BETWEEN 1000 AND 310000),
  summary     jsonb NOT NULL DEFAULT '{}'::jsonb,
  media_path  text,                                     -- inside MEDIA_DIR (never a public URL); null once deleted
  media_mime  text,
  status      text NOT NULL DEFAULT 'open' CHECK (status IN ('open','reviewed','withdrawn')),
  created_at  timestamptz NOT NULL DEFAULT now(),
  expires_at  timestamptz NOT NULL DEFAULT now() + interval '60 days',
  deleted_at  timestamptz,
  CHECK (student_id <> teacher_id),
  CHECK (surah IS NULL OR (from_verse IS NOT NULL AND to_verse IS NOT NULL AND to_verse >= from_verse))
);
CREATE INDEX IF NOT EXISTS teacher_recitations_student ON teacher_recitations(student_id, created_at DESC);
CREATE INDEX IF NOT EXISTS teacher_recitations_teacher ON teacher_recitations(teacher_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS teacher_recitations_share ON teacher_recitations(share_id, status);
CREATE INDEX IF NOT EXISTS teacher_recitations_expiry ON teacher_recitations(expires_at) WHERE media_path IS NOT NULL;
CREATE TABLE IF NOT EXISTS teacher_recitation_reviews (
  id             bigserial PRIMARY KEY,
  recitation_id  bigint NOT NULL UNIQUE REFERENCES teacher_recitations(id) ON DELETE CASCADE,
  teacher_id     bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  makharij       smallint CHECK (makharij BETWEEN 1 AND 5),
  tajweed        smallint CHECK (tajweed BETWEEN 1 AND 5),
  waqf           smallint CHECK (waqf BETWEEN 1 AND 5),
  pace           smallint CHECK (pace BETWEEN 1 AND 5),
  marks          jsonb NOT NULL DEFAULT '[]'::jsonb,
  body           text NOT NULL DEFAULT '' CHECK (char_length(body) <= 600),
  flagged        text,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON ALL TABLES IN SCHEMA public TO tafsirflow;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO tafsirflow;

-- AI tutor Dalil / Hidaya (src/lib/tutor/store.ts creates these on first use as well): one row per question without
-- text, user or IP (180 days), and reported answers without user or IP (90 days)
CREATE TABLE IF NOT EXISTS tutor_log (
  id         bigserial PRIMARY KEY,
  day        date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now(),
  source     text NOT NULL,
  locale     text NOT NULL,
  context    text,
  category   text,
  outcome    text NOT NULL,
  cached     boolean NOT NULL DEFAULT false,
  passages   integer NOT NULL DEFAULT 0,
  tokens_in  integer NOT NULL DEFAULT 0,
  tokens_out integer NOT NULL DEFAULT 0,
  ms         integer NOT NULL DEFAULT 0,
  model      text
);
CREATE INDEX IF NOT EXISTS tutor_log_day ON tutor_log (day);
CREATE TABLE IF NOT EXISTS tutor_reports (
  id         bigserial PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  answer_id  text NOT NULL,
  reason     text NOT NULL,
  note       text,
  locale     text NOT NULL,
  question   text,
  answer     text,
  sources    text,
  status     text NOT NULL DEFAULT 'open'
);

-- Together, review fixes 22.10.2026: circle week rows are written at most every 6 hours (or when the goal is reached);
-- one nudge per sender, recipient and UTC day (enforced by a unique index; the 20-hour rule and the daily limits are
-- checked under an advisory lock on the recipient in the same transaction)
ALTER TABLE together_circle_weeks ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE together_nudges ADD COLUMN IF NOT EXISTS day date NOT NULL DEFAULT ((now() AT TIME ZONE 'UTC')::date);
CREATE UNIQUE INDEX IF NOT EXISTS together_nudges_pair_day ON together_nudges(from_id, to_id, day);
CREATE INDEX IF NOT EXISTS together_nudges_created ON together_nudges(created_at);
GRANT ALL ON ALL TABLES IN SCHEMA public TO tafsirflow;

-- Founder badge (owner 22.10.2026): a gold check for exactly one account, the developer and founder. Only this
-- migration sets it (never derived from a username); the unique index allows one founder at most. community_profiles
-- carries a mirror (kept by triggers) so every profile select can show it without a join.
ALTER TABLE users ADD COLUMN IF NOT EXISTS founder boolean NOT NULL DEFAULT false;
CREATE UNIQUE INDEX IF NOT EXISTS users_one_founder ON users ((true)) WHERE founder;
UPDATE users SET founder = true
 WHERE lower(email) = 'namis@me.com' AND email_verified IS TRUE AND NOT founder
   AND NOT EXISTS (SELECT 1 FROM users f WHERE f.founder);
ALTER TABLE community_profiles ADD COLUMN IF NOT EXISTS founder boolean NOT NULL DEFAULT false;
CREATE OR REPLACE FUNCTION community_profiles_founder_sync() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.founder := COALESCE((SELECT u.founder FROM users u WHERE u.id = NEW.user_id), false);
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS community_profiles_founder ON community_profiles;
CREATE TRIGGER community_profiles_founder BEFORE INSERT OR UPDATE ON community_profiles FOR EACH ROW EXECUTE FUNCTION community_profiles_founder_sync();
CREATE OR REPLACE FUNCTION users_founder_sync() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.founder IS DISTINCT FROM OLD.founder THEN UPDATE community_profiles SET founder = NEW.founder WHERE user_id = NEW.id; END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS users_founder ON users;
CREATE TRIGGER users_founder AFTER UPDATE OF founder ON users FOR EACH ROW EXECUTE FUNCTION users_founder_sync();
UPDATE community_profiles c SET founder = u.founder FROM users u WHERE u.id = c.user_id AND c.founder IS DISTINCT FROM u.founder;
GRANT ALL ON ALL TABLES IN SCHEMA public TO tafsirflow;

-- Supporters list (owner 22.10.2026): voluntary support payments via Ziina whose payers chose to be named publicly.
-- A row is written as "pending" when the Ziina payment intent is created; only the server's own status check with Ziina
-- (return ?pi= or the webhook) sets it "paid". Only paid, listed and not hidden rows are public. No card data, no email.
CREATE TABLE IF NOT EXISTS supporters (
  id                bigserial PRIMARY KEY,
  payment_intent_id text NOT NULL UNIQUE,
  display_name      text,
  company           text,
  listed            boolean NOT NULL DEFAULT false,
  hidden            boolean NOT NULL DEFAULT false,
  amount_minor      integer NOT NULL,
  currency          text NOT NULL DEFAULT 'AED',
  status            text NOT NULL DEFAULT 'pending',
  created_at        timestamptz NOT NULL DEFAULT now(),
  paid_at           timestamptz
);
ALTER TABLE supporters ADD COLUMN IF NOT EXISTS hidden boolean NOT NULL DEFAULT false;
CREATE INDEX IF NOT EXISTS supporters_public ON supporters(paid_at DESC) WHERE status = 'paid' AND listed AND NOT hidden;
GRANT ALL ON ALL TABLES IN SCHEMA public TO tafsirflow;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO tafsirflow;

-- Star profiles (owner 22.10.2026): the well-known reciters of the reciters data (src/lib/reciters) each own a reserved
-- username (STARS in src/lib/usernameFilter.ts) and a public profile that is clearly marked as not run by the reciter.
-- The reciter or his official team asks to take it over (star_claims, signed-in account, link to an official channel);
-- an admin approves with one click: claimed_by is set, the reserved username moves to that account and the profile gets
-- the "star" badge (community_profiles.badge = 'star'). Seeded from the reciters data, idempotent.
CREATE TABLE IF NOT EXISTS star_profiles (
  slug         text PRIMARY KEY,                       -- the reserved username, e.g. mishary.alafasy
  reciter_id   text NOT NULL UNIQUE,                   -- slug in src/lib/reciters
  display_name text NOT NULL,
  country      text,
  claimed_by   bigint REFERENCES users(id) ON DELETE SET NULL,
  verified_at  timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS star_profiles_claimed_by ON star_profiles(claimed_by) WHERE claimed_by IS NOT NULL;
CREATE TABLE IF NOT EXISTS star_claims (
  id            bigserial PRIMARY KEY,
  star_slug     text NOT NULL REFERENCES star_profiles(slug) ON DELETE CASCADE,
  user_id       bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role          text NOT NULL CHECK (role IN ('self','team')),
  channel_url   text NOT NULL,                         -- link to the verified Instagram / X / YouTube / website
  message       text NOT NULL DEFAULT '',
  invited       boolean NOT NULL DEFAULT false,        -- came through the owner's signed invite link
  status        text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  reject_reason text,
  reviewed_by   bigint REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at   timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS star_claims_open ON star_claims(star_slug, user_id) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS star_claims_status ON star_claims(status, created_at);
INSERT INTO star_profiles (slug, reciter_id, display_name, country) VALUES
  ('mahmoud.alhusary', 'mahmoud-khalil-al-husary', 'Mahmoud Khalil Al-Husary', 'Egypt'),
  ('mohamed.alminshawi', 'mohamed-siddiq-al-minshawi', 'Mohamed Siddiq Al-Minshawi', 'Egypt'),
  ('abdulbasitabdulsamad', 'abdul-basit-abdul-samad', 'Abdul Basit Abdul Samad', 'Egypt'),
  ('mustafa.ismail', 'mustafa-ismail', 'Mustafa Ismail', 'Egypt'),
  ('muhammad.rifat', 'muhammad-rifat', 'Muhammad Rifat', 'Egypt'),
  ('abdelfattah.shaashai', 'abdel-fattah-al-shaashai', 'Abdel Fattah Al-Shaasha''i', 'Egypt'),
  ('mahmoud.albanna', 'mahmoud-ali-al-banna', 'Mahmoud Ali Al-Banna', 'Egypt'),
  ('mishary.alafasy', 'mishary-rashid-alafasy', 'Mishary Rashid Alafasy', 'Kuwait'),
  ('abdulrahman.alsudais', 'abdul-rahman-al-sudais', 'Abdul Rahman Al-Sudais', 'Saudi Arabia'),
  ('saud.alshuraim', 'saud-al-shuraim', 'Saud Al-Shuraim', 'Saudi Arabia'),
  ('maher.almuaiqly', 'maher-al-muaiqly', 'Maher Al-Muaiqly', 'Saudi Arabia'),
  ('yasser.aldosari', 'yasser-al-dosari', 'Yasser Al-Dosari', 'Saudi Arabia'),
  ('abdullah.aljuhany', 'abdullah-awad-al-juhany', 'Abdullah Awad Al-Juhany', 'Saudi Arabia'),
  ('bandar.baleela', 'bandar-baleela', 'Bandar Baleela', 'Saudi Arabia'),
  ('ali.alhudhaify', 'ali-al-hudhaify', 'Ali Al-Hudhaify', 'Saudi Arabia'),
  ('muhammad.ayyub', 'muhammad-ayyub', 'Muhammad Ayyub', 'Saudi Arabia'),
  ('ali.jaber', 'ali-jaber', 'Ali Jaber', 'Saudi Arabia'),
  ('abdullah.basfar', 'abdullah-basfar', 'Abdullah Basfar', 'Saudi Arabia'),
  ('saad.alghamdi', 'saad-al-ghamdi', 'Saad Al-Ghamdi', 'Saudi Arabia'),
  ('ahmed.alajmi', 'ahmed-al-ajmi', 'Ahmed Al-Ajmi', 'Saudi Arabia'),
  ('abubakr.alshatri', 'abu-bakr-al-shatri', 'Abu Bakr Al-Shatri', 'Saudi Arabia'),
  ('hani.arrifai', 'hani-ar-rifai', 'Hani Ar-Rifai', 'Saudi Arabia'),
  ('fares.abbad', 'fares-abbad', 'Fares Abbad', 'Yemen'),
  ('nasser.alqatami', 'nasser-al-qatami', 'Nasser Al-Qatami', 'Saudi Arabia'),
  ('idris.abkar', 'idris-abkar', 'Idris Abkar', 'Saudi Arabia'),
  ('muhammad.alluhaidan', 'muhammad-al-luhaidan', 'Muhammad Al-Luhaidan', 'Saudi Arabia'),
  ('salah.albudair', 'salah-al-budair', 'Salah Al-Budair', 'Saudi Arabia'),
  ('ibrahim.alakhdar', 'ibrahim-al-akhdar', 'Ibrahim Al-Akhdar', 'Saudi Arabia'),
  ('abdulbari.thubaity', 'abdulbari-ath-thubaity', 'Abdulbari Ath-Thubaity', 'Saudi Arabia'),
  ('salah.bukhatir', 'salah-bukhatir', 'Salah Bukhatir', 'United Arab Emirates'),
  ('khalifa.altunaiji', 'khalifa-al-tunaiji', 'Khalifa Al-Tunaiji', 'United Arab Emirates'),
  ('abdullah.almatroud', 'abdullah-al-matroud', 'Abdullah Al-Matroud', 'Saudi Arabia'),
  ('mohamed.altablawi', 'mohamed-mahmoud-al-tablawi', 'Mohamed Mahmoud Al-Tablawi', 'Egypt'),
  ('ahmed.naina', 'ahmed-naina', 'Ahmed Naina', 'Egypt'),
  ('muhammad.jibreel', 'muhammad-jibreel', 'Muhammad Jibreel', 'Egypt'),
  ('raad.alkurdi', 'raad-al-kurdi', 'Raad Al-Kurdi', 'Iraq'),
  ('islam.sobhi', 'islam-sobhi', 'Islam Sobhi', 'Egypt'),
  ('muhammad.assubayyil', 'muhammad-as-subayyil', 'Muhammad As-Subayyil', 'Saudi Arabia'),
  ('abdulmuhsin.alqasim', 'abdul-muhsin-al-qasim', 'Abdul Muhsin Al-Qasim', 'Saudi Arabia'),
  ('abdullah.khayyat', 'abdullah-khayyat', 'Abdullah Khayyat', 'Saudi Arabia'),
  ('ali.mahmoud', 'ali-mahmoud', 'Ali Mahmoud', 'Egypt'),
  ('taha.alfashni', 'taha-al-fashni', 'Taha Al-Fashni', 'Egypt'),
  ('shahat.anwar', 'shahat-muhammad-anwar', 'Shahat Muhammad Anwar', 'Egypt'),
  ('abdurrashid.sufi', 'abdur-rashid-sufi', 'Abdur-Rashid Sufi', 'Somalia'),
  ('mahmoud.anwar', 'mahmoud-shahat-anwar', 'Mahmoud Shahat Anwar', 'Egypt'),
  ('abulaynayn.shuaysha', 'abu-al-aynayn-shuaysha', 'Abu Al-Aynayn Shuaysha', 'Egypt'),
  ('khalid.aljalil', 'khalid-al-jalil', 'Khalid Al-Jalil', 'Saudi Arabia'),
  ('alzain.ahmad', 'al-zain-muhammad-ahmad', 'Al-Zain Muhammad Ahmad', 'Sudan'),
  ('ragheb.ghalwash', 'ragheb-mustafa-ghalwash', 'Ragheb Mustafa Ghalwash', 'Egypt'),
  ('kamel.albahtimi', 'kamel-yousef-al-bahtimi', 'Kamel Yousef Al-Bahtimi', 'Egypt')
ON CONFLICT (slug) DO NOTHING;
ALTER TABLE community_profiles DROP CONSTRAINT IF EXISTS community_profiles_badge;
ALTER TABLE community_profiles ADD CONSTRAINT community_profiles_badge CHECK (badge IN ('none','emerald','gold','star'));
GRANT ALL ON ALL TABLES IN SCHEMA public TO tafsirflow;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO tafsirflow;
