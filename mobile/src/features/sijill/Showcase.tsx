import { useEffect, useState, type ReactNode } from "react";
import { Linking, Pressable, Text, View } from "react-native";
import { FONT, GOLD_RING, R, goldButton, goldHair, stage, useTheme } from "@/lib/theme";
import { Icon, type IconName } from "@/components/icons";
import { useLang } from "@/i18n";
import { getChapters } from "@/lib/quran";
import { TreeArt } from "@/features/garden/Tree";
import { Celestial, FarLayer, Sky, Zellige, phaseNow, skyInk } from "@/features/garden/Scene";
import { CatalogArt } from "@/features/garden/CatalogArt";
import { useGardenText } from "@/features/garden/texts";
import type { TreeType } from "@/features/garden/garden";
import { GRADES } from "@/features/shams2/grades";
import { courseById, tx as courseTx } from "@/features/courses";
import { BadgeMark } from "@/features/talents/badges";
import { useTT, type TKey } from "@/features/talents/text";
import { ShareCardButton, type CardData } from "@/features/share/ShareKit";
import { SITE } from "@/lib/api";
import type { ExamPassed, Sijill } from "./api";
import { useST, type SKey } from "./text";

// The Sijill showcase: an academic record in emerald and gold (always on the deep emerald stage, in light and dark mode),
// one panel per section the member shows. Owner view: every section, hidden ones marked. Read-only numbers; certificates
// link to their public verify page.

const nf = (lang: string) => (n: number) => Intl.NumberFormat(lang).format(n);

export function Panel({ title, icon, hidden, checked, children }: { title: string; icon?: IconName; hidden?: boolean; checked?: boolean; children: ReactNode }) {
  const st = useST();
  return (
    <View accessibilityRole="summary" style={{ borderRadius: R.card, borderWidth: 1, borderColor: goldHair, backgroundColor: stage.bg, padding: 16, gap: 10, opacity: hidden ? 0.72 : 1 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        {icon ? <Icon name={icon} color={stage.gold} size={16} /> : null}
        <Text accessibilityRole="header" style={{ flex: 1, fontFamily: FONT.bold, fontSize: 15, color: stage.cream }}>{title}</Text>
        {hidden ? <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}><Icon name="lock" color={stage.textMuted} size={13} /><Text style={{ fontFamily: FONT.semibold, fontSize: 11.5, color: stage.textMuted }}>{st("hidden")}</Text></View> : null}
        {checked ? <View accessible accessibilityLabel={st("checked")} style={{ flexDirection: "row", alignItems: "center", gap: 4 }}><Icon name="checkCircle" color={stage.gold} size={14} /><Text style={{ fontFamily: FONT.semibold, fontSize: 11, color: stage.gold }}>{st("checked")}</Text></View> : null}
      </View>
      {children}
    </View>
  );
}
const Big = ({ children }: { children: ReactNode }) => <Text style={{ fontFamily: FONT.display, fontSize: 26, color: stage.cream }}>{children}</Text>;
const Line = ({ children, muted }: { children: ReactNode; muted?: boolean }) => <Text style={{ fontFamily: muted ? FONT.regular : FONT.semibold, fontSize: muted ? 13 : 14.5, lineHeight: muted ? 18 : 21, color: muted ? stage.textMuted : stage.text }}>{children}</Text>;
const Pill = ({ children }: { children: ReactNode }) => (
  <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: R.pill, borderWidth: 1, borderColor: goldButton.line, backgroundColor: "rgba(214,180,108,0.12)" }}>
    <Text style={{ fontFamily: FONT.semibold, fontSize: 12.5, color: stage.gold }}>{children}</Text>
  </View>
);

/** 30 juz cells (6 × 5): the brighter the gold, the more is memorised */
export function JuzGrid({ juz }: { juz: number[] }) {
  const st = useST();
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ fontFamily: FONT.semibold, fontSize: 12, color: stage.textMuted }}>{st("byJuz")}</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4 }}>
        {juz.map((p, i) => (
          <View key={i} accessible accessibilityLabel={`${i + 1}: ${p} %`} style={{ width: "15.3%", aspectRatio: 1.4, borderRadius: 4, alignItems: "center", justifyContent: "center",
            backgroundColor: p >= 100 ? goldButton.to : p > 0 ? `rgba(214,180,108,${0.12 + (p / 100) * 0.6})` : "rgba(255,255,255,0.05)", borderWidth: p >= 100 ? 0 : 1, borderColor: "rgba(214,180,108,0.2)" }}>
            <Text allowFontScaling={false} style={{ fontFamily: FONT.bold, fontSize: 11, color: p >= 100 ? goldButton.text : stage.cream }}>{i + 1}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
/** 114 small surah cells */
export function SurahGrid({ surahs }: { surahs: number[] }) {
  const st = useST();
  return (
    <View style={{ gap: 6 }} accessible accessibilityLabel={`${st("bySurah")}: ${surahs.filter((p) => p >= 100).length}`}>
      <Text style={{ fontFamily: FONT.semibold, fontSize: 12, color: stage.textMuted }}>{st("bySurah")}</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 2 }}>
        {surahs.map((p, i) => <View key={i} style={{ width: 11, height: 11, borderRadius: 2, backgroundColor: p >= 100 ? goldButton.to : p > 0 ? `rgba(214,180,108,${0.15 + (p / 100) * 0.6})` : "rgba(255,255,255,0.06)" }} />)}
      </View>
      <Text style={{ fontFamily: FONT.regular, fontSize: 11.5, color: stage.textMuted }}>{st("heatHint")}</Text>
    </View>
  );
}
/** XP of the week, Monday to Sunday */
export function WeekBars({ xp }: { xp: number[] }) {
  const { lang } = useLang();
  const max = Math.max(1, ...xp);
  // 2024-01-01 was a Monday
  const days = Array.from({ length: 7 }, (_, i) => new Date(Date.UTC(2024, 0, 1 + i)).toLocaleDateString(lang, { weekday: "narrow", timeZone: "UTC" }));
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 8, height: 86 }}>
      {xp.map((n, i) => (
        <View key={i} accessible accessibilityLabel={`${days[i]}: ${n} XP`} style={{ flex: 1, alignItems: "center", gap: 4 }}>
          <View style={{ width: "100%", height: Math.max(3, Math.round((n / max) * 62)), borderRadius: 3, backgroundColor: n > 0 ? goldButton.to : "rgba(255,255,255,0.08)" }} />
          <Text allowFontScaling={false} style={{ fontFamily: FONT.semibold, fontSize: 11, color: stage.textMuted }}>{days[i]}</Text>
        </View>
      ))}
    </View>
  );
}

/** the member's garden tree as a header banner: sky of the hour, the far arcade, tiles and the tree itself (garden
 * components reused unchanged), with its name, type, stage and age */
export function TreeBanner({ tree, height = 190 }: { tree: NonNullable<Sijill["tree"]>; height?: number }) {
  const st = useST();
  const gt = useGardenText();
  const [w, setW] = useState(0);
  const phase = phaseNow();
  const ink = skyInk(phase);
  const type = gt[`t_${tree.type}` as keyof typeof gt] as string;
  const label = [tree.name, type, st("treeStage", { n: tree.stage }), tree.days ? st("treeAge", { n: tree.days }) : ""].filter(Boolean).join(", ");
  return (
    <View accessible accessibilityRole="image" accessibilityLabel={label} onLayout={(e) => setW(Math.round(e.nativeEvent.layout.width))}
      style={{ height, borderRadius: R.card, overflow: "hidden", borderWidth: 1, borderColor: goldButton.line }}>
      <Sky phase={phase} />
      {w ? <Celestial phase={phase} width={w} height={height} /> : null}
      {w ? <View style={{ position: "absolute", left: 0, right: 0, bottom: 22 }}><FarLayer width={w} phase={phase} /></View> : null}
      {w ? <View style={{ position: "absolute", left: 0, right: 0, bottom: 0 }}><Zellige width={w} height={24} /></View> : null}
      <View style={{ position: "absolute", right: 14, bottom: 10, width: 150, height: height - 16, alignItems: "center", justifyContent: "flex-end" }}>
        <TreeArt id={`banner-${tree.type}-${tree.stage}`} type={tree.type as TreeType} stage={tree.stage} size={Math.round((height - 16) * 0.83)} />
      </View>
      <View style={{ position: "absolute", left: 14, top: 14, right: 170, gap: 2 }}>
        {tree.name ? <Text numberOfLines={1} style={{ fontFamily: FONT.display, fontSize: 19, color: ink }}>{tree.name}</Text> : null}
        <Text numberOfLines={1} style={{ fontFamily: FONT.semibold, fontSize: 13.5, color: ink }}>{type}</Text>
        <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, color: ink, opacity: 0.85 }}>{st("treeStage", { n: tree.stage })}</Text>
        {tree.days ? <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, color: ink, opacity: 0.85 }}>{st("treeAge", { n: tree.days })}</Text> : null}
      </View>
    </View>
  );
}

export function examTitle(e: Pick<ExamPassed, "exam" | "ref">, st: ReturnType<typeof useST>) {
  const key = `exam_${e.exam}` as SKey;
  return st(key, { n: e.ref });
}
export function useSurahNames() {
  const { lang } = useLang();
  const [names, setNames] = useState<string[]>([]);
  useEffect(() => { getChapters(lang).then((c) => setNames(c.map((x) => x.name_simple))).catch(() => undefined); }, [lang]);
  return (n: number) => names[n - 1] ? `${names[n - 1]} (${n})` : String(n);
}

/** the whole record; `mine` shows hidden sections too (marked) and the share button */
export function SijillShowcase({ s, mine, name, username, noTree }: { s: Sijill; mine: boolean; name: string; username: string; /** the tree is already shown as the profile banner */ noTree?: boolean }) {
  const st = useST();
  const t = useTheme();
  const tt = useTT();
  const gt = useGardenText();
  const { lang } = useLang();
  const n = nf(lang);
  const surah = useSurahNames();
  const hid = (k: keyof NonNullable<Sijill["privacy"]>) => mine && !!s.privacy && !s.privacy[k];
  const any = !!(s.level || s.badges || s.hifz || s.tree || s.stickers || s.certificates || s.exams || s.memorised || s.time || s.activity || s.courses || s.sharer);
  if (!any) return <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 20, color: t.muted, padding: 4 }}>{mine ? st("notSynced") : st("hiddenAll")}</Text>;

  const share = (): CardData => ({
    kicker: st("shareKicker"), title: name,
    big: s.level ? st("levelN", { n: s.level.level }) : s.memorised ? st("memVerses", { n: n(s.memorised.verses) }) : undefined,
    body: [
      s.level && st(`stage_${s.level.stage}` as SKey),
      s.hifz && `${st("sec_hifz")}: ${GRADES[s.hifz.grade - 1]?.tr ?? s.hifz.grade}`,
      s.memorised && s.memorised.verses > 0 && st("hifzVerses", { n: n(s.memorised.verses) }),
      s.certificates?.length && `${st("sec_certificates")}: ${s.certificates.length}`,
      s.time && st("streak", { n: s.time.streak }),
    ].filter(Boolean).join("\n"),
    seed: username,
  });

  return (
    <View style={{ gap: 12 }}>
      {/* the seal: level, stage and rank */}
      <View style={{ borderRadius: R.card, overflow: "hidden", borderWidth: 1.5, borderColor: goldButton.line, backgroundColor: stage.deep, padding: 18, gap: 8 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View style={{ width: 58, height: 58, borderRadius: 29, borderWidth: 2, borderColor: GOLD_RING[1], alignItems: "center", justifyContent: "center", backgroundColor: "rgba(214,180,108,0.12)" }}>
            <Text allowFontScaling={false} style={{ fontFamily: FONT.display, fontSize: 22, color: stage.cream }}>{s.level ? s.level.level : "·"}</Text>
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={{ fontFamily: FONT.semibold, fontSize: 11.5, letterSpacing: 1.4, color: stage.gold }}>{st("sijill")} · {st("title")}</Text>
            <Text style={{ fontFamily: FONT.display, fontSize: 19, color: stage.cream }}>{s.level ? st(`stage_${s.level.stage}` as SKey) : name}</Text>
            {s.level ? <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: stage.textSoft }}>{st(`rank_${s.level.rank}` as SKey)}{s.level.overall !== null ? ` · ${st("overall", { n: s.level.overall })}` : ""}</Text> : null}
          </View>
          {mine ? <ShareCardButton data={share} link={profileLink(username, lang)} color={stage.gold} label={st("shareRecord")} /> : null}
        </View>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {s.level ? <Pill>{st("xpN", { n: n(s.level.xp) })}</Pill> : null}
          {s.level ? <Pill>{`${st("talentLevel")}: ${tt(`level_${s.level.talentLevel}` as TKey)}`}</Pill> : null}
          {s.reactions > 0 ? <Pill>{st("encouragements", { n: n(s.reactions) })}</Pill> : null}
          {hid("level") ? <Pill>{st("hidden")}</Pill> : null}
        </View>
      </View>

      {s.badges ? (
        <Panel title={st("sec_badges")} icon="checkCircle" hidden={hid("badges")}>
          {s.badges.badge ? <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}><BadgeMark badge={s.badges.badge} size={24} /><Line>{tt(`badge_${s.badges.badge}` as TKey)}</Line></View> : <Line muted>{tt("noBadge")}</Line>}
        </Panel>
      ) : null}

      {s.hifz ? (
        <Panel title={st("sec_hifz")} icon="trophy" hidden={hid("hifz")}>
          <Text style={{ fontFamily: "Amiri_400Regular", fontSize: 26, color: stage.cream, writingDirection: "rtl" }}>{GRADES[s.hifz.grade - 1]?.ar}</Text>
          <Line>{GRADES[s.hifz.grade - 1]?.tr} · {st("hifzGrade", { n: s.hifz.grade })}</Line>
          <Line muted>{[st("hifzVerses", { n: n(s.hifz.verses) }), st("hifzTests", { n: n(s.hifz.tests) })].join(" · ")}</Line>
        </Panel>
      ) : null}

      {s.memorised ? (
        <Panel title={st("sec_memorised")} icon="book" hidden={hid("memorised")}>
          <Big>{st("memVerses", { n: n(s.memorised.verses) })}</Big>
          <Line muted>{st("memJuzDone", { n: s.memorised.juz.filter((p) => p >= 100).length })}</Line>
          {s.memorised.current ? <Line>{st("currentSurah", { s: surah(s.memorised.current) })}</Line> : null}
          <JuzGrid juz={s.memorised.juz} />
          <SurahGrid surahs={s.memorised.surahs} />
        </Panel>
      ) : null}

      {s.certificates ? (
        <Panel title={st("sec_certificates")} icon="starBig" hidden={hid("certificates")} checked={s.certificates.length > 0}>
          {s.certificates.length ? s.certificates.map((c) => (
            <View key={c.url} style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 4 }}>
              <View style={{ flex: 1 }}><Line>{c.title}</Line><Line muted>{`${c.pct} % · ${new Date(c.at).toLocaleDateString(lang, { day: "numeric", month: "short", year: "numeric" })}`}</Line></View>
              <Pressable onPress={() => void Linking.openURL(c.url)} accessibilityRole="link" accessibilityLabel={`${st("verify")}: ${c.title}`} hitSlop={8}
                style={{ paddingHorizontal: 12, minHeight: 34, justifyContent: "center", borderRadius: R.pill, borderWidth: 1, borderColor: goldButton.line }}>
                <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: stage.gold }}>{st("verify")}</Text>
              </Pressable>
            </View>
          )) : <Line muted>{st("noCertificates")}</Line>}
          {mine && s.certificates.length ? <Line muted>{st("certNote")}</Line> : null}
        </Panel>
      ) : null}

      {s.exams ? (
        <Panel title={st("sec_exams")} icon="checkCircle" hidden={hid("exams")} checked={s.exams.length > 0}>
          {s.exams.length ? (
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {s.exams.map((e) => <Pill key={`${e.exam}:${e.ref}`}>{`${examTitle(e, st)} · ${e.pct} %`}</Pill>)}
            </View>
          ) : <Line muted>{st("noExams")}</Line>}
        </Panel>
      ) : null}

      {s.tree && !noTree ? (
        <Panel title={st("sec_tree")} icon="sun" hidden={hid("tree")}>
          <TreeBanner tree={s.tree} height={150} />
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <View style={{ flex: 1, gap: 3 }}>
              {s.tree.trees > 1 ? <Line muted>{st("treeCount", { n: s.tree.trees })}</Line> : null}
              {s.tree.fruits > 0 ? <Line muted>{st("fruits", { n: n(s.tree.fruits) })}</Line> : null}
            </View>
          </View>
        </Panel>
      ) : null}

      {s.stickers ? (
        <Panel title={st("sec_stickers")} icon="grid" hidden={hid("stickers")}>
          <Big>{st("stickersTotal", { n: n(s.stickers.total), m: n(s.stickers.catalog) })}</Big>
          <Line muted>{[s.stickers.legendaryN && st("legendaryN", { n: s.stickers.legendaryN }), s.stickers.epic && st("epicN", { n: s.stickers.epic }), s.stickers.rare && st("rareN", { n: s.stickers.rare }), s.stickers.feed && st("feedStickers", { n: s.stickers.feed })].filter(Boolean).join(" · ")}</Line>
          {s.stickers.legendary.length ? (
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>{s.stickers.legendary.map((id) => <CatalogArt key={id} id={id} size={62} />)}</View>
          ) : null}
          {s.stickers.series.length ? (
            <View style={{ gap: 6 }}>
              <Line muted>{st("seriesDoneN", { n: s.stickers.series.length })}</Line>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>{s.stickers.series.map((se) => <Pill key={se}>{gt[`ser_${se}` as keyof typeof gt] as string}</Pill>)}</View>
            </View>
          ) : null}
        </Panel>
      ) : null}

      {s.time ? (
        <Panel title={st("sec_time")} icon="clock" hidden={hid("time")}>
          <Big>{st("timeTotal", { n: n(Math.round(s.time.totalMin / 60)) })}</Big>
          <Line muted>{[st("timeWeek", { n: n(s.time.weekMin) }), st("streak", { n: s.time.streak }), st("bestStreak", { n: s.time.best })].join(" · ")}</Line>
          {s.time.wird > 0 ? <Line muted>{st("wird", { n: s.time.wird })}</Line> : null}
        </Panel>
      ) : null}

      {s.activity ? (
        <Panel title={st("sec_activity")} icon="flame" hidden={hid("activity")}>
          <Line>{`${st("levelN", { n: s.activity.level })} · ${st("xpN", { n: n(s.activity.xp) })}`}</Line>
          <WeekBars xp={s.activity.week} />
          <Line muted>{st("weekActive", { n: s.activity.active })}</Line>
        </Panel>
      ) : null}

      {s.courses ? (
        <Panel title={st("sec_courses")} icon="cap" hidden={hid("courses")}>
          <Big>{st("coursesDone", { n: s.courses.done })}</Big>
          {s.courses.ids.length ? <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>{s.courses.ids.map((id) => { const c = courseById(id as never); return c ? <Pill key={id}>{courseTx(c.title, lang)}</Pill> : null; })}</View> : null}
          {s.courses.arLevels.length ? <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>{s.courses.arLevels.map((l) => <Pill key={l}>{st("arabicLevel", { l })}</Pill>)}</View> : null}
          <Line muted>{[s.courses.qaida && st("qaidaN", { n: s.courses.qaida }), s.courses.arabic && st("arabicN", { n: s.courses.arabic }), s.courses.rp && st("rpN", { n: s.courses.rp })].filter(Boolean).join(" · ") || " "}</Line>
        </Panel>
      ) : null}

      {s.sharer ? (
        <Panel title={st("sec_sharer")} icon="send" hidden={hid("sharer")}>
          <Line>{st("sharerTier", { n: s.sharer.tier })}</Line>
          <Line muted>{st("sharesN", { n: n(s.sharer.shares) })}</Line>
        </Panel>
      ) : null}

      {s.updatedAt ? <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: t.muted }}>{st("updated", { d: new Date(s.updatedAt).toLocaleDateString(lang, { day: "numeric", month: "short", year: "numeric" }) })}</Text> : null}
    </View>
  );
}

export const profileLink = (username: string, lang: string) => `${SITE}/${lang}/talents/${username}`;
