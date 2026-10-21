import { useLocalSearchParams } from "expo-router";
import { CertificateScreen } from "@/features/srs/Tests";

export default function CertificateRoute() {
  const { juz } = useLocalSearchParams<{ juz?: string }>();
  return <CertificateScreen juz={Number(juz) || 0} />;
}
