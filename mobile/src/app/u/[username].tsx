import { Redirect, useLocalSearchParams, type Href } from "expo-router";

// quranmasterclass://u/<username> – short profile link (QR codes, messages); opens /talents/u/<username>
export default function ShortProfileLink() {
  const { username } = useLocalSearchParams<{ username: string }>();
  const u = String(username ?? "").toLowerCase().replace(/^@/, "");
  return <Redirect href={(/^[a-z0-9_.]{3,20}$/.test(u) ? `/talents/u/${u}` : "/talents") as Href} />;
}
