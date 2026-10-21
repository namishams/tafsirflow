# Verification of religious references (21 October 2026)

This is an automated and semi-manual check of references, not a scholarly review. It confirms that cited verses and
hadith exist and say roughly what the text claims. It does not replace review by a qualified scholar, and it does not
judge fiqh positions, creed statements or tafsir opinions. The Nahj al-Balagha course content is not part of this
check and is not quoted here.

Sources used: Quran.com API v4 (`chapters`, `verses/by_key` with words, `verses/by_chapter` with Arabic and two
English translations) and fawazahmed0/hadith-api (`eng-bukhari`, `eng-muslim`, `eng-tirmidhi`, `eng-abudawud`,
`eng-malik`).

Scope: `src/features/qbank/data`, `shams2` (incl. maqasid, mutashabihat), `courses`, `plan/story.ts`, `abrahamic`,
`haramain`, `reciter-path`, `arabic-lang`, `school`; the web twin of the courses (`src/lib/learn/courses`) for the
hadith references.

## Result in numbers

| | Checked | Valid | Changed | Not verifiable |
|---|---|---|---|---|
| Verse keys `v: "s:a"` in the question bank | 746 (454 distinct verses) | 746 | 0 | 0 |
| Word positions `w:` | 434 | 434 (position exists, word fits the question when read) | 0 | 0 |
| Inline verse references in prose (`s:a`, `s:a-b`) | 2,643 | 2,643 (surah 1-114, verse within the surah's verse count) | 0 | 0 |
| Content cross-check, verse vs. claim | see below | no mismatch found | 0 | prose claims in German and Arabic only by name/quote checks |
| Hadith with a number (distinct) | 21 | 21 resolve | 1 note reworded (Tirmidhi 3507) | 0 |
| Hadith named by narrator and collection, no number (question bank) | 18 | 18 found with matching narrator and topic | 0 | exact number not stated |
| Hadith/asbab attributions in the surah cards (maqasid) | about 25 | 22 found by text | 0 | 4 rely on Musnad Ahmad (not in the API) |

## Verses

- Existence: all 3,389 references (746 structured, 2,643 inline) fall inside the verse count of their surah, ranges
  are ordered and inside the surah. Nothing had to be removed or corrected.
- Word positions: all 434 `w` values exist in the verse (Quran.com word list, end marker excluded). All entries were
  read next to the highlighted word (vocabulary, i'rab, tajweed, qira'at, creed, tafsir). No mismatch found.
- Claim vs. verse text: for 509 English contexts the context words were compared with the translations (185 without
  overlap were read by hand, all correct, mostly verses cited by number only); 228 contexts naming a prophet, place
  or person were compared with the verse (100 without a name hit were read by hand, all correct, the verse is about
  the person without naming him or the name is only part of a source title); 63 quoted Arabic phrases in guillemets
  were matched against the verse text (18 not found in the cited verse were read by hand: hadith, Torah, supplications
  or document titles, or the verse is cited next to the quote; none is a wrong verse attribution); 312 questions with a
  verse card but no word were checked for topic overlap (36 without overlap read by hand, all fit).
- Mutashabihat (`shams2/mutData.ts`): 56 keys in 25 groups; all verses show the wording the group topic names.
- Maqasid cards: 114 surahs, 302 sections; sections are contiguous, start at verse 1 and end at the last verse of every
  surah; the 170 "verse N / verses N-M" mentions are within the surah.
- Tajweed practice items (`courses/content/tajweedPractice.ts`, 157 items): lam shamsiyya/qamariyya, hamzat al-wasl,
  noon/tanween and meem rules, madd and qalqala were tested against the Arabic text of the verse. 119 of these items
  were tested; the 16 the script could not confirm were read by hand and are correct (the script does not model
  hamza spelling and waqf).

## Hadith

Numbered references (Muslim numbers are the traditional numbers as on sunnah.com, which the API stores as
`arabicnumber`; the API's own file number for Muslim is a running count, so e.g. Muslim 2564 is API file 6541-6543):

- Bukhari 1, 3, 631, 1903, 1933, 4986, 4987, 4992, 5027, 6014, 6018, 6094, 6306, 6410: text matches the claim.
- Muslim 8, 91, 2564 (c: "does not look at your faces and wealth but at your hearts and deeds"), 2589, 2999: match.
- Tirmidhi 3464 (date palm planted in Paradise): matches; graded sahih by Shakir and al-Albani, one grader weak.
- Tirmidhi 3507 (list of the 99 names): the narration exists, but Shakir and al-Albani grade it weak. Changed: the
  note in the names course (mobile `courses/index.ts` and the web twin) now says that the hadith of the ninety-nine
  names is in al-Bukhari 6410, that the common list follows Tirmidhi 3507, and that several hadith scholars grade that
  narration as weak. Wording in three languages (en, de, ar).
- Not changed on purpose: the internal hadith feed ids (`bukhari:n`, `nawawi:n`) use the API numbering and were
  checked earlier; Muslim is deliberately left out there.

Narrations without number in the question bank (18): Ubayy (Muslim 810, greatest verse), Adi ibn Hatim (Tirmidhi
2953/2954), Abu Said (Bukhari 3339), Abu Mas'ud (Bukhari 5008, Muslim 807), Umar (Bukhari 45), al-Bara (Bukhari 4486,
1369), Adi (Bukhari 1916), Ibn Abbas (Abu Dawud 2682), Aisha (Bukhari 4547), Jabir (Bukhari 4558), Ibn Mas'ud
(two reports, 6:82 and 11:114, both in Bukhari), Ka'b ibn Malik (Bukhari 4676), Abu Said ibn al-Mu'alla (Bukhari 4474), Ibn Abbas (Bukhari 183),
Abu Said (Muslim 1398). The numbers are listed here for a later reviewer; the app does not display them.

## Not verified (needs a person)

1. Fiqh and creed statements, differences between the schools, the attribution of opinions to named scholars, and
   the grading of hadith other than the numbered ones above.
2. Reports that rely on Musnad Ahmad (no edition in the API): Umm Salama on Ja'far reciting Maryam before the Negus,
   Ahmad alongside Abu Dawud on Surat al-Mujadila, alongside Tirmidhi on al-Saff and on al-Ikhlas.
3. About 240 further questions in the bank cite a collection at chapter level ("Kitab al-Hajj") or a classical
   work (Ibn Kathir, al-Qurtubi, Ibn Qudama) without a number; only the verse and the existence of such
   works can be checked mechanically.
4. Dates, counts and lists (for example the order of revelation, number of Companions at a battle, qira'at attributed
   to named readers). These come from the classical sources named in each entry.
5. Whether German, Arabic and the other translations carry exactly the same claim as the English text. Only
   verse keys, numbers and names were compared across languages.
6. Sunni-Shia sections on positions of the Shia tradition (for example how some commentators read 2:124).

## Status labels

The visible "draft / needs scholarly review" badges were replaced by a calm note ("Prepared with care from classical
sources. Found a mistake? Report it.") in all 14 languages. The internal fields (`review`, `fachlichGeprueft`-style
status values, `BANK_REVIEW`, `STORY_NEEDS_SCHOLARLY_REVIEW`, `MUT_REVIEW`) are unchanged.
