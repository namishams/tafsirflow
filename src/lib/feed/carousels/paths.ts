// The website paths of the carousels for the sitemap (read once when the server starts; synchronous, server only).
import fs from "fs";
import path from "path";

export function carouselPaths(): string[] {
  const dir = path.join(process.cwd(), "src/lib/feed/carousels/data");
  const out = ["/carousels"];
  try {
    for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".json")).sort()) {
      try {
        const d = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")) as { items?: { id?: string }[] };
        for (const c of d.items ?? []) if (typeof c.id === "string" && /^[a-z0-9-]{3,80}$/.test(c.id)) out.push(`/carousels/${c.id}`);
      } catch { /* a broken file is skipped */ }
    }
  } catch { /* no data in this deployment */ }
  return out;
}
