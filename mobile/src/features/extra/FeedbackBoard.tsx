import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { router, type Href } from "expo-router";
import { Chip, GoldButton, GoldCard, OutlineButton, Segmented } from "@/components/brand";
import { Icon } from "@/components/icons";
import { useLang } from "@/i18n";
import { useWebT } from "@/i18n/web";
import { ApiError, api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { FONT, R, goldButton, useTheme } from "@/lib/theme";
import { GOLD, alpha, useHm } from "./art";
import { openWebsite } from "./links";
import { fill, useX } from "./strings";

type Post = { id: number; category: string; title: string; body: string; status: string; approved: boolean; created_at: string; author: string; country: string | null; votes: number; voted: boolean; mine: boolean };
export const FEEDBACK_CATS = ["feature", "tafsir", "translation", "reciter", "bug", "content"] as const;
export type FeedbackCat = (typeof FEEDBACK_CATS)[number];
export type FeedbackDraft = { cat?: FeedbackCat; title?: string; body?: string; open?: boolean };

/**
 * "Report a problem" from any content (owner's wish: a report button on every content screen). Opens the feedback
 * board with the form already filled, e.g. reportProblem({ cat: "content", title: "Tafsir 2:255", body: "…" }).
 */
export function reportProblem(d: Omit<FeedbackDraft, "open"> = {}) {
  const p = new URLSearchParams({ new: "1", cat: d.cat ?? "bug", ...(d.title ? { title: d.title.slice(0, 120) } : {}), ...(d.body ? { body: d.body.slice(0, 1500) } : {}) });
  router.push(`/feedback?${p.toString()}` as Href);
}

/**
 * Feedback board of the website (FeedbackBoard.tsx): requests for features, tafsir, translations, reciters, mistakes
 * and content, with votes and status, against the website's /api/feedback (same moderation and review).
 */
export function FeedbackBoard({ initial }: { initial?: FeedbackDraft }) {
  const t = useTheme();
  const hm = useHm(t);
  const w = useWebT("feedback");
  const x = useX();
  const { lang } = useLang();
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [cat, setCat] = useState<string>("");
  const [sort, setSort] = useState<"top" | "new">("top");
  const [open, setOpen] = useState(!!initial?.open);
  const [form, setForm] = useState({ category: initial?.cat ?? "feature", title: initial?.title ?? "", body: initial?.body ?? "" });
  const [msg, setMsg] = useState<{ text: string; web?: boolean } | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    setFailed(false);
    api<{ posts?: Post[] }>(`/api/feedback?sort=${sort}${cat ? `&cat=${cat}` : ""}`).then((d) => setPosts(d.posts ?? [])).catch(() => { setPosts((p) => p ?? []); setFailed(true); });
  }, [cat, sort]);
  useEffect(load, [load]);

  // signed out -> sign in; e-mail not confirmed -> say so; true when the action may go on
  const gate = () => {
    if (!user) { setMsg({ text: x.feedback.signIn }); router.push("/sign-in"); return false; }
    if (!user.emailVerified) { setMsg({ text: x.verify }); return false; }
    return true;
  };
  const authError = (e: unknown) => {
    if (!(e instanceof ApiError)) return false;
    if (e.status === 401) { setMsg({ text: x.feedback.signIn }); router.push("/sign-in"); return true; }
    if (e.status === 403) { setMsg({ text: x.verify }); return true; }
    return false;
  };

  const vote = async (p: Post) => {
    if (!p.approved || !gate()) return;
    setPosts((list) => list?.map((q) => (q.id === p.id ? { ...q, voted: !q.voted, votes: Math.max(0, q.votes + (q.voted ? -1 : 1)) } : q)) ?? null);
    try { await api("/api/feedback", { body: { action: "vote", id: p.id } }); } catch (e) { authError(e); }
    load();
  };

  const submit = async () => {
    if (!gate()) return;
    setBusy(true); setMsg(null);
    try {
      await api("/api/feedback", { body: { category: form.category, title: form.title.trim(), body: form.body.trim() } });
      setMsg({ text: w("thanks") }); setForm({ category: form.category, title: "", body: "" }); setOpen(false); load();
    } catch (e) {
      if (authError(e)) return;
      const err = e instanceof ApiError ? e : null;
      if (err?.code === "captcha") setMsg({ text: x.feedback.captcha, web: true });
      else setMsg({ text: err?.status === 422 ? w("rejected") : err?.status === 429 ? w("rate") : err ? w("invalid") : x.offline });
    } finally { setBusy(false); }
  };

  const statusStyle = (s: string) => ({
    review: { bg: t.line, fg: t.muted },
    planned: { bg: alpha(GOLD, 0.16), fg: hm.goldD },
    progress: { bg: t.accentSoft, fg: t.accent },
    done: { bg: t.accent, fg: t.onAccent },
    declined: { bg: t.bg, fg: t.muted },
  }[s] ?? { bg: t.line, fg: t.muted });

  return (
    <View style={{ gap: 16 }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }} style={{ marginHorizontal: -16 }}>
        <Chip label={w("all")} selected={cat === ""} onPress={() => setCat("")} />
        {FEEDBACK_CATS.map((c) => <Chip key={c} label={w(`c_${c}`)} selected={cat === c} onPress={() => setCat(c)} />)}
      </ScrollView>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <Segmented value={sort} options={[["top", w("top")], ["new", w("newest")]]} onChange={setSort} />
        {!open ? <OutlineButton title={w("new")} icon="plus" compact onPress={() => { if (gate()) setOpen(true); }} /> : null}
      </View>

      {msg ? (
        <View accessibilityRole="alert" style={{ borderRadius: R.md, backgroundColor: t.accentSoft, padding: 14, gap: 10 }}>
          <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 20, color: t.ink }}>{msg.text}</Text>
          {msg.web ? <Text onPress={() => void openWebsite("/feedback", lang)} accessibilityRole="link" style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.accent }}>{x.openWebsite}</Text> : null}
        </View>
      ) : null}

      {open ? (
        <GoldCard>
          <View style={{ gap: 14 }}>
            <Text style={{ fontFamily: FONT.semibold, fontSize: 11.5, letterSpacing: 1.8, textTransform: "uppercase", color: t.muted }}>{x.feedback.category}</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {FEEDBACK_CATS.map((c) => <Chip key={c} label={w(`c_${c}`)} selected={form.category === c} onPress={() => setForm({ ...form, category: c })} />)}
            </View>
            <TextInput value={form.title} onChangeText={(v) => setForm({ ...form, title: v })} maxLength={120} placeholder={w("titlePh")} placeholderTextColor={t.muted} accessibilityLabel={x.feedback.titleLabel}
              style={{ height: 48, borderRadius: R.md, borderWidth: 1, borderColor: t.line, backgroundColor: t.bg, paddingHorizontal: 14, fontFamily: FONT.regular, fontSize: 16, color: t.ink }} />
            <TextInput value={form.body} onChangeText={(v) => setForm({ ...form, body: v })} maxLength={1500} multiline placeholder={w("bodyPh")} placeholderTextColor={t.muted} accessibilityLabel={x.feedback.bodyLabel}
              style={{ minHeight: 110, borderRadius: R.md, borderWidth: 1, borderColor: t.line, backgroundColor: t.bg, paddingHorizontal: 14, paddingTop: 12, paddingBottom: 12, fontFamily: FONT.regular, fontSize: 16, color: t.ink, textAlignVertical: "top" }} />
            <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, color: t.muted }}>{w("reviewNote")}</Text>
            <GoldButton title={w("send")} onPress={() => void submit()} busy={busy} disabled={form.title.trim().length < 6} />
            <OutlineButton title={x.feedback.cancel} onPress={() => setOpen(false)} />
          </View>
        </GoldCard>
      ) : null}

      {posts === null ? <ActivityIndicator color={t.accent} style={{ marginTop: 24 }} /> : posts.length === 0 ? (
        <Text style={{ fontFamily: FONT.regular, fontSize: 15, color: t.muted, paddingVertical: 16 }}>{failed ? x.offline : w("empty")}</Text>
      ) : (
        <View style={{ borderRadius: R.lg, borderWidth: 1, borderColor: t.line, overflow: "hidden", backgroundColor: t.surface }}>
          {posts.map((p, i) => {
            const st = statusStyle(p.status);
            return (
              <View key={p.id} style={{ flexDirection: "row", gap: 14, padding: 16, borderTopWidth: i ? 1 : 0, borderTopColor: t.line }}>
                <Pressable onPress={() => void vote(p)} disabled={!p.approved} accessibilityRole="button" accessibilityState={{ selected: p.voted, disabled: !p.approved }} accessibilityLabel={`${w("vote")}, ${fill(x.feedback.votes, { n: p.votes })}`}
                  style={({ pressed }) => ({ width: 48, height: 56, borderRadius: R.md, borderWidth: 1, alignItems: "center", justifyContent: "center", gap: 2,
                    borderColor: p.voted ? t.accent : pressed ? goldButton.line : t.line, backgroundColor: p.voted ? t.accentSoft : t.surface, opacity: p.approved ? 1 : 0.5 })}>
                  <View style={{ transform: [{ rotate: "180deg" }] }}><Icon name="chevronDown" size={16} color={p.voted ? t.accent : t.muted} /></View>
                  <Text style={{ fontFamily: FONT.bold, fontSize: 14, color: p.voted ? t.accent : t.ink, fontVariant: ["tabular-nums"] }}>{p.votes}</Text>
                </Pressable>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
                    <Text style={{ fontFamily: FONT.semibold, fontSize: 11, letterSpacing: 1.1, textTransform: "uppercase", color: hm.goldD }}>{w(`c_${p.category}`)}</Text>
                    <Text style={{ fontFamily: FONT.semibold, fontSize: 11.5, color: st.fg, backgroundColor: st.bg, borderRadius: 3, overflow: "hidden", paddingHorizontal: 6, paddingVertical: 2, textDecorationLine: p.status === "declined" ? "line-through" : "none" }}>{w(`s_${p.status}`)}</Text>
                    {!p.approved ? <Text style={{ fontFamily: FONT.semibold, fontSize: 11.5, color: t.muted, backgroundColor: t.bg, borderRadius: 3, overflow: "hidden", paddingHorizontal: 6, paddingVertical: 2 }}>{w("pending")}</Text> : null}
                  </View>
                  <Text style={{ fontFamily: FONT.bold, fontSize: 16, lineHeight: 21, color: t.ink, marginTop: 6 }}>{p.title}</Text>
                  {p.body ? <Text numberOfLines={3} style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 20, color: t.muted, marginTop: 4 }}>{p.body}</Text> : null}
                  <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: t.muted, marginTop: 8 }}>
                    {p.author}{p.country ? ` · ${p.country}` : ""} · {new Date(p.created_at).toLocaleDateString(lang, { day: "numeric", month: "short", year: "numeric" })}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}
