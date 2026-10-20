import { Redirect, type Href } from "expo-router";

// Website /premium: in the app, Pro lives in the Pro sheet (app/pro.tsx)
export default function Premium() {
  return <Redirect href={"/pro?f=general" as Href} />;
}
