// Verifies that a visitor who calls itself Googlebot, Bingbot, GPTBot … really is that crawler (owner 23.10.2026). Only for
// Node.js (src/middleware.ts runs on the Node runtime): operators publish address lists (OpenAI, Perplexity, Google, Bing,
// Apple) or support reverse DNS (Google, Bing, Apple, Yandex, Baidu: the host name of the address must end in the operator's
// domain AND resolve back to the same address). The result is cached; a lookup that fails (list or DNS unreachable) never
// shuts a real crawler out: the claim then counts as "claimed" and only the high ceiling for unverified crawlers applies.
import dns from "node:dns/promises";
import { BlockList, isIP } from "node:net";
import type { CrawlerKind } from "./botguard";

export type Verdict = "verified" | "claimed" | "fake";

const HOUR = 60 * 60_000;
const verdicts = new Map<string, { until: number; v: Verdict }>();
const lists = new Map<string, { until: number; block: BlockList }>();

/** "::ffff:1.2.3.4" is the IPv4 address 1.2.3.4 */
const plain = (ip: string) => ip.replace(/^::ffff:/i, "");

async function loadList(url: string): Promise<BlockList | null> {
  const now = Date.now(), hit = lists.get(url);
  if (hit && hit.until > now) return hit.block;
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(5000), headers: { accept: "application/json" } });
    if (!r.ok) throw new Error(String(r.status));
    const data = (await r.json()) as { prefixes?: { ipv4Prefix?: string; ipv6Prefix?: string }[] };
    const block = new BlockList();
    for (const p of data.prefixes ?? []) {
      const [net, bits] = (p.ipv4Prefix ?? p.ipv6Prefix ?? "").split("/");
      if (!net || !isIP(net)) continue;
      block.addSubnet(net, bits ? Number(bits) : isIP(net) === 4 ? 32 : 128, isIP(net) === 4 ? "ipv4" : "ipv6");
    }
    lists.set(url, { until: now + 24 * HOUR, block });
    return block;
  } catch (e) {
    console.warn("crawler list not loaded", url, (e as Error).message);
    // keep the old list when there is one; try again in ten minutes
    if (hit) { hit.until = now + 10 * 60_000; return hit.block; }
    return null;
  }
}

async function viaDns(ip: string, domain: RegExp): Promise<"yes" | "no" | "error"> {
  try {
    const names = (await dns.reverse(ip)).filter((n) => domain.test(n));
    for (const n of names) {
      const back = [...(await dns.resolve4(n).catch(() => [] as string[])), ...(await dns.resolve6(n).catch(() => [] as string[]))];
      if (back.some((a) => plain(a).toLowerCase() === ip.toLowerCase())) return "yes";
    }
    return "no";
  } catch (e) {
    const code = (e as { code?: string }).code;
    return code === "ENOTFOUND" || code === "ENODATA" ? "no" : "error";
  }
}

export async function verifyCrawler(kind: CrawlerKind, rawIp: string): Promise<Verdict> {
  if (!kind.lists && !kind.rdns) return "claimed"; // nothing published to check against (ClaudeBot)
  const ip = plain(rawIp), key = `${kind.name}|${ip}`, now = Date.now();
  const hit = verdicts.get(key);
  if (hit && hit.until > now) return hit.v;
  if (verdicts.size > 20_000) for (const [k, x] of verdicts) if (x.until < now) verdicts.delete(k);
  const fam = isIP(ip) === 6 ? "ipv6" : "ipv4";
  let unsure = false, v: Verdict = "fake";
  for (const url of kind.lists ?? []) {
    const block = await loadList(url);
    if (!block) unsure = true;
    else if (isIP(ip) && block.check(ip, fam)) { v = "verified"; break; }
  }
  if (v !== "verified" && kind.rdns && isIP(ip)) {
    const r = await viaDns(ip, kind.rdns);
    if (r === "yes") v = "verified"; else if (r === "error") unsure = true;
  }
  if (v !== "verified" && unsure) v = "claimed";
  verdicts.set(key, { v, until: now + (v === "verified" ? 24 * HOUR : v === "claimed" ? 5 * 60_000 : HOUR) });
  return v;
}
