// Shared defences against bots, mass mailers and scrapers (owner 23.10.2026). Used by the form routes and by
// src/middleware.ts. Nothing here talks to a third party; reCAPTCHA stays in src/lib/captcha.ts.
//
//   honeypot            a hidden form field that only bots fill
//   disposable e-mail   throw-away mail domains cannot be used for sign-in, contact forms and accounts
//   scraper user agent  command-line and library clients that read the API instead of a browser
//   crawler table       the search and AI crawlers that are welcome (verified in src/lib/crawlers.ts)
//   subnet              the /24 (IPv4) or /64 (IPv6) of an address, so a farm of addresses in one data centre counts together
import { rateLimited } from "./http";

// ---------- honeypot ----------
/** the name of the hidden field every protected form carries (see src/components/Honeypot.tsx) */
export const HONEYPOT_FIELD = "website";
/** true when a bot filled the hidden field; the route then answers "ok" as if it had worked */
export const honeypotTripped = (body: unknown): boolean => {
  const v = body && typeof body === "object" ? (body as Record<string, unknown>)[HONEYPOT_FIELD] : undefined;
  return typeof v === "string" && v.trim().length > 0;
};

// ---------- disposable e-mail domains ----------
// Well-known throw-away providers. Extend without a deploy: DISPOSABLE_DOMAINS_EXTRA="a.com,b.com"; let one through:
// DISPOSABLE_DOMAINS_ALLOW="c.com". Subdomains count (x.mailinator.com).
const DISPOSABLE = new Set((
  "mailinator.com,mailinator.net,mailinator2.com,guerrillamail.com,guerrillamail.net,guerrillamail.org,guerrillamail.biz,guerrillamail.de,guerrillamailblock.com,grr.la,sharklasers.com,pokemail.net,spam4.me,10minutemail.com,10minutemail.net,10minutemail.co.uk,10minutemail.de,20minutemail.com,minutemail.com,tempmail.com,temp-mail.org,temp-mail.io,tempmail.net,tempmail.dev,tempmailo.com,tempail.com,tempinbox.com,tempr.email,temporary-mail.net,tmpmail.org,tmpmail.net,tmailor.com,mohmal.com,yopmail.com,yopmail.net,yopmail.fr,cool.fr.nf,jetable.org,nospam.ze.tc,nomail.xl.cx,trashmail.com,trashmail.net,trashmail.de,trashmail.me,trash-mail.com,trash-mail.de,wegwerfmail.de,wegwerfmail.net,wegwerfmail.org,wegwerfemail.de,einrot.com,cuvox.de,dayrep.com,fleckens.hu,gustr.com,jourrapide.com,rhyta.com,superrito.com,teleworm.us,armyspy.com,getnada.com,nada.email,nada.ltd,maildrop.cc,mailnesia.com,mailcatch.com,mailforspam.com,mailtemp.info,mail-temp.com,fakeinbox.com,fakemail.net,fakemailgenerator.com,throwawaymail.com,throwam.com,discard.email,discardmail.com,discardmail.de,dispostable.com,dropmail.me,emailondeck.com,emailfake.com,email-fake.com,fake-mail.net,burnermail.io,spamgourmet.com,spamgourmet.net,spambox.us,spamex.com,spam.la,mintemail.com,mytemp.email,mytrashmail.com,moakt.com,moakt.cc,mailsac.com,inboxkitten.com,inboxbear.com,owlymail.com,luxusmail.org,zetmail.com,airmail.cc,mail.tm,mailpoof.com,harakirimail.com,incognitomail.org,instantemailaddress.com,getairmail.com,gettempmail.com,generator.email,e4ward.com,eyepaste.com,filzmail.com,guerillamail.info,haltospam.com,imgof.com,jsrsolutions.com,kasmail.com,klassmaster.com,lroid.com,mailexpire.com,mailmoat.com,mailzilla.com,meltmail.com,mt2015.com,my10minutemail.com,mynetstore.de,notmailinator.com,objectmail.com,onewaymail.com,pjjkp.com,proxymail.eu,quickinbox.com,rcpt.at,safetymail.info,sendspamhere.com,shieldedmail.com,smashmail.de,snkmail.com,sogetthis.com,spambog.com,spambog.de,spamfree24.org,spamherelots.com,spamhole.com,spaml.com,supergreatmail.com,tempemail.co.za,tempemail.net,tempsky.com,thankyou2010.com,thisisnotmyrealemail.com,trbvm.com,uggsrock.com,veryrealemail.com,wh4f.org,yepmail.net,zippymail.info,1secmail.com,1secmail.net,1secmail.org,esiix.com,wwjmp.com,xojxe.com,yoggm.com,vjuum.com,laafd.com,txcct.com,dcctb.com,kzccv.com,qiott.com,bheps.com,oosln.com,vddaz.com,emltmp.com,tmpeml.com,tmpbox.net,crazymailing.com,receiveee.com,mailnator.com,mailinater.com,reallymymail.com,sofort-mail.de,spoofmail.de,trashmail.io,trashmail.at,trashmail.ws,dodgit.com,dodgeit.com,deadaddress.com,despammed.com,devnullmail.com,disposableaddress.com,disposableemailaddresses.com,disposeamail.com,dumpmail.de,dumpyemail.com,email60.com,emailigo.de,emailmiser.com,emailsensei.com,emailtemporanea.net,emailthe.net,emailtmp.com,emailwarden.com,emailx.at.hm,emailxfer.com,fastacura.com,fastchevy.com,fastchrysler.com,fastkawasaki.com,fastmazda.com,fastmitsubishi.com,fastnissan.com,fastsubaru.com,fastsuzuki.com,fasttoyota.com,fastyamaha.com,mailin8r.com,mailmetrash.com,mailslite.com,mbx.cc,nwldx.com,nobulk.com,noclickemail.com,nogmailspam.info,nospamfor.us,nowmymail.com,sharedmailbox.org,tafmail.com,tagyourself.com,wegwerf-email.de,wegwerfadresse.de,zoemail.org"
).split(","));
const envSet = (name: string) => new Set((process.env[name] ?? "").split(",").map((x) => x.trim().toLowerCase()).filter(Boolean));

/** the domain of an address, lower case ("" when there is none) */
export const emailDomain = (email: string) => (email.split("@")[1] ?? "").trim().toLowerCase().replace(/\.$/, "");
/** true for throw-away mail domains (and their subdomains) */
export function isDisposableEmail(email: string): boolean {
  const domain = emailDomain(email);
  if (!domain) return false;
  const allow = envSet("DISPOSABLE_DOMAINS_ALLOW"), extra = envSet("DISPOSABLE_DOMAINS_EXTRA");
  const labels = domain.split(".");
  for (let i = 0; i < labels.length - 1; i++) {
    const d = labels.slice(i).join(".");
    if (allow.has(d)) return false;
    if (DISPOSABLE.has(d) || extra.has(d)) return true;
  }
  return false;
}

/** per-address limit shared by every form that takes an e-mail address (in memory; the sign-in codes also have their own in the database) */
export const emailRateLimited = (scope: string, email: string, max: number, windowMs: number) => rateLimited(`${scope}:mail:${email.trim().toLowerCase()}`, max, windowMs);

// ---------- scraper user agents ----------
// Clients that are not browsers and have no business on /api/: libraries and command-line tools used for scraping, headless
// browsers, and the crawlers of SEO tools. Search and AI crawlers are NOT in this list (CRAWLERS below) and the apps are
// recognised by their x-qmc-app header. A UA is trivially forged, so this only stops the lazy; the limits do the rest.
const TOOL_UA = /^(?:python-requests|python-urllib|python-httpx|python-urllib3|aiohttp|httpx|scrapy|curl|wget|libwww-perl|lwp-|go-http-client|java|jakarta|apache-httpclient|httpclient|okhttp|node-fetch|axios|got|undici|mechanize|postmanruntime|insomnia|guzzlehttp|reqwest|ruby|rest-client|colly|httpie|libcurl|powershell|php|perl|dart|deno|bun)(?![a-z0-9])/i;
const BOT_UA = /(headlesschrome|phantomjs|selenium|puppeteer|playwright|webdriver|httrack|nutch|heritrix|crawler4j|mj12bot|ahrefsbot|semrushbot|dotbot|blexbot|bytespider|dataforseobot|petalbot|megaindex|zoominfobot|serpstatbot|seokicks|barkrowler|linkpadbot|netestate|scrapy|scraper|python\/|go-http|\bhttp\.rb\b|libwww|java\/\d|node-superagent)/i;
/** true for an empty user agent or an obvious scraping tool */
export function isScraperUA(ua: string | null | undefined): boolean {
  const s = (ua ?? "").trim();
  if (!s) return true;
  return TOOL_UA.test(s) || BOT_UA.test(s);
}

// ---------- welcome crawlers ----------
// Claimed by user agent only here; src/lib/crawlers.ts verifies the claim against the operators' published address lists
// or reverse DNS (a fake "Googlebot" from a rented server is treated like any other visitor).
export type CrawlerKind = { name: string; ua: RegExp; lists?: string[]; rdns?: RegExp };
export const CRAWLERS: CrawlerKind[] = [
  { name: "googlebot", ua: /Googlebot|Google-InspectionTool|GoogleOther|Storebot-Google|AdsBot-Google|Mediapartners-Google|Google-Extended|FeedFetcher-Google/i, lists: ["https://developers.google.com/static/search/apis/ipranges/googlebot.json", "https://developers.google.com/static/search/apis/ipranges/special-crawlers.json", "https://developers.google.com/static/search/apis/ipranges/user-triggered-fetchers.json"], rdns: /\.(googlebot|google|googleusercontent)\.com$/i },
  { name: "bingbot", ua: /bingbot|BingPreview|msnbot/i, lists: ["https://www.bing.com/toolbox/bingbot.json"], rdns: /\.search\.msn\.com$/i },
  { name: "gptbot", ua: /GPTBot/i, lists: ["https://openai.com/gptbot.json"] },
  { name: "oai-searchbot", ua: /OAI-SearchBot/i, lists: ["https://openai.com/searchbot.json"] },
  { name: "chatgpt-user", ua: /ChatGPT-User/i, lists: ["https://openai.com/chatgpt-user.json"] },
  { name: "perplexitybot", ua: /PerplexityBot/i, lists: ["https://www.perplexity.ai/perplexitybot.json"] },
  { name: "perplexity-user", ua: /Perplexity-User/i, lists: ["https://www.perplexity.ai/perplexity-user.json"] },
  // Anthropic publishes no address list for its crawlers: the claim is accepted by user agent, with a high ceiling per address
  { name: "claudebot", ua: /ClaudeBot|Claude-User|Claude-SearchBot|anthropic-ai/i },
  { name: "applebot", ua: /Applebot/i, lists: ["https://search.developer.apple.com/applebot.json"], rdns: /\.applebot\.apple\.com$/i },
  { name: "duckduckbot", ua: /DuckDuckBot|DuckDuckGo-Favicons-Bot/i },
  { name: "yandexbot", ua: /YandexBot|YandexImages|YandexMobileBot/i, rdns: /\.yandex\.(ru|net|com)$/i },
  { name: "baiduspider", ua: /Baiduspider/i, rdns: /\.(baidu\.com|baidu\.jp)$/i },
];
export const claimedCrawler = (ua: string | null | undefined): CrawlerKind | null => {
  const s = ua ?? "";
  return CRAWLERS.find((c) => c.ua.test(s)) ?? null;
};

// ---------- network helpers ----------
/** loopback and private addresses: our own server, monitoring on the same machine, the reverse proxy itself */
export const isPrivateIp = (ip: string) => /^(127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|169\.254\.|::1$|fc|fd|fe80:)/i.test(ip) || ip === "localhost";

/** /24 of an IPv4 address, /64 of an IPv6 address: one key for a whole block of neighbouring addresses */
export function subnetOf(ip: string): string {
  if (ip.includes(":")) {
    // expand "::" so the first four groups are right
    const [head, tail = ""] = ip.split("::");
    const h = head ? head.split(":") : [], t = tail ? tail.split(":") : [];
    const full = ip.includes("::") ? [...h, ...Array(Math.max(0, 8 - h.length - t.length)).fill("0"), ...t] : h;
    return `v6:${full.slice(0, 4).map((g) => g.toLowerCase().replace(/^0+(?=.)/, "")).join(":")}`;
  }
  const m = ip.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.\d{1,3}$/);
  return m ? `v4:${m[1]}.${m[2]}.${m[3]}` : `x:${ip}`;
}
