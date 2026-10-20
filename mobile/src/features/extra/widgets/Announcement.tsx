import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { Icon } from "@/components/icons";
import { useLang } from "@/i18n";
import { useWebT } from "@/i18n/web";
import { useStored, writeJSON } from "@/lib/store";
import { FONT, stage } from "@/lib/theme";
import { GOLD, GoldHairline } from "../art";
import { useSiteConfig } from "../config";
import { openLink } from "../links";

/**
 * The owner's short notice from the admin dashboard (website Announcement.tsx): a stage bar with a gold hairline,
 * the text in the reader's language (English as fallback), an optional link, and a close button that hides this
 * notice until the owner writes a new one (tf:annClosed). No props; renders nothing without an announcement.
 * Place it at the very top of the Today tab (below the safe area).
 */
export function Announcement() {
  const { announcement: a } = useSiteConfig();
  const { lang } = useLang();
  const w = useWebT("nav");
  const closed = useStored<string>("tf:annClosed", "");
  const [hidden, setHidden] = useState(false);
  if (!a || hidden || closed === a.id) return null;
  const text = (lang === "de" ? a.de : a.en) || a.en || a.de;
  if (!text) return null;
  const close = () => { writeJSON("tf:annClosed", a.id, true); setHidden(true); };
  const body = <Text style={{ flex: 1, fontFamily: FONT.semibold, fontSize: 13, lineHeight: 18, color: stage.text }}>{text}</Text>;
  return (
    <View accessibilityRole="alert" style={{ backgroundColor: stage.bg }}>
      <GoldHairline strength={1} />
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 8 }}>
        <Svg width={16} height={16} viewBox="0 0 20 20"><Path d="M10 1.5l2.2 5.3 5.3 2.2-5.3 2.2L10 16.5l-2.2-5.3L2.5 9l5.3-2.2z" fill={GOLD} /></Svg>
        {a.href ? <Pressable onPress={() => openLink(a.href, lang)} accessibilityRole="link" style={{ flex: 1 }}>{body}</Pressable> : body}
        <Pressable onPress={close} accessibilityRole="button" accessibilityLabel={w("close")} hitSlop={10} style={{ width: 30, height: 30, alignItems: "center", justifyContent: "center" }}>
          <Icon name="close" size={16} color="rgba(255,255,255,0.7)" />
        </Pressable>
      </View>
    </View>
  );
}
