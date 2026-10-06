import { captchaEnabled, captchaSiteKeys } from "@/lib/captcha";
import { json } from "@/lib/http";

export const dynamic = "force-dynamic";

// public site keys for the browser (the secrets never leave the server)
export function GET() {
  const k = captchaSiteKeys();
  return json(captchaEnabled() ? k : { v3: "", v2: "" }, 200, { "cache-control": "public, max-age=300" });
}
