import { Redirect, type Href } from "expo-router";

// Website /blog redirects to the guides as well
export default function Blog() {
  return <Redirect href={"/guides" as Href} />;
}
