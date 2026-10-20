# Übergabe an Claude auf dem Mac (Stand 20.10.2026)

**Für Nami:** Im Ordner dieses Repos auf dem Mac `claude` starten (oder in der Claude-Desktop-App diesen Ordner öffnen) und schreiben:
„Lies docs/HANDOFF.md und meine App-Wünsche-Datei und mach weiter.“
Die Datei mit deinen App-Wünschen (aus dem Mediflow-Chat) bitte dazulegen oder hineinkopieren – sie ist absichtlich nicht im Repo, weil das Repo öffentlich ist.

---

## For Claude: where the project stands

Read `CLAUDE.md` and `docs/BLUEPRINT.md` first. Reply to the owner in German, short and clear. Work on branch
`claude/tafsir-projekt-letzter-chat-73j3xi` and push there.

### 1. Website (Next.js, live at https://quranmasterclass.com)
- Next.js 15 App Router, next-intl with 14 locales (`messages/*.json`), Postgres via `src/lib/db.ts`, PM2 + Nginx on the
  Hostinger VPS 186.240.158.226. The owner deploys himself: `bash /srv/tafsirflow/app/scripts/deploy.sh` on the server
  (the script cleans caches first; the disk was full once – keep ≥ 3 GB free; `scripts/import-reciters.sh --remove/--clean`
  frees space). SEO check: `bash /srv/tafsirflow/app/scripts/seo-check.sh`.
- **The website stays free.** Donation invitations and the support page were removed on the owner's request.
- Premium on the website: `users.plan = 'premium'`, admin tab „Steuerung" → „Masterclass Premium" (free offline surahs,
  assistant limit, `gateWeb` = ask for Premium on the web too; **keep it off** – the web stays free).
- Content to reuse in the app: Islam chapters `src/lib/islam/*` (+ `i18n/<locale>/`), guides `src/lib/guides.ts`,
  tajweed `src/lib/tajweed.ts`, duas, radio stations, reciter bios `src/lib/reciters/*`, Shams Method logic
  `src/lib/coach.ts` + spaced repetition `src/lib/learning.ts`, progress sync `/api/sync` (`src/lib/sync.ts`).
- Quran data for web and app: `/api/q/...` (proxy + store for Quran.com API v4 with an allowlist in `src/lib/upstream.ts`).

### 2. Server changes made for the apps
- **Token sign-in:** requests with header `x-qmc-app: ios|android` get `token` in the JSON of `/api/auth/login` and
  `/api/auth/register`; every API accepts `Authorization: Bearer <token>` (`src/lib/auth.ts`). reCAPTCHA is skipped for
  the app, replaced by stricter per-IP limits (`src/app/api/auth/[action]/route.ts`).
- **Apple purchases:** `POST /api/iap/apple {jws}` verifies the StoreKit 2 signed transaction against Apple Root CA G3
  (`src/lib/appleIap.ts`, no network call) and sets `users.plan = 'premium'`; table `iap_purchases`. Sandbox only counts
  for the admin or with `IAP_ALLOW_SANDBOX=1`.
- `/.well-known/apple-app-site-association` → `src/app/api/aasa/route.ts`, filled from `IOS_APP_IDS` in
  `/srv/tafsirflow/.env.app` (`<TeamID>.com.quranmasterclass.app`).
- Still missing: **App Store Server Notifications V2** endpoint (refund/revoke → `plan = 'free'`), Google Play purchase
  verification (needs a Play service account; the owner's Play Console identity check is still pending).

### 3. Native app – `mobile/` (the product the owner wants)
Expo SDK 58, React Native 0.88, Expo Router, one code base for iOS and Android. Bundle ID / package
`com.quranmasterclass.app`. Premium product id `com.quranmasterclass.app.premium` (non-consumable, one-time purchase,
**4.99 €** – decided by the owner on 20.10.2026, no subscription; the price is set in App Store Connect).

Done (type check clean, web bundle builds; **not yet run on an iPhone/Android device or simulator**):
- `src/app/(tabs)/_layout.tsx` native tab bar: Übersicht, Quran, Lernen, Bibliothek, Konto (SF Symbols / Material).
- Design system `src/components/ui.tsx` (grouped sections, rows, one full-width primary button, fields, toggles) and
  `src/lib/theme.ts` (system greys, deep green accent, iOS text styles, Dynamic Type via default font scaling).
- Light/Dark/System chosen in Konto (`src/lib/settings.tsx`), language System/Deutsch/English (`src/i18n`, „du" like the
  website). Arabic font Amiri (`@expo-google-fonts/amiri`).
- Account: sign-in, registration (nothing preselected, country list `src/lib/countries.ts`), sign-out, account deletion
  with password (Apple 5.1.1(v)), legal links, report a problem. Token in the keychain (`expo-secure-store`).
- Quran tab: surah list with search (`src/lib/quran.ts` ports the website's data layer; tafsir ids 169/168/817 English,
  16 Arabic al-Muyassar – verified against api.quran.com).
- Placeholders still empty: Übersicht, Lernen, Bibliothek, surah reader `src/app/(tabs)/quran/[surah].tsx`.

Product decisions agreed with the owner:
- App = Premium Quran Masterclass for **learning tafsir with the Shams Method**. Free to try: whole Quran (read + listen,
  one reciter), tafsir reading, Shams Method for al-Fātiḥa and Juz ʿAmma (78–114). Premium: full Shams course for all
  surahs, radio, all reciters, offline downloads. Tafsir texts themselves stay free (Quran.com licences).
- Owner's app style (from his wishes file): like Apple's own apps – no all-caps headings, no gradients as decoration,
  no animations/bouncing, no emojis, **no gamification** (no points/stickers/ranking in the app), grouped lists, one clear
  primary action per screen, iPhone + iPad, VoiceOver, nothing preselected, explanations hidden until asked
  (tafsir collapsed), lock icon on Premium content and a clean purchase sheet with a summary (what, price, lifetime)
  before Apple's sheet, purchase bound to the account (sign-in before buying), restore purchases, rating prompt only via
  `expo-store-review` after a good moment, iOS and Android always the same version and features.
- **Ask the owner before any upload or submission to Apple/Google.** Collect fixes into one version.

### 4. Next steps (in this order)
1. Surah reader + Arabic player: Uthmani text (Amiri), translation, transliteration, tafsir collapsed per verse,
   `expo-audio` with `setAudioModeAsync({ shouldPlayInBackground: true, interruptionMode: 'doNotMix' })` and
   `setActiveForLockScreen`, word highlighting from timing segments, repeat ×N, speed, reciter choice (Premium beyond
   Alafasy), continue where you stopped.
2. Lernen: Shams Method flow natively (port `src/lib/coach.ts`), progress shared with the website via `/api/sync`
   (same keys as the web localStorage `tf:*`), free surahs gate, Premium sheet with `expo-iap`, restore, then
   `POST /api/iap/apple` with the JWS; App Store Server Notifications endpoint.
3. Radio (Premium) from the website's station list; lock screen controls.
4. Bibliothek: JSON content endpoints on the server (Islam chapters, guides, duas per locale) + native readers.
5. Übersicht: continue learning, today's verses, plain statistics (no points).
6. Icon „Quran Masterclass" (deep green, elegant lettering; check on a home screen), panoramic App Store screenshots
   (iPhone + iPad, real screens, short headline each, Shams Method first), store texts de/en, reviewer notes in English
   (test account with the purchase screen visible), App Privacy answers.
7. CI for `mobile/` (`expo prebuild` + `xcodebuild` simulator build on macos runners; `./gradlew assembleDebug`).
8. Website polish pass on every page, changelog entry.
9. Old Swift shell `ios/` (WKWebView + StoreKit, compiles in `.github/workflows/ios.yml`) is superseded by `mobile/`
   (same bundle ID) – remove it once the native app has the features.

### 5. Running things on the Mac
- App: `cd mobile && npm install && LANG=en_US.UTF-8 npx expo run:ios` (simulator). Xcode: `npx expo prebuild -p ios`
  then `open ios/*.xcworkspace`. Checks: `npx tsc --noEmit`, `npx expo export --platform web`.
- Website: `npm install`, then `npx next dev` (needs `DATABASE_URL`; without it the Quran proxy still works against
  Quran.com). Type check: `npx tsc --noEmit -p .`.

### 6. Rules
- Never commit secrets (OpenAI key, reCAPTCHA, App Store Connect keys, keystore). **The GitHub repo is public** – the
  owner wants private repos; remind him once to switch it (GitHub → Settings → Danger Zone → Change visibility).
- Religious accuracy: no invented hadith or numbers; mark scholar review where content is new.
- Website texts exist in 14 locales; new keys need translations (the owner wants Sonnet agents for translations).
- Never touch the LeadHero server 62.72.32.76.
