import { useRef, useState } from "react";
import { Linking, Text, View } from "react-native";
import { Stack, router, type Href } from "expo-router";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FONT } from "@/lib/theme";
import { GlassIconButton, GoldButton } from "@/components/brand";
import { useMT } from "@/features/messenger/ui";

// /talents/scan – "QR scannen": reads the QR code of a profile (quranmasterclass.com/[lang/]talents/<username>) with
// the camera and opens the profile. Nothing is stored; the camera only runs while this screen is open.
const PROFILE = /^https?:\/\/(?:www\.)?quranmasterclass\.com\/(?:[a-z]{2}(?:-[A-Za-z]+)?\/)?(?:talents|u)\/([a-z0-9_.]{3,20})\/?(?:[?#].*)?$/i;

export default function ScanQr() {
  const mt = useMT();
  const insets = useSafeAreaInsets();
  const [perm, ask] = useCameraPermissions();
  const [note, setNote] = useState("");
  const done = useRef(false);
  const onCode = (data: string) => {
    if (done.current) return;
    const m = PROFILE.exec(data.trim());
    if (!m) { setNote(mt.scanWrong); return; }
    done.current = true;
    router.replace(`/talents/u/${m[1].toLowerCase()}` as Href);
  };
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={{ flex: 1, backgroundColor: "#000" }}>
        {perm?.granted ? (
          <CameraView style={{ flex: 1 }} facing="back" barcodeScannerSettings={{ barcodeTypes: ["qr"] }} onBarcodeScanned={(r) => onCode(r.data)} />
        ) : (
          <View style={{ flex: 1, justifyContent: "center", padding: 24, gap: 16 }}>
            <Text style={{ fontFamily: FONT.regular, fontSize: 16, lineHeight: 23, color: "#fff", textAlign: "center" }}>{perm && !perm.canAskAgain ? mt.cameraDenied : mt.scanHint}</Text>
            {perm?.canAskAgain !== false ? <GoldButton title={mt.scanQr} icon="eye" onPress={() => void ask()} /> : <GoldButton title={mt.openSettings} onPress={() => void Linking.openSettings()} />}
          </View>
        )}
        <View style={{ position: "absolute", top: insets.top + 8, left: 16 }}>
          <GlassIconButton size={44} icon="close" label={mt.close} onPress={() => router.back()} />
        </View>
        <View style={{ position: "absolute", left: 16, right: 16, bottom: insets.bottom + 24, padding: 14, borderRadius: 16, backgroundColor: "rgba(0,0,0,0.55)" }}>
          <Text accessibilityLiveRegion="polite" style={{ fontFamily: FONT.semibold, fontSize: 14.5, color: "#fff", textAlign: "center" }}>{note || mt.scanHint}</Text>
        </View>
      </View>
    </>
  );
}
