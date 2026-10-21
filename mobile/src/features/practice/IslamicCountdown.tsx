import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { HIJRI_MONTHS, calText, countdown, fmtGregorian, fmtHijri, monthLength, toHijri, todayUtc } from "@/web/hijri";
import { useLang } from "@/i18n";
import { FONT, R, useTheme } from "@/lib/theme";
import { useTradition } from "@/lib/tradition";

// Moon icon for the Hijri day of the month (the Hijri day is the age of the moon, give or take a day)
export function MoonPhase({ day, length, size = 44, lit, dark }: { day: number; length: number; size?: number; lit: string; dark: string }) {
  const f = Math.min(0.999, Math.max(0.001, (day - 0.5) / (length || 29.53)));
  const r = size / 2 - 2, c = size / 2;
  const rx = Math.abs(Math.cos(2 * Math.PI * f)) * r;
  const waxing = f < 0.5;
  const crescent = waxing ? f < 0.25 : f > 0.75;
  const outer = waxing ? 1 : 0;
  const inner = waxing ? (crescent ? 0 : 1) : crescent ? 1 : 0;
  const d = `M ${c} ${c - r} A ${r} ${r} 0 0 ${outer} ${c} ${c + r} A ${rx} ${r} 0 0 ${inner} ${c} ${c - r} Z`;
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Circle cx={c} cy={c} r={r} fill={dark} />
      <Path d={d} fill={lit} />
      <Circle cx={c} cy={c} r={r} fill="none" stroke={lit} strokeOpacity={0.5} strokeWidth={1} />
    </Svg>
  );
}

function Ring({ progress, size, color, track, children }: { progress: number; size: number; color: string; track: string; children: React.ReactNode }) {
  const sw = 5, r = (size - sw) / 2, len = 2 * Math.PI * r;
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} style={{ position: "absolute", transform: [{ rotate: "-90deg" }] }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={sw} fill="none" />
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={sw} fill="none" strokeLinecap="round" strokeDasharray={`${len * progress} ${len}`} />
      </Svg>
      {children}
    </View>
  );
}

const when = (n: number, t: (k: string, v?: Record<string, string | number>) => string) => (n === 0 ? t("todayCount") : n === 1 ? t("tomorrow") : t("inDays", { n }));

/** "Next: Ramadan in 23 days" with a moon, a progress ring and (full) the next five days. The event set follows the tradition. */
export function IslamicCountdown({ full = false, onPress }: { full?: boolean; onPress?: () => void }) {
  const th = useTheme();
  const { lang } = useLang();
  const { tradition } = useTradition();
  const { t, ev } = calText(lang);
  const [today] = useState(() => todayUtc());
  const cd = useMemo(() => countdown(tradition, today, 5), [tradition, today]);
  if (!cd) return null;
  const h = toHijri(today);
  const { e, o } = cd.next;
  const name = ev(e.id).name;
  const hijriDate = fmtHijri({ y: o.y, m: e.m, d: e.d }, lang);
  const greg = fmtGregorian(o.t, lang, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const label = `${t("cdNext")}: ${name}, ${when(cd.days, t)}, ${hijriDate}, ${greg}. ${t("cdApprox")}`;
  const head = (
    <View accessible accessibilityRole={onPress ? "button" : "summary"} accessibilityLabel={label} style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
      <Ring progress={cd.progress} size={84} color={th.gold} track={th.line}>
        <MoonPhase day={h.d} length={monthLength(h.y, h.m)} size={50} lit={th.gold} dark={th.accentSoft} />
      </Ring>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ fontFamily: FONT.semibold, fontSize: 11, letterSpacing: lang === "ar" ? 0 : 2, textTransform: "uppercase", color: th.muted }}>{t("cdNext")}</Text>
        <Text style={{ fontFamily: FONT.display, fontSize: 22, lineHeight: 28, color: th.ink, marginTop: 2 }}>{name}</Text>
        <Text style={{ fontFamily: FONT.bold, fontSize: 16, color: th.gold, marginTop: 2 }}>{when(cd.days, t)}</Text>
        <Text style={{ fontFamily: FONT.regular, fontSize: 13, lineHeight: 19, color: th.muted, marginTop: 2 }}>{hijriDate} · {greg}</Text>
      </View>
    </View>
  );
  return (
    <View style={{ borderRadius: R.card, borderWidth: 1, borderColor: "rgba(201,166,94,0.3)", backgroundColor: th.surface, padding: 18, gap: full ? 16 : 10 }}>
      {onPress ? <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}>{head}</Pressable> : head}
      {full ? (
        <View style={{ gap: 2 }}>
          {cd.list.map(({ e: x, o: ox }) => {
            const n = Math.round((ox.t - today) / 86_400_000);
            return (
              <View key={x.id} accessible accessibilityLabel={`${ev(x.id).name}, ${when(n, t)}, ${fmtGregorian(ox.t, lang, { day: "numeric", month: "long" })}`}
                style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, paddingVertical: 9, borderTopWidth: 1, borderTopColor: th.line }}>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text numberOfLines={2} style={{ fontFamily: FONT.semibold, fontSize: 14.5, color: th.ink }}>{ev(x.id).name}</Text>
                  <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, color: th.muted }}>{fmtGregorian(ox.t, lang, { day: "numeric", month: "long" })}</Text>
                </View>
                <Text style={{ fontFamily: FONT.bold, fontSize: 13, color: th.gold }}>{when(n, t)}</Text>
              </View>
            );
          })}
        </View>
      ) : null}
      <Text style={{ fontFamily: FONT.italic, fontSize: 12, lineHeight: 17, color: th.muted }}>{t("cdApprox")}</Text>
    </View>
  );
}
