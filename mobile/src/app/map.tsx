import { Stack } from "expo-router";
import { MapScreen } from "@/features/progress/MapScreen";

// /map – same path as quranmasterclass.com/map (Koran-Landkarte)
export default function MapRoute() {
  return <><Stack.Screen options={{ headerShown: false }} /><MapScreen /></>;
}
