#!/usr/bin/env bash
# One-time setup on the server (as root): automatic deploys every 5 minutes and log rotation.
set -euo pipefail
chmod +x /srv/tafsirflow/app/scripts/autodeploy.sh
cat > /etc/cron.d/tafsirflow-autodeploy <<'CRON'
*/5 * * * * root /srv/tafsirflow/app/scripts/autodeploy.sh >> /var/log/tafsirflow-autodeploy.log 2>&1
CRON
cat > /etc/logrotate.d/tafsirflow-autodeploy <<'ROT'
/var/log/tafsirflow-autodeploy.log { weekly rotate 4 compress missingok notifempty }
ROT
echo "Automatic deploys are on (every 5 minutes, log: /var/log/tafsirflow-autodeploy.log)."
