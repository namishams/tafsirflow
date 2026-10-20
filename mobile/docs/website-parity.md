# Website → app parity (quranmasterclass.com → native app)

Snapshot 20 Oct 2026, while all agents were still building. "Route exists" means the app route is in
`mobile/src/app`; it does not say the screen is finished. Owners: **lead** (Today, Masterclass, Quran/reader,
Shams, Academy, Pro, purchases, account), **radio**, **islam**, **daily**, **courses**, **progress**,
**extra** (completeness agent: `mobile/src/features/extra`).

## Pages

| Website page | App route / component | Owner | Status |
|---|---|---|---|
| `/` home (landing) | Today tab is the daily hub; the landing page itself is `/welcome` (all home sections as widgets) | lead / extra | `/welcome` done; Today tab route exists |
| `/today` (TodayDashboard) | `(tabs)/(home)`; `app/today.tsx` redirects there (links, universal links) | lead | route exists; redirect done |
| `/quran` (SurahBrowser) | `(tabs)/quran/index.tsx` | lead | route exists |
| `/surah/[id]` (Player) | `(tabs)/quran/[surah].tsx`; `app/surah/[id].tsx` redirects `/surah/N?v=&m=` → `/quran/N` | lead / extra | reader route exists; redirect done |
| `/shams` | `app/shams/index.tsx`, `app/shams/[surah].tsx` | lead | route exists |
| `/academy`, `/academy/[s]/[from]` | `app/academy/**` | lead | route exists |
| `/premium` | `app/pro.tsx` (Pro sheet); `app/premium.tsx` redirects to it | lead / extra | Pro sheet exists; redirect done |
| `/account`, `/account/reset` | `(tabs)/account`, `sign-in.tsx`, `register.tsx`; reset via website link | lead | exists (still old ui.tsx style) |
| `/profile` | `app/profile.tsx` | progress | route exists |
| `/map` | `app/map.tsx` | progress | route exists |
| `/stats` | `app/stats.tsx` | progress | route exists |
| `/ranking` | `app/ranking.tsx` | progress | route exists |
| `/plan` | `app/plan.tsx` | progress | route exists |
| `/radio` | `app/radio/index.tsx`, `app/radio/now.tsx` | radio | route exists |
| `/reciters`, `/reciters/[slug]` | `app/reciters/**` | radio | route exists |
| `/khatm` | `app/khatm.tsx` | radio | route exists |
| `/islam`, `/islam/[slug]` | `app/islam/**` | islam | route exists |
| `/guides`, `/guides/[slug]` | `app/guides/**` | islam | route exists |
| `/blog` | `app/blog.tsx` → `/guides` (same as website) | extra | done |
| `/secrets` (+ WordCounter) | `app/secrets.tsx` | islam | route exists |
| `/world` | `app/world.tsx` | islam | route exists |
| `/how` | `app/how.tsx` | islam | route exists |
| `/about` | `app/about.tsx` | islam | route exists |
| `/changelog` | `app/changelog.tsx` | islam | route exists |
| `/community` (+ MyLikes) | **missing** `app/community.tsx`; `MyLikes` is ready in extra | islam | missing |
| `/prayer` (+ Qibla) | `app/prayer.tsx`, `app/qibla.tsx` | daily | route exists |
| `/calendar` (HijriCalendar) | `app/calendar.tsx` | daily | route exists |
| `/salah` | `app/salah.tsx` | daily | route exists |
| `/wudu` | `app/wudu.tsx` | daily | route exists |
| `/duas` | `app/duas.tsx` | daily | route exists |
| `/dua-generator` | `app/dua-generator.tsx` | daily | route exists |
| `/names` | `app/names.tsx` | daily | route exists |
| `/arabic`, `/arabic/[id]` (incl. `placement`) | `app/arabic/**` | courses | route exists |
| `/tajweed`, `/tajweed/[id]` | `app/tajweed/**` | courses | route exists |
| `/vocab` | `app/vocab.tsx` | courses | route exists |
| `/search` (SearchView) | `app/search.tsx` → `extra/SearchView` | extra | done |
| `/assistant` (AssistantChat) | `app/assistant.tsx` → `extra/AssistantChat` (Pro only, ProGate) | extra | done |
| `/feedback` (FeedbackBoard) | `app/feedback.tsx` → `extra/FeedbackBoard`, `reportProblem()` | extra | done (sending needs server change, see below) |
| `/legal/[doc]` | `app/legal/[doc].tsx` (privacy/terms native from messages, imprint read from the website) | extra | done |
| `/support` (donations, SupportZiina – new on the website, in progress) | – | – | n/a in the app: donations only outside the app (App Store 3.2.2, the website hides DonateCTA in the iOS shell too) |
| password-reset link `/account/reset?token=` (opens the app through the universal link) | `app/reset-password.tsx` (native form, POST `/api/auth/reset`) + `app/+native-intent.tsx` | extra | done |
| `/app` (install page) | – | – | n/a inside the app |
| `/admin` | – (owner uses the website) | – | n/a |
| 404 / `[...rest]` | `app/+not-found.tsx` → `extra/NotFound` | extra | done |

## Components

| Website component | App component | Owner | Status |
|---|---|---|---|
| AppHeader, Logo | `components/page.tsx` BrandBar, `brand.tsx` LogoMark | lead | exists |
| TabBar | `components/TabBar.tsx` (Today, Quran, Masterclass, Discover, Account; website has Search instead of Discover) | lead | exists |
| SiteMenu (all sections) | `(tabs)/library` Discover posters (`lib/features.ts` GROUPS) | lead | exists; lacks Search, Assistant, Feedback, About, Changelog, Premium, Legal |
| SiteFooter | `extra/widgets/SiteFooter` | extra | done |
| LanguageSwitcher | account tab (System/Deutsch/English) | lead | exists |
| AccountLink, AuthShell, AccountForm, ResetForm, RequireAccount, AuthGate, CaptchaBox | sign-in / register modals; reCAPTCHA replaced by server rate limits for the app | lead | exists (AuthGate = tafsir limit wall in the reader: lead) |
| PremiumPanel, PremiumLock, NativeBridge | `app/pro.tsx`, `ProGate`, `lib/purchases.ts`, `lib/iap.ts` | lead | exists |
| AppInstall, Pwa, JsonLd, StageLight, SideCalligraphy, art/HomeGlow | – | – | n/a (web / desktop only) |
| Announcement | `extra/widgets/Announcement` | extra | done (place on Today) |
| Featured | `extra/widgets/Featured` | extra | done (place on Today) |
| VerseOfTheDay, VerseAudio | Today tab | lead | lead (SocialBar from extra can go under it) |
| WhyQuran | `extra/widgets/WhyQuran` | extra | done |
| TrustStrip, TrustLine | `extra/widgets/TrustStrip` | extra | done |
| Skyline, MadeInDubai, CountUp, ScrollReveal | `extra/widgets/Signature` (Skyline, MadeInDubai, CountUp, Reveal) | extra | done |
| PosterTiles | `brand.tsx` Poster/PosterGrid | lead | exists |
| Ornaments (Divider, SurahBanner, Rosette, Ink …), art/HomeOrnaments | `brand.tsx` + `extra/art.tsx` (HomeStar, StarGlyph, Rosette, HmCard, WarmSection, MarbleHero, Arch, QuranQuote) | lead / extra | exists |
| Onboarding | `extra/Onboarding` + `app/onboarding.tsx` | extra | done |
| KidsToggle | `extra/KidsToggle` + `extra/kids.ts` (`useKids`) | extra | done; theme switch: lead (see below) |
| SocialBar (likes, comments, share, views) | `extra/SocialBar` (+ CommentsSheet) | extra | done; embed in reader + VOTD: lead |
| MyLikes | `extra/MyLikes` | extra | done; place on /community (islam) and profile (progress) |
| FeedbackBoard | `extra/FeedbackBoard` | extra | done |
| SearchView | `extra/SearchView` | extra | done |
| AssistantChat, Markdown (plain) | `extra/AssistantChat`, `extra/Markdown` | extra | done |
| ReciteCheck | `extra/ReciteCheck` (record + compare works; word check needs a speech module) | extra | partial; embed in reader: lead |
| SessionStart, SessionDone, SessionBar | Today tab / reader | lead | lead |
| TodayDashboard pieces, ProgressPanel (CoachCard), LearningJourney, Heatmap, RewardsCard | Today tab / `features/progress` | lead / progress | in progress |
| SurahBrowser, SurahPicker, Player, art/QuranArt | Quran tab, reader, `features/quran` | lead | in progress |
| ShamsPlanner | Shams page | lead | lead |
| AcademyHome, LessonRunner | Masterclass tab, academy | lead | in progress |
| MemoryMap, MapView, SurahQuiz, StatsView, ProfileView, Rewards, Sticker, Ranking, PlanBoard | `features/progress` | progress | in progress |
| RadioPlayer, RadioProvider, KhatmPlanner | `features/radio`, `features/khatm` | radio | in progress |
| art/Islam*, Markdown (article), WordCounter | `features/library` | islam | in progress |
| PrayerBoard, PrayerTrainer, WuduTrainer, SunnahDuas, DuaGenerator, NameGenerator, HijriCalendar, art/Practice* | `features/practice` | daily | in progress |
| ArabicHome, ArabicLesson, TajweedQuiz, VocabTrainer | `features/arabic`, `tajweed`, `vocab`, `coursekit` | courses | in progress |
| AdminPanel | – | – | n/a |
| DonateCTA, SupportZiina (new on the website) | – | – | n/a in the app (App Store 3.2.2) |
| Home page sections (hero, courses, why, paths, method, features, map teaser, popular, kids + tajweed, glossary, tools, FAQ, final call) | `extra/widgets/Home` (`HomeHero` … `HomeFinalCta`) | extra | done |

## Exported widgets (extra) and their props

All exported from `@/features/extra` (index.ts).

- `Featured({ layout?: "carousel" | "stack" = "carousel", title?: boolean = true })` – surah of the day / month, dua of the month, door to the dua generator. Hijri month via Intl, with a tabular-calendar fallback when Hermes lacks the Islamic calendar (`safeHijriMonth`).
- `Announcement()` – owner's notice from `/api/config`; dismiss stored in `tf:annClosed`. Put it first on Today.
- `TrustStrip({ variant?: "grid" | "compact", dark?: boolean, details?: boolean })`, `TrustLine({ dark? })`.
- `WhyQuran({ cta?: boolean = true, padded?: boolean = true })` – verse 54:17 loaded from the server.
- `Skyline({ color?, style? })`, `MadeInDubai({ color?, style? })`, `CountUp({ to, decimals?, duration?, style? })`, `Reveal({ children, delay?, style? })`.
- `SiteFooter()` – end of Discover / Account.
- `ProTeaser({ feature?: ProFeature = "general", title?, body?, compact?: boolean, style? })` – renders nothing for Pro users.
- Home sections: `HomeHero({ topInset? })`, `HomeCourses()`, `HomeWhy()`, `HomePaths()`, `HomeMethod()`, `HomeFeatures()`, `HomeMapTeaser()`, `HomePopular()`, `HomeKidsTajweed()`, `HomeGlossary()`, `HomeTools()`, `HomeFaq()`, `HomeFinalCta()` – each full width with its own background.
- `SocialBar({ verseKey: string, shareText?: string, trackView?: boolean = true, onStage?: boolean })`, `CommentsSheet({ visible, verseKey, onClose, onCount? })`.
- `MyLikes()`.
- `ReciteCheck({ words?, onResult?, onPlayReciter?, pauseOthers?, dark? })`.
- `Onboarding({ force?, fullScreen?, onClose?, onStartSession?, style? })`, `shouldOnboard()`, `pathFor(goal)`. Today tab: `{shouldOnboard() && <Onboarding onStartSession={startTodaysSession} />}` or `router.push("/onboarding")` on first start.
- `KidsToggle({ variant?: "pill" | "row", onStage?, style? })`, `useKids()` → `[on, setOn]`, `readKids()`, `setKids(on)`, `KIDS_PALETTE`.
- `SearchView({ initial? })`, `AssistantChat({ header? })`, `AssistantSuggestions({ onPick? })`, `FeedbackBoard({ initial? })`, `reportProblem({ cat?, title?, body? })`.
- `useSiteConfig()` (features likes/comments/assistant/community, announcement), `Markdown({ text, size?, color? })`, `appHref()`, `openLink()`, `openVerse("2:255")`.

## Kids mode – what the theme must do (lead, `lib/theme.ts`)

Website: `html[data-kids="1"]` (globals.css, art-home.css), set from `localStorage "tf:kids" === "1"`; the app keeps the
same key in its store (`useKids()`).

- Palette (light): bg `255 249 232`, surface `255 255 255`, ink `30 41 59`, muted `71 85 105`, line `250 222 160`,
  accent `37 99 235` (blue), accentSoft `219 234 254`, gold `194 90 0`, hero `37 99 235 → 147 51 234`;
  art-home ivory `255 252 242`, sand `255 246 222`. The website defines nothing extra for dark mode (dark palette stays).
- Type: body and display font Nunito (display weight 800, letter-spacing 0) instead of Plus Jakarta Sans; root size
  112.5 % (all text ×1.125). Nunito is not bundled yet: `@expo-google-fonts/nunito` (Nunito_400/600/700/800) needs to be installed.
- Shapes: rounded-2xl 22px, rounded-3xl 28px (normal mode 8/10px); `.pop` scale animation for feedback.
- Behaviour in the reader (Player.tsx): word-by-word and transliteration forced on, tafsir panel, notes, mode/gap/
  repeat settings, SocialBar, Shams buttons and the desktop side panel hidden; answer buttons taller (h-14).
- Stage, gold buttons and posters stay as they are.

## Required shared / server changes found

1. Server: `/api/feedback` (POST) and `/api/social/comment` require reCAPTCHA when it is configured. The app cannot
   produce a token – exempt requests with `x-qmc-app` (like `/api/auth/*` already does) and use stricter rate limits.
   Until then the app shows "please use the website" with a link.
2. Server: `lib/purchases.ts` calls `/api/app/credits`, which does not exist in `src/app/api` yet (assistant daily limit, dua credits).
3. Legal texts (`messages/*.json legal.*`) do not cover the app: auto-renewable Pro subscription through Apple/Google,
   in-app purchases, the AI assistant (OpenAI processing), microphone use; they still describe reCAPTCHA and cookies only.
   Needed before App Store review (EULA / privacy).
4. Texts that contradict Pro in the app and are therefore not used there: `free.title/body`, `home2.heroKicker`,
   `home2.statFree`, `shams.whyClose`, `landing.f6t` ({n} languages – the app has 2). FAQ `landing.a4` still says "free".
5. Universal links: website paths carry a locale prefix (`/en/surah/2?v=255`), and the AASA sends every path except
   `/api`, `/audio`, `/admin` into the app – including the password-reset mail link. Done in extra: `app/+native-intent.tsx`
   strips the locale and maps `/account/reset` → `app/reset-password.tsx`; `/surah/N` → `app/surah/[id].tsx` → `/quran/N`.
   Lead: please check it against `_layout.tsx` (it is a root-level router file).
6. `app.json`: microphone permission (`expo-audio` plugin `microphonePermission`) for ReciteCheck; for the word check
   a speech module (e.g. `expo-speech-recognition`) – not installed.
7. Discover tab (`lib/features.ts`): add Search, Assistant (Pro), Feedback / Report a problem, About, Changelog, Legal,
   `/welcome`; account tab legal rows can open `/legal/*` natively instead of the web browser.
8. Hermes Intl: `web/featured.ts` and `web/hijri.ts` rely on `Intl.DateTimeFormat` with `islamic-umalqura`; if the
   engine ignores the calendar, `hijriMonth()` silently returns the Gregorian month. Verify on a device (Featured uses
   its own fallback).
