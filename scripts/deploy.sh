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
# Support via Ziina: API key (Ziina Business → Developers) for amount selection, or just a Ziina payment link
ZIINA_API_KEY=
SUPPORT_URL=
ENVEOF
  chown tafsir:tafsir "$ENV_APP"
fi

echo "==> Build (into .next-build; the live site keeps running from .next)"
sudo -u tafsir bash -c "cd $APP && rm -rf .next-build && npm ci && NEXT_DIST_DIR=.next-build npm run build" || {
  echo "BUILD FAILED – the site keeps running on the previous version."; exit 1; }

echo "==> Switch to the new build and (re)start"
sudo -u tafsir bash -c "cd $APP && rm -rf .next-old && { [ -d .next ] && mv .next .next-old || true; } && mv .next-build .next && pm2 startOrReload ecosystem.config.cjs --update-env && pm2 save"

echo
echo "Done. Version now: $(sudo -u tafsir git -C "$APP" log --oneline -1)"
