import type { ComponentType } from "react";
import { Image as RNImage, type ImageStyle, type StyleProp } from "react-native";
import { requireOptionalNativeModule } from "expo";

// Pictures loaded from the internet (feed articles, Explore tiles, lesson images): expo-image keeps them in a disk
// cache across starts, decodes them at the size they are shown and off the main thread. An app binary built before
// expo-image (an older development build) falls back to React Native's Image, so nothing breaks there.
// Local artwork (garden, brand marks) stays on React Native's Image: it is already bundled and must look identical.

type Props = {
  uri: string;
  style?: StyleProp<ImageStyle>;
  /** "cover" (default) or "contain", like resizeMode */
  fit?: "cover" | "contain";
  accessibilityLabel?: string;
  onLoad?: () => void;
  onError?: () => void;
};

type ExpoImageProps = Props & { source: { uri: string }; contentFit: "cover" | "contain"; cachePolicy: "disk"; transition: number; accessible?: boolean };
let ExpoImage: ComponentType<Omit<ExpoImageProps, "uri" | "fit">> | null | undefined;
function expoImage() {
  if (ExpoImage === undefined) {
    ExpoImage = null;
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      if (requireOptionalNativeModule("ExpoImage")) ExpoImage = (require("expo-image") as { Image: typeof ExpoImage }).Image ?? null;
    } catch { ExpoImage = null; }
  }
  return ExpoImage;
}

export function RemoteImage({ uri, style, fit = "cover", accessibilityLabel, onLoad, onError }: Props) {
  const Img = expoImage();
  if (Img) {
    return <Img source={{ uri }} style={style} contentFit={fit} cachePolicy="disk" transition={0} accessible={!!accessibilityLabel}
      accessibilityLabel={accessibilityLabel} onLoad={onLoad} onError={onError} />;
  }
  return <RNImage source={{ uri }} style={style} resizeMode={fit} accessibilityIgnoresInvertColors accessibilityLabel={accessibilityLabel} onLoad={onLoad} onError={onError} />;
}
