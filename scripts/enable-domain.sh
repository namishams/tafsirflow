#!/usr/bin/env bash
# Connect the domain and switch on HTTPS. Run on the server as root:
#   bash /srv/tafsirflow/app/scripts/enable-domain.sh quranmasterclass.com contact@namishams.com
# Before: at the domain provider create A records for "@" and "www" pointing to this server's IP and wait until they resolve.
set -euo pipefail

DOMAIN=${1:?usage: enable-domain.sh <domain> <your-email-for-certificate-notices>}
EMAIL=${2:?usage: enable-domain.sh <domain> <your-email-for-certificate-notices>}
SITE=/etc/nginx/sites-available/tafsirflow
ENV_APP=/srv/tafsirflow/.env.app

SERVER_IP=$(curl -fsS https://api.ipify.org)
for h in "$DOMAIN" "www.$DOMAIN"; do
  got=$(getent ahostsv4 "$h" | awk '{print $1; exit}' || true)
  if [ "$got" != "$SERVER_IP" ]; then
    echo "STOP: $h resolves to '${got:-nothing}', but this server is $SERVER_IP."
    echo "Create the A record for $h pointing to $SERVER_IP, wait a few minutes, then run this again."
    exit 1
  fi
done

echo "==> Nginx: serve $DOMAIN and redirect www to the bare domain"
if ! grep -q "server_name .*$DOMAIN" "$SITE"; then
  sed -i "s|server_name _;|server_name $DOMAIN www.$DOMAIN _;\n    if (\$host = www.$DOMAIN) { return 301 \$scheme://$DOMAIN\$request_uri; }|" "$SITE"
fi
nginx -t
systemctl reload nginx

echo "==> HTTPS certificate (Let's Encrypt)"
certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --non-interactive --agree-tos -m "$EMAIL" --redirect

echo "==> Tell the app its address"
touch "$ENV_APP"
if grep -q '^SITE_URL=' "$ENV_APP"; then sed -i "s|^SITE_URL=.*|SITE_URL=https://$DOMAIN|" "$ENV_APP"; else echo "SITE_URL=https://$DOMAIN" >> "$ENV_APP"; fi
chown tafsir:tafsir "$ENV_APP"
sudo -u tafsir bash -c "cd /srv/tafsirflow/app && pm2 startOrReload ecosystem.config.cjs --update-env && pm2 save"

echo
echo "Done: https://$DOMAIN"
echo "Check it in the browser. When everything looks right, invite search engines:"
echo "  edit $ENV_APP -> ALLOW_INDEXING=1, then:  sudo -u tafsir pm2 restart tafsirflow --update-env"
