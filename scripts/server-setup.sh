#!/usr/bin/env bash
# TafsirFlow – base setup for a fresh, plain Ubuntu 24.04 / 26.04 VPS.
# Run as root:  bash server-setup.sh
# Safe to re-run. Does not delete anything.
set -euo pipefail

APP_USER=tafsir
APP_DIR=/srv/tafsirflow
DB_NAME=tafsirflow
DB_USER=tafsirflow

echo "==> System update"
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get upgrade -y
apt-get install -y sudo openssl curl git ufw nginx postgresql postgresql-contrib certbot python3-certbot-nginx unzip htop fail2ban

echo "==> Firewall"
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

echo "==> Node.js 22 + PM2"
if ! command -v node >/dev/null || ! node -v | grep -q '^v22'; then
  if curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && apt-get install -y nodejs; then :; else
    echo "    NodeSource unavailable for this release, using Ubuntu's nodejs/npm"
    apt-get install -y nodejs npm
  fi
fi
npm install -g pm2

echo "==> App user and folders"
id -u "$APP_USER" >/dev/null 2>&1 || adduser --system --group --home "$APP_DIR" --shell /bin/bash "$APP_USER"
mkdir -p "$APP_DIR"/{app,audio,logs}
chown -R "$APP_USER":"$APP_USER" "$APP_DIR"

echo "==> PostgreSQL database"
if ! sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'" | grep -q 1; then
  DB_PASS=$(openssl rand -hex 24)
  sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';"
  sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"
  umask 077
  echo "DATABASE_URL=postgresql://$DB_USER:$DB_PASS@localhost:5432/$DB_NAME" > "$APP_DIR/.env.db"
  chown "$APP_USER":"$APP_USER" "$APP_DIR/.env.db"
  echo "    DB credentials written to $APP_DIR/.env.db"
fi

echo "==> Content tables"
if [ -f "$(dirname "$0")/../db/schema.sql" ]; then
  sudo -u postgres psql -d "$DB_NAME" -f "$(dirname "$0")/../db/schema.sql" || true
fi

echo "==> Nginx site (IP only until a domain is set)"
cat > /etc/nginx/sites-available/tafsirflow <<'NGINX'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    client_max_body_size 20m;

    # Self-hosted recitation audio (supports range requests for seeking)
    location /audio/ {
        alias /srv/tafsirflow/audio/;
        add_header Cache-Control "public, max-age=31536000, immutable";
        add_header Access-Control-Allow-Origin "*";
        types { audio/mpeg mp3; }
        try_files $uri =404;
    }

    # Static prototype until the Next.js app is deployed
    location /prototype/ {
        alias /srv/tafsirflow/app/prototype/;
        try_files $uri $uri/ /prototype/index.html;
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
NGINX
ln -sf /etc/nginx/sites-available/tafsirflow /etc/nginx/sites-enabled/tafsirflow
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

echo "==> Deploy key for GitHub (add the public key below to the repo: Settings > Deploy keys, allow write)"
sudo -u "$APP_USER" bash -c "mkdir -p ~/.ssh && [ -f ~/.ssh/id_ed25519 ] || ssh-keygen -t ed25519 -N '' -C 'tafsirflow-vps' -f ~/.ssh/id_ed25519"
cat "$APP_DIR/.ssh/id_ed25519.pub"

echo
echo "Done. Next: bash scripts/download-audio.sh"
