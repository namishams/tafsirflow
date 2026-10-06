#!/usr/bin/env bash
# Shows whether search engines can read the site and its sitemap, and what is in the way.
# Run on the server:   bash /srv/tafsirflow/app/scripts/seo-check.sh
ENV_APP=/srv/tafsirflow/.env.app
DOMAIN=${1:-quranmasterclass.com}
ok=1
say() { printf '%s\n' "$*"; }

say "== Server settings ($ENV_APP)"
site=$(grep -m1 '^SITE_URL=' "$ENV_APP" 2>/dev/null | cut -d= -f2-)
idx=$(grep -m1 '^ALLOW_INDEXING=' "$ENV_APP" 2>/dev/null | cut -d= -f2- | sed 's/\s*#.*$//; s/\s*$//')
say "   SITE_URL=$site"; say "   ALLOW_INDEXING=$idx"
[ "$site" = "https://$DOMAIN" ] || { say "   -> SITE_URL should be https://$DOMAIN"; ok=0; }
[ "$idx" = "1" ] || { say "   -> ALLOW_INDEXING should be 1"; ok=0; }

say "== HTTPS certificate"
ls -d /etc/letsencrypt/live/$DOMAIN* 2>/dev/null || { say "   none found – run scripts/enable-domain.sh $DOMAIN <e-mail>"; ok=0; }

say "== https://$DOMAIN/robots.txt"
robots=$(curl -fsS -m 15 "https://$DOMAIN/robots.txt" 2>&1); say "$robots" | sed 's/^/   /'
echo "$robots" | grep -qi '^disallow: /$' && { say "   -> robots.txt blocks everything"; ok=0; }

say "== https://$DOMAIN/sitemap.xml"
tmp=$(mktemp)
curl -sS -m 20 -o "$tmp" -w "   status %{http_code} · %{content_type} · %{size_download} bytes\n" "https://$DOMAIN/sitemap.xml"
first=$(grep -o '<loc>[^<]*' "$tmp" | head -1 | cut -c6-)
say "   first entry: $first"
case "$first" in https://$DOMAIN/*) ;; *) say "   -> the sitemap points to another address than https://$DOMAIN"; ok=0;; esac
[ -n "$first" ] && curl -sS -m 20 -o /dev/null -w "   first sub-sitemap: status %{http_code}\n" "$first"
rm -f "$tmp"

say "== Robots meta tag of the home page"
meta=$(curl -fsS -m 20 "https://$DOMAIN/de" | grep -o '<meta name="robots"[^>]*>' | head -1)
say "   ${meta:-(none = indexable)}"
echo "$meta" | grep -q noindex && { say "   -> pages say noindex: run scripts/deploy.sh once more so the build sees ALLOW_INDEXING=1"; ok=0; }

echo
if [ $ok = 1 ]; then
  say "All good. In Google Search Console: Sitemaps -> remove the old entry, add 'sitemap.xml' again; then URL inspection -> https://$DOMAIN/de -> Request indexing."
else
  say "Fix the points marked with -> and run:  bash /srv/tafsirflow/app/scripts/deploy.sh   then this check again."
fi
