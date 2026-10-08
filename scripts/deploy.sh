#!/usr/bin/env bash
# Update the running site to the latest code. Run on the server as root:   bash /srv/tafsirflow/app/scripts/deploy.sh
# Safe to re-run. Does not touch the audio files or the database content (only adds missing tables/columns).
set -euo pipefail

APP=/srv/tafsirflow/app
ENV_APP=/srv/tafsirflow/.env.app
BRANCH=${BRANCH:-claude/tafsir-projekt-letzter-chat-73j3xi}

echo "==> Fetch latest code ($BRANCH)"
cd "$APP"
sudo -u tafsir git fetch origin "$BRANCH"
sudo -u tafsir git reset --hard FETCH_HEAD
# run the freshly fetched version of this script (bash would otherwise keep reading the old file)
[ "${DEPLOY_REEXEC:-}" = 1 ] || DEPLOY_REEXEC=1 exec bash "$APP/scripts/deploy.sh" "$@"

echo "==> Disk space"
free_gb() { df --output=avail -BG /srv/tafsirflow | tail -1 | tr -dc '0-9'; }
# only leftovers and caches – never audio, database, settings or the running build
rm -rf "$APP/.next-build" "$APP/.next-old" "$APP/.next/cache/webpack"
sudo -u tafsir npm cache clean --force >/dev/null 2>&1 || true
npm cache clean --force >/dev/null 2>&1 || true
sudo -u tafsir pm2 flush >/dev/null 2>&1 || true
journalctl --vacuum-size=200M >/dev/null 2>&1 || true
apt-get clean >/dev/null 2>&1 || true
find /srv/tafsirflow/audio -name '*.part' -delete 2>/dev/null || true
echo "    free: $(free_gb) GB"
if [ "$(free_gb)" -lt 2 ]; then
  # no hard stop: the build is tried anyway; if it runs out of space, the site simply keeps running on the old version
  echo "    Little space left – trying anyway. Largest folders:"
  du -xh --max-depth=2 /srv /var /root /home /opt 2>/dev/null | sort -h | tail -8 | sed 's/^/      /'
  echo "    (to free space: bash $APP/scripts/import-reciters.sh --remove <FOLDER>)"
fi

echo "==> Database tables"
sudo -u postgres psql -v ON_ERROR_STOP=1 -q -d tafsirflow -f "$APP/db/schema.sql"

if [ ! -f "$ENV_APP" ]; then
  echo "==> Creating $ENV_APP (edit it, then run this script again)"
  umask 077
  cat > "$ENV_APP" <<'ENVEOF'
# Quran Masterclass – server settings (not in git). One KEY=value per line.
SITE_URL=http://186.240.158.226
# Switch to 1 only when the real domain with HTTPS is live:
ALLOW_INDEXING=0
# E-mail (needed for confirmation and password-reset mails). Leave SMTP_HOST empty to disable e-mail confirmation.
SMTP_HOST=
SMTP_PORT=465
SMTP_USER=
SMTP_PASS=
MAIL_FROM=Quran Masterclass <noreply@quranmasterclass.com>
# Bot protection (Google reCAPTCHA) – easiest: bash scripts/set-recaptcha.sh <v3 keys> <v2 keys>
RECAPTCHA_V3_SITE_KEY=
RECAPTCHA_V3_SECRET=
RECAPTCHA_V2_SITE_KEY=
RECAPTCHA_V2_SECRET=
# Quran assistant (OpenAI): key from platform.openai.com – kept only here, never in git
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
# Android app: written by scripts/build-android.sh; PLAY_STORE_URL once the app is on Google Play
ANDROID_SHA256=
PLAY_STORE_URL=
ENVEOF
  chown tafsir:tafsir "$ENV_APP"
fi

# Once the domain has its HTTPS certificate the site is public: canonical address and search engines on.
# (Set ALLOW_INDEXING=0 together with the comment "# keep" on that line to stay hidden on purpose.)
DOMAIN=quranmasterclass.com
if [ -d "/etc/letsencrypt/live/$DOMAIN" ] || ls -d /etc/letsencrypt/live/$DOMAIN-* >/dev/null 2>&1; then
  if ! grep -q "^SITE_URL=https://$DOMAIN\s*$" "$ENV_APP"; then
    if grep -q '^SITE_URL=' "$ENV_APP"; then sed -i "s|^SITE_URL=.*|SITE_URL=https://$DOMAIN|" "$ENV_APP"; else echo "SITE_URL=https://$DOMAIN" >> "$ENV_APP"; fi
    echo "==> SITE_URL set to https://$DOMAIN"
  fi
  if grep -q '^ALLOW_INDEXING=0\s*$' "$ENV_APP"; then sed -i 's|^ALLOW_INDEXING=0\s*$|ALLOW_INDEXING=1|' "$ENV_APP"; echo "==> Search engines invited (ALLOW_INDEXING=1)"; fi
  grep -q '^ALLOW_INDEXING=' "$ENV_APP" || echo "ALLOW_INDEXING=1" >> "$ENV_APP"
fi
# the build bakes these into static pages (robots meta, canonical links), so it must see the same values as the server
env_val() { grep -m1 "^$1=" "$ENV_APP" | cut -d= -f2- | sed 's/\s*#.*$//; s/\s*$//'; }
BUILD_ENV="SITE_URL='$(env_val SITE_URL)' ALLOW_INDEXING='$(env_val ALLOW_INDEXING)'"
echo "==> Address: $(env_val SITE_URL) · indexing: $(env_val ALLOW_INDEXING)"

echo "==> Build (into .next-build; the live site keeps running from .next)"
sudo -u tafsir bash -c "cd $APP && rm -rf .next-build .next/types .next-old && npm ci && $BUILD_ENV NEXT_DIST_DIR=.next-build npm run build" || {
  echo "BUILD FAILED – the site keeps running on the previous version."; exit 1; }

echo "==> Switch to the new build and (re)start"
sudo -u tafsir bash -c "cd $APP && rm -rf .next-old && { [ -d .next ] && mv .next .next-old || true; } && mv .next-build .next && pm2 startOrReload ecosystem.config.cjs --update-env && pm2 save"
# the previous build and the compiler cache are not needed any more (each build starts fresh in .next-build)
rm -rf "$APP/.next-old" "$APP/.next/cache/webpack"
echo "    free disk now: $(free_gb) GB"

echo
echo "Done. Version now: $(sudo -u tafsir git -C "$APP" log --oneline -1)"
# quick look at what search engines see (should start with "Allow: /" and name the sitemap)
sleep 8
echo "==> https://$DOMAIN/robots.txt"
curl -fsS -m 20 "https://$DOMAIN/robots.txt" 2>/dev/null | sed 's/^/   /' || echo "   (not reachable yet – try again in a minute)"
