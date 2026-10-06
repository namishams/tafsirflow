"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { localeMeta } from "@/i18n/locales";
import LanguageSwitcher from "./LanguageSwitcher";
import AccountLink from "./AccountLink";
import AuthGate from "./AuthGate";
import SocialBar from "./SocialBar";
import SurahPicker from "./SurahPicker";
import { Ink, Medallion, Rosette, SurahBanner } from "./Ornaments";
import DonateCTA from "./DonateCTA";
import ReciteCheck from "./ReciteCheck";
import SessionBar from "./SessionBar";
import { completeItem, itemUrl } from "@/lib/session";
import { offlineReady, removeSurah, saveSurah, savedSurahs } from "@/lib/offline";
import Logo from "./Logo";
import { IconPlay, IconPause, IconPrev, IconNext, IconPlaySm, IconCopy, IconShare, IconNote, IconBookmark, IconVolume, IconFlame } from "./Icons";
import {
  LimitError, OWN_TAFSIR_ID, RECITERS, getChapter, reciterName, getChapters, getOwnTafsir, getReciters, getResources, getTafsir, getVerses, hasOwnTafsir, pickTranslation, tafsirOptionsFor,
  type Chapter, type Reciter, type Resource, type TafsirResult, type Verse,
} from "@/lib/quran";
import { readJSON, writeJSON } from "@/lib/storage";
import { dueVerses, rate, readSrs, stats, type Rating } from "@/lib/learning";
import { versePlan, type VersePlan } from "@/lib/coach";
import * as vp from "@/lib/versePlayback";
import { ageProfile } from "@/lib/age";

type Mode = "learn" | "continuous";

const seg = (on: boolean) =>
  `shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition ${on ? "bg-surface text-ink shadow-sm ring-1 ring-line" : "text-muted hover:text-ink"}`;
const IconDots = () => (<svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden><circle cx="5" cy="12" r="1.8" /><circle cx="12" cy="12" r="1.8" /><circle cx="19" cy="12" r="1.8" /></svg>);
const menuItem = "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-ink hover:bg-bg";
// sun disc (shams = sun) used as the mark of the Shams method
const Sun = ({ className = "h-3.5 w-3.5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden><circle cx="12" cy="12" r="5.5" fill="currentColor" /><circle cx="12" cy="12" r="9.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeOpacity=".55" /></svg>
);
const field = "h-10 rounded-xl border border-line bg-surface px-3 text-sm font-medium text-ink transition hover:border-ink/30";
// a row with an on/off switch (instead of a bare checkbox)
function Toggle({ on, onChange, label, compact = false }: { on: boolean; onChange: (v: boolean) => void; label: string; compact?: boolean }) {
  return (
    <button type="button" role="switch" aria-checked={on} onClick={() => onChange(!on)} className={`flex items-center justify-between gap-3 rounded-xl text-start font-medium transition ${compact ? "p-1" : "w-full px-3 py-2.5 hover:bg-bg"}`}>
      <span className={compact ? "sr-only" : ""}>{label}</span>
      <span className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-300 ${on ? "bg-accent" : "bg-line"}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,.25)] transition-all duration-300 ${on ? "start-[1.375rem]" : "start-0.5"}`} />
      </span>
    </button>
  );
}
// a small group of choices shown as pills
function Chips<T extends number>({ value, options, onChange, fmtOpt }: { value: T; options: T[]; onChange: (v: T) => void; fmtOpt: (v: T) => string }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => <button key={o} type="button" aria-pressed={value === o} onClick={() => onChange(o)} className={`h-9 min-w-[3rem] rounded-full border px-3 text-[13px] font-semibold tabular-nums transition ${value === o ? "border-[rgb(201_166_94)] bg-[rgb(201_166_94)]/15 text-ink" : "border-line bg-surface text-muted hover:border-ink/30 hover:text-ink"}`}>{fmtOpt(o)}</button>)}
    </div>
  );
}
const label = "text-[11px] font-semibold uppercase tracking-[0.14em] text-muted";

// First letter of an Arabic word (with its vowel marks) as a memory cue; a tatweel keeps the joined initial form
const NON_JOINING = "اأإآٱءدذرزوؤة";
const MARKS = "[\\u064B-\\u065F\\u0670\\u06D6-\\u06ED]*";
function firstLetter(word: string) {
  // the article al- carries no information: show it together with the first letter of the word itself
  const art = word.match(new RegExp(`^[ٱا]${MARKS}ل${MARKS}`, "u"));
  const rest = art ? word.slice(art[0].length) : word;
  const m = rest.match(new RegExp(`^.${MARKS}`, "u"));
  const g = m ? m[0] : rest.slice(0, 1);
  const cue = (art ? art[0] : "") + g;
  return NON_JOINING.includes(g[0]) || cue.length >= word.length ? cue : `${cue}ـ`;
}

// small deterministic hash for the random hide mode
const hashOf = (x: string) => { let h = 2166136261; for (let i = 0; i < x.length; i++) h = Math.imul(h ^ x.charCodeAt(i), 16777619); return h >>> 0; };

// Memory hooks (Eselsbrücken) for a verse, computed from its words
const bare = (w: string) => w.replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, "");
function hooks(v: Verse, next?: Verse) {
  const ws = v.words.filter((w) => w.char_type_name === "word");
  const anchor = [...ws].sort((a, b) => bare(b.text_uthmani).length - bare(a.text_uthmani).length)[0];
  const end = (x: Verse) => { const w = x.words.filter((y) => y.char_type_name === "word").at(-1); return w ? bare(w.text_uthmani).slice(-2) : ""; };
  return {
    anchor,
    acrostic: ws.map((w) => firstLetter(w.text_uthmani)).join(" "),
    bridge: next ? { from: ws.at(-1), to: next.words.filter((w) => w.char_type_name === "word")[0] } : null,
    rhyme: end(v),
    rhymeWord: ws.at(-1),
  };
}

type Initial = { chapter: Chapter; verses: Verse[]; translationId: number };

export default function Player({ chapterId, startVerse, startHide = 0, reviewMode = false, shamsStart = false, sessionMode = false, initial }: { chapterId: number; startVerse: number; startHide?: number; reviewMode?: boolean; shamsStart?: boolean; sessionMode?: boolean; initial?: Initial }) {
  const router = useRouter();
  const t = useTranslations("player");
  const th = useTranslations("home");
  const ta = useTranslations("account");
  const ts = useTranslations("shams");
  const locale = useLocale();
  const meta = localeMeta(locale);
  // the audio element is shared and lives beyond this page (see lib/versePlayback.ts)
  const audioRef = useMemo(() => ({ get current(): HTMLAudioElement | null { return typeof window === "undefined" ? null : vp.getAudio(); } }), []);
  const handlers = useRef<vp.Handlers>({});
  const playsDone = useRef(0);
  const wantPlay = useRef(false); // start playing as soon as the next verse file is ready
  const tafsirCache = useRef(new Map<string, TafsirResult | null>());

  const skipFirstLoad = useRef(!!initial);
  const [chapter, setChapter] = useState<Chapter | null>(initial?.chapter ?? null);
  const [verses, setVerses] = useState<Verse[]>(initial?.verses ?? []);
  const [error, setError] = useState(false);
  const [translationId, setTranslationId] = useState<number | null>(initial?.translationId ?? null);
  const [tafsirOpts, setTafsirOpts] = useState<Resource[]>([]);
  const [hasLocalTafsir, setHasLocalTafsir] = useState(true);
  const [tafsirId, setTafsirId] = useState<number | null>(null);
  const [tafsir, setTafsir] = useState<TafsirResult | null | undefined>(undefined);

  const [idx, setIdx] = useState(initial ? Math.min(Math.max(startVerse, 1), initial.verses.length) - 1 : 0);
  const [playing, setPlaying] = useState(false);
  const [waiting, setWaiting] = useState(false); // learn mode: paused until "Continue"
  // listening aids: a pause after each recitation to repeat it yourself (-1 = as long as the verse) and a sleep timer
  const [gap, setGapState] = useState<number>(0);
  const [sleep, setSleepState] = useState<{ mode: number; until: number }>({ mode: 0, until: 0 }); // mode: minutes, -1 = end of surah
  const [turn, setTurn] = useState<{ ms: number; key: number } | null>(null); // "your turn" countdown during the pause
  const gapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const setGap = (g: number) => { setGapState(g); writeJSON("tf:gap", g, true); };
  const setSleep = (m: number) => setSleepState({ mode: m, until: m > 0 ? Date.now() + m * 60_000 : 0 });
  const clearGap = () => { if (gapTimer.current) { clearTimeout(gapTimer.current); gapTimer.current = null; } setTurn(null); };
  const [activeWord, setActiveWord] = useState<number | null>(null);
  const [useRemote, setUseRemote] = useState(false); // local file failed -> Quran.com audio
  const [timingsOk, setTimingsOk] = useState(true);
  const [dbg, setDbg] = useState("");
  const [hide, setHide] = useState(startHide); // 0 show all, 1 every 2nd word, 2 hard (all), 3 first letters (cue), 4 random, 5 soft (blurred), 6 test word by word
  const [seed, setSeed] = useState(1); // random mode: reshuffle
  const [practiceHide, setPracticeHide] = useState(5); // last chosen cover level of the "practise" tool
  const [menuFor, setMenuFor] = useState<string | null>(null); // verse whose "more" menu is open
  useEffect(() => {
    if (!menuFor) return;
    const close = () => setMenuFor(null);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [menuFor]);
  const [testPos, setTestPos] = useState(0); // test mode: next word to check
  const [testMarks, setTestMarks] = useState<Record<number, boolean>>({});
  const [revealed, setRevealed] = useState(false);
  const [reciteScore, setReciteScore] = useState<number | null>(null); // result of "recite & check" (speech recognition)
  const [note, setNote] = useState("");
  const [limitHit, setLimitHit] = useState(false);
  const [needsVerify, setNeedsVerify] = useState(false);
  const [gateOpen, setGateOpen] = useState(false);
  const [authTick, setAuthTick] = useState(0);
  const [kids, setKids] = useState(false);

  const [mode, setMode] = useState<Mode>("continuous");
  const [repeat, setRepeat] = useState(1);
  const [speed, setSpeed] = useState(1);
  const [reciters, setReciters] = useState<Reciter[]>(RECITERS);
  const [reciterFolder, setReciterFolder] = useState(RECITERS[0].folder);
  const reciter = reciters.find((r) => r.folder === reciterFolder) ?? reciters[0];
  const [showTranslation, setShowTranslation] = useState(true);
  const [showWords, setShowWords] = useState(false);
  const [shams, setShams] = useState<number | null>(null); // Shams method: current step id (see lib/coach.ts), null = off
  const [plan, setPlan] = useState<VersePlan | null>(null); // the coach's plan for the current verse
  const [fullPath, setFullPath] = useState(false); // learner asked for all steps even on a known verse
  const [linking, setLinking] = useState(false); // step "connect": previous + current verse are playing
  const linkQ = useRef<string[]>([]);
  const [chain, setChain] = useState<number | null>(null); // backward build-up: index of the first word segment being played
  const [chainDone, setChainDone] = useState(false);
  const [mnemos, setMnemos] = useState<Record<string, string>>({});
  useEffect(() => { setMnemos(readJSON<Record<string, string>>("tf:mnemo", {})); }, []);
  const saveMnemo = (key: string, text: string) => { const n = { ...mnemos }; if (text.trim()) n[key] = text.trim(); else delete n[key]; setMnemos(n); writeJSON("tf:mnemo", n); };
  const [showTranslit, setShowTranslit] = useState(true);
  const [loopOn, setLoopOn] = useState(false);
  const [loopFrom, setLoopFrom] = useState(1);
  const [loopTo, setLoopTo] = useState(initial?.verses.length ?? 1);
  const [marks, setMarks] = useState<string[]>([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [view, setView] = useState<"verses" | "reading">("verses");
  const [arSize, setArSize] = useState(1);
  const [notes, setNotes] = useState<Record<string, { text: string; at: number }>>({});
  const [noteOpen, setNoteOpen] = useState<string | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [cur, setCur] = useState(0);
  const [dur, setDur] = useState(0);
  const [vol, setVol] = useState(1);
  // tap a word: hear it on its own (word-by-word recordings of Quran.com)
  const wordAudio = useRef<HTMLAudioElement | null>(null);
  const [wordOn, setWordOn] = useState<string | null>(null);
  const playWord = (key: string, pos: number) => {
    const [s, a] = key.split(":").map((n) => n.padStart(3, "0"));
    audioRef.current?.pause();
    wordAudio.current ??= new Audio();
    const el = wordAudio.current;
    el.src = `https://audio.qurancdn.com/wbw/${s}_${a}_${String(pos).padStart(3, "0")}.mp3`;
    el.onended = () => setWordOn(null);
    setWordOn(`${key}:${pos}`);
    window.dispatchEvent(new Event("tf-audio-start"));
    el.play().catch(() => setWordOn(null));
  };
  const [offline, setOffline] = useState<{ state: "none" | "saving" | "saved" | "error"; done: number; bytes: number }>({ state: "none", done: 0, bytes: 0 });

  useEffect(() => {
    setMarks(readJSON<string[]>("tf:bookmarks", []));
    setNotes(readJSON("tf:notes", {}));
    setView(readJSON<"verses" | "reading">("tf:view", "verses"));
    setArSize(readJSON<number>("tf:arsize", 1));
    const mq = window.matchMedia("(min-width: 1024px)");
    const on = () => setIsDesktop(mq.matches);
    on();
    mq.addEventListener("change", on);
    const readKids = () => setKids(document.documentElement.dataset.kids === "1");
    readKids();
    window.addEventListener("tf-kids", readKids);
    const onAuth = () => { setGateOpen(false); setLimitHit(false); tafsirCache.current.clear(); setAuthTick((n) => n + 1); };
    window.addEventListener("tf-auth", onAuth);
    return () => { mq.removeEventListener("change", on); window.removeEventListener("tf-kids", readKids); window.removeEventListener("tf-auth", onAuth); };
  }, []);

  useEffect(() => { getChapters(locale).then(setChapters).catch(() => undefined); }, [locale]);
  useEffect(() => {
    getReciters().then((list) => {
      setReciters(list);
      // ?reciter=<slug> (e.g. from a reciter biography) wins over the saved choice
      const wanted = new URLSearchParams(window.location.search).get("reciter");
      const fromUrl = wanted ? list.find((r) => r.slug === wanted) : undefined;
      const saved = readJSON<string>("tf:reciter", "");
      if (fromUrl) setReciterFolder(fromUrl.folder);
      else if (saved && list.some((r) => r.folder === saved)) setReciterFolder(saved);
    });
  }, []);
  useEffect(() => { if (audioRef.current) audioRef.current.volume = vol; }, [vol]);
  useEffect(() => { setGapState(readJSON<number>("tf:gap", 0)); return () => { if (gapTimer.current) clearTimeout(gapTimer.current); }; }, []);
  // sleep timer: also stops in the middle of a long verse
  useEffect(() => {
    if (sleep.mode <= 0) return;
    const iv = setInterval(() => { if (Date.now() >= sleep.until) { audioRef.current?.pause(); clearGap(); setSleepState({ mode: 0, until: 0 }); } }, 5000);
    return () => clearInterval(iv);
  }, [sleep]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    vp.attach(handlers);
    setPlaying(!vp.getAudio().paused); // coming back to a surah that keeps playing
    return () => vp.detach(handlers, playsDone.current);
  }, []);
  useEffect(() => { setCur(0); setDur(0); }, [idx]);

  // Kids mode: word-by-word with transliteration on by default, tafsir out of the way
  useEffect(() => { if (kids) { setShowWords(true); setShowTranslit(true); } }, [kids]);

  // Discover translation + tafsir sources for this UI language
  useEffect(() => {
    Promise.all([getResources(), hasOwnTafsir(locale)])
      .then(([r, own]) => {
        setTranslationId(pickTranslation(locale, r.translations));
        const { options, hasLocal } = tafsirOptionsFor(locale, r.tafsirs);
        const all: Resource[] = own ? [{ id: OWN_TAFSIR_ID, name: `Quran Masterclass · ${meta.label}`, author_name: "", language_name: meta.resourceLang }, ...options] : options;
        setTafsirOpts(all);
        setHasLocalTafsir(hasLocal || own);
        setTafsirId(all[0]?.id ?? null);
      })
      .catch(() => {
        setTranslationId(locale === "de" ? 27 : 20);
        setTafsirId(169);
      });
  }, [locale]);

  useEffect(() => {
    if (translationId === null) return;
    if (skipFirstLoad.current) { skipFirstLoad.current = false; return; } // data came with the page
    setError(false);
    getVerses(chapterId, locale, reciter, translationId)
      .then((v) => {
        setVerses(v);
        setIdx((cur) => (verses.length === 0 ? Math.min(Math.max(startVerse, 1), v.length) - 1 : Math.min(cur, v.length - 1)));
        setLoopTo(v.length);
      })
      .catch(() => setError(true));
    getChapter(chapterId, locale).then(setChapter).catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapterId, locale, reciter.folder, translationId]);

  const verse = verses[idx];

  useEffect(() => { setUseRemote(false); setTimingsOk(true); setDbg(""); }, [verse, reciter.folder]);
  useEffect(() => { setRevealed(false); setTestPos(0); setTestMarks({}); setReciteScore(null); }, [idx, hide]);
  useEffect(() => {
    if (!note) return;
    const id = setTimeout(() => setNote(""), 2600);
    return () => clearTimeout(id);
  }, [note]);

  // Remember where the learner stopped
  useEffect(() => {
    if (verse) writeJSON("tf:last", { chapter: chapterId, verse: verse.verse_number, at: Date.now() });
  }, [verse, chapterId]);

  // Bring a card to the top of the screen, just below the header (and the session bar). The verse cards above may still
  // change height while it scrolls (the previous verse folds), so the position is checked once more afterwards.
  const alignTop = (el: HTMLElement) => {
    const off = () => Math.max(0, ...Array.from(document.querySelectorAll<HTMLElement>("[data-top-bar]")).map((b) => b.getBoundingClientRect().bottom)) + 10;
    const go = () => window.scrollTo({ top: Math.max(0, el.getBoundingClientRect().top + window.scrollY - off()), behavior: "smooth" });
    go();
    window.setTimeout(() => { if (Math.abs(el.getBoundingClientRect().top - off()) > 6) go(); }, 700);
  };
  // Keep the active verse in view. With the Shams coach the verse and its coach card are brought to the top after
  // every step (steps show/hide translation, words and cues for all verses, so in long surahs things would move away).
  const shamsOnRef = useRef(false);
  const firstScroll = useRef(true);
  useEffect(() => {
    // opening a surah at its start keeps the title in view; a link to a verse (?v=) scrolls there
    if (firstScroll.current) { firstScroll.current = false; if (startVerse <= 1) return; }
    if (shamsOnRef.current) return;
    let raf = requestAnimationFrame(() => { raf = requestAnimationFrame(() => { const el = document.getElementById(`v-${idx}`); if (el) alignTop(el); }); });
    return () => cancelAnimationFrame(raf);
  }, [idx]); // eslint-disable-line react-hooks/exhaustive-deps
  const shamsVerse = useRef(-1);
  useEffect(() => {
    if (shams === null || shams < 0) return;
    // a new verse always starts at the top of its card; later steps of the same verse bring the coach card up if the verse is tall
    const newVerse = shamsVerse.current !== idx;
    shamsVerse.current = idx;
    let raf = requestAnimationFrame(() => {
      raf = requestAnimationFrame(() => {
        const li = document.getElementById(`v-${idx}`), card = document.getElementById("shams-card");
        if (!li) return;
        const fits = li.getBoundingClientRect().height < window.innerHeight - 220;
        alignTop(newVerse || fits || !card ? li : card);
      });
    });
    return () => cancelAnimationFrame(raf);
  }, [shams, idx]); // eslint-disable-line react-hooks/exhaustive-deps
  // the coach card scrolled out of sight: a small button brings it back
  const [cardAway, setCardAway] = useState<"up" | "down" | null>(null);

  // Tafsir for the current verse; empty entries belong to the nearest earlier non-empty one.
  useEffect(() => {
    if (!verse || tafsirId === null || !(isDesktop || sheetOpen) || kids) return;
    let cancelled = false;
    setTafsir(undefined);
    setLimitHit(false);
    (async () => {
      if (tafsirId === OWN_TAFSIR_ID) {
        try {
          const r = await getOwnTafsir(locale, chapterId, verse.verse_number);
          if (!cancelled) setTafsir(r);
        } catch (e) {
          if (e instanceof LimitError && !cancelled) { setLimitHit(true); setNeedsVerify(e.needsVerify); setGateOpen(true); setTafsir(null); }
          else if (!cancelled) setTafsir(null);
        }
        return;
      }
      for (let n = verse.verse_number; n >= 1; n--) {
        const key = `${tafsirId}:${chapterId}:${n}`;
        let r = tafsirCache.current.get(key);
        if (r === undefined) {
          try {
            r = await getTafsir(tafsirId, `${chapterId}:${n}`, n === verse.verse_number);
          } catch (e) {
            if (e instanceof LimitError && !cancelled) { setLimitHit(true); setNeedsVerify(e.needsVerify); setGateOpen(true); setTafsir(null); }
            else if (!cancelled) setTafsir(null);
            return;
          }
          tafsirCache.current.set(key, r);
        }
        if (cancelled) return;
        if (r) { setTafsir(r); return; }
      }
      if (!cancelled) setTafsir(null);
    })();
    return () => { cancelled = true; };
  }, [verse, tafsirId, chapterId, isDesktop, sheetOpen, kids, locale, authTick]);

  const play = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    a.playbackRate = speed;
    a.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  }, [speed]);

  const goTo = useCallback((i: number, autoplay = true) => {
    if (gapTimer.current) { clearTimeout(gapTimer.current); gapTimer.current = null; setTurn(null); }
    playsDone.current = 0;
    setWaiting(false);
    setActiveWord(null);
    wantPlay.current = autoplay;
    setIdx(i);
  }, []);

  useEffect(() => { if (audioRef.current) audioRef.current.playbackRate = speed; }, [speed]);

  const onTime = () => {
    if (linkQ.current.length || linking) { setActiveWord(null); return; }
    const ms = (audioRef.current?.currentTime ?? 0) * 1000;
    const s = verse?.segments.find((x) => ms >= x.start && ms < x.end);
    setActiveWord(s ? s.word : null);
  };

  // Backward build-up (Shams method): last word, last two words, … up to the whole verse, using the word timings
  const chainSegs = useMemo(() => (verse ? [...verse.segments].sort((a, b) => a.start - b.start) : []), [verse]);
  const chainStep = Math.max(1, Math.ceil(chainSegs.length / 6));
  const playFrom = (k: number) => {
    const a = audioRef.current;
    if (!a || !chainSegs[k]) return;
    a.currentTime = chainSegs[k].start / 1000;
    a.playbackRate = speed;
    a.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  };
  const startChain = () => {
    setChainDone(false);
    if (chainSegs.length < 2) { setChain(null); goTo(idx, true); return; } // no word timings: plain slow repetition
    const k = Math.max(0, chainSegs.length - chainStep);
    setChain(k);
    playFrom(k);
  };
  // smooth flow: after listening and after the backward build-up the coach moves on by itself
  const shamsRef = useRef<number | null>(null);
  const autoNext = (from: number) => setTimeout(() => { if (shamsRef.current === from) keys.current.next(); }, 1400);
  const continueChain = () => {
    if (chain === null) return;
    if (chain === 0) { setChain(null); setChainDone(true); setPlaying(false); if (shams === 1) autoNext(1); return; }
    const k = Math.max(0, chain - chainStep);
    setChain(k);
    playFrom(k);
  };
  const chainFrom = chain !== null ? chainSegs[chain]?.word ?? 0 : null;

  const advance = () => {
    if (sleep.mode === -1 && idx >= verses.length - 1) { setSleepState({ mode: 0, until: 0 }); return; } // sleep timer: end of surah
    if (loopOn && idx >= loopTo - 1 && sleep.mode !== -1) { goTo(Math.max(0, loopFrom - 1)); return; }
    if (idx < verses.length - 1) goTo(idx + 1);
  };
  // after a recitation: wait (gap) so the listener can repeat it, then continue
  const afterGap = (next: () => void) => {
    const a = audioRef.current;
    const ms = gap === -1 ? Math.round(((a && isFinite(a.duration) ? a.duration : 4) / (a?.playbackRate || 1)) * 1000) : gap * 1000;
    if (!ms) { next(); return; }
    setTurn({ ms, key: Date.now() });
    gapTimer.current = setTimeout(() => { gapTimer.current = null; setTurn(null); next(); }, ms);
  };
  const sleeping = () => sleep.mode > 0 && Date.now() >= sleep.until;

  const onEnded = () => {
    if (linkQ.current.length) { wantPlay.current = true; vp.setPlaybackSrc({ url: linkQ.current.shift()!, remote: "" }); return; }
    if (linking) { setLinking(false); setPlaying(false); return; }
    if (chain !== null) { continueChain(); return; }
    playsDone.current += 1;
    setActiveWord(null);
    if (sleeping()) { setPlaying(false); setSleepState({ mode: 0, until: 0 }); return; } // sleep timer reached
    if (playsDone.current < repeat) { if (shams !== null) play(); else afterGap(play); return; }
    setPlaying(false);
    if (shams !== null) { if (shams === 0) autoNext(0); return; } // Shams method: the coach decides when to move on
    if (mode === "learn") { setWaiting(true); return; }
    afterGap(advance);
  };

  // Self-hosted files may be a different recording than the one the timings belong to:
  // if the file length is far from the last segment end, turn word highlighting off.
  const onMeta = () => {
    const a = audioRef.current;
    const last = verse?.segments.reduce((m, s) => Math.max(m, s.end), 0) ?? 0;
    if (!a || useRemote || !last || !isFinite(a.duration)) return;
    setTimingsOk(Math.abs(a.duration * 1000 - last) <= 1500);
  };

  // Shams method: every step sets up the page for one learning activity
  useEffect(() => {
    if (shams === null) return;
    const replay = () => goTo(idx, true);
    const ap = ageProfile(); // children and seniors: slower and more repetitions
    switch (shams) {
      case 0: setMode("learn"); setRepeat(plan?.listen ?? ap.listen); setSpeed(ap.speed); setShowWords(false); setShowTranslit(false); setShowTranslation(false); setHide(0); setSheetOpen(false); replay(); break;
      case 1: setRepeat(1); setSpeed(Math.min(ap.speed, hasTimings ? 0.85 : 0.75)); setShowTranslit(true); if (hasTimings) startChain(); else { setRepeat(3); replay(); } break;
      case 2: setChain(null); setRepeat(1); setSpeed(ap.speed); setShowWords(true); setShowTranslit(true); break;
      case 3: setShowWords(false); setShowTranslation(true); break;
      case 4: if (!isDesktop) setSheetOpen(true); break;
      case 5: setSheetOpen(false); setShowTranslation(false); setShowTranslit(false); setHide(3); break;
      case 6: setHide(0); setShowTranslation(true); setNoteOpen(verse?.verse_key ?? null); break;
      case 7: setHide(0); setShowTranslation(false); setShowTranslit(false); setSheetOpen(false); startLink(); break;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shams]);
  // Step "connect": previous verse + this verse, twice, so the verses join into one recitation
  const startLink = () => {
    const prev = verses[idx - 1];
    if (!prev || !verse) return;
    const p = useRemote && prev.remoteAudioUrl ? prev.remoteAudioUrl : prev.audioUrl;
    const c = useRemote && verse.remoteAudioUrl ? verse.remoteAudioUrl : verse.audioUrl;
    linkQ.current = [c, p, c];
    setLinking(true);
    playsDone.current = 0;
    wantPlay.current = true;
    vp.setPlaybackSrc({ url: p, remote: "" });
  };
  const stopLink = () => { linkQ.current = []; if (linking) { setLinking(false); audioRef.current?.pause(); } };
  // the coach plans every verse anew: new verses get the full path, known verses only what they need
  const planFor = (i: number, full = fullPath): VersePlan | null => {
    const v = verses[i];
    if (!v) return null;
    const words = v.words.filter((w) => w.char_type_name === "word").length;
    const p = versePlan(v.verse_key, words, verses[i - 1]?.verse_key ?? null, readSrs());
    return full && p.kind !== "new" ? { ...p, steps: [0, 1, 2, 3, 4, 5, ...(i > 0 ? [7] : []), 6] } : p;
  };
  const beginPlan = (i: number, full = fullPath) => {
    const p = planFor(i, full);
    if (!p) return;
    stopLink();
    setPlan(p);
    setShams(-1);
    setTimeout(() => setShams(p.steps[0]), 0);
  };
  const startShams = () => beginPlan(idx);
  const shamsIdx = useRef(idx);
  useEffect(() => {
    if (shamsIdx.current === idx) return;
    shamsIdx.current = idx;
    if (shams !== null) beginPlan(idx);
  }, [idx]); // eslint-disable-line react-hooks/exhaustive-deps
  const shamsAuto = useRef(shamsStart);
  useEffect(() => { if (shamsAuto.current && verse) { shamsAuto.current = false; beginPlan(idx); } }, [verse]); // eslint-disable-line react-hooks/exhaustive-deps
  const stopShams = () => { stopLink(); setShams(null); setPlan(null); setFullPath(false); setChain(null); setMode("continuous"); setRepeat(1); setSpeed(1); setShowWords(false); setShowTranslit(true); setShowTranslation(true); setHide(0); };
  shamsRef.current = shams;
  shamsOnRef.current = shams !== null;
  useEffect(() => {
    if (shams === null) { setCardAway(null); return; }
    const el = document.getElementById("shams-card");
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setCardAway(e.isIntersecting ? null : e.boundingClientRect.top < 0 ? "up" : "down"), { rootMargin: "-56px 0px -190px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [shams, idx]);
  const stepPos = plan && shams !== null ? plan.steps.indexOf(shams) : -1;
  const lastStep = !!plan && stepPos === plan.steps.length - 1;
  // today's session: after a verse go to the next item (another verse, possibly another surah) or to the summary
  const goSession = (ok: boolean) => {
    if (!verse) return;
    const next = completeItem(verse.verse_key, ok);
    audioRef.current?.pause();
    router.push(next ? itemUrl(next) : "/today?session=done");
  };
  const nextShams = () => {
    if (shams === null || !plan) return;
    stopLink();
    if (!lastStep) { setShams(plan.steps[stepPos + 1]); return; }
    if (sessionMode) { goSession(true); return; }
    if (idx < verses.length - 1) goTo(idx + 1, false); else stopShams();
  };

  // wire the shared audio element to this page
  const audioUrl = verse ? (useRemote ? verse.remoteAudioUrl : verse.audioUrl) : "";
  useEffect(() => { if (audioUrl) vp.setPlaybackSrc({ url: audioUrl, remote: "" }); }, [audioUrl]);
  handlers.current = {
    loadedmetadata: () => { onMeta(); setDur(vp.getAudio().duration ?? 0); },
    canplay: () => { if (wantPlay.current) { wantPlay.current = false; play(); } },
    error: () => { const m = vp.getAudio().error; setDbg(`audio error ${m?.code ?? "?"}: ${m?.message ?? ""}`); if (!useRemote && verse?.remoteAudioUrl) setUseRemote(true); },
    waiting: () => setDbg("waiting for data"),
    stalled: () => setDbg("stalled"),
    timeupdate: () => { onTime(); setCur(vp.getAudio().currentTime ?? 0); },
    ended: () => { setDbg("ended"); onEnded(); },
    pause: () => setPlaying(false),
    play: () => setPlaying(true),
    next: () => goTo(Math.min(verses.length - 1, idx + 1)),
    prev: () => goTo(Math.max(0, idx - 1)),
  };
  useEffect(() => {
    if (!chapter || verses.length === 0) return;
    vp.sync({
      chapterId, chapterName: chapter.name_simple, reciterName: reciter.name,
      items: verses.map((v) => ({ url: v.audioUrl, remote: v.remoteAudioUrl })), idx, repeat, playsDone: playsDone.current,
      mode, loopOn, loopFrom, loopTo, speed,
    });
  }, [chapter, verses, idx, repeat, mode, loopOn, loopFrom, loopTo, speed, chapterId, reciter.name]);

  const hasTimings = useMemo(() => !!verse && verse.segments.length > 0 && (useRemote || timingsOk), [verse, useRemote, timingsOk]);

  const [celebrate, setCelebrate] = useState<string | null>(null); // a short gold glow when a verse was recalled
  useEffect(() => { if (!celebrate) return; const id = setTimeout(() => setCelebrate(null), 1700); return () => clearTimeout(id); }, [celebrate]);
  const onRate = (r: Rating) => {
    if (!verse) return;
    if (r !== "again") { setCelebrate(verse.verse_key); try { navigator.vibrate?.(18); } catch { /* not supported */ } }
    const days = rate(verse.verse_key, r);
    setNote(days ? t("saved", { days }) : t("savedToday"));
    if (shams !== null) { if (r === "again" && plan) { beginPlan(idx); return; } nextShams(); return; }
    if (sessionMode) { setTimeout(() => goSession(r !== "again"), 500); return; }
    if (reviewMode) {
      const next = dueVerses().find((k) => k !== verse.verse_key);
      if (next) {
        const [c, vn] = next.split(":").map(Number);
        if (c === chapterId) goTo(vn - 1, false);
        else router.push(`/surah/${c}?v=${vn}&m=2&r=1`);
        return;
      }
    }
    if (idx < verses.length - 1) goTo(idx + 1, false);
  };

  const toggleMark = (key: string) => {
    const next = marks.includes(key) ? marks.filter((k) => k !== key) : [...marks, key];
    setMarks(next);
    writeJSON("tf:bookmarks", next);
  };

  const saveNote = (key: string, text: string) => {
    const n = { ...notes };
    if (text.trim()) n[key] = { text: text.trim(), at: Date.now() };
    else delete n[key];
    setNotes(n);
    writeJSON("tf:notes", n);
  };
  const setViewPref = (v: "verses" | "reading") => { setView(v); writeJSON("tf:view", v, true); };
  const setSize = (n: number) => { setArSize(n); writeJSON("tf:arsize", n, true); };
  const copyVerse = async (v: Verse) => {
    const text = `${v.text_uthmani}\n\n${v.translation}\n\n— ${chapter?.name_simple ?? ""} ${v.verse_key}`;
    try { await navigator.clipboard.writeText(text); setNote(t("copied")); } catch { /* clipboard blocked */ }
  };
  const shareVerse = async (v: Verse) => {
    const url = `${location.origin}/${locale}/surah/${chapterId}?v=${v.verse_number}`;
    if (navigator.share) { await navigator.share({ title: `${chapter?.name_simple ?? ""} ${v.verse_key}`, text: v.translation, url }).catch(() => undefined); return; }
    try { await navigator.clipboard.writeText(url); setNote(t("copied")); } catch { /* clipboard blocked */ }
  };
  const fmt = (x: number) => (isFinite(x) ? `${Math.floor(x / 60)}:${String(Math.floor(x % 60)).padStart(2, "0")}` : "0:00");
  const toAr = (n: number) => String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)]);

  if (error) return <p className="p-6">{t("error")}</p>;
  if (!verse || !chapter) return <p className="p-6 text-muted">{t("loading")}</p>;

  const source = tafsirOpts.find((s) => s.id === tafsirId);
  const tafsirBody = (
    <div>
      {!hasLocalTafsir && (
        <p className="mb-3 rounded-lg bg-accent-soft p-2 text-xs text-ink">{t("noLocalTafsir", { language: meta.label })}</p>
      )}
      <select value={tafsirId ?? ""} onChange={(e) => setTafsirId(Number(e.target.value))} className={`${field} mb-3 w-full`}>
        {tafsirOpts.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
      </select>
      {tafsir === undefined && <p className="text-muted">{t("loading")}</p>}
      {limitHit && (
        <div className="rounded-xl bg-accent-soft p-4 text-sm">
          <p className="mb-3">{t("limitReached")}</p>
          <button onClick={() => setGateOpen(true)} className="inline-block rounded-lg bg-accent px-4 py-2 font-semibold text-white">{ta("register")}</button>
        </div>
      )}
      {tafsir === null && !limitHit && <p className="text-muted">{t("noTafsir")}</p>}
      {tafsir && (
        <>
          {tafsir.verseKeys.length > 1 && (
            <p className="mb-2 text-xs text-muted">
              {t("covers", { from: tafsir.verseKeys[0].split(":")[1], to: tafsir.verseKeys[tafsir.verseKeys.length - 1].split(":")[1] })}
            </p>
          )}
          {/* HTML comes from the Quran.com API */}
          <div className="tafsir-html" dir={source?.language_name?.toLowerCase() === localeMeta(locale).resourceLang ? meta.dir : "ltr"} dangerouslySetInnerHTML={{ __html: tafsir.text }} />
          {source && (
            <p className="mt-4 border-t border-line pt-2 text-xs text-muted">
              {t("source")}: {source.name}{source.author_name ? ` — ${source.author_name}` : ""}{source.id === OWN_TAFSIR_ID ? "" : " (Quran.com)"}
            </p>
          )}
        </>
      )}
    </div>
  );

  const showDebug = typeof window !== "undefined" && window.location.search.includes("debug");
  const learned = useMemo(() => stats(), [note, shams]); // eslint-disable-line react-hooks/exhaustive-deps
  // keyboard: space = play/pause, R = reveal, Enter = next Shams step (never while typing)
  const keys = useRef({ toggle: () => {}, reveal: () => {}, next: () => {} });
  keys.current = {
    toggle: () => (playing ? audioRef.current?.pause() : play()),
    reveal: () => { if (hide > 0 && !revealed) setRevealed(true); },
    next: () => { if (shams !== null && shams !== 5) nextShams(); },
  };
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT" || el.isContentEditable)) return;
      if (e.key === " ") { e.preventDefault(); keys.current.toggle(); }
      else if (e.key === "r" || e.key === "R") keys.current.reveal();
      else if (e.key === "Enter") keys.current.next();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);
  const primary = "btn-gold rounded-full px-5 py-2.5 text-sm font-bold";
  const withBismillah = chapterId !== 1 && chapterId !== 9;

  return (
    <div className="pb-64 lg:pb-48" style={{ ["--ar-scale" as string]: arSize }}>
      <div className={`mx-auto px-4 ${kids ? "max-w-3xl" : "max-w-6xl lg:grid lg:grid-cols-[1fr_25rem] lg:gap-8"}`}>
        <main className="min-w-0">
          {sessionMode && <SessionBar />}
          {/* illuminated opening, like the first page of a surah in a fine mushaf */}
          <section className="stage relative mb-8 mt-6 overflow-hidden rounded-2xl px-5 pb-8 pt-8 text-center text-[#eef0f3] sm:px-10">
            <span aria-hidden className="illum-frame" />
            {[["start-1.5 top-1.5"], ["end-1.5 top-1.5"], ["bottom-1.5 start-1.5"], ["bottom-1.5 end-1.5"]].map(([c]) => <Rosette key={c} size={26} className={`absolute ${c}`} />)}
            <p className="relative text-[11px] font-semibold uppercase tracking-[0.22em] text-[rgb(var(--gold))]">{th("surahLabel", { n: chapter.id })} · {chapter.verses_count} {th("verses")}</p>
            <div className="relative mt-4 flex items-center justify-center gap-1 sm:gap-3">
              <Medallion className="hidden w-12 shrink-0 sm:block" />
              <SurahBanner dark arabic={`سورة ${chapter.name_arabic}`} className="!mx-0 min-w-0" />
              <Medallion flip className="hidden w-12 shrink-0 sm:block" />
            </div>
            <h1 className={locale === "ar" ? "sr-only" : "font-display relative mt-5 text-3xl leading-none sm:text-4xl"}>{chapter.name_simple}</h1>
            {chapter.translated_name.name && <p className="relative mt-2 text-white/60">{chapter.translated_name.name}</p>}
            {withBismillah && <p className="font-arabic relative mt-6 text-[30px] leading-loose text-[rgb(var(--gold))] sm:text-[36px]"><Ink>بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</Ink></p>}
          </section>

          <div className="mb-6">
            <div className="flex items-center gap-2">
              <button onClick={() => router.push(`/surah/${chapterId - 1}`)} disabled={chapterId <= 1} aria-label={t("prev")} className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line bg-surface text-muted transition hover:border-ink/40 hover:text-ink disabled:opacity-30"><svg viewBox="0 0 24 24" className="h-4 w-4 rtl:rotate-180" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M15 6l-6 6 6 6" /></svg></button>
              <div className="min-w-0 flex-1"><SurahPicker current={chapter} chapters={chapters} /></div>
              <button onClick={() => router.push(`/surah/${chapterId + 1}`)} disabled={chapterId >= 114} aria-label={t("next")} className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line bg-surface text-muted transition hover:border-ink/40 hover:text-ink disabled:opacity-30"><svg viewBox="0 0 24 24" className="h-4 w-4 rtl:rotate-180" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M9 6l6 6-6 6" /></svg></button>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-[13px] text-muted">
              {verse.page > 0 ? <span className="tabular-nums">{t("page")} {verse.page} · {t("juz")} {verse.juz} · {t("hizb")} {verse.hizb}</span> : <span />}
              <div className="flex flex-wrap items-center justify-end gap-2">
                {!kids && shams !== null && <button onClick={stopShams} className="inline-flex h-8 items-center rounded-full border border-line px-3.5 text-[13px] font-semibold hover:border-ink">{ts("stop")}</button>}
                <div className="inline-flex rounded-full bg-bg p-1">
                  <button className={seg(view === "verses")} onClick={() => setViewPref("verses")}>{t("viewVerses")}</button>
                  <button className={seg(view === "reading")} onClick={() => setViewPref("reading")}>{t("viewReading")}</button>
                </div>
                <button className="inline-flex h-8 items-center gap-1.5 rounded-full px-2 font-semibold text-muted transition hover:text-ink" onClick={() => setSettingsOpen((o) => !o)} aria-expanded={settingsOpen}>
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></svg>
                  {t("settings")}
                </button>
              </div>
            </div>
            {settingsOpen && (
              <div className="step-in mt-4 overflow-hidden rounded-2xl border border-[rgb(201_166_94)]/30 bg-surface text-sm shadow-[0_10px_30px_rgba(3,25,18,0.08)]">
                <div className="h-[2px] bg-gradient-to-r from-transparent via-[rgb(201_166_94)] to-transparent" />
                <div className="grid gap-5 p-4 sm:grid-cols-2 sm:p-5">
                  <label className="grid gap-2"><span className={label}>{t("reciter")}</span>
                    <select value={reciter.folder} onChange={(e) => { setReciterFolder(e.target.value); writeJSON("tf:reciter", e.target.value, true); }} className={field}>
                      {reciters.map((r) => <option key={r.folder} value={r.folder}>{reciterName(r, locale)}</option>)}
                    </select>
                  </label>
                  <div className="grid gap-2"><span className={label}>{t("fontSize")}</span>
                    <div className="inline-flex w-fit rounded-full bg-bg p-1">
                      {[0.85, 1, 1.2, 1.45].map((n, i) => (
                        <button key={n} className={seg(arSize === n)} onClick={() => setSize(n)} aria-label={`${t("fontSize")} ${n}`}><span className="font-arabic" style={{ fontSize: `${0.85 + i * 0.14}rem` }}>أ</span></button>
                      ))}
                    </div>
                  </div>
                  {!kids && <div className="grid gap-2"><span className={label}>{t("mode")}</span>
                    <div className="inline-flex w-fit rounded-full bg-bg p-1">
                      <button className={seg(mode === "learn")} onClick={() => setMode("learn")}>{t("modeLearn")}</button>
                      <button className={seg(mode === "continuous")} onClick={() => setMode("continuous")}>{t("modeContinuous")}</button>
                    </div>
                  </div>}
                  <div className="grid gap-2"><span className={label}>{t("repeat")}</span>
                    <Chips value={repeat} options={[1, 2, 3, 5, 10]} onChange={setRepeat} fmtOpt={(n) => `×${n}`} />
                  </div>
                  <div className="grid gap-2"><span className={label}>{t("speed")}</span>
                    <Chips value={speed} options={[0.5, 0.75, 1, 1.25, 1.5]} onChange={setSpeed} fmtOpt={(n) => `${n}×`} />
                  </div>
                  {!kids && <div className="grid gap-2"><span className={label}>{t("gap")}</span>
                    <Chips value={gap} options={[0, 2, 5, 10, -1]} onChange={setGap} fmtOpt={(n) => (n === 0 ? t("gapOff") : n === -1 ? t("gapVerse") : `${n} s`)} />
                    <span className="text-xs text-muted">{t("gapHint")}</span>
                  </div>}
                  <div className="grid gap-2"><span className={label}>{t("sleep")}</span>
                    <Chips value={sleep.mode} options={[0, 15, 30, 60, -1]} onChange={setSleep} fmtOpt={(n) => (n === 0 ? t("sleepOff") : n === -1 ? t("sleepEnd") : `${n} min`)} />
                    {sleep.mode > 0 && <span className="text-xs text-muted">{t("sleepLeft", { m: Math.max(1, Math.ceil((sleep.until - Date.now()) / 60000)) })}</span>}
                  </div>
                  {!kids && <div className="grid gap-2">
                    <span className={label}>{t("loop")}</span>
                    <div className="flex flex-wrap items-center gap-2 text-muted">
                      <Toggle compact on={loopOn} onChange={setLoopOn} label={t("loop")} />
                      <span className={loopOn ? "" : "opacity-50"}>{t("loopFrom")}</span>
                      <select value={loopFrom} disabled={!loopOn} onChange={(e) => setLoopFrom(Number(e.target.value))} className={`${field} w-20 disabled:opacity-50`}>
                        {verses.map((v) => <option key={v.verse_key} value={v.verse_number}>{v.verse_number}</option>)}
                      </select>
                      <span className={loopOn ? "" : "opacity-50"}>{t("loopTo")}</span>
                      <select value={loopTo} disabled={!loopOn} onChange={(e) => setLoopTo(Number(e.target.value))} className={`${field} w-20 disabled:opacity-50`}>
                        {verses.map((v) => <option key={v.verse_key} value={v.verse_number}>{v.verse_number}</option>)}
                      </select>
                    </div>
                  </div>}
                  {!kids && <div className="grid gap-1 rounded-xl border border-line p-1 sm:col-span-2 sm:grid-cols-3">
                    <Toggle on={showTranslit} onChange={setShowTranslit} label={t("transliteration")} />
                    <Toggle on={showTranslation} onChange={setShowTranslation} label={t("translation")} />
                    <Toggle on={showWords} onChange={setShowWords} label={t("wordByWord")} />
                  </div>}
                  {offlineReady() && (() => {
                    const key = `${chapterId}:${reciter.folder}`;
                    const saved = offline.state === "saved" || (offline.state === "none" && savedSurahs()[key] !== undefined);
                    const urls = verses.map((v) => v.audioUrl);
                    const save = async () => {
                      setOffline({ state: "saving", done: 0, bytes: 0 });
                      try { const bytes = await saveSurah(chapterId, reciter.folder, urls, `/${locale}/surah/${chapterId}`, (done) => setOffline((o) => ({ ...o, done }))); setOffline({ state: "saved", done: urls.length, bytes }); }
                      catch { setOffline((o) => ({ ...o, state: "error" })); }
                    };
                    return (
                      <div className="grid gap-2 sm:col-span-2">
                        <span className={label}>{t("offline")}</span>
                        <div className="flex flex-wrap items-center gap-3">
                          {offline.state === "saving"
                            ? <span className="flex min-w-0 flex-1 items-center gap-3"><span className="h-1.5 flex-1 overflow-hidden rounded-full bg-line"><span className="block h-full bg-[rgb(201_166_94)] transition-all" style={{ width: `${(offline.done / Math.max(1, urls.length)) * 100}%` }} /></span><span className="tabular-nums text-muted">{offline.done}/{urls.length}</span></span>
                            : saved
                              ? <><span className="inline-flex items-center gap-2 font-semibold text-accent"><svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>{t("offlineSaved", { mb: Math.max(0.1, Math.round(((offline.bytes || savedSurahs()[key] || 0) / 1048576) * 10) / 10) })}</span><button onClick={async () => { await removeSurah(chapterId, reciter.folder, urls); setOffline({ state: "none", done: 0, bytes: 0 }); }} className="text-muted underline-offset-2 hover:underline">{t("offlineRemove")}</button></>
                              : <button onClick={save} className="inline-flex h-10 items-center gap-2 rounded-full border border-[rgb(201_166_94)]/60 px-4 font-semibold transition hover:bg-[rgb(201_166_94)]/10"><svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 4v11M7 10l5 5 5-5M5 20h14" /></svg>{t("offlineSave")}</button>}
                          {offline.state === "error" && <span className="text-red-600">{t("offlineError")}</span>}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>

          {view === "reading" ? (
            <div className="rounded-2xl border border-line bg-surface p-6 text-justify font-arabic sm:p-10" dir="rtl" style={{ textAlignLast: "center" }}>
              <p className="ar-text" style={{ lineHeight: 2.6 }}>
                {verses.map((v, i) => (
                  <span key={v.verse_key} id={`v-${i}`} onClick={() => goTo(i)} className={`cursor-pointer rounded-lg px-1 transition ${i === idx ? "bg-accent-soft" : "hover:bg-bg"}`}>
                    {v.text_uthmani} <span className="verse-end">﴿{toAr(v.verse_number)}﴾</span>{" "}
                  </span>
                ))}
              </p>
            </div>
          ) : (
          <ol className="grid grid-cols-[minmax(0,1fr)] gap-3">
            {verses.map((v, i) => {
              const active = i === idx;
              const words = v.words.filter((w) => w.char_type_name === "word");
              const marked = marks.includes(v.verse_key);
              const tool = hide === 0 ? "read" : hide === 6 ? "test" : "practice";
              const markWord = (ok: boolean) => () => { const m = { ...testMarks, [testPos]: ok }; setTestMarks(m); if (testPos + 1 >= words.length) setRevealed(true); setTestPos(testPos + 1); };
              // Shams focus: only the verse being learned (and the one before it, for connecting) stays open – the rest fold into one quiet line
              if (shams !== null && i !== idx && i !== idx - 1) return (
                <li key={v.verse_key} id={`v-${i}`} className="min-w-0 scroll-mt-20">
                  <button onClick={() => goTo(i, false)} className="flex w-full min-w-0 items-center gap-3 overflow-hidden rounded-xl border border-line/50 bg-surface/40 px-4 py-2 text-start text-muted transition hover:bg-surface">
                    <span className="w-7 shrink-0 text-center text-[12px] tabular-nums">{v.verse_number}</span>
                    <span className="font-arabic min-w-0 flex-1 truncate text-lg leading-loose" dir="rtl">{v.text_uthmani}</span>
                  </button>
                </li>
              );
              return (
                <li key={v.verse_key} id={`v-${i}`} className="min-w-0 scroll-mt-20">
                  <article
                    onClick={() => !active && goTo(i)}
                    className={`relative rounded-2xl border p-5 transition duration-500 ${celebrate === v.verse_key ? "glow-once" : ""} ${shams !== null && !active ? "opacity-60" : ""} ${active ? "verse-frame border-[rgb(var(--gold))]/35 bg-surface" : "cursor-pointer border-line/70 bg-surface/60 hover:bg-surface"}`}
                  >
                    {active && <><span aria-hidden className="frame-corner start-2 top-2 border-s border-t" /><span aria-hidden className="frame-corner end-2 top-2 border-e border-t" /><span aria-hidden className="frame-corner bottom-2 start-2 border-b border-s" /><span aria-hidden className="frame-corner bottom-2 end-2 border-b border-e" /></>}
                    <div className="mb-3 flex items-center justify-between">
                      <span className="relative grid h-9 w-9 place-items-center" aria-label={`${t("verse")} ${v.verse_number}`}>
                        <span className={`absolute inset-1 rotate-45 rounded-[4px] border ${active ? "border-[rgb(var(--gold))]/70 bg-[rgb(var(--gold))]/15" : "border-[rgb(var(--gold))]/40 bg-surface"}`} />
                        <span className={`absolute inset-1 rounded-[4px] border ${active ? "border-[rgb(var(--gold))]/70 bg-[rgb(var(--gold))]/15" : "border-[rgb(var(--gold))]/40 bg-surface"}`} />
                        <span className="relative text-xs font-bold text-[rgb(var(--gold))]">{v.verse_number}</span>
                      </span>
                      {active ? (
                        <div className="relative flex items-center gap-0.5 text-muted" onClick={(e) => e.stopPropagation()}>
                          <button className={`grid h-9 w-9 place-items-center rounded-full hover:bg-bg ${marked ? "text-gold" : "hover:text-ink"}`} aria-label={marked ? t("bookmarked") : t("bookmark")} title={marked ? t("bookmarked") : t("bookmark")} onClick={() => toggleMark(v.verse_key)}><IconBookmark filled={marked} /></button>
                          {!kids && <button className={`grid h-9 w-9 place-items-center rounded-full hover:bg-bg ${notes[v.verse_key] ? "text-accent" : "hover:text-ink"}`} aria-label={t("note")} title={t("note")} onClick={() => setNoteOpen(noteOpen === v.verse_key ? null : v.verse_key)}><IconNote /></button>}
                          {!kids && (
                            <>
                              <button className="grid h-9 w-9 place-items-center rounded-full hover:bg-bg hover:text-ink" aria-label={t("more")} aria-haspopup="menu" aria-expanded={menuFor === v.verse_key} onClick={() => setMenuFor(menuFor === v.verse_key ? null : v.verse_key)}><IconDots /></button>
                              {menuFor === v.verse_key && (
                                <div role="menu" className="absolute end-0 top-10 z-20 w-44 rounded-lg border border-line bg-surface p-1 shadow-card">
                                  <button role="menuitem" className={menuItem} onClick={() => { copyVerse(v); setMenuFor(null); }}><IconCopy />{t("copy")}</button>
                                  <button role="menuitem" className={menuItem} onClick={() => { shareVerse(v); setMenuFor(null); }}><IconShare />{t("share")}</button>
                                  <button role="menuitem" className={menuItem} onClick={() => { if (i === idx) { const a = audioRef.current; if (a) { a.currentTime = 0; playsDone.current = 0; play(); } } else goTo(i, true); setMenuFor(null); }}><IconPlaySm />{t("playVerse")}</button>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      ) : marked ? <span className="text-gold" aria-label={t("bookmarked")}><IconBookmark filled /></span> : null}
                    </div>
                    {active ? (
                      <p className="ar-text flex flex-wrap justify-start gap-x-3 gap-y-2 font-arabic" dir="rtl">
                        {words.map((w, wi) => {
                          const randomHidden = hide === 4 && ((hashOf(`${v.verse_key}:${seed}:${wi}`) % 100) < 45 || (words.length > 1 && wi === hashOf(`${v.verse_key}:${seed}`) % words.length));
                          const covered = !revealed && (hide === 2 || (hide === 1 && wi % 2 === 1) || randomHidden || (hide === 6 && wi >= testPos));
                          const soft = hide === 5 && !revealed;
                          const cueOnly = hide === 3 && !revealed;
                          const mark = hide === 6 ? testMarks[wi] : undefined;
                          const outOfChain = chainFrom !== null && w.position < chainFrom;
                          return (
                          <span key={w.position} className="text-center" onClick={covered || soft || cueOnly ? undefined : (e) => { e.stopPropagation(); playWord(v.verse_key, w.position); }}>
                            <span className={`block cursor-pointer rounded-lg px-1.5 transition ${wordOn === `${v.verse_key}:${w.position}` ? "bg-gold/15 text-gold" : ""} ${covered ? "select-none bg-line text-transparent blur-sm" : ""} ${soft ? "select-none opacity-40 blur-[3px]" : ""} ${mark === true ? "text-accent" : mark === false ? "text-red-600 underline decoration-2 underline-offset-8" : ""} ${hide === 6 && wi === testPos && !revealed ? "ring-2 ring-gold" : ""} ${cueOnly ? "text-gold" : ""} ${outOfChain ? "opacity-25" : ""} ${!covered && hasTimings && activeWord === w.position ? "bg-accent-soft text-accent" : ""}`}>{cueOnly ? firstLetter(w.text_uthmani) : w.text_uthmani}</span>
                            {showWords && !covered && (
                              <span className="block font-sans text-[11px] leading-tight text-muted" dir="ltr">
                                {showTranslit && <span className="block italic text-gold">{w.transliteration?.text}</span>}
                                {w.translation?.text}
                              </span>
                            )}
                          </span>
                          );
                        })}
                        <span className="verse-end self-center">﴿{toAr(v.verse_number)}﴾</span>
                      </p>
                    ) : (
                      <p className="ar-text-sm font-arabic" dir="rtl">{v.text_uthmani} <span className="verse-end">﴿{toAr(v.verse_number)}﴾</span></p>
                    )}
                    {showTranslit && v.transliteration && !(active && hide > 0 && !revealed) && (
                      <p className="mt-3 italic leading-relaxed text-gold" dir="ltr" lang="en">{v.transliteration}</p>
                    )}
                    {showTranslation && <p className="mt-2 leading-relaxed text-muted" dir={meta.dir}>{v.translation}</p>}
                    {active && shams !== null && shams >= 0 && (
                      <div id="shams-card" className="stage mt-5 scroll-mt-20 rounded-xl p-4 text-[#eef0f3] sm:p-5" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between gap-3">
                          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[rgb(var(--gold))]"><Sun className="h-3.5 w-3.5" />{ts("title")} · {ts("stepOf", { n: stepPos + 1, total: plan?.steps.length ?? 7 })}</p>
                          <span className="flex items-center gap-3 text-xs text-white/60">
                            {learned.todayCount > 0 && <span>{t("todayCount", { n: learned.todayCount })}</span>}
                            {learned.streak > 1 && <span><IconFlame /> {learned.streak}</span>}
                            <Link href="/shams" className="underline-offset-2 hover:underline">{ts("about")}</Link>
                          </span>
                        </div>
                        <ol className="mt-3 flex gap-1" aria-hidden>
                          {(plan?.steps ?? []).map((n, k) => <li key={n} className={`h-1 flex-1 rounded-full transition-colors duration-500 ${k <= stepPos ? "bg-[rgb(var(--gold))]" : "bg-white/15"}`} />)}
                        </ol>
                        {plan && stepPos === 0 && (
                          <p className="mt-3 rounded-lg bg-white/[0.06] px-3 py-2 text-[13px] leading-snug text-white/75">
                            <span className="font-semibold text-white">{ts(`k_${plan.kind}`)}</span> · {ts(`w_${plan.kind}`, { n: plan.listen, words: plan.words, lapses: plan.lapses, pct: Math.round((plan.strength ?? 0) * 100) })}
                            {plan.kind !== "new" && !fullPath && <button onClick={() => { setFullPath(true); beginPlan(idx, true); }} className="ms-2 font-semibold text-[rgb(var(--gold))] underline-offset-2 hover:underline">{ts("fullPath")}</button>}
                          </p>
                        )}
                        <div key={`${v.verse_key}-${shams}`} className="step-in">
                          <h3 className="font-display mt-4 text-2xl leading-tight">{ts(`s${shams + 1}`)}</h3>
                          <p className="mt-2 text-[15px] leading-relaxed text-white/75">{shams === 0 && plan ? ts("d1n", { n: plan.listen }) : ts(`d${shams + 1}`)}</p>
                        </div>
                        {shams === 7 && (
                          <div className="mt-3 rounded-lg border border-white/10 p-3">
                            {verses[i - 1] && <p className="font-arabic text-xl leading-loose text-white/60" dir="rtl">{verses[i - 1].text_uthmani}</p>}
                            <p className="font-arabic text-xl leading-loose" dir="rtl">{v.text_uthmani}</p>
                            <p className="mt-2 text-sm text-white/70">{linking ? ts("linkNow") : ts("linkRecite")}</p>
                          </div>
                        )}
                        {shams === 3 && (() => {
                          const h = hooks(v, verses[i + 1]);
                          const sameRhyme = verses.filter((x) => hooks(x).rhyme === h.rhyme).length;
                          return (
                            <div className="mt-3 grid gap-2 text-sm">
                              {h.anchor && <p><span className="font-semibold">{ts("hAnchor")}:</span> <span className="font-arabic text-xl" dir="rtl">{h.anchor.text_uthmani}</span>{h.anchor.translation?.text ? ` – ${h.anchor.translation.text}` : ""}</p>}
                              {h.rhymeWord && <p><span className="font-semibold">{ts("hRhyme")}:</span> <span className="font-arabic text-xl" dir="rtl">…{h.rhyme}</span>{h.rhymeWord.transliteration?.text ? ` (${h.rhymeWord.transliteration.text})` : ""} · {ts("hRhymeN", { n: sameRhyme, total: verses.length })}</p>}
                              {h.bridge && h.bridge.from && h.bridge.to && <p><span className="font-semibold">{ts("hBridge")}:</span> <span className="font-arabic mt-1 block text-xl" dir="rtl">{h.bridge.from.text_uthmani} ← {h.bridge.to.text_uthmani}</span></p>}
                              <p><span className="font-semibold">{ts("hAcrostic")}:</span> <span className="font-arabic text-xl text-gold" dir="rtl">{h.acrostic}</span></p>
                              <label className="mt-1 grid gap-1"><span className="font-semibold">{ts("hOwn")}</span>
                                <textarea rows={2} defaultValue={mnemos[v.verse_key] ?? ""} onBlur={(e) => saveMnemo(v.verse_key, e.target.value)} placeholder={ts("hOwnPh")} className="rounded-md border border-line bg-surface p-2 text-sm text-ink" />
                              </label>
                            </div>
                          );
                        })()}
                        {shams === 6 && <ul className="mt-2 grid gap-1 text-sm text-white/70">{["q1", "q2", "q3"].map((q) => <li key={q}>– {ts(q)}</li>)}</ul>}
                        <div className="mt-5 flex flex-wrap items-center gap-2">
                          {(shams === 0 || (shams === 1 && !hasTimings)) && <button onClick={() => goTo(idx, true)} className="h-11 rounded-full border border-white/25 px-4 text-sm font-semibold hover:border-white">{ts("again")}</button>}
                          {shams === 7 && !linking && <button onClick={startLink} className="h-11 rounded-full border border-white/25 px-4 text-sm font-semibold hover:border-white">{ts("linkAgain")}</button>}
                          {shams !== 5 && <button onClick={nextShams} className="btn-gold h-11 rounded-full px-6 text-sm font-bold">{lastStep ? (idx < verses.length - 1 ? ts("nextVerse") : ts("finish")) : ts("next")}</button>}
                          {shams === 1 && hasTimings && <button onClick={startChain} className="h-11 rounded-full border border-white/25 px-4 text-sm font-semibold hover:border-white">{ts("chainAgain")}</button>}
                          {shams === 1 && chain !== null && <span className="text-sm text-white/70">{ts("chainNow")}</span>}
                          {shams === 1 && chainDone && <span className="text-sm font-semibold text-[rgb(var(--gold))]">{ts("chainDone")}</span>}
                          {shams === 5 && hide === 3 && !revealed && <button onClick={() => setHide(2)} className="btn-gold h-11 rounded-full px-6 text-sm font-bold">{ts("noCues")}</button>}
                          {shams === 5 && !revealed && <span className="text-sm text-white/70">{hide === 3 ? ts("cueHint") : ts("recallHint")}</span>}
                        </div>
                      </div>
                    )}
                    {active && shams === null && (
                      <div className="mt-5 border-t border-line pt-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="inline-flex rounded-full bg-bg p-1" role="tablist" aria-label={t("memorize")}>
                            <button role="tab" aria-selected={tool === "read"} className={seg(tool === "read")} onClick={() => setHide(0)}>{t("toolRead")}</button>
                            <button role="tab" aria-selected={tool === "practice"} className={seg(tool === "practice")} onClick={() => setHide(practiceHide)}>{t("toolPractice")}</button>
                            <button role="tab" aria-selected={tool === "test"} className={seg(tool === "test")} onClick={() => setHide(6)}>{t("toolTest")}</button>
                          </div>
                          {!kids && <button onClick={startShams} className="btn-gold ms-auto inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-full px-4 text-[13px] font-bold sm:w-auto"><Sun className="h-3.5 w-3.5" />{t("toolShams")}</button>}
                        </div>
                        {tool === "practice" && (
                          <div className="mt-3 flex flex-wrap items-center gap-2 text-[13px]">
                            <span className="shrink-0 text-muted">{t("hideLabel")}</span>
                            <div className="inline-flex flex-wrap rounded-full bg-bg p-1">
                              {([[5, "hideSoft"], [1, "hideHalf"], [4, "hideRandom"], [2, "hideHard"]] as const).map(([h, k]) => (
                                <button key={h} className={seg(hide === h)} onClick={() => { if (h === 4 && hide === 4) setSeed((x) => x + 1); setHide(h); setPracticeHide(h); }}>{t(k)}</button>
                              ))}
                            </div>
                            {hide === 4 && !revealed && <button className="shrink-0 font-semibold text-accent hover:underline" onClick={() => setSeed((x) => x + 1)}>↻ {t("shuffle")}</button>}
                          </div>
                        )}
                      </div>
                    )}
                    {active && ((shams === null && hide > 0) || shams === 5) && (
                      <div onClick={(e) => e.stopPropagation()}>
                        {hide === 6 && !revealed && (
                          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gold/40 bg-gold/5 p-3 text-sm">
                            <p className="font-semibold">{t("testWord", { n: testPos + 1, total: words.length })}</p>
                            <div className="flex gap-2">
                              <button className={primary} onClick={markWord(true)}>✓ {t("knewWord")}</button>
                              <button className="rounded-full border border-line bg-surface px-4 py-2 text-sm font-semibold hover:border-ink" onClick={markWord(false)}>✗ {t("missedWord")}</button>
                            </div>
                          </div>
                        )}
                        {hide === 6 && revealed && words.length > 0 && (
                          <p className="mt-3 text-sm font-semibold">{t("testScore", { ok: Object.values(testMarks).filter(Boolean).length, total: words.length, pct: Math.round((Object.values(testMarks).filter(Boolean).length / words.length) * 100) })}</p>
                        )}
                        {hide !== 6 && !revealed && (
                          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gold/40 bg-gold/5 p-3 text-sm">
                            <span className="font-medium">{t("tapToReveal")}</span>
                            <button className={primary} onClick={() => setRevealed(true)}>{t("reveal")}</button>
                          </div>
                        )}
                        {!revealed && !kids && (
                          <div className="mt-3">
                            <ReciteCheck words={words.map((w) => w.text_uthmani)} onResult={(score) => { setReciteScore(score); setRevealed(true); }} onPlayReciter={() => goTo(idx, true)} pauseOthers={() => audioRef.current?.pause()} />
                          </div>
                        )}
                        {revealed && (
                          <div className="mt-3 rounded-xl border border-gold/40 bg-gold/5 p-3 text-sm">
                            <p className="mb-3 font-semibold">{t("rateQ")}</p>
                            {(() => {
                              // after "recite & check" the coach suggests a rating (the learner still decides)
                              const tip = reciteScore === null ? null : reciteScore >= 0.95 ? "easy" : reciteScore >= 0.75 ? "good" : "again";
                              const ring = (r: string) => (tip === r ? "ring-2 ring-offset-2 ring-[rgb(var(--gold))] ring-offset-surface" : "");
                              return (
                                <div className={`grid grid-cols-3 gap-2 ${kids ? "text-base [&>button]:h-14" : ""}`}>
                                  <button className={`h-11 rounded-lg border border-red-300 bg-surface font-semibold text-red-700 transition hover:bg-red-50 dark:border-red-500/40 dark:text-red-300 dark:hover:bg-red-500/10 ${ring("again")}`} onClick={() => onRate("again")}>↺ {t("again")}</button>
                                  <button className={`h-11 rounded-lg bg-accent font-bold text-white transition hover:brightness-110 ${ring("good")}`} onClick={() => onRate("good")}>✓ {t("good")}</button>
                                  <button className={`btn-gold h-11 rounded-lg font-bold ${ring("easy")}`} onClick={() => onRate("easy")}>★ {t("easy")}</button>
                                </div>
                              );
                            })()}
                          </div>
                        )}
                      </div>
                    )}
                    {active && !kids && shams === null && <div className="border-t border-line pt-1"><SocialBar verseKey={v.verse_key} shareText={v.translation} /></div>}
                    {(noteOpen === v.verse_key || notes[v.verse_key]) && (
                      <div className="mt-4 border-t border-line pt-4" onClick={(e) => e.stopPropagation()}>
                        {noteOpen === v.verse_key ? (
                          <textarea autoFocus rows={3} defaultValue={notes[v.verse_key]?.text ?? ""} placeholder={t("notePlaceholder")} onBlur={(e) => { saveNote(v.verse_key, e.target.value); setNoteOpen(null); }} className="w-full rounded-lg border border-line bg-bg p-3 text-sm outline-none focus:border-accent" />
                        ) : (
                          <button className="block w-full text-start text-sm italic text-muted hover:text-ink" onClick={() => setNoteOpen(v.verse_key)}>“{notes[v.verse_key].text}”</button>
                        )}
                      </div>
                    )}
                    {active && waiting && shams === null && (
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-bg/60 p-4 text-sm">
                        <span className="font-medium">{t("learnHint")}</span>
                        <button className={primary} onClick={(e) => { e.stopPropagation(); advance(); }}>{t("continue")}</button>
                      </div>
                    )}
                    {active && !kids && (
                      <button className="mt-4 inline-flex h-10 items-center gap-2 rounded-full border border-line bg-surface px-4 text-sm font-semibold text-ink transition hover:border-gold lg:hidden" onClick={(e) => { e.stopPropagation(); setSheetOpen(true); }}>
                        <svg viewBox="0 0 24 24" className="h-4 w-4 text-gold" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden><path d="M12 6.5C10 5 7 4.5 3.5 5v13c3.5-.5 6.5 0 8.5 1.5 2-1.5 5-2 8.5-1.5V5C17 4.5 14 5 12 6.5zM12 6.5v13" /></svg>
                        {t("tafsir")}
                      </button>
                    )}
                  </article>
                </li>
              );
            })}
          </ol>
          )}
          {showDebug && <p className="mt-6 text-center text-[11px] text-muted">{useRemote ? "quran.com" : "self-hosted"} · {verse.verse_key} · {dbg || "ok"}</p>}
          <DonateCTA variant="slim" className="mt-10" />
        </main>

        {!kids && <aside className="sticky top-20 my-5 hidden max-h-[calc(100vh-6rem)] self-start overflow-y-auto rounded-2xl border border-line bg-surface p-5 shadow-card lg:block">
          <h2 className="mb-3 font-display text-lg font-semibold">{t("tafsir")} · {verse.verse_key}</h2>
          {tafsirBody}
        </aside>}
      </div>


      {gateOpen && limitHit && <AuthGate mode={needsVerify ? "verify" : "register"} onClose={() => setGateOpen(false)} />}

      {note && (
        <div role="status" className="fixed inset-x-0 bottom-28 z-50 flex justify-center px-4">
          <p className={`rounded-full bg-ink px-4 py-2 text-sm text-bg shadow-card ${kids ? "pop text-base" : ""}`}>{kids ? "🌟 " : ""}{note}</p>
        </div>
      )}

      {shams !== null && cardAway && (
        <button onClick={() => { const c = document.getElementById("shams-card"); if (c) alignTop(c); }} className="fixed bottom-[12.25rem] left-1/2 z-40 inline-flex -translate-x-1/2 items-center gap-2 rounded-full bg-[rgb(var(--stage))] px-4 py-2 text-[13px] font-semibold text-white shadow-lg ring-1 ring-[rgb(var(--gold))]/40 lg:bottom-[8.5rem]">
          <Sun className="h-3.5 w-3.5 text-[rgb(var(--gold))]" />{ts("title")} · {ts("stepOf", { n: stepPos + 1, total: plan?.steps.length ?? 7 })}<span aria-hidden>{cardAway === "up" ? "↑" : "↓"}</span>
        </button>
      )}

      {/* Floating player dock: a dark-green jewel with gold, the play button inside a slowly turning rosette */}
      <div className="fixed inset-x-0 bottom-[4.5rem] z-40 px-3 lg:bottom-3">
        <div dir="ltr" className="stage mx-auto max-w-xl overflow-hidden rounded-3xl border border-[rgb(201_166_94)]/35 text-[#eef0f3] shadow-[0_14px_44px_rgba(3,25,18,0.45)]">
          {turn && (
            <div key={turn.key} className="flex items-center justify-center gap-2 bg-[rgb(201_166_94)]/15 px-4 py-1.5 text-[12px] font-semibold text-[rgb(233_207_153)]">
              <span className="relative h-1.5 w-24 overflow-hidden rounded-full bg-white/10"><span className="turn-bar absolute inset-y-0 start-0 rounded-full bg-[rgb(201_166_94)]" style={{ animationDuration: `${turn.ms}ms` }} /></span>
              {t("yourTurn")}
              <button onClick={() => { clearGap(); advance(); }} className="ms-1 rounded-full border border-white/20 px-2 py-0.5 text-[11px] text-white/80 hover:border-white">{t("skip")}</button>
            </div>
          )}
          <div className="h-[3px] bg-white/10"><div className="h-full bg-gradient-to-r from-[rgb(201_166_94)]/60 via-[rgb(233_207_153)] to-[rgb(201_166_94)] transition-all duration-500" style={{ width: `${((idx + 1) / verses.length) * 100}%` }} /></div>
          <div className="flex items-center gap-2 px-4 pt-2.5 text-[11px] tabular-nums text-white/55">
            <span className="w-8 text-end">{fmt(cur)}</span>
            <input type="range" min={0} max={dur || 1} step={0.1} value={Math.min(cur, dur || 1)} onChange={(e) => { const a = audioRef.current; if (a) { a.currentTime = Number(e.target.value); setCur(a.currentTime); } }} className="h-1 min-w-0 flex-1 accent-[rgb(201_166_94)]" aria-label={t("seek")} />
            <span className="w-8">{fmt(dur)}</span>
            {sleep.mode !== 0 && <span className="inline-flex items-center gap-1 text-[rgb(233_207_153)]" title={t("sleep")}><svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" /></svg>{sleep.mode > 0 ? Math.max(1, Math.ceil((sleep.until - Date.now()) / 60000)) : ""}</span>}
            <button className="grid h-7 w-7 place-items-center rounded-full hover:text-white" onClick={() => setVol(vol === 0 ? 1 : 0)} aria-label={t("volume")}><IconVolume muted={vol === 0} /></button>
          </div>
          <div className="flex items-center justify-between gap-2 px-3 pb-2.5 pt-1">
            <span className="flex w-20 min-w-0 items-center gap-2 text-xs leading-tight text-white/65">
              <span aria-hidden className={`eq ${playing ? "eq-on" : ""}`}><i /><i /><i /><i /></span>
              <span className="min-w-0"><span className="font-callig block truncate text-[15px] leading-none text-[rgb(var(--gold))]" dir="rtl" lang="ar">{chapter.name_arabic}</span>{verse.verse_number}/{verses.length}</span>
            </span>
            <div className="flex items-center gap-1">
              <button className="grid h-11 w-11 place-items-center rounded-full text-white/85 transition hover:bg-white/10 hover:text-white" onClick={() => goTo(Math.max(0, idx - 1), false)} aria-label={t("prev")}><IconPrev /></button>
              <span className="relative grid h-16 w-16 place-items-center">
                <svg aria-hidden viewBox="0 0 64 64" className={`play-rosette absolute inset-0 h-full w-full text-[rgb(201_166_94)] ${playing ? "play-rosette-on" : ""}`}>
                  <path d={Array.from({ length: 32 }, (_, i) => { const a = (Math.PI / 16) * i - Math.PI / 2, r = i % 2 ? 27 : 31; return `${i ? "L" : "M"}${(32 + r * Math.cos(a)).toFixed(2)},${(32 + r * Math.sin(a)).toFixed(2)}`; }).join("") + "Z"} fill="none" stroke="currentColor" strokeWidth="1" strokeOpacity=".7" />
                </svg>
                <button
                  className="btn-gold relative grid h-12 w-12 place-items-center rounded-full shadow-card"
                  onClick={() => { if (turn) { clearGap(); return; } if (playing) audioRef.current?.pause(); else play(); }}
                  aria-label={playing ? t("pause") : t("play")}
                >{playing ? <IconPause /> : <IconPlay />}</button>
              </span>
              <button className="grid h-11 w-11 place-items-center rounded-full text-white/85 transition hover:bg-white/10 hover:text-white" onClick={() => goTo(Math.min(verses.length - 1, idx + 1), false)} aria-label={t("next")}><IconNext /></button>
            </div>
            <select value={idx} onChange={(e) => goTo(Number(e.target.value), false)} className="h-9 w-16 rounded-md border border-white/15 bg-white/5 px-2 text-sm text-white" aria-label={t("jump")}>
              {verses.map((v, i) => <option key={v.verse_key} value={i} className="text-ink">{v.verse_number}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Mobile: bottom sheet */}
      {sheetOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSheetOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[85dvh] overflow-y-auto rounded-t-3xl bg-surface p-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-xl">
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-line" />
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display font-semibold">{t("tafsir")} · {verse.verse_key}</h2>
              <button className="text-sm font-medium text-accent" onClick={() => setSheetOpen(false)}>{t("closeTafsir")}</button>
            </div>
            {tafsirBody}
            {shams === 4 && <button onClick={() => { setSheetOpen(false); nextShams(); }} className="mt-5 h-11 w-full rounded-md bg-ink text-sm font-bold text-bg">{ts("next")}</button>}
          </div>
        </div>
      )}
    </div>
  );
}
