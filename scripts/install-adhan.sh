#!/usr/bin/env bash
# Install an adhan (call to prayer) recording for the radio. Run on the server as root:
#   bash scripts/install-adhan.sh makkah  <URL-or-file> ["Credit line shown on the site"]
#   bash scripts/install-adhan.sh dubai   <URL-or-file> ["Credit line"]
#   bash scripts/install-adhan.sh default <URL-or-file> ["Credit line"]     (used when a city has no own file)
#
# LICENCE: only install recordings you are allowed to use on a public website – public domain / CC0, CC BY (give the credit line),
# or a recording you licensed or recorded yourself. Broadcast recordings from the Haramain or Dubai media are NOT free to copy
# without permission. Free recordings can be found e.g. on Wikimedia Commons (Category: Adhan) – check the licence on each file page.
set -euo pipefail

NAME=${1:?usage: install-adhan.sh <makkah|dubai|default> <url-or-file> [credit]}
SRC=${2:?usage: install-adhan.sh <makkah|dubai|default> <url-or-file> [credit]}
CREDIT=${3:-}
case "$NAME" in makkah|dubai|default) ;; *) echo "name must be makkah, dubai or default"; exit 2 ;; esac

DIR=/srv/tafsirflow/audio/adhan
mkdir -p "$DIR"
TMP=$(mktemp -d); trap 'rm -rf "${TMP:?}"' EXIT

if [[ "$SRC" =~ ^https?:// ]]; then curl -fsSL "$SRC" -o "$TMP/in"; else cp "$SRC" "$TMP/in"; fi

mime=$(file --brief --mime-type "$TMP/in")
case "$mime" in audio/*|video/ogg|application/ogg) ;; *) echo "STOP: that is not an audio file (type: $mime)"; exit 1 ;; esac

command -v ffmpeg >/dev/null || apt-get install -y -qq ffmpeg >/dev/null
# normalise to a 128 kbps mp3 (plays everywhere), cut to at most 6 minutes
ffmpeg -loglevel error -y -i "$TMP/in" -t 360 -vn -ac 2 -b:a 128k "$TMP/out.mp3"
install -m 0644 "$TMP/out.mp3" "$DIR/$NAME.mp3"
if [ -n "$CREDIT" ]; then printf '%s\n' "$CREDIT" > "$DIR/$NAME.credit.txt"; chmod 0644 "$DIR/$NAME.credit.txt"; fi
chown -R tafsir:tafsir "$DIR" 2>/dev/null || true
chmod o+rx /srv/tafsirflow "$DIR"
echo "Installed: $DIR/$NAME.mp3  ($(du -h "$DIR/$NAME.mp3" | cut -f1)) – the radio and prayer page now play it."
