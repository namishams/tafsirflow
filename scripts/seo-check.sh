#!/usr/bin/env bash
# Shows whether search engines can read the site and its sitemap, and what is in the way.
# Run on the server:   bash /srv/tafsirflow/app/scripts/seo-check.sh
APP=/srv/tafsirflow/app
DOMAIN=${1:-quranmasterclass.com}
BRANCH=${BRANCH:-main}
UA="Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
ok=1
say() { printf '%s\n' "$*"; }
bad() { say "   -> $*"; ok=0; }

say "== Running version"
live=$(sudo -u tafsir git -C "$APP" rev-parse --short HEAD 2>/dev/null)
latest=$(sudo -u tafsir git -C "$APP" ls-remote origin "refs/heads/$BRANCH" 2>/dev/null | cut -c1-7)
say "   checked out: $live · latest on GitHub: ${latest:-?}"
[ -n "$latest" ] && [ "$live" != "$latest" ] && bad "not the latest code – run scripts/deploy.sh"
[ -d "$APP/.next" ] && say "   build from: $(date -r "$APP/.next/BUILD_ID" '+%Y-%m-%d %H:%M' 2>/dev/null)"
say "   free disk: $(df -h --output=avail /srv/tafsirflow | tail -1 | tr -d ' ')"

say "== https://$DOMAIN/robots.txt (as Googlebot)"
robots=$(curl -sS -m 15 -A "$UA" "https://$DOMAIN/robots.txt" 2>&1); say "$robots" | sed 's/^/   /'
echo "$robots" | grep -qi '^disallow: /\s*$' && bad "robots.txt blocks everything – the new version is not live yet (deploy failed?)"
echo "$robots" | grep -qi "^sitemap: https://$DOMAIN/sitemap.xml" || bad "robots.txt does not name https://$DOMAIN/sitemap.xml"

say "== https://$DOMAIN/sitemap.xml"
tmp=$(mktemp)
curl -sS -m 20 -A "$UA" -o "$tmp" -w "   status %{http_code} · %{content_type} · %{size_download} bytes\n" "https://$DOMAIN/sitemap.xml"
head -c 5 "$tmp" | grep -q '<?xml' || bad "the answer is not XML"
n=$(grep -o '<loc>' "$tmp" | wc -l); first=$(grep -o '<loc>[^<]*' "$tmp" | head -1 | cut -c6-)
say "   $n sub-sitemaps, first: $first"
case "$first" in https://$DOMAIN/*) ;; *) bad "the sitemap points to another address than https://$DOMAIN";; esac
if [ -n "$first" ]; then
  curl -sS -m 20 -A "$UA" -o "$tmp" -w "   first sub-sitemap: status %{http_code} · %{content_type}\n" "$first"
  say "   pages in it: $(grep -o '<loc>' "$tmp" | wc -l)"
fi
rm -f "$tmp"

say "== Home page"
page=$(curl -sS -m 20 -A "$UA" "https://$DOMAIN/de")
meta=$(echo "$page" | grep -o '<meta name="robots"[^>]*>' | head -1)
canon=$(echo "$page" | grep -o '<link rel="canonical"[^>]*>' | head -1)
say "   ${meta:-(no robots meta = indexable)}"; say "   ${canon:-(no canonical)}"
echo "$meta" | grep -q noindex && bad "the pages say noindex – run scripts/deploy.sh"
say "   http -> $(curl -sS -m 15 -o /dev/null -w '%{http_code} %{redirect_url}' "http://$DOMAIN/de")"

say "== Has Google been here? (nginx access logs)"
gb=$(zgrep -h 'Googlebot' /var/log/nginx/access.log* 2>/dev/null)
if [ -z "$gb" ]; then
  say "   -> Googlebot has not requested a single page yet: Google does not know the site – do the Search Console steps below"
else
  say "   Googlebot requests: $(echo "$gb" | wc -l) · last: $(grep -h 'Googlebot' /var/log/nginx/access.log /var/log/nginx/access.log.1 2>/dev/null | tail -1 | awk '{print substr($4,2)}')"
  say "   status codes: $(echo "$gb" | awk '{print $9}' | sort | uniq -c | sort -rn | awk '{printf "%s x %s  ", $1, $2}')"
  say "   sitemap fetched: $(echo "$gb" | grep -c 'GET /sitemap') times"
  n429=$(echo "$gb" | awk '$9 == 429' | wc -l)
  [ "$n429" -gt 0 ] && bad "Googlebot got $n429 x HTTP 429 from the nginx rate limit"
  n5xx=$(echo "$gb" | awk '$9 ~ /^5/' | wc -l)
  [ "$n5xx" -gt 0 ] && bad "Googlebot got $n5xx x a server error (5xx)"
  banned=$(fail2ban-client status nginx-limit-req 2>/dev/null | sed -n 's/.*Banned IP list:[[:space:]]*//p')
  for ip in $(echo "$gb" | awk '{print $1}' | sort -u); do
    case " $banned " in *" $ip "*) bad "fail2ban has banned Googlebot's address $ip – unban: fail2ban-client set nginx-limit-req unbanip $ip";; esac
  done
fi

echo
if [ $ok = 1 ]; then
  say "All good on the server. In Google Search Console:"
  say "  1. Settings -> robots.txt -> open the report -> 'Request a recrawl' (Google keeps an old robots.txt for up to 24 hours)"
  say "  2. Sitemaps -> remove the old entry -> add 'sitemap.xml' again"
  say "  3. URL inspection -> https://$DOMAIN/de -> Request indexing"
  say "'Couldn't fetch' can stay for a few hours after that; it is Google's queue, not the site."
else
  say "Fix the points marked with ->, then run this check again."
fi
