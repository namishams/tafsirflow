#!/usr/bin/env bash
# Store the Google reCAPTCHA keys in /srv/tafsirflow/.env.app (never in git) and restart the site. Run on the server as root:
#   bash /srv/tafsirflow/app/scripts/set-recaptcha.sh <v3-key-A> <v3-key-B> [<v2-key-A> <v2-key-B>]
# Pass the two keys of each version in any order: the script asks Google which one is the secret key.
set -euo pipefail
ENV_APP=/srv/tafsirflow/.env.app
[ $# -eq 2 ] || [ $# -eq 4 ] || { echo "usage: set-recaptcha.sh <v3-key> <v3-key> [<v2-key> <v2-key>]"; exit 1; }

is_secret() { # a valid secret gets "invalid-input-response" for a dummy token, a site key gets "invalid-input-secret"
  curl -fsS --max-time 15 https://www.google.com/recaptcha/api/siteverify -d "secret=$1" -d "response=test" | grep -q "invalid-input-response"
}
pair() { # prints "site secret"
  if is_secret "$2"; then echo "$1 $2"; elif is_secret "$1"; then echo "$2 $1"; else echo "ERROR"; fi
}
setvar() { # KEY VALUE
  touch "$ENV_APP"
  grep -v "^$1=" "$ENV_APP" > "$ENV_APP.tmp" || true
  echo "$1=$2" >> "$ENV_APP.tmp"
  mv "$ENV_APP.tmp" "$ENV_APP"
}

read -r S3 K3 <<<"$(pair "$1" "$2")"
[ "$S3" != "ERROR" ] || { echo "Google accepted neither v3 key as a secret key – please check the keys."; exit 1; }
setvar RECAPTCHA_V3_SITE_KEY "$S3"; setvar RECAPTCHA_V3_SECRET "$K3"
echo "OK v3: site key ${S3:0:10}…, secret stored"
if [ $# -eq 4 ]; then
  read -r S2 K2 <<<"$(pair "$3" "$4")"
  [ "$S2" != "ERROR" ] || { echo "Google accepted neither v2 key as a secret key – please check the keys."; exit 1; }
  setvar RECAPTCHA_V2_SITE_KEY "$S2"; setvar RECAPTCHA_V2_SECRET "$K2"
  echo "OK v2: site key ${S2:0:10}…, secret stored"
fi
chmod 600 "$ENV_APP"; chown tafsir:tafsir "$ENV_APP"
sudo -u tafsir bash -c "cd /srv/tafsirflow/app && pm2 startOrReload ecosystem.config.cjs --update-env && pm2 save" >/dev/null
echo "Bot protection is active (login, sign-up, password reset, comments, feedback). In the Google reCAPTCHA console the domain quranmasterclass.com must be listed for both keys."
