# Feed (server-driven)

Endpoints: `/api/feed/config`, `/api/feed/new`, `/api/feed/page` (types in `types.ts`).

## Add a post
Create `posts/<yyyy-mm>-<slug>.json`:

```json
{
  "id": "unique-slug",
  "kind": "article | verse | hadith | announcement",
  "title": { "de": "...", "en": "..." },
  "body": { "de": "...", "en": "..." },
  "verseKey": "2:255",
  "hadithId": "bukhari:1",
  "image": "(optional, only existing files under public/)",
  "source": "Quran.com",
  "sourceUrl": "https://...",
  "tradition": "all | sunni | shia",
  "publishAt": "2026-10-21T00:00:00Z",
  "expiresAt": "2026-12-31T00:00:00Z"
}
```

- Never type Quran or hadith text by hand: set `verseKey` / `hadithId`; the app loads the text from the source.
- `publishAt` in the future = scheduled. Invalid files are skipped (see server log), they do not break the feed.
- Changes show up after deploy (posts are re-read every 60 s, CDN caches up to 5 min).

## Remote config
Edit `config.json` and bump `version`. Deeplinks use the app scheme `quranmasterclass://<route>` (expo-router path). Labels: all 14 app locales, missing ones fall back to en. Promo ids the app renders natively: shams, pro, dua, name; other ids are shown as a plain card with title + deeplink. Announcements appear between `startsAt` and `endsAt`.

## Server corpus (endless `/api/feed/page`)
`feed_items` (db/schema.sql) holds 200,000+ posts as references only (verse keys, hadith collection:number, tafsir id +
verse key, name index, qbank id, lesson id, Wikipedia catalog title, lemma, dua id, mutashabihat group, maqasid section);
no Quran, hadith, tafsir or article text is stored. Fill or refresh it on the server (idempotent, safe to re-run):

```bash
sudo -u tafsir bash -lc "cd /srv/tafsirflow/app && node scripts/feed-corpus.mjs"
```

`--dry-run` builds and counts without the database, `--only=hadith,verse` limits the kinds, `--samples` prints examples.
`/api/feed/page?v=2&seed=<install seed>` walks a per-install shuffled order (src/lib/feed/corpus.ts) with variety rules,
the tradition filter and language availability; `nextCursor` is never null (a finished stream starts again in a new
order). Without `v=2` (older app builds) only verse and hadith posts come, as `editorial` items. Without the corpus (no
database, empty table) the previous day-by-day page answers. Weights per corpus kind and the app's share of corpus posts:
`corpus` in `config.json`.
