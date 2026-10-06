#!/usr/bin/env bash
# Switch the Quran & Islam assistant (and the AI check of comments) on. Run on the server as root:
#   bash /srv/tafsirflow/app/scripts/set-openai.sh
# The script asks for the OpenAI key without showing it (so it does not end up in the shell history), checks it with
# OpenAI, stores it only in /srv/tafsirflow/.env.app (never in git) and restarts the site.
set -euo pipefail
ENV_APP=/srv/tafsirflow/.env.app
KEY=${1:-}
if [ -z "$KEY" ]; then read -rsp "OpenAI API key (sk-…): " KEY; echo; fi
[[ "$KEY" =~ ^sk- ]] || { echo "That does not look like an OpenAI key (it starts with sk-)."; exit 1; }

CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 20 https://api.openai.com/v1/models -H "Authorization: Bearer $KEY" || echo 000)
case "$CODE" in
  200) echo "OK   OpenAI accepted the key." ;;
  401) echo "OpenAI rejected the key (401). Please create a new key at platform.openai.com/api-keys."; exit 1 ;;
  429) echo "Note: OpenAI answers 429 – usually no credit on the account yet (platform.openai.com → Billing). Storing the key anyway." ;;
  *)   echo "Could not reach OpenAI (HTTP $CODE). Storing the key anyway; check the server's internet connection." ;;
esac

touch "$ENV_APP"
grep -v "^OPENAI_API_KEY=" "$ENV_APP" > "$ENV_APP.tmp" || true
echo "OPENAI_API_KEY=$KEY" >> "$ENV_APP.tmp"
grep -q "^OPENAI_MODEL=" "$ENV_APP.tmp" || echo "OPENAI_MODEL=gpt-4o-mini" >> "$ENV_APP.tmp"
mv "$ENV_APP.tmp" "$ENV_APP"
chmod 600 "$ENV_APP"; chown tafsir:tafsir "$ENV_APP"
sudo -u tafsir bash -c "cd /srv/tafsirflow/app && pm2 startOrReload ecosystem.config.cjs --update-env && pm2 save" >/dev/null
sleep 3
if curl -s --max-time 10 http://127.0.0.1:3000/api/assistant | grep -q '"enabled":true'; then
  echo "OK   The assistant is online: https://quranmasterclass.com/de/assistant"
else
  echo "The site restarted, but the assistant does not report itself as enabled yet – run: pm2 logs --lines 50"
fi
