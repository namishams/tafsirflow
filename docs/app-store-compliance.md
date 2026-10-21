# App Store compliance – Quran Masterclass (iOS app `mobile/`)

Stand: 21.10.2026. Audit of the app against the current App Store Review Guidelines, what was fixed in code, and what
the owner has to set in App Store Connect. Keep this file up to date when a feature that touches one of these points
changes (new permission, new purchase, posting switched on, ads, new social feature).

Status: **OK** = compliant in code · **FIXED** = changed in this audit · **OWNER** = action in App Store Connect / on the server · **WATCH** = fine now, re-check when the named switch changes.

## 1. Guideline overview

| Guideline | Status | Notes |
|---|---|---|
| 1.1 Objectionable content | OK | No user posts/clips while `posting.enabled = false`. Religious texts come from Quran.com/hadith sources with attribution; AI output labelled as AI, no fatwas. |
| 1.2 User-generated content (profiles, avatars, 1:1 messages, follow/connect, moment reactions) | FIXED | Filter: `moderate()` on bios, comments, messages (server). Report + block on profiles and in message threads; blocked members disappear. Moderation queue in the app (`/talents/admin`) and on the web (`/[locale]/admin/talents`), every step logged. Guidelines accepted before joining (checkbox "terms of use and community guidelines"). **Fixed:** published contact for safety/moderation on the guidelines screen (`contactMod`, 14 languages, mailto info@quranmasterclass.com) and a "Community and content from members" section with zero tolerance in the website terms (`messages/*.json` → `legal.termsBody`, 14 languages). Act on reports within 24 hours (Apple's expectation). |
| 1.2 Age gating | OK | Birth year + confirmation, locked afterwards. Under 13: no community. 13+: view/follow/like. 16+: messages, connect, public profile/avatar. |
| 1.4 Physical harm / health | n/a | Not a health app. Prayer-time/Qibla only. |
| 2.1 App completeness | OK / OWNER | No "coming soon" screens reachable: dev previews (`/talents/preview`, garden `level`/`cine` params, funnel preview) are `__DEV__`-only; `/talents/record` is only linked when posting is on. Owner: demo account in the review notes (section 4), deploy the server first (section 5). |
| 2.3 Accurate metadata | FIXED | `store/listing.md`: radio is free, removed "and radio stations" from the Pro paragraph (EN, DE); age-rating line pointed here. Screenshots must show the current app (no clips/stories while posting is off). |
| 2.5.? / hidden features | WATCH | `posting.enabled`, `adSlots.enabled` and promos are server switches. Switching posting or ads **on** changes reviewed functionality: ship it with an app update and mention it in the review notes, update the privacy labels (ads) and this file. |
| 3.1.1 In-app purchase | FIXED | All digital goods via StoreKit (Pro subscription, dua and name-report consumables). No links or buttons to web payments: the website's voluntary support page (`/support`, Ziina) is never reachable from the app (**fixed:** `appHref` maps `/support` to `/about`). The website itself stays free; donations there unlock nothing. Never add a feed promo or link to `/support` or any donation page in the app. |
| 3.1.2 Subscriptions | FIXED | Pro sheet, day-1 paywall and feed paywall show the store price in the buyer's currency (nothing before the store answers), the period, the auto-renew terms, restore, Terms and Privacy. **Fixed:** the Pro sheet now shows the full renewal text (price, period, cancel 24 h before, charged to the App Store account) once the price is known; the feed paywall mentions a free trial only when StoreKit reports an intro free trial for this buyer (the server's `trialDays` alone no longer shows a trial). No countdowns, no invented discounts; "Continue for free" always visible on the day-1 paywall. |
| 3.1.2 / 5.1.1(v) Purchase without registration | FIXED | Pro (iOS) can now be bought and restored **without an account**: the app sends the signed transaction to the new `POST /api/iap/apple/check` (signature, bundle, product, expiry only; stores nothing) and unlocks Pro on the device; after sign-in `settlePending` binds the same transaction to the account (`/api/iap/apple`). New texts `pro.guestNote`, `pro.thanksGuest` (14 languages). Consumables (personal duas, name reports) stay account-bound because their credits live on the server and are used by account-only AI features. Website terms say so (14 languages). |
| 3.1.2 Sandbox / App Review purchases | FIXED / OWNER | `/api/iap/apple` and the App Store Server Notifications now accept sandbox transactions by default (App Review buys in the sandbox; before, they only counted with `IAP_ALLOW_SANDBOX=1`, so a reviewer's purchase looked successful but unlocked nothing). `IAP_ALLOW_SANDBOX=0` turns that off again (do not set it while a build is in review). |
| 4.2 Minimum functionality / 4.3 Spam | OK | — |
| 4.5.4 Push notifications | FIXED | Only local notifications; nothing required for the app to work. Permission is asked only when the person turns a reminder on (daily reminder, prayer alerts, garden). **Fixed:** the garden reminder is now off by default (opt-in; a stored choice is kept) – before it went out automatically once any other reminder had granted permission. Garden reminder max 1/day, 9:00–20:00, never near a prayer time; "received encouragement" notice max 1/day, never at night. No promotional notifications. |
| 4.8 Sign in with Apple | OK | Only e-mail + password accounts. The Google/YouTube OAuth on `/talents/badges` only checks a YouTube channel for the official badge and does not sign anyone in, so Sign in with Apple is not required. Re-check if any social login is added. |
| 5.1.1 Account deletion | OK | Account → Delete account (password confirmation). Server `POST /api/account {action:"delete"}` removes Quran Talents media files (`deleteUserMedia`: clips, verification samples, avatar) and deletes the user row; every table with user data references `users` with `ON DELETE CASCADE` (profiles, follows, blocks, reports, messages, notifications, moments, mentoring, rankings, purchases, credits, sessions, sync data); admin/audit columns use `SET NULL`. **Fixed:** certificate recordings sent for review (`review_queue.recording_path`, absolute files outside `MEDIA_DIR`) are now deleted with the account too (before, the rows went with the cascade but the files stayed); mentoring audio is removed by the orphan sweep in `api/mentoring/_lib`. The dialog tells users that an App Store subscription must be cancelled separately. |
| 5.1.1 Data minimisation / permissions | FIXED | See section 2. |
| 5.1.2 Data use / ATT | OK | No tracking, no ad SDK, no third-party analytics; feed statistics are anonymous daily aggregates. ATT prompt not needed. If an ad provider is ever wired into `adSlots`, ATT, privacy labels and the manifest must change first. |
| 5.1 Privacy manifest | FIXED | `ios.privacyManifests` in `app.json` (section 3). |
| 5.2 Intellectual property | OK / OWNER | Quran text, translations, word data, timings and tafsir via the Quran.com API with the source under every text; per-verse audio from everyayah.com (free for Quran projects), self-hosted; Wikipedia texts CC BY-SA 4.0 with article link, Commons images only with free licences and credit line (`content/extra/wiki.ts`); Nahj al-Balagha course content owned by the owner. Owner: answer "Content Rights" in App Store Connect (section 4). |
| 5.6 Developer code of conduct | OK | No manipulative patterns: no countdowns, no fake discounts, free features stay free (safety features never behind Pro), paywalls are dismissible, notifications opt-in and rate-limited. |
| Religious content | OK | No promised rewards; AI answers labelled "AI" and say they are not a ruling and do not replace a scholar; the store description says the app does not replace a teacher or scholar; religious content new to the app is marked for scholar review (BLUEPRINT §4). |
| Export compliance | OK | `ITSAppUsesNonExemptEncryption = false` in `ios.infoPlist` (only HTTPS/OS encryption). |

## 2. Permissions (Info.plist, `app.json` plugins + `locales/*.json`, 14 languages)

| Key | Used for | Change in this audit |
|---|---|---|
| NSLocationWhenInUseUsageDescription | Prayer times and Qibla on the device | German text now in the polite form. |
| NSLocationAlways…, NSLocationAlwaysAndWhenInUse…, NSLocationTemporaryUsageDescriptionDictionary | not used | **Removed** (`expo-location`: `locationAlways*Permission: false`, `locationFullAccuracyPermission: false`). |
| NSMotionUsageDescription | not used (compass uses the heading API) | **Removed** (`motionUsagePermission: false`). |
| NSFaceIDUsageDescription | not used (SecureStore without biometrics) | **Removed** (`expo-secure-store`: `faceIDPermission: false`). |
| NSMicrophoneUsageDescription | Recordings, recitation check, word check, sending a recitation to a teacher | Text now accurate in all 14 languages (the localized text used to say recordings are never uploaded). One identical text in `expo-audio`, `expo-speech-recognition`, `expo-camera`. |
| NSSpeechRecognitionUsageDescription | On-device Arabic word recognition (`requiresOnDeviceRecognition: true`) in exercises, tests, word check | Text covers all uses, 14 languages. |
| NSCameraUsageDescription | Profile picture (image picker); video for recitation clips only when posting is on | One identical text in `expo-camera` and `expo-image-picker` (before, the camera plugin's clip-only text won), 14 languages. `expo-camera` stays installed because `/talents/record` is kept behind the posting switch. |
| NSPhotoLibraryUsageDescription | Choosing a profile picture | Text accurate, 14 languages. The avatar picker **no longer asks for photo-library access** (system picker, data minimisation). |
| NSPhotoLibraryAddUsageDescription | Saving verse images/videos the person chooses | 14 languages. |

Android (Google Play, not App Store): the merged manifest still carries `READ/WRITE_EXTERNAL_STORAGE` and `READ_MEDIA_IMAGES/VIDEO` from `expo-media-library`/`expo-image-picker`; Play's photo-and-video policy may ask about them. Not changed here.

After changing `app.json` run `npx expo prebuild --clean` (script `npm run prebuild`) so the generated `ios/` matches.

## 3. Privacy manifest (`ios.privacyManifests`)

- `NSPrivacyTracking: false`, no tracking domains.
- Required-reason APIs: UserDefaults `CA92.1`; file timestamp `C617.1`, `0A2A.1`, `3B52.1`; system boot time `35F9.1`; disk space `E174.1`, `85F4.1` (React Native, AsyncStorage, Expo file system, audio/video caches). Expo and React Native pods ship their own manifests as well; Xcode merges them.
- Collected data (linked to the account, not used for tracking, purpose App Functionality): e-mail address, name, user ID, purchase history, photos (avatar), audio (recitations sent to a teacher), other user content (bio, messages), product interaction (also Analytics), other data (birth year, country).

## 4. What the owner sets in App Store Connect

**Age rating (new questionnaire):** User-generated content: **Yes**. Messaging and chat: **Yes** (1:1 messages between accepted connections, 16+). Unrestricted web access: No (in-app browser only for own legal pages and sources). Social/contacts features: Yes. Medical, gambling, contests with prizes, violence, mature themes: None/No (religious stories are narrated without graphic detail). Advertising: No. Parental controls / age assurance: the app has its own age gate (13+ community, 16+ messages). Expected rating: **13+**. Do not choose "Made for Kids".

**App Privacy (nutrition label)** – "Data linked to you", none used for tracking:
- Contact info: Email address, Name → App Functionality.
- User content: Photos or videos (profile picture), Audio data (recitations sent to a teacher), Other user content (bio, messages) → App Functionality.
- Identifiers: User ID → App Functionality.
- Purchases: Purchase history → App Functionality.
- Usage data: Product interaction → App Functionality, Analytics.
- Other data: birth year, country → App Functionality.
- Not collected: location (stays on the device), health, financial info, browsing history, contacts, device ID, crash data.

**Review notes (App Review Information):**
- Demo account: create `review@quranmasterclass.com` with a confirmed address, birth year ≥ 16 confirmed, community guidelines accepted, one connection with a second test account so messages, report and block can be shown. Put e-mail and password in "Sign-in information".
- Text (EN): "Quran Masterclass works without an account. Pro (monthly auto-renewable subscription) can be bought and restored without an account; signing in is optional and links Pro to the account. Personal duas and name reports are consumables that credit the signed-in account (AI features need an account). Quran Masterclass Talents (Discover → Quran Talents) is a moderated community: profiles, follow/connect and 1:1 messages for members 16+, with guidelines, report and block on every profile and message thread, an automatic text filter and a moderation queue for administrators; contact info@quranmasterclass.com. Posting recitation clips is switched off in this version. Location is used only on the device for prayer times and Qibla. Account deletion: Account → Delete account."
- Attach a short screen recording of report/block if a previous review asked about 1.2.

**Content rights:** "Yes, it contains third-party content and I have the rights": Quran.com API (text, translations, tafsir, timings), everyayah.com recitations, Wikipedia/Wikimedia (CC BY-SA / free licences, attributed), hadith sources as named in the app; Nahj course content owned by the developer.

**In-app purchases:** product IDs as in `store/listing.md`; each with review screenshot of the Pro sheet / dua screen; the subscription group "Quran Masterclass Pro" with localized display names. Submit the IAPs together with the build. Terms of Use (EULA) link in the app description and in the "License Agreement"/metadata field: Apple standard EULA + `https://quranmasterclass.com/en/legal/terms`. Privacy Policy URL: `https://quranmasterclass.com/en/legal/privacy`.

**Trader status (EU DSA):** set the trader details; the website imprint still says "Full provider details are added before the public launch" (`legal.imprintPending`) – complete the imprint before release.

**Export compliance:** answered by `ITSAppUsesNonExemptEncryption = false` (no prompt).

## 5. Server steps before submitting

1. Deploy the website (new route `src/app/api/iap/apple/check`, sandbox default in `/api/iap/apple` and its notifications route, new terms texts).
2. Remove `IAP_ALLOW_SANDBOX=0` from `/srv/tafsirflow/.env.app` if it was ever set; `IAP_ALLOW_SANDBOX=1` is no longer needed.
3. Keep `src/lib/feed/config.json`: `posting.enabled = false`, `adSlots.enabled` off, `monetize.paywall.trialDays = 0` unless an intro offer exists in App Store Connect.
4. Make sure the demo account exists on the production server.

## 6. Open points for other work streams

- **Mishary track / mentoring** (`/mishary/*`, `/api/mentoring/*`): free-text reviews and notes are filtered with `moderate()`; before release add "Report" on a received review and on a mentor/student link (same `community_reports` flow), and keep mentoring 16+ like messages.
- **Posting clips**: when switched on, review this file (camera/microphone texts already cover it), add clip screenshots and mention it in the review notes.
- `pro.nothingToRestore` says "Apple ID" also on Android (cosmetic).
