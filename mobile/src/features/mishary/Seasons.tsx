import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { Stack, router, type Href } from "expo-router";
import { GoldButton, OutlineButton } from "@/components/brand";
import { Icon } from "@/components/icons";
import { Page, PageHero } from "@/components/page";
import { useLang } from "@/i18n";
import { useAuth } from "@/lib/auth";
import { FONT, R, useTheme } from "@/lib/theme";
import { SURAHS } from "@/features/garden/catalog";
import { M, type Placement, type Season, type SeasonItem } from "./api";
import { useMt } from "./texts";
import { Card, Chip, ErrorText, Muted, Recorder, Row, Section, useLoad, type Take } from "./ui";
import { Gate, MemberLine, VersePick, useErr } from "./Mentoring";

// Talent seasons: monthly challenges (created by the server for every month), Ramadan and special seasons (admin).
// An entry is a private recording heard only by the jury (masters and admins), without the member's name. Published
// results go to season_results (the rankings read it) and the Hall of Fame; place 1 earns the season's mythic
// sticker, places 2–3 the legendary one (new sticker ids per season, see talent_seasons.reward_*).

const href = (p: string) => p as Href;
const MYTHIC = "rgb(122,64,160)";

export function seasonTitle(s: Season, mt: ReturnType<typeof useMt>, lang: string): string {
  if (s.title) return s.title;
  const [surah, range] = s.verses.split(":");
  const name = SURAHS[Number(surah) - 1] ?? surah;
  const [a, b] = range.split("-");
  const base = `${name} ${a}${b ? `–${b}` : ""}`;
  if (s.kind !== "month") return base;
  try { return `${new Date(`${s.startsOn}T12:00:00`).toLocaleDateString(lang, { month: "long", year: "numeric" })} · ${base}`; } catch { return base; }
}
function statusLine(s: Season, mt: ReturnType<typeof useMt>) {
  if (s.published) return mt("published");
  if (s.status === "open") return mt("openUntil", { d: s.endsOn });
  return s.status === "judging" ? mt("judging") : mt("closed");
}

function SeasonCard({ s }: { s: SeasonItem }) {
  const t = useTheme();
  const mt = useMt();
  const { lang } = useLang();
  return (
    <Pressable onPress={() => router.push(href(`/mishary/seasons/${s.slug}`))} accessibilityRole="button">
      <Card>
        <Text style={{ fontFamily: FONT.semibold, fontSize: 12, letterSpacing: 1, color: t.gold }}>{mt(`k_${s.kind}`).toUpperCase()}</Text>
        <Text style={{ fontFamily: FONT.bold, fontSize: 17, color: t.ink }}>{seasonTitle(s, mt, lang)}</Text>
        <Muted>{statusLine(s, mt)} · {mt("entriesN", { n: s.entries })}</Muted>
        {s.result ? <Text style={{ fontFamily: FONT.semibold, color: s.result.rarity === "mythic" ? MYTHIC : t.accent }}>{mt("yourResult", { n: s.result.place })}</Text>
          : s.mine ? <Text style={{ fontFamily: FONT.semibold, color: t.accent }}>{mt("yourEntry")}</Text> : null}
      </Card>
    </Pressable>
  );
}

function NewSeason({ onDone }: { onDone: () => void }) {
  const t = useTheme();
  const mt = useMt();
  const err = useErr();
  const [f, setF] = useState({ slug: "", kind: "ramadan", title: "", verses: "", startsOn: "", endsOn: "" });
  const [msg, setMsg] = useState("");
  const input = (k: keyof typeof f, label: string) => (
    <View style={{ gap: 4 }}>
      <Muted size={12}>{label}</Muted>
      <TextInput value={f[k]} onChangeText={(v) => setF({ ...f, [k]: v })} autoCapitalize="none"
        style={{ borderWidth: 1, borderColor: t.line, borderRadius: R.md, padding: 10, fontFamily: FONT.regular, fontSize: 15, color: t.ink }} />
    </View>
  );
  return (
    <Card>
      <Text style={{ fontFamily: FONT.bold, fontSize: 15, color: t.ink }}>{mt("adminNew")}</Text>
      <Row>{(["month", "ramadan", "special"] as const).map((k) => <Chip key={k} label={mt(`k_${k}`)} on={f.kind === k} onPress={() => setF({ ...f, kind: k })} />)}</Row>
      {input("slug", mt("slug"))}{input("verses", `${mt("verse")} (67:1-5)`)}{input("startsOn", mt("startsOn"))}{input("endsOn", mt("endsOn"))}{input("title", mt("titleField"))}
      <ErrorText text={msg} />
      <OutlineButton compact title={mt("create")} onPress={() => void M.newSeason(f).then(() => { setMsg(""); onDone(); }).catch((e) => setMsg(err(e)))} />
    </Card>
  );
}

// ——— /mishary/seasons ———
export function SeasonsScreen() {
  const mt = useMt();
  const { user } = useAuth();
  const d = useLoad(() => (user ? M.seasons() : Promise.resolve(null)), [user]);
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Page>
        <PageHero topInset back eyebrow={mt("kicker")} title={mt("seasonsTitle")} lead={mt("seasonsLead")}>
          <OutlineButton onStage compact icon="trophy" title={mt("hofTitle")} onPress={() => router.push(href("/mishary/hall-of-fame"))} />
        </PageHero>
        <View style={{ paddingHorizontal: 16, marginTop: 20, gap: 14 }}>
          <Gate error={d.error}>
            {!d.data ? <Muted>{mt("loading")}</Muted> : (
              <>
                <Muted>{mt("rewards")}</Muted>
                {d.data.seasons.map((s) => <SeasonCard key={s.slug} s={s} />)}
                {d.data.admin ? <NewSeason onDone={d.reload} /> : null}
              </>
            )}
          </Gate>
          <View style={{ height: 40 }} />
        </View>
      </Page>
    </>
  );
}

export function Podium({ list }: { list: Placement[] }) {
  const t = useTheme();
  const mt = useMt();
  return (
    <View style={{ gap: 10 }}>
      {list.map((p) => (
        <View key={p.place} style={{ gap: 6, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: t.line }}>
          <Row>
            <Text style={{ fontFamily: FONT.bold, fontSize: 14, color: p.place === 1 ? MYTHIC : t.gold }}>{mt("place", { n: p.place })}</Text>
            <Muted size={12}>{mt("score", { s: p.score.toFixed(1) })}</Muted>
            {p.rarity ? (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, height: 22, borderRadius: R.pill, borderWidth: 1, borderColor: p.rarity === "mythic" ? MYTHIC : t.gold }}>
                <Icon name="starBig" size={11} color={p.rarity === "mythic" ? MYTHIC : t.gold} />
                <Text style={{ fontFamily: FONT.bold, fontSize: 10.5, color: p.rarity === "mythic" ? MYTHIC : t.gold }}>{p.rarity === "mythic" ? mt("mythic") : mt("legendary")}</Text>
              </View>
            ) : null}
          </Row>
          {p.member ? <MemberLine m={p.member} /> : null}
        </View>
      ))}
    </View>
  );
}

// ——— /mishary/seasons/[slug] ———
export function SeasonScreen({ slug }: { slug: string }) {
  const t = useTheme();
  const mt = useMt();
  const err = useErr();
  const { lang } = useLang();
  const list = useLoad(() => M.seasons(), [slug]);
  const d = useLoad(() => M.season(slug), [slug]);
  const jury = useLoad(() => (list.data?.judge ? M.submissions("jury", slug).then((r) => r.submissions) : Promise.resolve([])), [list.data, slug]);
  const [take, setTake] = useState<Take | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const item = list.data?.seasons.find((s) => s.slug === slug);
  const s = d.data?.season;
  const enter = async () => {
    if (!take || !s) return;
    setBusy(true); setMsg("");
    try { await M.send({ verseKey: s.verses, durationMs: take.durMs, season: s.slug }, take.uri); setTake(null); list.reload(); d.reload(); }
    catch (e) { setMsg(err(e)); } finally { setBusy(false); }
  };
  const admin = (a: "judging" | "publish") => void M.seasonAction(slug, a).then(() => { d.reload(); list.reload(); }).catch((e) => setMsg(err(e)));
  const open = s?.status === "open" && s.endsOn >= new Date().toISOString().slice(0, 10);
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Page>
        <PageHero topInset back eyebrow={s ? mt(`k_${s.kind}`) : mt("seasonsTitle")} title={s ? seasonTitle(s, mt, lang) : mt("loading")} lead={s ? `${statusLine(s, mt)} · ${mt("entriesN", { n: d.data!.entries })}` : undefined} arcade={false} />
        <View style={{ paddingHorizontal: 16, marginTop: 20, gap: 22 }}>
          <Gate error={d.error ?? list.error}>
            {!s ? <Muted>{mt("loading")}</Muted> : (
              <>
                <Muted>{mt("rewards")}</Muted>
                {item?.mine ? (
                  <Section title={mt("yourEntry")}>
                    <Card>
                      <Text style={{ fontFamily: FONT.semibold, color: t.accent }}>{item.mine.status === "reviewed" ? mt("reviewed") : mt("pending")}</Text>
                      <OutlineButton compact title={mt("open")} onPress={() => router.push(href(`/mishary/mentoring/${item.mine!.id}`))} />
                    </Card>
                  </Section>
                ) : open ? (
                  <Section title={mt("enter")}>
                    <Card>
                      <VersePick value={s.verses} fixed />
                      <Muted>{mt("recordSeason", { v: s.verses, s: s.maxSeconds })}</Muted>
                      <Recorder maxSec={s.maxSeconds} minSec={10} onTake={setTake} />
                      <Row><Icon name="lock" size={14} color={t.accent} /><Muted>{mt("entryPrivate")}</Muted></Row>
                      <GoldButton title={mt("sendBtn")} icon="send" busy={busy} disabled={!take || busy} onPress={() => void enter()} />
                    </Card>
                  </Section>
                ) : null}
                <ErrorText text={msg} />
                <Section title={mt("hofTitle")}>
                  <Card>{d.data!.results.length ? <Podium list={d.data!.results} /> : <Muted>{mt("noResults")}</Muted>}</Card>
                </Section>
                {list.data?.judge && !s.published ? (
                  <Section title={`${mt("toJudge")} (${jury.data?.length ?? 0})`}>
                    <Card style={{ gap: 0 }}>
                      {(jury.data ?? []).length ? (jury.data ?? []).map((x) => (
                        <Pressable key={x.id} onPress={() => router.push(href(`/mishary/mentoring/${x.id}`))} accessibilityRole="button"
                          style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10, borderTopWidth: 1, borderTopColor: t.line }}>
                          <Icon name="speaker" size={16} color={t.gold} />
                          <Text style={{ flex: 1, fontFamily: FONT.semibold, fontSize: 14, color: t.ink }}>{mt("entry", { n: x.id })} · {Math.round(x.durationMs / 1000)} s</Text>
                          <Icon name="chevronRight" size={15} color={t.muted} />
                        </Pressable>
                      )) : <Muted>{mt("none")}</Muted>}
                    </Card>
                  </Section>
                ) : null}
                {list.data?.admin && !s.published ? (
                  <Row>
                    {s.status === "open" ? <OutlineButton compact title={mt("adminJudging")} onPress={() => admin("judging")} /> : null}
                    <GoldButton compact title={mt("adminPublish")} onPress={() => admin("publish")} />
                  </Row>
                ) : null}
              </>
            )}
          </Gate>
          <View style={{ height: 40 }} />
        </View>
      </Page>
    </>
  );
}

// ——— /mishary/hall-of-fame ———
export function HallOfFameScreen() {
  const mt = useMt();
  const { lang } = useLang();
  const { user } = useAuth();
  const d = useLoad(() => (user ? M.hallOfFame() : Promise.resolve(null)), [user]);
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Page>
        <PageHero topInset back eyebrow={mt("seasonsTitle")} title={mt("hofTitle")} lead={mt("hofLead")} arabic="لوحة الشرف" />
        <View style={{ paddingHorizontal: 16, marginTop: 20, gap: 18 }}>
          <Gate error={d.error}>
            {!d.data ? <Muted>{mt("loading")}</Muted> : d.data.seasons.length ? d.data.seasons.map((x) => (
              <Section key={x.season.slug} title={seasonTitle(x.season, mt, lang)}>
                <Card><Podium list={x.podium} /></Card>
              </Section>
            )) : <Muted>{mt("noResults")}</Muted>}
          </Gate>
          <View style={{ height: 40 }} />
        </View>
      </Page>
    </>
  );
}
