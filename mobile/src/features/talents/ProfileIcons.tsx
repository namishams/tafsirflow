import Svg, { Circle, Path, Rect } from "react-native-svg";

// Outline icons of the profile screen that the shared set (components/icons.tsx, generated from the website) does not
// have: Instagram's create square, add person, more (three dots), TikTok's grid tab, the Sijill record and the badge
// rosette. Same 24 px grid and stroke as the shared icons.
export type ProfileIconName = "plusSquare" | "userPlus" | "dots" | "gridTab" | "record" | "rosette" | "userCheck" | "chart";

function shape(name: ProfileIconName) {
  switch (name) {
    case "plusSquare": return <><Rect x="3.5" y="3.5" width="17" height="17" rx="5" /><Path d="M12 8.2v7.6M8.2 12h7.6" /></>;
    case "userPlus": return <><Circle cx="9.5" cy="8.5" r="3.6" /><Path d="M3 19.5c.7-3.3 3.3-5 6.5-5s5.8 1.7 6.5 5" /><Path d="M18.5 7.5v6M15.5 10.5h6" /></>;
    case "userCheck": return <><Circle cx="9.5" cy="8.5" r="3.6" /><Path d="M3 19.5c.7-3.3 3.3-5 6.5-5s5.8 1.7 6.5 5" /><Path d="M15.8 10.6l1.8 1.8 3.4-3.6" /></>;
    case "dots": return <><Circle cx="5.5" cy="12" r="1.1" /><Circle cx="12" cy="12" r="1.1" /><Circle cx="18.5" cy="12" r="1.1" /></>;
    case "gridTab": return <><Rect x="3.5" y="3.5" width="17" height="17" rx="2.5" /><Path d="M9.2 3.5v17M14.8 3.5v17M3.5 9.2h17M3.5 14.8h17" /></>;
    case "record": return <><Path d="M6.5 3.5h8l4 4v13h-12z" /><Path d="M14.5 3.5v4h4" /><Path d="M9.5 12h6M9.5 15.5h6M9.5 8.5h2.5" /></>;
    case "chart": return <><Path d="M4 20h16" /><Path d="M6.5 16.5V11M11 16.5V6M15.5 16.5v-4M20 16.5V8.5" /></>;
    case "rosette": return <><Circle cx="12" cy="9.5" r="5.5" /><Path d="M8.6 13.8 7.6 20.5l4.4-2.4 4.4 2.4-1-6.7" /><Path d="M9.7 9.6l1.6 1.6 3-3.2" /></>;
  }
}

export function PIcon({ name, size = 24, color, weight = 1.7 }: { name: ProfileIconName; size?: number; color: string; weight?: number }) {
  const filledDots = name === "dots";
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={filledDots ? color : "none"} stroke={color} strokeWidth={filledDots ? 1.2 : weight} strokeLinecap="round" strokeLinejoin="round">
      {shape(name)}
    </Svg>
  );
}
