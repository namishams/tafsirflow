import { Stack } from "expo-router";
import { NotFoundView } from "@/features/extra/NotFound";

// Unknown address (old link, mistyped universal link): the website's 404 with a way home
export default function NotFound() {
  return (
    <>
      <Stack.Screen options={{ title: "" }} />
      <NotFoundView />
    </>
  );
}
