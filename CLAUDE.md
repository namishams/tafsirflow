# TafsirFlow — project brief for Claude Code

Responsive web platform for listening to the Quran verse by verse and studying tafsir alongside the audio.
Owner: Nami (contact@namishams.com). Working language with the owner: German.

> **Read `docs/BLUEPRINT.md` first** – it is the agreed overall picture (vision, signature idea, design rules, roadmap, open decisions). Build only what it describes; UI changes must pass the multi-size check.

## Product decisions (confirmed by the owner)
- **Languages:** German + English UI and content at launch; architecture must allow adding more languages (i18n keys + per-language content tables, no hard-coded strings).
- **Core flow:** verse-by-verse. Play a verse → highlight the current word (timing segments) → show tafsir for that verse. Modes: *Learn* (pause after each verse until "Continue") and *Continuous*. Repeat ×N, speed, jump to verse, all 114 surahs.
- **Reciters:** several voices (see `scripts/download-audio.sh`), audio self-hosted on the VPS.
- **Accounts:** e-mail sign-up/login. Users get progress (last verse per surah), bookmarks, notes. Admin area for the owner.
- **Freemium gate:** anonymous visitors can use tafsir up to a limit (default: 20 verses with tafsir per day, configurable in admin); after that, a free account is required. Later: paid premium tier (Stripe) — design the plan/entitlement model now, wire payments later.
- **Responsive:** mobile-first; tafsir opens as a bottom sheet on phones (see prototype).
- **Domain:** decided later. Suggested & available as of 2026-10-06: `tafsirflow.com` (+ `tafsirflow.de` redirect). Until then serve on the server IP.

### Open question to confirm with the owner
- German tafsir source. No openly licensed classical German tafsir exists in the Quran.com API. Options presented: (a) AI-generated German explanations, clearly labelled as such and approved in the admin area before publishing; (b) owner/scholar writes German content in an admin editor; (c) license a published German tafsir. Build the content model so all three work (tafsir entries have `source`, `language`, `status: draft|approved`, `generated_by_ai: bool`).

## Content & licensing rules (important)
- Quran text, translations, word-by-word data, timing segments and the English tafsirs (Ibn Kathir abridged, Ma'arif al-Qur'an, Tazkirul Quran) come from the **Quran.com API v4** (`https://api.quran.com/api/v4`, CORS open). Show source attribution under every tafsir. Prefer fetching/caching over bulk-republishing tafsir text; check Quran.com API terms before storing tafsir permanently.
- German translation: Bubenheim & Elyas (translation id `27`); alternative Abu Reda (`208`). English: Saheeh International (`20`).
- Audio: per-verse MP3s from everyayah.com (free for Quran projects), self-hosted under `/srv/tafsirflow/audio/<Reciter>/<SSSAAA>.mp3`.
- Do **not** mirror quran411.com's English narration recordings (their own productions) unless the owner confirms permission. Their Arabic Alafasy files are the same recording as everyayah's `Alafasy_128kbps`.

## Recommended stack
- Next.js (App Router, TypeScript) + Tailwind, `next-intl` for i18n (`/de`, `/en`).
- PostgreSQL + Prisma. Auth: Auth.js (credentials + magic link) or Lucia.
- Nginx serves `/audio/*` directly from disk with long cache headers and range requests; Next.js runs under PM2 (or systemd) behind Nginx.
- Stripe later (plans: free, premium).

### Suggested data model (start point)
`User`, `Session`, `Plan`/`Subscription`, `UsageCounter` (anon by hashed IP+cookie, per day), `Progress` (user, surah, verse), `Bookmark`, `Note`, `Language`, `TafsirSource`, `TafsirEntry` (source, language, surah, verseFrom, verseTo, html, status, generatedByAi), `Reciter` (slug, name, folder, hasSegments).

## Prototype
`prototype/index.html` is a working single-file version (English, live Quran.com API, word highlighting, Learn/Continuous modes, three English tafsirs, mobile bottom sheet). Use it as the UX reference. Notes from it:
- Tafsir commentary is grouped: an empty entry belongs to the nearest earlier non-empty one; show "covers verses X–Y".
- Timing segments: `[index, wordPosition, startMs, endMs]`, sometimes strings → cast to numbers. Quran.com recitation ids with segments: 7 Alafasy, 2/1 AbdulBaset, 6/12 Husary, 9 Minshawi, 3 Sudais, 4 Shatri, 5 Rifai.
- Audio URLs from the API may be relative (prefix `https://verses.quran.com/`) or protocol-relative (`//…`). When self-hosting, map recitation → local folder and keep the API segments for timing (verify timings match the everyayah files; if not, disable word highlighting for that reciter).

## Server
- Hostinger VPS **srv2003094.hstgr.cloud**, IP **186.240.158.226**, KVM 1 (1 vCPU, 4 GB RAM, 50 GB disk), hPanel account info@onboardcourier.ae.
- NOT the LeadHero / onboardcourier.ae production server (62.72.32.76) — never touch that one from this project.
- Owner is reinstalling it as plain Ubuntu 24.04. Then run `scripts/server-setup.sh`, then `scripts/download-audio.sh`.
- **VPS plan expires 2026-10-23** — remind the owner to renew.
- Disk budget: each reciter ≈ 1.5–2.5 GB for all 6,236 verses (Alafasy 128 kbps: surahs 1–2 alone = 113 MB); with 50 GB disk start with 3–4 reciters.

## Roadmap
1. Scaffold Next.js app with i18n (de/en), port the prototype UI.
2. Audio served from VPS; reciter selector.
3. Auth + progress/bookmarks/notes; anonymous usage gate.
4. Admin: languages, tafsir sources, German tafsir editor/approval, usage limit setting, users.
5. Deploy (Nginx + PM2 + Let's Encrypt once the domain exists).
6. Stripe premium.
