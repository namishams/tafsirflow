import { Redirect, useLocalSearchParams, type Href } from "expo-router";
import { TestRunner, isTestKind } from "@/features/srs/Tests";

export default function TestRoute() {
  const { kind, ref } = useLocalSearchParams<{ kind: string; ref?: string }>();
  if (!isTestKind(kind)) return <Redirect href={"/tests" as Href} />;
  return <TestRunner key={`${kind}:${ref ?? ""}`} kind={kind} refId={String(ref ?? "")} />;
}
