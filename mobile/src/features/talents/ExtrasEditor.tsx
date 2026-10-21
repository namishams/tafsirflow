import { useState } from "react";
import { Pressable, Switch, Text, View } from "react-native";
import { FONT, R, goldButton, useTheme } from "@/lib/theme";
import { Chip, Segmented } from "@/components/brand";
import { LabeledField } from "@/components/form";
import { Icon } from "@/components/icons";
import { useLang } from "@/i18n";
import type { Audience, OwnExtras, TalentProfile } from "./api";
import { BadgeButton } from "./badges";
import { TalentAvatar } from "./ui";
import { usePT } from "./profileText";
import { GOALS_V2, placeCityName, useGoalLabels } from "./travel";
import { TravelBadge } from "./TravelCard";

// Edit profile additions (owner, 21.10.2026; app and website 1:1): learning goals (multi-select from the onboarding
// goals), a coarse city or region (typed, or the city of the prayer-time place, never coordinates), travel mode with
// a destination, and for each who sees it (everyone, followers, only me). Plus the live preview of the profile header.

export const EMPTY_EXTRAS: OwnExtras = { goals: [], city: "", travel: { on: false, city: "" }, privacy: { goals: "everyone", city: "followers", travel: "followers" } };

function AudiencePicker({ value, onChange }: { value: Audience; onChange: (v: Audience) => void }) {
  const t = useTheme();
  const pt = usePT();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
      <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.muted }}>{pt("visibleTo")}</Text>
      <Segmented<Audience> value={value} onChange={onChange} options={[["everyone", pt("vis_everyone")], ["followers", pt("vis_followers")], ["me", pt("vis_me")]]} />
    </View>
  );
}

export function ExtrasEditor({ value, onChange }: { value: OwnExtras; onChange: (v: OwnExtras) => void }) {
  const t = useTheme();
  const pt = usePT();
  const { lang } = useLang();
  const labels = useGoalLabels();
  const [locMsg, setLocMsg] = useState("");
  const set = (p: Partial<OwnExtras>) => onChange({ ...value, ...p });
  const priv = (k: keyof OwnExtras["privacy"]) => (a: Audience) => set({ privacy: { ...value.privacy, [k]: a } });
  const box = { gap: 10, padding: 14, borderRadius: R.lg, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface } as const;
  const head = (title: string, hint: string) => (
    <View style={{ gap: 2 }}>
      <Text accessibilityRole="header" style={{ fontFamily: FONT.bold, fontSize: 15.5, color: t.ink }}>{title}</Text>
      <Text style={{ fontFamily: FONT.regular, fontSize: 13, lineHeight: 18, color: t.muted }}>{hint}</Text>
    </View>
  );
  const useLocation = async () => {
    setLocMsg(pt("cityLocating"));
    const c = await placeCityName(lang);
    if (c) { set({ city: c }); setLocMsg(""); } else setLocMsg(pt("cityNotFound"));
  };
  return (
    <View style={{ gap: 14 }}>
      <View style={box}>
        {head(pt("goalsTitle"), pt("goalsHint"))}
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {GOALS_V2.map((g) => {
            const on = value.goals.includes(g);
            return <Chip key={g} label={labels[g]} selected={on} onPress={() => set({ goals: on ? value.goals.filter((x) => x !== g) : [...value.goals, g] })} />;
          })}
        </View>
        <AudiencePicker value={value.privacy.goals} onChange={priv("goals")} />
      </View>

      <View style={box}>
        {head(pt("cityTitle"), pt("cityHint"))}
        <LabeledField label={pt("cityTitle")} value={value.city} onChangeText={(c) => set({ city: c.replace(/[0-9]/g, "").slice(0, 60) })} maxLength={60} autoCorrect={false} />
        <Pressable onPress={() => void useLocation()} accessibilityRole="button" style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", minHeight: 40, opacity: pressed ? 0.6 : 1 })}>
          <Icon name="map" color={t.accent} size={16} />
          <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.accent }}>{pt("cityUseLocation")}</Text>
        </Pressable>
        {locMsg ? <Text accessibilityLiveRegion="polite" style={{ fontFamily: FONT.regular, fontSize: 13, color: t.muted }}>{locMsg}</Text> : null}
        <AudiencePicker value={value.privacy.city} onChange={priv("city")} />
      </View>

      <View style={box}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View style={{ flex: 1 }}>{head(pt("travelTitle"), pt("travelHint"))}</View>
          <Switch value={value.travel.on} onValueChange={(on) => set({ travel: { ...value.travel, on } })} trackColor={{ true: t.accent }} accessibilityLabel={pt("travelTitle")} />
        </View>
        {value.travel.on ? <LabeledField label={pt("destination")} value={value.travel.city} onChangeText={(c) => set({ travel: { ...value.travel, city: c.replace(/[0-9]/g, "").slice(0, 60) } })} maxLength={60} autoCorrect={false} /> : null}
        <AudiencePicker value={value.privacy.travel} onChange={priv("travel")} />
      </View>
    </View>
  );
}

/** the profile header as others will see it, updated while typing (Edit profile) */
export function ProfilePreview({ name, username, bio, avatar, badge, facts, extras }: {
  name: string; username: string; bio: string; avatar: string | null; badge?: TalentProfile["badge"]; facts: string; extras: OwnExtras;
}) {
  const t = useTheme();
  const pt = usePT();
  const labels = useGoalLabels();
  return (
    <View accessibilityLabel={pt("previewTitle")} style={{ borderRadius: R.card, borderWidth: 1, borderColor: goldButton.line, backgroundColor: t.dark ? t.bg : t.surface, padding: 16, gap: 6, alignItems: "center" }}>
      <Text style={{ alignSelf: "flex-start", fontFamily: FONT.semibold, fontSize: 11.5, letterSpacing: 1.2, color: t.gold }}>{pt("previewTitle")}</Text>
      <TalentAvatar name={name || username || "?"} size={64} uri={avatar} badge={badge} />
      <View style={{ flexDirection: "row", alignItems: "center", gap: 5, maxWidth: "100%" }}>
        <Text numberOfLines={1} style={{ flexShrink: 1, fontFamily: FONT.bold, fontSize: 16, color: t.ink, writingDirection: "ltr" }}>{username ? `@${username}` : name}</Text>
        <BadgeButton badge={badge ?? null} size={15} />
      </View>
      {name && username ? <Text numberOfLines={1} style={{ fontFamily: FONT.medium, fontSize: 13.5, color: t.muted }}>{name}</Text> : null}
      {facts ? <Text style={{ fontFamily: FONT.semibold, fontSize: 13.5, color: t.ink, textAlign: "center" }}>{facts}</Text> : null}
      {bio ? <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 20, color: t.ink, textAlign: "center" }}>{bio}</Text> : null}
      <ExtrasChips goals={extras.goals} city={extras.city} travel={extras.travel} labels={labels} />
    </View>
  );
}

/** goals as chips, the city and the travel badge (profile header and preview) */
export function ExtrasChips({ goals, city, travel, labels }: { goals?: string[]; city?: string; travel?: { on: boolean; city: string }; labels: Record<string, string> }) {
  const t = useTheme();
  if (!goals?.length && !city && !travel?.on) return null;
  return (
    <View style={{ alignItems: "center", gap: 8, marginTop: 4, alignSelf: "stretch" }}>
      {city || travel?.on ? (
        <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center", alignItems: "center", gap: 8 }}>
          {city ? (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <Icon name="map" color={t.muted} size={13} />
              <Text numberOfLines={1} style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.muted }}>{city}</Text>
            </View>
          ) : null}
          {travel?.on ? <TravelBadge city={travel.city} /> : null}
        </View>
      ) : null}
      {goals?.length ? (
        <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 6 }}>
          {goals.map((g) => labels[g] ? (
            <View key={g} style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: R.pill, borderWidth: 1, borderColor: goldButton.line, backgroundColor: "rgba(201,166,94,0.08)" }}>
              <Text numberOfLines={1} style={{ fontFamily: FONT.semibold, fontSize: 12, color: t.ink }}>{labels[g]}</Text>
            </View>
          ) : null)}
        </View>
      ) : null}
    </View>
  );
}
