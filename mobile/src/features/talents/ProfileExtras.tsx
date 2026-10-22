import { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, Share, Text, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import { router, type Href } from "expo-router";
import * as Haptics from "expo-haptics";
import { FONT, R, goldButton, stage, useTheme } from "@/lib/theme";
import { GoldButton, OutlineButton } from "@/components/brand";
import { Icon, type IconName } from "@/components/icons";
import { QrCode } from "@/features/exam/ExamUI";
import { LinearGradient } from "expo-linear-gradient";
import { ShareSheet as ImageShareSheet } from "@/features/feed/share";
import { CARD_SIZE, PALETTES, type ShareFormat, type ShareOpts } from "@/features/share/formats";
import { useLang } from "@/i18n";
import { T, type TalentCard, type TalentProfile } from "./api";
import { BadgeButton, BadgeMark as BadgeMarkStatic } from "./badges";
import { TalentAvatar, useTalentErr } from "./ui";
import { usePT, type PKey } from "./profileText";
import { useTT } from "./text";
import { maOf } from "./MomentPosts";
import type { Moment } from "@/features/sijill/api";
import { ChatShareButton } from "@/features/messenger/ui";

// Social parts of the talent profile around the header (owner, build 20: "real social media", content = achievements):
// achievement highlights (Instagram highlights, built automatically from the member's moments, grouped by kind),
// "Followed by X and 3 others", suggested profiles, the profile completeness meter (own profile) and the share sheet
// with the profile link and its QR code under the gold wordmark.

const HL_ORDER: Moment["kind"][] = ["certificate", "juz", "tree", "exam", "level", "hifz", "streak", "course", "sticker"];
const HL_ICON: Record<Moment["kind"], IconName> = {
  certificate: "starBig", exam: "checkCircle", level: "trophy", hifz: "trophy", juz: "book", tree: "sun", sticker: "grid", streak: "flame", course: "cap",
};

/** highlight circles: one per kind of achievement the member shows; tap opens the full-screen feed of that kind.
 * `onNew` (own profile, Instagram): a dashed "New" circle first, shown even before there are two kinds */
export function Highlights({ moments, onOpen, onNew, inset = 2 }: { moments: Moment[]; onOpen: (ids: string[]) => void; onNew?: () => void; inset?: number }) {
  const t = useTheme();
  const pt = usePT();
  const tt = useTT();
  const groups = HL_ORDER.map((k) => ({ k, list: moments.filter((m) => m.kind === k) })).filter((g) => g.list.length);
  if (groups.length < 2 && !onNew) return null;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 14, paddingVertical: 2, paddingHorizontal: inset }}>
      {onNew ? (
        <Pressable onPress={onNew} accessibilityRole="button" accessibilityLabel={tt("newHighlight")} style={({ pressed }) => ({ alignItems: "center", gap: 5, width: 72, opacity: pressed ? 0.7 : 1 })}>
          <View style={{ width: 66, height: 66, borderRadius: 33, borderWidth: 1.5, borderColor: t.line, alignItems: "center", justifyContent: "center" }}>
            <Icon name="plus" color={t.ink} size={26} weight={1.8} />
          </View>
          <Text numberOfLines={1} style={{ fontFamily: FONT.semibold, fontSize: 12, color: t.ink }}>{tt("newHighlight")}</Text>
        </Pressable>
      ) : null}
      {groups.map(({ k, list }) => {
        const label = pt(`hl_${k}` as PKey);
        const ma = list.reduce((a, m) => a + maOf(m), 0);
        return (
          <Pressable key={k} onPress={() => onOpen(list.map((m) => m.id))} accessibilityRole="button" accessibilityLabel={`${label}, ${list.length}, ${pt("maCount", { n: ma })}`}
            style={({ pressed }) => ({ alignItems: "center", gap: 5, width: 72, opacity: pressed ? 0.7 : 1 })}>
            <View style={{ width: 66, height: 66, borderRadius: 33, padding: 2.5, borderWidth: 1.5, borderColor: goldButton.line }}>
              <View style={{ flex: 1, borderRadius: 30, backgroundColor: stage.bg, alignItems: "center", justifyContent: "center" }}>
                <Icon name={HL_ICON[k]} color={goldButton.from} size={24} />
              </View>
              <View style={{ position: "absolute", right: -4, bottom: -2, minWidth: 22, height: 22, paddingHorizontal: 5, borderRadius: 11, backgroundColor: goldButton.to, borderWidth: 2, borderColor: t.bg, alignItems: "center", justifyContent: "center" }}>
                <Text allowFontScaling={false} style={{ fontFamily: FONT.bold, fontSize: 11, color: goldButton.text }}>{list.length}</Text>
              </View>
            </View>
            <Text numberOfLines={1} style={{ fontFamily: FONT.semibold, fontSize: 12, color: t.ink }}>{label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

/** "Followed by X, Y and 3 others" with stacked avatars; tap opens the followers list */
export function FollowedBy({ p }: { p: TalentProfile }) {
  const t = useTheme();
  const pt = usePT();
  const f = p.followedBy;
  if (!f || !f.users.length || p.mine) return null;
  const [a, b] = f.users;
  const rest = f.total - 2;
  const text = !b ? pt("followedBy1", { a: a.name }) : rest > 0 ? pt("followedByMore", { a: a.name, b: b.name, n: rest }) : pt("followedBy2", { a: a.name, b: b.name });
  return (
    <Pressable onPress={p.restricted ? undefined : () => router.push(`/talents/list?u=${p.username}&kind=followers` as Href)} accessibilityRole={p.restricted ? "text" : "button"}
      style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 32 }}>
      <View style={{ flexDirection: "row" }}>
        {f.users.slice(0, 3).map((u, i) => (
          <View key={u.username} style={{ marginLeft: i ? -8 : 0, borderRadius: 12, borderWidth: 1.5, borderColor: t.bg }}>
            <TalentAvatar name={u.name} size={22} uri={u.avatar} />
          </View>
        ))}
      </View>
      <Text numberOfLines={2} style={{ flexShrink: 1, fontFamily: FONT.regular, fontSize: 13, color: t.muted }}>{text}</Text>
    </Pressable>
  );
}

/** horizontal rail of suggested profiles with a follow button on each card; `seeAll` (TikTok profile arrow) adds
 * "See all" to Discover talents and keeps the header even when there are no suggestions */
export function Suggested({ exclude, seeAll, inset = 0 }: { exclude?: string; seeAll?: boolean; inset?: number }) {
  const t = useTheme();
  const tt = useTT();
  const pt = usePT();
  const err = useTalentErr();
  const [list, setList] = useState<TalentCard[] | null>(null);
  const [msg, setMsg] = useState("");
  useEffect(() => { T.suggested().then((d) => setList(d.talents.filter((x) => x.username !== exclude))).catch(() => setList([])); }, [exclude]);
  if (!list?.length && !seeAll) return null;
  // optimistic with a light haptic tap; a failed call puts the card back. Followed and requested stay apart (a pending
  // request to a private account reads "Requested"; tapping it again withdraws the request)
  const follow = async (c: TalentCard) => {
    setMsg("");
    const mark = (followed: boolean, requested: boolean) => setList((l) => l?.map((x) => (x.username === c.username ? { ...x, followed, requested } : x)) ?? null);
    const on = !c.followed && !c.requested;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    mark(on && !c.private, on && !!c.private);
    try { const d = await T.follow(c.username, on); mark(d.followed, !!d.requested && !d.followed); }
    catch (e) { mark(!!c.followed, !!c.requested); setMsg(err(e)); }
  };
  return (
    <View style={{ gap: 8 }}>
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: inset }}>
        <Text accessibilityRole="header" style={{ flex: 1, fontFamily: FONT.bold, fontSize: 15, color: t.ink }}>{seeAll ? pt("suggestedAccounts") : pt("suggested")}</Text>
        {seeAll ? (
          <Pressable onPress={() => router.push("/talents" as Href)} accessibilityRole="link" accessibilityLabel={`${pt("seeAll")}, ${tt("discoverTitle")}`} hitSlop={8} style={{ minHeight: 36, justifyContent: "center" }}>
            <Text style={{ fontFamily: FONT.bold, fontSize: 14, color: t.gold }}>{pt("seeAll")}</Text>
          </Pressable>
        ) : null}
      </View>
      {!list ? null : !list.length ? (
        <Pressable onPress={() => router.push("/talents" as Href)} accessibilityRole="link" style={{ marginHorizontal: inset, minHeight: 48, flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Icon name="search" color={t.muted} size={18} />
          <Text style={{ flex: 1, fontFamily: FONT.semibold, fontSize: 14, color: t.ink }}>{tt("discoverTitle")}</Text>
          <Icon name="chevronRight" color={t.muted} size={16} />
        </Pressable>
      ) : (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingVertical: 2, paddingHorizontal: inset }}>
        {list.map((c) => { const done = !!(c.followed || c.requested); return (
          <View key={c.username} style={{ width: 148, borderRadius: R.lg, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface, padding: 12, alignItems: "center", gap: 6 }}>
            <Pressable onPress={() => router.push(`/talents/u/${c.username}` as Href)} accessibilityRole="link" accessibilityLabel={`${c.name}, @${c.username}`} style={{ alignItems: "center", gap: 5 }}>
              <TalentAvatar name={c.name} size={64} uri={c.avatar} badge={c.badge} />
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4, maxWidth: 124 }}>
                <Text numberOfLines={1} style={{ flexShrink: 1, fontFamily: FONT.bold, fontSize: 13.5, color: t.ink }}>{c.name}</Text>
                <BadgeButton badge={c.badge ?? null} size={13} />
              </View>
              <Text numberOfLines={1} style={{ fontFamily: FONT.regular, fontSize: 12, color: t.muted, writingDirection: "ltr" }}>@{c.username}</Text>
            </Pressable>
            <Pressable onPress={() => void follow(c)} accessibilityRole="button" accessibilityState={{ selected: done }}
              style={({ pressed }) => ({ alignSelf: "stretch", minHeight: 34, borderRadius: R.md, alignItems: "center", justifyContent: "center", opacity: pressed ? 0.7 : 1,
                backgroundColor: done ? t.surface : goldButton.to, borderWidth: 1, borderColor: done ? t.line : goldButton.line })}>
              <Text style={{ fontFamily: FONT.bold, fontSize: 13, color: done ? t.ink : goldButton.text }}>{c.followed ? tt("followingBtn") : c.requested ? tt("requested") : c.followsMe ? pt("followBack") : tt("follow")}</Text>
            </Pressable>
          </View>
        ); })}
      </ScrollView>
      )}
      {msg ? <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: t.muted, paddingHorizontal: inset }}>{msg}</Text> : null}
    </View>
  );
}

/** own profile: how complete it is, and the next step (hidden at 100 %) */
export function Completeness({ p, onPhoto }: { p: TalentProfile; onPhoto: () => void }) {
  const t = useTheme();
  const pt = usePT();
  const items: [PKey, boolean, () => void][] = [
    ["complete_photo", !!p.avatar, onPhoto],
    ["complete_bio", !!p.bio?.trim(), () => router.push("/community/me" as Href)],
    ["complete_country", !!p.country, () => router.push("/community/me" as Href)],
    ["complete_rewaya", !!p.rewaya?.trim(), () => router.push("/community/me" as Href)],
    ["complete_badge", !!p.badge, () => router.push("/talents/badges" as Href)],
    ["complete_sijill", (p.momentCount ?? 0) > 0, () => router.push("/talents/sijill" as Href)],
    ["complete_follow", p.following > 0, () => router.push("/talents" as Href)],
  ];
  const done = items.filter((x) => x[1]).length;
  if (done === items.length) return null;
  const pct = Math.round((done / items.length) * 100);
  const next = items.find((x) => !x[1])!;
  return (
    <Pressable onPress={next[2]} accessibilityRole="button" accessibilityLabel={`${pt("completeTitle", { n: pct })}. ${pt("completeNext")}: ${pt(next[0])}`}
      style={({ pressed }) => ({ borderRadius: R.lg, borderWidth: 1, borderColor: goldButton.line, backgroundColor: t.surface, padding: 14, gap: 8, opacity: pressed ? 0.8 : 1 })}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Text style={{ flex: 1, fontFamily: FONT.bold, fontSize: 14.5, color: t.ink }}>{pt("completeTitle", { n: pct })}</Text>
        <Text style={{ fontFamily: FONT.bold, fontSize: 13, color: t.gold }}>{done}/{items.length}</Text>
      </View>
      <View style={{ height: 6, borderRadius: 3, backgroundColor: t.line, overflow: "hidden" }}>
        <View style={{ width: `${pct}%`, height: 6, borderRadius: 3, backgroundColor: goldButton.to }} />
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
        <Text style={{ flex: 1, fontFamily: FONT.semibold, fontSize: 13.5, color: t.muted }}>{`${pt("completeNext")}: ${pt(next[0])}`}</Text>
        <Icon name="chevronRight" color={t.muted} size={16} />
      </View>
    </Pressable>
  );
}

/** share sheet: gold wordmark, avatar, name with badge, @username, QR code of the public profile link */
export function ShareSheet({ p, visible, onClose }: { p: TalentProfile; visible: boolean; onClose: () => void }) {
  const t = useTheme();
  const pt = usePT();
  const [copied, setCopied] = useState(false);
  const [image, setImage] = useState(false);
  const url = p.shareUrl ?? "";
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <ScrollView style={{ flex: 1, backgroundColor: t.bg }} contentContainerStyle={{ padding: 20, gap: 18 }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text accessibilityRole="header" style={{ flex: 1, fontFamily: FONT.display, fontSize: 20, color: t.ink }}>{pt("shareTitle")}</Text>
          <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel={pt("close")} hitSlop={10} style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center" }}>
            <Icon name="close" color={t.muted} size={20} />
          </Pressable>
        </View>
        <View style={{ borderRadius: 20, backgroundColor: stage.bg, borderWidth: 1, borderColor: goldButton.line, padding: 24, alignItems: "center", gap: 10 }}>
          <Text style={{ fontFamily: FONT.display, fontSize: 20, letterSpacing: 0.4, color: stage.gold }}>Quran Masterclass</Text>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 13, letterSpacing: 0.6, color: stage.cream, marginTop: -6 }}>Talents</Text>
          <View style={{ marginTop: 8 }}><TalentAvatar name={p.name} size={72} uri={p.avatar} badge={p.badge} /></View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Text numberOfLines={1} style={{ flexShrink: 1, fontFamily: FONT.display, fontSize: 19, color: stage.text }}>{p.name}</Text>
            <BadgeButton badge={p.badge ?? null} size={18} />
          </View>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 14.5, color: stage.textSoft, writingDirection: "ltr" }}>@{p.username}</Text>
          {p.shareQr?.length ? (
            <View accessible accessibilityLabel={`${pt("qrCode")}: ${url}`} style={{ marginTop: 8, padding: 10, borderRadius: 14, backgroundColor: "#fff", borderWidth: 2, borderColor: goldButton.from }}>
              <QrCode rows={p.shareQr} size={196} color={stage.bg} />
            </View>
          ) : null}
          <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, color: stage.textMuted, textAlign: "center" }}>{pt("scanHint")}</Text>
        </View>
        <GoldButton title={pt("share")} icon="share" onPress={() => void Share.share({ message: `${p.name} (@${p.username}) · Quran Masterclass Talents\n${url}` }).catch(() => undefined)} />
        {/* the profile card as an image: story 9:16 (1080 × 1920), portrait 4:5 and square 1:1 (1080 × 1080) */}
        <OutlineButton title={pt("shareImage")} icon="send" onPress={() => setImage(true)} />
        <ChatShareButton card={{ type: "profile", ref: p.username, title: `${p.name} (@${p.username})`, subtitle: "", url: `/talents/u/${p.username}` }} />
        <OutlineButton title={copied ? pt("copied") : pt("copyLink")} icon="copy" onPress={() => void Clipboard.setStringAsync(url).then(() => setCopied(true)).catch(() => undefined)} />
        <Text selectable style={{ fontFamily: FONT.regular, fontSize: 12.5, color: t.muted, textAlign: "center", writingDirection: "ltr" }}>{url}</Text>
      </ScrollView>
      <ImageShareSheet visible={image} onClose={() => setImage(false)} link={url} message={`${p.name} (@${p.username}) · Quran Masterclass Talents`} templated noDecoration seed={p.username}
        renderCard={(f, o) => <ProfileShareCard p={p} format={f} opts={o} />} />
    </Modal>
  );
}

/** the shareable profile card at CARD_SIZE[format]: gold wordmark, avatar, name with badge, @username, the counters
 * and the QR code of the public profile, on the chosen design's ground */
export function ProfileShareCard({ p, format, opts }: { p: TalentProfile; format: ShareFormat; opts: ShareOpts }) {
  const pt = usePT();
  const tt = useTT();
  const { lang } = useLang();
  const pal = PALETTES[opts.palette] ?? PALETTES.night;
  const { w, h } = CARD_SIZE[format];
  const story = format === "story", square = format === "square";
  const qr = story ? 170 : square ? 92 : 120;
  const av = story ? 96 : square ? 56 : 72;
  const nf = (n: number) => { try { return Intl.NumberFormat(lang, { notation: n >= 10000 ? "compact" : "standard", maximumFractionDigits: 1 }).format(n); } catch { return String(n); } };
  const stat = (n: number, label: string) => (
    <View style={{ alignItems: "center", minWidth: 70 }}>
      <Text allowFontScaling={false} style={{ fontFamily: FONT.bold, fontSize: square ? 15 : 18, color: pal.ink }}>{nf(n)}</Text>
      <Text allowFontScaling={false} numberOfLines={1} style={{ fontFamily: FONT.medium, fontSize: square ? 10 : 11.5, color: pal.muted }}>{label}</Text>
    </View>
  );
  return (
    <LinearGradient colors={pal.bg as [string, string, ...string[]]} style={{ width: w, height: h, alignItems: "center", justifyContent: "center", paddingHorizontal: 26, gap: story ? 12 : square ? 5 : 8 }}>
      <View pointerEvents="none" style={{ position: "absolute", top: 12, left: 12, right: 12, bottom: 12, borderRadius: 18, borderWidth: 1, borderColor: pal.line, opacity: 0.7 }} />
      <Text allowFontScaling={false} style={{ fontFamily: FONT.display, fontSize: story ? 24 : square ? 16 : 19, letterSpacing: 0.4, color: pal.wordmark === "gold" ? "#D6B46C" : pal.accent }}>Quran Masterclass</Text>
      <Text allowFontScaling={false} style={{ fontFamily: FONT.semibold, fontSize: square ? 10.5 : 12.5, letterSpacing: 1.2, color: pal.soft, marginTop: story ? -8 : -4 }}>Talents</Text>
      <View style={{ marginTop: story ? 10 : 2 }}><TalentAvatar name={p.name} size={av} uri={p.avatar} badge={p.badge} /></View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6, maxWidth: w - 60 }}>
        <Text allowFontScaling={false} numberOfLines={1} style={{ flexShrink: 1, fontFamily: FONT.display, fontSize: story ? 22 : square ? 15 : 18, color: pal.ink }}>{p.name}</Text>
        {p.badge ? <BadgeMarkStatic badge={p.badge} size={story ? 20 : 15} /> : null}
      </View>
      <Text allowFontScaling={false} style={{ fontFamily: FONT.semibold, fontSize: square ? 11.5 : 14, color: pal.soft, writingDirection: "ltr", marginTop: -2 }}>@{p.username}</Text>
      <View style={{ flexDirection: "row", gap: 6, marginTop: story ? 6 : 2 }}>
        {stat(p.following, tt("following"))}{stat(p.followers, tt("followers"))}{stat(p.mashaallahTotal ?? 0, pt("statMashaAllah"))}
      </View>
      {p.shareQr?.length ? (
        <View style={{ marginTop: story ? 14 : 4, padding: square ? 6 : 9, borderRadius: 12, backgroundColor: "#fff", borderWidth: 2, borderColor: "#D6B46C" }}>
          <QrCode rows={p.shareQr} size={qr} color={stage.bg} />
        </View>
      ) : null}
      <Text allowFontScaling={false} style={{ fontFamily: FONT.regular, fontSize: square ? 9.5 : 11.5, color: pal.muted, textAlign: "center" }}>{pt("scanHint")}</Text>
    </LinearGradient>
  );
}
