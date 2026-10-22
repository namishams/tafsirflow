#!/usr/bin/env bash
# Runs every 5 minutes (cron, installed by scripts/install-autodeploy.sh): when the branch on GitHub has new commits,
# the site is updated with scripts/deploy.sh. One run at a time; the log is /var/log/tafsirflow-autodeploy.log.
set -uo pipefail
APP=/srv/tafsirflow/app
BRANCH=${BRANCH:-main}
exec 9>/run/tafsirflow-autodeploy.lock
flock -n 9 || exit 0
cd "$APP" || exit 0
REMOTE=$(sudo -u tafsir git ls-remote origin "refs/heads/$BRANCH" | cut -f1)
LOCAL=$(sudo -u tafsir git rev-parse HEAD)
[ -n "$REMOTE" ] && [ "$REMOTE" != "$LOCAL" ] || exit 0
echo "==== $(date -Is) deploy $LOCAL -> $REMOTE"
BRANCH="$BRANCH" bash "$APP/scripts/deploy.sh" && echo "==== $(date -Is) done" || echo "==== $(date -Is) FAILED (site keeps running on the previous version)"
