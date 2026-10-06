#!/usr/bin/env bash
# Security hardening for the Quran Masterclass server. Run as root:
#   bash /srv/tafsirflow/app/scripts/harden-server.sh                 firewall, fail2ban, auto-updates, nginx limits, encrypted backups
#   bash /srv/tafsirflow/app/scripts/harden-server.sh --ssh-keys-only also switch SSH to key login only (only if a key is installed!)
# Safe to run again.
set -euo pipefail
APP_DIR=/srv/tafsirflow
KEYS_ONLY=0; [ "${1:-}" = "--ssh-keys-only" ] && KEYS_ONLY=1

echo "==> Packages: fail2ban, unattended-upgrades"
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq fail2ban unattended-upgrades openssl >/dev/null

echo "==> Automatic security updates"
cat > /etc/apt/apt.conf.d/20auto-upgrades <<'EOF'
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
EOF

echo "==> Firewall: only SSH, HTTP and HTTPS"
ufw allow OpenSSH >/dev/null
ufw allow 'Nginx Full' >/dev/null
ufw default deny incoming >/dev/null
ufw default allow outgoing >/dev/null
ufw --force enable >/dev/null

echo "==> fail2ban: block repeated SSH login attempts and request floods"
cat > /etc/fail2ban/jail.d/quranmasterclass.conf <<'EOF'
[sshd]
enabled  = true
maxretry = 5
findtime = 10m
bantime  = 1h

[nginx-limit-req]
enabled  = true
port     = http,https
logpath  = /var/log/nginx/error.log
maxretry = 20
findtime = 5m
bantime  = 30m
EOF
systemctl enable --now fail2ban >/dev/null
systemctl restart fail2ban

echo "==> Nginx: hide version, rate limits, timeouts"
cat > /etc/nginx/conf.d/qm-security.conf <<'EOF'
server_tokens off;
# every visitor (IP) may send up to 20 requests per second with short bursts; floods get HTTP 429
limit_req_zone $binary_remote_addr zone=qm:10m rate=20r/s;
limit_req zone=qm burst=80 nodelay;
limit_req_status 429;
limit_conn_zone $binary_remote_addr zone=qmconn:10m;
limit_conn qmconn 60;
client_body_timeout 15s;
client_header_timeout 15s;
send_timeout 30s;
ssl_protocols TLSv1.2 TLSv1.3;
EOF
nginx -t && systemctl reload nginx

echo "==> PostgreSQL only reachable from this server"
if ss -ltn | grep -q '0.0.0.0:5432\|\[::\]:5432'; then
  echo "    WARNING: PostgreSQL listens on all interfaces – set listen_addresses = 'localhost' in postgresql.conf"
else
  echo "    ok (localhost only)"
fi

echo "==> Secrets readable only by the app user"
for f in "$APP_DIR/.env.db" "$APP_DIR/.env.app"; do [ -f "$f" ] && chown tafsir:tafsir "$f" && chmod 600 "$f"; done

echo "==> Encrypted daily database backups (14 days kept)"
mkdir -p "$APP_DIR/backups"; chmod 700 "$APP_DIR/backups"
if [ ! -f /root/.qm-backup-key ]; then
  umask 077; openssl rand -base64 48 > /root/.qm-backup-key
  echo "    New backup key created: /root/.qm-backup-key – copy it to a safe place (password manager). Without it backups cannot be restored."
fi
cat > /etc/cron.daily/qm-backup <<EOF
#!/bin/sh
set -e
f="$APP_DIR/backups/db-\$(date +%F).sql.gz.enc"
sudo -u postgres pg_dump tafsirflow | gzip | openssl enc -aes-256-cbc -pbkdf2 -salt -pass file:/root/.qm-backup-key -out "\$f"
chmod 600 "\$f"
find "$APP_DIR/backups" -name 'db-*.sql.gz.enc' -mtime +14 -delete
EOF
chmod 700 /etc/cron.daily/qm-backup
/etc/cron.daily/qm-backup && echo "    first backup written to $APP_DIR/backups"
echo "    restore: openssl enc -d -aes-256-cbc -pbkdf2 -pass file:/root/.qm-backup-key -in FILE | gunzip | sudo -u postgres psql tafsirflow"

echo "==> SSH"
if [ "$KEYS_ONLY" = 1 ]; then
  if [ -s /root/.ssh/authorized_keys ]; then
    cat > /etc/ssh/sshd_config.d/10-quranmasterclass.conf <<'EOF'
PasswordAuthentication no
KbdInteractiveAuthentication no
PermitRootLogin prohibit-password
MaxAuthTries 4
EOF
    sshd -t && systemctl reload ssh 2>/dev/null || systemctl reload sshd
    echo "    SSH now accepts keys only."
  else
    echo "    No key in /root/.ssh/authorized_keys – NOT switching to key-only (you would lock yourself out)."
  fi
else
  echo "    Tip: install an SSH key, then run this script with --ssh-keys-only to switch off password logins."
fi

echo
echo "Done. Check: ufw status · fail2ban-client status · ls -l $APP_DIR/backups"
