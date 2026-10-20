import { useEffect, useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { router, useGlobalSearchParams, type Href } from "expo-router";
import { ARABIC_FONT, FONT, R, stage } from "@/lib/theme";
import { Arcade, Display, Eyebrow, GoldButton, OutlineButton, SmallStar, Stage } from "@/components/brand";
import { Icon } from "@/components/icons";
import { useLang } from "@/i18n";
import { readJSON, writeJSON } from "@/lib/store";
import { readDaily, setDaily } from "@/lib/daily";
import { today } from "@/web/learning";
import { getVerseByKey, type SingleVerse } from "@/lib/quran";
import { verseOfDayKey } from "@/web/votd";

// The daily moment: once a day (never on the first day of use), a calm sheet asks "Have you remembered Allah today?"
// with verse 13:28 and offers a personal dua for one's concern. One tap closes it; it can also open from the reminder.
const KEY = "qmc.moment";
type Seen = { first: number; last: number };

const T = {
  de: {
    title: "Heute schon an Allah gedacht?", lead: "Nimm dir eine Minute: ein Vers, ein stilles Gedenken – und wenn du magst, eine persönliche Dua, geschrieben für dein Anliegen.",
    dua: "Persönliche Dua · 0,99 €", verse: "Vers des Tages öffnen", later: "Jetzt nicht",
    remind: "Jeden Tag daran erinnern", remindHint: "Eine Mitteilung am Morgen, auch mit Hinweisen auf persönliche Duas. Jederzeit im Konto abschaltbar.", reminded: "Erinnerung ist eingeschaltet",
  },
  en: {
    title: "Have you remembered Allah today?", lead: "Take one minute: a verse, a quiet remembrance – and if you like, a personal dua written for your concern.",
    dua: "Personal dua · 0,99 €", verse: "Open the verse of the day", later: "Not now",
    remind: "Remind me every day", remindHint: "A notification in the morning, including suggestions for personal duas. Turn it off any time in your account.", reminded: "Reminder is on",
  },
};

export function DailyMoment() {
  const { lang } = useLang();
  const params = useGlobalSearchParams<{ moment?: string }>();
  const [open, setOpen] = useState(false);
  const [reminder, setReminder] = useState(readDaily().on);
  const [verse, setVerse] = useState<SingleVerse | null>(null);
  const tx = T[lang];
  // 13:28 – "by the remembrance of Allah hearts are assured" – text and translation from the server
  useEffect(() => { if (open) getVerseByKey("13:28", lang).then(setVerse).catch(() => undefined); }, [open, lang]);

  useEffect(() => {
    const d = today();
    const seen = readJSON<Seen | null>(KEY, null);
    if (!seen) { writeJSON(KEY, { first: d, last: d }, true); return; } // not on the very first day
    if (params.moment === "1" || (seen.last < d && d > seen.first)) {
      const id = setTimeout(() => setOpen(true), 1200);
      writeJSON(KEY, { ...seen, last: d }, true);
      return () => clearTimeout(id);
    }
  }, [params.moment]);

  const close = () => setOpen(false);
  const go = (href: string) => { setOpen(false); setTimeout(() => router.push(href as Href), 250); };
  const remind = async () => { const ok = await setDaily({ ...readDaily(), on: true }, lang); setReminder(ok); };

  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={close}>
      <View style={{ flex: 1, backgroundColor: "rgba(4,20,15,0.55)", justifyContent: "center", padding: 18 }}>
        <Stage rounded={R.card + 6}>
          <View style={{ padding: 22 }}>
            <Pressable onPress={close} accessibilityRole="button" accessibilityLabel={tx.later} hitSlop={10} style={{ position: "absolute", right: 14, top: 14, zIndex: 2, width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.1)" }}>
              <Icon name="close" color="#fff" size={16} />
            </Pressable>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}><SmallStar size={11} color={stage.gold} /><Eyebrow onStage>Quran Masterclass</Eyebrow></View>
            <Display size="title1" onStage style={{ marginTop: 12, paddingRight: 30 }}>{tx.title}</Display>
            {verse ? (
              <>
                <Text style={{ fontFamily: ARABIC_FONT, fontSize: 22, lineHeight: 44, color: "rgb(233,207,153)", textAlign: "center", writingDirection: "rtl", marginTop: 14 }}>{verse.text_uthmani}</Text>
                <Text style={{ fontFamily: FONT.italic, fontSize: 14, lineHeight: 21, color: stage.textSoft, textAlign: "center" }}>{verse.translation} (13:28)</Text>
              </>
            ) : null}
            <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 23, color: stage.textSoft, marginTop: 14 }}>{tx.lead}</Text>
            <View style={{ gap: 10, marginTop: 18 }}>
              <GoldButton title={tx.dua} icon="hands" onPress={() => go("/dua-generator")} />
              <OutlineButton title={tx.verse} onStage onPress={() => { const [c, v] = verseOfDayKey().split(":"); go(`/quran/${c}?v=${v}`); }} />
            </View>
            {!reminder ? (
              <Pressable onPress={remind} accessibilityRole="button" style={{ marginTop: 16, flexDirection: "row", gap: 10, alignItems: "flex-start" }}>
                <Icon name="clock" color={stage.gold} size={18} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: FONT.semibold, fontSize: 14.5, color: stage.gold }}>{tx.remind}</Text>
                  <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, lineHeight: 18, color: stage.textMuted, marginTop: 2 }}>{tx.remindHint}</Text>
                </View>
              </Pressable>
            ) : <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, color: stage.textMuted, marginTop: 14 }}>{tx.reminded}</Text>}
          </View>
          <Arcade />
        </Stage>
      </View>
    </Modal>
  );
}
