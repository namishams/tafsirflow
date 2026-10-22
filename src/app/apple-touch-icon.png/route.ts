import { readFile } from "node:fs/promises";
import { join } from "node:path";

// /apple-touch-icon.png: the address iOS, iMessage and crawlers try first, whatever the page's <link rel="apple-touch-icon">
// says (it was a 404); serves the same picture as /apple-icon.png (src/app/apple-icon.png), built once
export const dynamic = "force-static";

export async function GET() {
  const png = await readFile(join(process.cwd(), "src/app/apple-icon.png"));
  return new Response(new Uint8Array(png), { headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=86400" } });
}
