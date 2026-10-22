import { useEffect, useState } from "react";
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import { GoldButton, OutlineButton } from "@/components/brand";
import { Icon } from "@/components/icons";
import { tick, success } from "@/features/feed/haptics";
import { T as TL, type Conversation } from "@/features/talents/api";
import { writeJSON } from "@/lib/store";
import { ARABIC_FONT, CALLIG_FONT, FONT, R, stage } from "@/lib/theme";
import { toHijri, todayUtc } from "@/web/hijri";
import { DIRECTION_AR, DUA_MOMENTS_KEY, MOMENT_TOPICS, MY_DUAS_KEY, NICHE_PATH, momentFor, type GiftDua, type Moment, type MomentPrefs, type SavedDua } from "@/web/duaJourney";

// What brings people back to the personal dua, in an honest way (owner, 22.10.2026): the journal "Meine Duas" with
// the sealed duas as illuminated cards and "answered, Alhamdulillah" with a private note; gentle occasion moments
// (opt-in, in the app only, at most one a week, never a notification); a dua as a gift; sending it in Messages.
type T = (k: string, p?: Record<string, string | number>) => string;
const alpha = (rgb: string, a: number) => rgb.replace("rgb(", "rgba(").replace(")", `,${a})`);
const fmtDate = (t: number, lang: string) => { try { return new Date(t).toLocaleDateString(lang, { day: "numeric", month: "long", year: "numeric" }); } catch { return new Date(t).toDateString(); } };

/** the journal of sealed duas: illuminated cards with date and occasion; one can be marked answered with a note */
export function MyDuas({ saved, t, lang, onOpen }: { saved: SavedDua[]; t: T; lang: string; onOpen: (d: SavedDua) => void }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const answered = saved.filter((d) => d.answeredAt).length;
  const update = (id: string, patch: Partial<SavedDua>) => writeJSON(MY_DUAS_KEY, saved.map((d) => (d.id === id ? { ...d, ...patch } : d)), true);
  const remove = (id: string) => writeJSON(MY_DUAS_KEY, saved.filter((d) => d.id !== id), true);
  return (
    <View style={{ marginTop: 36 }}>
      <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 24, lineHeight: 30, color: "#ffffff" }}>{t("c_title")}</Text>
      <Text style={{ fontFamily: FONT.regular, fontSize: 13.5, lineHeight: 20, color: stage.textMuted, marginTop: 4 }}>{saved.length ? t("c_lead") : t("j_savedEmpty")}</Text>
      {answered ? (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 10 }}>
          <Icon name="starBig" color={stage.gold} size={16} />
          <Text style={{ flex: 1, fontFamily: FONT.medium, fontSize: 13.5, lineHeight: 19, color: "#f3d48e" }}>{answered === 1 ? t("c_countOne") : t("c_count", { n: answered })}</Text>
        </View>
      ) : null}
      <View style={{ gap: 12, marginTop: 14 }}>
        {saved.slice(0, 30).map((d) => {
          const on = !!d.answeredAt;
          return (
            <Animated.View key={d.id} entering={FadeInDown.duration(380)} style={{ borderRadius: 18, overflow: "hidden", borderWidth: 1, borderColor: on ? stage.gold : alpha(stage.gold, 0.3), shadowColor: "#f3c86a", shadowOpacity: on ? 0.5 : 0, shadowRadius: 16, shadowOffset: { width: 0, height: 0 } }}>
              <LinearGradient colors={on ? ["#2a3a1f", "#0b2a20"] : ["#0b2f24", "#061a14"]} style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }} />
              <View pointerEvents="none" style={{ position: "absolute", right: -10, top: 6, opacity: 0.25 }}>
                <Svg width={90} height={108} viewBox="0 0 300 360"><Path d={NICHE_PATH} stroke={stage.gold} strokeWidth={6} fill="none" /></Svg>
              </View>
              <Pressable onPress={() => onOpen(d)} accessibilityRole="button" accessibilityLabel={`${t(`d_${d.direction}`)}, ${fmtDate(d.at, lang)}`} style={{ padding: 16, gap: 6 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <Text allowFontScaling={false} style={{ fontFamily: ARABIC_FONT, fontSize: 22, color: stage.gold }}>{DIRECTION_AR[d.direction]}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: FONT.semibold, fontSize: 15, color: "#ffffff" }}>{t(`d_${d.direction}`)}{d.who !== "me" ? ` · ${t(`w_${d.who}`)}` : ""}</Text>
                    <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: stage.textMuted }}>{fmtDate(d.at, lang)}</Text>
                  </View>
                </View>
                <Text numberOfLines={3} style={{ fontFamily: FONT.regular, fontSize: 14.5, lineHeight: 22, color: "#f6ead0" }}>{d.personal}</Text>
                {on ? (
                  <View style={{ marginTop: 4, gap: 2 }}>
                    <Text style={{ fontFamily: FONT.semibold, fontSize: 12.5, color: "#f3d48e" }}>{t("c_answered")} · {fmtDate(d.answeredAt!, lang)}</Text>
                    {d.note ? <Text style={{ fontFamily: FONT.italic, fontSize: 13, lineHeight: 19, color: stage.textSoft }}>{d.note}</Text> : null}
                  </View>
                ) : null}
              </Pressable>
              {editing === d.id ? (
                <View style={{ paddingHorizontal: 16, paddingBottom: 16, gap: 10 }}>
                  <TextInput value={note} onChangeText={(v) => setNote(v.slice(0, 200))} placeholder={t("c_note")} placeholderTextColor="rgba(255,255,255,0.45)" multiline accessibilityLabel={t("c_note")}
                    style={{ minHeight: 64, borderRadius: R.md, borderWidth: 1, borderColor: alpha(stage.gold, 0.35), padding: 12, color: "#ffffff", fontFamily: FONT.regular, fontSize: 15, textAlignVertical: "top" }} />
                  <GoldButton compact title={t("c_saveNote")} onPress={() => { update(d.id, { answeredAt: d.answeredAt ?? Date.now(), note: note.trim() || undefined }); setEditing(null); success(); }} />
                </View>
              ) : (
                <View style={{ flexDirection: "row", gap: 16, paddingHorizontal: 16, paddingBottom: 14 }}>
                  <Text onPress={() => { if (on) update(d.id, { answeredAt: undefined, note: undefined }); else { setNote(""); setEditing(d.id); tick(); } }} accessibilityRole="button" style={{ fontFamily: FONT.semibold, fontSize: 13, color: stage.gold, paddingVertical: 6 }}>{on ? t("c_unmark") : t("c_mark")}</Text>
                  <Text onPress={() => remove(d.id)} accessibilityRole="button" style={{ fontFamily: FONT.medium, fontSize: 13, color: stage.textMuted, paddingVertical: 6 }}>{t("j_remove")}</Text>
                </View>
              )}
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
}

/** the occasion moment (when switched on and due), and the simple list of topics */
export function useMoment(prefs: MomentPrefs): Moment | null {
  const [m, setM] = useState<Moment | null>(null);
  useEffect(() => {
    const h = toHijri(todayUtc());
    setM(momentFor(prefs, Date.now(), new Date().getDay(), { m: h.m, d: h.d }));
  }, [prefs]);
  return m;
}
export function MomentCard({ m, t, prefs, onStart }: { m: Moment; t: T; prefs: MomentPrefs; onStart: (m: Moment) => void }) {
  useEffect(() => { writeJSON(DUA_MOMENTS_KEY, { ...prefs, lastShown: Date.now() }, true); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <Animated.View entering={FadeIn.duration(700)} style={{ borderRadius: 18, borderWidth: 1, borderColor: alpha(stage.gold, 0.5), backgroundColor: "rgba(6,30,23,0.78)", padding: 18, gap: 12, marginBottom: 24 }}>
      <Text style={{ fontFamily: FONT.semibold, fontSize: 16, lineHeight: 23, color: "#ffffff" }}>{t(`m_${m.id}`)}</Text>
      <View style={{ flexDirection: "row", gap: 10 }}>
        <GoldButton compact title={t("m_cta")} onPress={() => onStart(m)} />
        <OutlineButton compact onStage title={t("m_later")} onPress={() => writeJSON(DUA_MOMENTS_KEY, { ...prefs, dismissed: Date.now() }, true)} />
      </View>
    </Animated.View>
  );
}
export function MomentSettings({ t, prefs }: { t: T; prefs: MomentPrefs }) {
  const set = (p: Partial<MomentPrefs>) => { writeJSON(DUA_MOMENTS_KEY, { ...prefs, ...p }, true); tick(); };
  return (
    <View style={{ marginTop: 32, borderRadius: 16, borderWidth: 1, borderColor: alpha(stage.gold, 0.25), backgroundColor: "rgba(6,30,23,0.62)", padding: 16, gap: 10 }}>
      <Pressable onPress={() => set({ on: !prefs.on })} accessibilityRole="switch" accessibilityState={{ checked: prefs.on }} style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 15.5, color: "#ffffff" }}>{t("m_setTitle")}</Text>
          <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, lineHeight: 18, color: stage.textMuted, marginTop: 3 }}>{t("m_setLead")}</Text>
        </View>
        <View style={{ width: 46, height: 28, borderRadius: 14, padding: 3, backgroundColor: prefs.on ? stage.gold : "rgba(255,255,255,0.18)", alignItems: prefs.on ? "flex-end" : "flex-start" }}>
          <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: "#ffffff" }} />
        </View>
      </Pressable>
      {prefs.on ? (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {MOMENT_TOPICS.map((k) => {
            const on = prefs.topics.includes(k);
            return (
              <Pressable key={k} onPress={() => set({ topics: on ? prefs.topics.filter((x) => x !== k) : [...prefs.topics, k] })} accessibilityRole="checkbox" accessibilityState={{ checked: on }}
                style={{ paddingHorizontal: 13, height: 36, borderRadius: R.pill, borderWidth: 1, justifyContent: "center", borderColor: on ? stage.gold : alpha(stage.gold, 0.3), backgroundColor: on ? alpha(stage.gold, 0.16) : "transparent" }}>
                <Text style={{ fontFamily: FONT.semibold, fontSize: 13.5, color: "#ffffff" }}>{t(`a_${k}`)}</Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

/** the gift moment for a recipient who opened a dua link: the dua addressed to them, then the natural next step */
export function GiftMoment({ g, t, quranAr, onClose, onGive }: { g: GiftDua; t: T; quranAr: string | null; onClose: () => void; onGive: () => void }) {
  return (
    <Animated.View entering={FadeIn.duration(900)} style={{ alignItems: "center", gap: 14 }}>
      <Text allowFontScaling={false} style={{ fontFamily: CALLIG_FONT, fontSize: 58, lineHeight: 88, color: stage.gold, textShadowColor: "rgba(255,214,130,0.55)", textShadowRadius: 18 }}>هدية</Text>
      <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 28, lineHeight: 34, color: "#ffffff", textAlign: "center" }}>{t("g_title")}</Text>
      <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 22, color: stage.textSoft, textAlign: "center" }}>{t("g_from")}</Text>
      <View style={{ alignSelf: "stretch", borderRadius: 18, borderWidth: 1, borderColor: alpha(stage.gold, 0.45), backgroundColor: "rgba(6,30,23,0.78)", padding: 18, gap: 10 }}>
        {quranAr ? <Text style={{ fontFamily: ARABIC_FONT, fontSize: 20, lineHeight: 38, color: "#ffffff", textAlign: "center", writingDirection: "rtl" }} numberOfLines={4}>{quranAr}</Text> : null}
        {g.q ? <Text style={{ fontFamily: FONT.semibold, fontSize: 12, color: stage.gold, textAlign: "center" }}>{t("j_quranRef", { ref: g.q })}</Text> : null}
        <Text style={{ fontFamily: FONT.semibold, fontSize: 10.5, letterSpacing: 1.6, textTransform: "uppercase", color: stage.gold, textAlign: "center", marginTop: 6 }}>{t("j_personalAi")}</Text>
        <Text style={{ fontFamily: FONT.regular, fontSize: 16.5, lineHeight: 26, color: "#f6ead0", textAlign: "center" }}>{g.p}</Text>
        {g.a ? <Text style={{ fontFamily: ARABIC_FONT, fontSize: 19, lineHeight: 36, color: stage.cream, textAlign: "center", writingDirection: "rtl" }}>{g.a}</Text> : null}
        <Text style={{ fontFamily: FONT.regular, fontSize: 11.5, lineHeight: 17, color: stage.textMuted, textAlign: "center", marginTop: 4 }}>{t("j_disclosure")}</Text>
      </View>
      <GoldButton title={t("g_cta")} onPress={onGive} style={{ alignSelf: "stretch" }} />
      <OutlineButton onStage title={t("j_next")} onPress={onClose} style={{ alignSelf: "stretch" }} />
    </Animated.View>
  );
}

/** send the dua as a message to one of the person's conversations (text only; links are not allowed in messages) */
export function MessengerSheet({ visible, onClose, text, t }: { visible: boolean; onClose: () => void; text: string; t: T }) {
  const insets = useSafeAreaInsets();
  const [list, setList] = useState<Conversation[] | null>(null);
  const [sent, setSent] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  useEffect(() => { if (visible) { setSent(null); TL.conversations().then((d) => setList(d.conversations)).catch(() => setList([])); } }, [visible]);
  const send = async (c: Conversation) => {
    setBusy(c.id);
    try { await TL.send(c.id, text); setSent(c.id); success(); } catch { /* stays unsent */ }
    setBusy(null);
  };
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: "rgba(2,12,9,0.55)" }} onPress={onClose} accessibilityLabel={t("j_back")} />
      <View style={{ maxHeight: "70%", backgroundColor: "rgb(6,30,23)", borderTopLeftRadius: 26, borderTopRightRadius: 26, borderWidth: 1, borderColor: alpha(stage.gold, 0.35), paddingBottom: insets.bottom + 12 }}>
        <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 20, color: "#ffffff", padding: 20, paddingBottom: 8 }}>{t("g_pick")}</Text>
        {list === null ? <ActivityIndicator color={stage.gold} style={{ margin: 24 }} /> : list.length === 0 ? (
          <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: stage.textMuted, paddingHorizontal: 20, paddingBottom: 20 }}>{t("g_noConv")}</Text>
        ) : (
          <ScrollView contentContainerStyle={{ paddingHorizontal: 12 }}>
            {list.map((c) => (
              <Pressable key={c.id} onPress={() => void send(c)} disabled={!!busy || sent === c.id} accessibilityRole="button" style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: R.md, backgroundColor: pressed ? "rgba(255,255,255,0.06)" : "transparent" })}>
                <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: alpha(stage.gold, 0.18), alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ fontFamily: FONT.bold, fontSize: 15, color: stage.gold }}>{(c.name || c.username).slice(0, 1).toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: FONT.semibold, fontSize: 15, color: "#ffffff" }}>{c.name || c.username}</Text>
                  <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, color: stage.textMuted }}>@{c.username}</Text>
                </View>
                {busy === c.id ? <ActivityIndicator color={stage.gold} /> : sent === c.id ? <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: stage.gold }}>{t("g_sent")}</Text> : <Icon name="send" color={stage.gold} size={18} />}
              </Pressable>
            ))}
          </ScrollView>
        )}
      </View>
    </Modal>
  );
}
