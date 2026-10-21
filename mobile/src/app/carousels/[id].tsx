import { Stack, useLocalSearchParams } from "expo-router";
import { CarouselDetailScreen } from "@/features/carousel/Screens";

// /carousels/<id> – one carousel with its slides, sharing and the slides as text (website: /[locale]/carousels/<id>)
export default function CarouselRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <CarouselDetailScreen id={String(id ?? "")} />
    </>
  );
}
