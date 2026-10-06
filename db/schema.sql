-- TafsirFlow content store. Quran.com responses are kept here so the site no longer depends on it at runtime.
-- Apply once:  sudo -u postgres psql -d tafsirflow -f db/schema.sql
CREATE TABLE IF NOT EXISTS api_cache (
  path        text PRIMARY KEY,           -- upstream path + query, e.g. /verses/by_chapter/1?...
  payload     jsonb NOT NULL,
  fetched_at  timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON api_cache TO tafsirflow;
