import { Redirect, type Href } from "expo-router";

// Website /today is the app's Today tab (links and universal links keep working)
export default function Today() {
  return <Redirect href={"/" as Href} />;
}
