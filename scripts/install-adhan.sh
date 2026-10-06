#!/usr/bin/env bash
# Add adhan recordings to the server (the radio and prayer page play them; "random" picks a different one each time).
# Run as root:
#   bash scripts/install-adhan.sh <id> <url-or-file> ["Display name"] ["Credit / permission"]
#   bash scripts/install-adhan.sh --list adhans.txt        one recording per line:  id | url | Display name | Credit
# id: lowercase letters, digits and -, e.g. dubai-1, makkah-sudais, tehran
# Only use recordings you are allowed to publish (own recording, licence or written permission of the source).
set -euo pipefail
DIR=/srv/tafsirflow/audio/adhan
mkdir -p "$DIR"
command -v ffmpeg >/dev/null || apt-get install -y -qq ffmpeg >/dev/null

install_one() { # id src label credit
  local ID=$1 SRC=$2 LABEL=${3:-} CREDIT=${4:-} TMP
  [[ "$ID" =~ ^[a-z0-9][a-z0-9-]{0,40}$ ]] || { echo "SKIP $ID: id may only contain a-z, 0-9 and -"; return 0; }
  TMP=$(mktemp -d)
  if [[ "$SRC" =~ ^https?:// ]]; then
    curl -fsSL --max-time 120 -A "Mozilla/5.0" "$SRC" -o "$TMP/in" || { echo "SKIP $ID: download failed"; rm -rf "${TMP:?}"; return 0; }
  else cp "$SRC" "$TMP/in"; fi
  case "$(file --brief --mime-type "$TMP/in")" in audio/*|video/*|application/ogg|application/octet-stream) ;; *) echo "SKIP $ID: not an audio file"; rm -rf "${TMP:?}"; return 0 ;; esac
  # normalise to 128 kbps mp3, at most 6 minutes, even loudness
  if ! ffmpeg -loglevel error -y -i "$TMP/in" -t 360 -vn -ac 2 -af loudnorm=I=-16:TP=-1.5 -b:a 128k "$TMP/out.mp3"; then echo "SKIP $ID: could not convert"; rm -rf "${TMP:?}"; return 0; fi
  install -m 0644 "$TMP/out.mp3" "$DIR/$ID.mp3"
  [ -n "$LABEL" ] && printf '%s\n' "$LABEL" > "$DIR/$ID.label.txt"
  [ -n "$CREDIT" ] && printf '%s\n' "$CREDIT" > "$DIR/$ID.credit.txt"
  rm -rf "${TMP:?}"
  echo "OK   $ID  ($(du -h "$DIR/$ID.mp3" | cut -f1))  ${LABEL}"
}

if [ "${1:-}" = "--list" ]; then
  LIST=${2:?usage: install-adhan.sh --list file.txt}
  while IFS='|' read -r id url label credit; do
    id=$(echo "$id" | xargs); url=$(echo "${url:-}" | xargs)
    [ -z "$id" ] || [[ "$id" == \#* ]] && continue
    install_one "$id" "$url" "$(echo "${label:-}" | xargs)" "$(echo "${credit:-}" | xargs)"
  done < "$LIST"
else
  install_one "${1:?usage: install-adhan.sh <id> <url-or-file> [label] [credit]}" "${2:?url or file missing}" "${3:-}" "${4:-}"
fi

chown -R tafsir:tafsir "$DIR" 2>/dev/null || true
chmod o+rx /srv/tafsirflow /srv/tafsirflow/audio "$DIR"
echo "Installed recordings: $(ls "$DIR"/*.mp3 2>/dev/null | wc -l) – the radio and the prayer page play them (random by default)."
