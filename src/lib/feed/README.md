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
  "image": "/images/...",
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
Edit `config.json` and bump `version`. Announcements appear between `startsAt` and `endsAt`.
