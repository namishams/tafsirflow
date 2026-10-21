import { Stack, useLocalSearchParams } from "expo-router";
import { CarouselGalleryScreen } from "@/features/carousel/Screens";

// /carousels – the gallery of the feed's carousels (website: app/[locale]/(app)/carousels); ?series= opens one series
export default function CarouselsRoute() {
  const { series } = useLocalSearchParams<{ series?: string }>();
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <CarouselGalleryScreen series={typeof series === "string" && /^[a-z0-9-]{2,60}$/.test(series) ? series : undefined} />
    </>
  );
}
