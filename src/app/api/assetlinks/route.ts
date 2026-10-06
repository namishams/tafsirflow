import { json } from "@/lib/http";

export const dynamic = "force-dynamic";

// Digital Asset Links (served as /.well-known/assetlinks.json, see next.config.mjs): tells Android that the app
// com.quranmasterclass.app belongs to this domain, so it opens the site full screen without a browser bar.
// ANDROID_SHA256 (comma-separated certificate fingerprints) is written by scripts/build-android.sh.
export function GET() {
  const fps = (process.env.ANDROID_SHA256 ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  return json(fps.length ? [{ relation: ["delegate_permission/common.handle_all_urls"], target: { namespace: "android_app", package_name: process.env.ANDROID_PACKAGE || "com.quranmasterclass.app", sha256_cert_fingerprints: fps } }] : []);
}
