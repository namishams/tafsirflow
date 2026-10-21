# App Blueprint – Quran Masterclass (fixed template)

Stand: 21.10.2026. This is the fixed template for the native app (`mobile/`) and the server parts it uses.
The product vision and roadmap stay in `docs/BLUEPRINT.md`; this file says **where things go and which rules never change**.
New work must fit here; if it does not, update this file first (with the owner's OK).

## 1. The five tabs

| Tab (route) | Design | What belongs here |
|---|---|---|
| **Feed** `(tabs)/(home)` | Social, Instagram style (full-screen cards, stories rail, likes, share) | Verse/hadith/dua cards, stories, promos, sharer status, later: approved talent posts and stories |
| **Quran** `(tabs)/quran` | Masterclass | Surah list, reader, player, reciters, tafsir (collapsed per verse) |
| **Masterclass** `(tabs)/learn` | Masterclass | Shams Method, courses (Academy, Arabic, Tajweed), cards, tests, certificates, garden |
| **Discover** `(tabs)/library` | Masterclass | Library, Islam chapters, duas, radio, tools, **Quran Talents** (network entry) |
| **Account** `(tabs)/account` | Masterclass | Sign-in, Pro, settings, language, my talent profile, redeem master invite, admin moderation (admins only), legal |

`(tabs)/explore` is a hidden tab opened from the feed header. Deep screens live as stacks under `src/app/<path>` (routes = website paths).

## 2. Design rules

- **Masterclass design** everywhere except the feed: stage hero (`PageHero`), gold (`goldButton`, `stage.gold`) on deep emerald, white tiles (`RowGroup`, `LinkRow`, `GoldCard`), `src/components/{brand,page,form}.tsx`, tokens in `src/lib/theme.ts`.
- Tab bar: icons only on a floating **Liquid Glass** capsule (`expo-glass-effect`, blur fallback).
- Font **Plus Jakarta Sans** (`FONT.*`); Arabic Amiri, calligraphy Aref Ruqaa (initials on avatars).
- Light and dark mode, Dynamic Type, VoiceOver labels on every control, RTL-safe layouts, iPhone and iPad.
- German UI in the **Sie-form** (polite address in every language). **No emojis**, no all-caps headings, no decorative animation, nothing preselected.
- One clear primary (gold) action per screen.

## 3. Free vs Pro

- Free: feed, Quran reader (Alafasy, Husary), tafsir texts, first unit of every course, Shams for al-Fātiḥa and Juz ʿAmma, daily card/test limits, **the whole talent network** (profiles, follow, connect, messages, reports).
- Pro (monthly subscription, `src/lib/pro.tsx`): all courses and surahs, all reciters, offline, statistics, AI assistant; Pro includes 5 AI duas per month.
- Decide access only through `useEntitlement()` (`src/lib/entitlements.ts`) and `FREE` in `src/lib/pro.tsx`. Safety features (report, block, guidelines) are **never** behind Pro.
- The website stays free.

## 4. Content rules

- **No hand-typed Quran or hadith text.** Quran text, translations and tafsir come from the Quran.com API (`/api/q/...`); hadith from the synced sources. Every tafsir/translation/hadith shows its source.
- No invented numbers, rulings or hadith; new religious content is marked for scholar review.
- AI output is labelled as AI. Fatwa-like questions are not answered by the app.

## 5. Extend only

**Never delete or replace** an existing screen, route, table, column, endpoint or stored key. Add columns with
`ALTER TABLE … ADD COLUMN IF NOT EXISTS`, add routes next to the old ones, keep response fields (only add new ones).
`db/schema.sql` is applied on every deploy and must stay idempotent.

## 6. Where new features plug in

- **Routes:** `mobile/src/app/<path>.tsx` (stack screen with `PageHero back`). Tabs only change with the owner's OK.
- **Feature code:** `mobile/src/features/<name>/` (texts in `text.ts`, UI, API client). Shared UI only in `src/components`.
- **Texts:** de + en in the feature's `text.ts`; the other 12 languages in `mobile/src/i18n/app/<lang>.json` under the module key (`moduleText`). Website: `messages/*.json` (14 locales).
- **Feed promos:** `src/lib/feed/config.json` on the website (served as `/api/feed/config`, read by `features/feed/remote.ts`); new promo ids in `features/feed/Promo.tsx`.
- **Entitlements:** `src/lib/entitlements.ts` + `src/lib/pro.tsx` (app), `users.plan` / `pro_until` (server).
- **Server:** API routes under `src/app/api/<area>/`, helpers in `src/lib/`, rate limits with `rateLimited()` (`src/lib/http.ts`), text checks with `moderate()` (`src/lib/moderation.ts`), auth with `currentUser()` / `requireAdmin()` (`src/lib/auth.ts`).

## 7. Quran Talents network ("Quran Masterclass Talents")

Built on the existing reciters community (`community_profiles`, `community_follows`, `community_blocks`, `community_reports`, `/api/community/*`, `src/app/community/*`); everything there keeps working. **All social features are free.**

- **Profile (Instagram/TikTok structure, Masterclass design):** avatar (photo or calligraphic initials, gold ring for gold/official), name + badge + level, stats (posts · followers · following · likes), rewaya/maqam/country, bio, Follow / Message / Connect, story highlights, tabs (recitations grid, saved, achievements). App `src/app/talents/*`, `src/features/talents/*`; web `/[locale]/talents/<username>` (public, 16+ only, badged profiles indexed), `/talents/<username>/followers|following`, `/talents/me`.
- **Levels:** `talent | rising | master | sheikh` (admins or invite codes set them).
- **Badges (automatic, `src/lib/talentBadges.ts`):** emerald check (e-mail confirmed, 16+, profile complete, guidelines accepted; SMS phone check once a provider exists: `badges.requirePhone`), gold check "Masterclass Reciter" (emerald + signed Reciter Path certificate ≥ `badges.goldMinLevel` from the exam module), official star (YouTube channel via Google OAuth with ≥ `officialMinSubscribers` and a matching name, or an invite code; admin override and revoke). Tapping a badge explains it.
- **Social graph:** follow (private accounts approve follow requests), connection (request → accept/decline), 1:1 text messages between accepted connections (policy "connections" or "nobody"), comments, likes, saves, notifications.
- **Ages:** birth year + confirmation on the account (locked after confirmation). Under 13: no community. 13+: view, follow, like, save. 16+: post, comment, connect, message (both sides).
- **Achievements only (owner decision 21.10.2026):** the network is for connecting and showing learning achievements. `posting.enabled` in `src/lib/feed/config.json` is `false`: clips, stories, comments on clips, highlights, the record button, the reels tab and clip moderation are off on the server and hidden in app and web (the code stays behind the switch). Follow, connect, messages (report/block), notifications, discover and badges stay.
- **Sijill (academic record):** the app sends a summary of aggregates (`features/sijill/summary.ts` → `POST /api/community/achievements`, validated in `src/lib/sijill.ts`, stored in `community_profiles.achievements`); certificates and exams come only from the server tables. Every section is hidden until the member switches it on (`sijill_privacy`); leaderboards are opt-in. Achievement moments are system-generated (`community_moments`), reactions are a gold heart or three preset encouragements (`community_moment_reactions`), never free text. Compare only between mutual follows or connections; study buddies 16+. App: `/talents/sijill|friends|leaderboard|buddies|compare/<u>`; web: the Sijill on `/talents/<username>` and `/talents/me`.
- **Posting recitation clips (switched off, see above):** rule set `posting` in `src/lib/feed/config.json` (16+, badge ≥ emerald, Reciter Path certificate level, Pro off by default). Recorded only in the app: verse key → on-device word check (≥ 80 %) → 10–30 s voice (camera optional, off) → emerald/gold visual (verse text from Quran data) → admin approval. Stories 24 h (kept in highlights), posts until deleted. Files in `MEDIA_DIR` (private, streamed with access checks; ffmpeg transcode when available).
- **Safety (Apple 1.2):** guidelines, report and block on every screen; blocked members disappear; profanity/link filter (`moderate()`) on bios, comments, messages; moderation in the app (`/talents/admin`) and on the web (`/[locale]/admin/talents`); every admin step in `community_admin_actions`. Admin = `users.role = 'admin'` or `ADMIN_EMAIL` with a confirmed address. Account deletion removes all community rows and files.
- **Privacy:** no e-mail, real name, birth year or user ids in responses; avatars and public pages only for members 16+.
- **Server env:** `MEDIA_DIR` (absolute, writable; uploads answer 503 without it), optional `FFMPEG_PATH`, `GOOGLE_OAUTH_CLIENT_ID` / `GOOGLE_OAUTH_CLIENT_SECRET` (redirect URI `https://quranmasterclass.com/api/community/official/callback`), optional `YOUTUBE_MIN_SUBSCRIBERS`. Nginx `client_max_body_size` ≥ 50 MB for `/api/community/posts`.

## 8. Frozen framework (owner rule, 21.10.2026)

Before and after launch these parts are the fixed frame of the app. Prompts may only **add** to them (new stickers, new series, new stages at the end, new score sources, new profile sections), never change or replace what exists:

- **Stickers:** existing ids, series, rarities, art style and album. New stickers get new ids; existing ids keep their meaning and look.
- **Tree and garden:** scene, tree art, planting ceremony, onboarding journey visuals (tag `garten-design-v1`, see `src/features/garden/Scene.tsx` header). Growth points, stage thresholds and the 365-day calendar gate only change with the owner's explicit OK; stages are never taken away from a user.
- **Profiles (Sijill):** sections, badges (emerald, gold, official star) and their meaning, levels and app ranks.
- **Scores:** XP, levels, streaks, Darajat al-Hifz, hifz quality, exam pass marks, report-card grades (Mumtaz … Maqbul), certificate rules. Formulas are versioned; a change needs a new version and a migration that never lowers what a user already earned.
- **Storage keys and sync keys:** never renamed or reused; new data gets new keys.

The feed (content, post types, server config) stays flexible and grows over time.
