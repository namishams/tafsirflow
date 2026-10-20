import { useRef, useState } from "react";
import { View, type LayoutChangeEvent, type GestureResponderEvent } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

// A quiet gold slider (the website's range input with accent-gold) for volume and the position in a verse.
// Drag or tap; VoiceOver / TalkBack can step it with the adjustable actions.
export function GoldSlider({ value, onChange, onDone, label, valueText, step = 0.05, track = "rgba(255,255,255,0.18)", height = 32 }: {
  value: number; onChange: (v: number) => void; onDone?: (v: number) => void; label: string; valueText?: string; step?: number; track?: string; height?: number;
}) {
  const [w, setW] = useState(0);
  const [drag, setDrag] = useState<number | null>(null);
  const left = useRef(0);
  const last = useRef<number | null>(null);
  const v = Math.max(0, Math.min(1, drag ?? value));
  const at = (e: GestureResponderEvent) => (w > 0 ? Math.max(0, Math.min(1, (e.nativeEvent.locationX ?? 0) / w)) : 0);
  const move = (e: GestureResponderEvent) => {
    if (w <= 0) return;
    const x = Math.max(0, Math.min(1, (e.nativeEvent.pageX - left.current) / w));
    last.current = x;
    setDrag(x);
    onChange(x);
  };
  return (
    <View
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(v * 100), text: valueText }}
      accessibilityActions={[{ name: "increment" }, { name: "decrement" }]}
      onAccessibilityAction={(e) => {
        const n = Math.max(0, Math.min(1, value + (e.nativeEvent.actionName === "increment" ? step : -step)));
        onChange(n); onDone?.(n);
      }}
      onLayout={(e: LayoutChangeEvent) => setW(e.nativeEvent.layout.width)}
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={() => true}
      onResponderTerminationRequest={() => false}
      onResponderGrant={(e) => {
        const x = at(e);
        left.current = e.nativeEvent.pageX - x * w;
        last.current = x;
        setDrag(x);
        onChange(x);
      }}
      onResponderMove={move}
      onResponderRelease={() => { const x = last.current; last.current = null; setDrag(null); if (x !== null) onDone?.(x); }}
      onResponderTerminate={() => setDrag(null)}
      hitSlop={{ top: 8, bottom: 8 }}
      style={{ height, justifyContent: "center", direction: "ltr" }}
    >
      <View style={{ height: 4, borderRadius: 2, backgroundColor: track, overflow: "hidden" }}>
        <LinearGradient colors={["#b98f45", "#f3e2b6"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ height: 4, width: `${v * 100}%` }} />
      </View>
      <View pointerEvents="none" style={{ position: "absolute", left: Math.max(0, v * w - 8), width: 16, height: 16, borderRadius: 8, backgroundColor: "#e6cd92", borderWidth: 1, borderColor: "rgba(255,255,255,0.6)" }} />
    </View>
  );
}
