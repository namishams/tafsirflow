#!/usr/bin/env bash
# Import reciters from EveryAyah onto this server and register them in the app.
# Run on the server as root:
#   bash scripts/import-reciters.sh --list                 show the catalogue (name, folder, estimated size, installed?)
#   bash scripts/import-reciters.sh Husary_128kbps ...     import specific folders
#   bash scripts/import-reciters.sh --all [--max-gb 30]    import everything that fits (stops at the size limit)
#   bash scripts/import-reciters.sh --remove FOLDER ...    switch a reciter off in the app and delete its audio (frees disk)
#   bash scripts/import-reciters.sh --clean                delete half-downloaded reciters that are not switched on
# Always leaves 8 GB free, because every update of the site (scripts/deploy.sh) needs a few GB to build.
# Resumable: already downloaded files are skipped. A reciter is only switched on in the app when all 6,236 verse files are present.
set -euo pipefail

AUDIO=${AUDIO:-/srv/tafsirflow/audio}
CATALOG_URL=https://everyayah.com/data/recitations.js
HERE=$(cd "$(dirname "$0")" && pwd)
MAX_GB=0; FORCE=0; MODE=""; FOLDERS=()

while [ $# -gt 0 ]; do
  case "$1" in
    --list) MODE=list ;;
    --all) MODE=all ;;
    --max-gb) MAX_GB=$2; shift ;;
    --force) FORCE=1 ;;
    --remove) MODE=remove ;;
    --clean) MODE=clean ;;
    -*) echo "unknown option $1"; exit 2 ;;
    *) FOLDERS+=("$1"); MODE=${MODE:-some} ;;
  esac
  shift
done
[ -n "$MODE" ] || { sed -n '2,12p' "$0"; exit 2; }

free_gb() { df --output=avail -BG "$AUDIO" | tail -1 | tr -dc '0-9'; }
enabled_in_app() { # psql only fills in :'f' in input it reads, not in -c
  local n; n=$(echo "SELECT count(*) FROM reciters WHERE folder = :'f' AND enabled;" | sudo -u postgres psql -tAq -d tafsirflow -v f="$1" 2>/dev/null || echo 0)
  [ "${n:-0}" != 0 ]
}

if [ "$MODE" = remove ]; then
  [ ${#FOLDERS[@]} -gt 0 ] || { echo "usage: --remove FOLDER ..."; exit 2; }
  for folder in "${FOLDERS[@]}"; do
    case "$folder" in ""|*/*|.|..|adhan) echo "SKIP $folder"; continue ;; esac
    sudo -u postgres psql -q -d tafsirflow -v f="$folder" <<'SQL'
UPDATE reciters SET enabled = false WHERE folder = :'f';
SQL
    [ -d "$AUDIO/$folder" ] && echo "REMOVED $folder ($(du -sh "$AUDIO/$folder" | cut -f1))" && rm -rf "${AUDIO:?}/$folder" || echo "SKIP $folder: no such folder"
  done
  echo "Free disk: $(free_gb) GB."; exit 0
fi

if [ "$MODE" = clean ]; then
  for dir in "$AUDIO"/*/; do
    folder=$(basename "$dir"); [ "$folder" = adhan ] && continue
    n=$(find "$dir" -name '*.mp3' | wc -l)
    if [ "$n" -lt 6236 ] && ! enabled_in_app "$folder"; then echo "REMOVED $folder: only $n of 6236 verses ($(du -sh "$dir" | cut -f1))"; rm -rf "${dir:?}"; fi
  done
  echo "Free disk: $(free_gb) GB."; exit 0
fi

TMP=$(mktemp -d); trap 'rm -rf "${TMP:?}"' EXIT
echo "==> Reading the reciter catalogue from EveryAyah"
curl -fsS "$CATALOG_URL" -o "$TMP/cat.raw"
python3 - "$TMP/cat.raw" "$TMP/cat.tsv" <<'PY'
import json, re, sys
raw = open(sys.argv[1], encoding="utf-8", errors="replace").read()
raw = raw[raw.index("{"): raw.rindex("}") + 1]
data = json.loads(raw)
rows = []
for k, v in data.items():
    if isinstance(v, dict) and v.get("subfolder"):
        rows.append((v["subfolder"], v.get("name", v["subfolder"]).replace("\t", " ")))
if not rows:
    sys.exit("catalogue format not recognised")
with open(sys.argv[2], "w", encoding="utf-8") as f:
    for folder, name in sorted(rows, key=lambda r: r[1].lower()):
        f.write(f"{folder}\t{name}\n")
PY

est_gb() { # rough size from the bitrate in the folder name (measured: 128 kbps ~ 1.7 GB for all verses)
  local br; br=$(echo "$1" | grep -o '[0-9]\+kbps' | grep -o '[0-9]\+' | head -1); br=${br:-64}
  python3 -c "print(round($br/128*1.7,1))"
}
installed() { [ "$(find "$AUDIO/$1" -name '*.mp3' 2>/dev/null | wc -l)" -ge 6236 ]; }

if [ "$MODE" = list ]; then
  printf "%-46s %-40s %8s  %s\n" FOLDER NAME "~GB" STATUS
  while IFS=$'\t' read -r folder name; do
    printf "%-46s %-40s %8s  %s\n" "$folder" "${name:0:40}" "$(est_gb "$folder")" "$(installed "$folder" && echo installed || echo -)"
  done < "$TMP/cat.tsv"
  echo; echo "Free disk: $(free_gb) GB in $AUDIO"
  exit 0
fi

if [ "$MODE" = all ]; then mapfile -t FOLDERS < <(cut -f1 "$TMP/cat.tsv"); fi

register() { # folder name
  local folder=$1 name=$2
  sudo -u postgres psql -v ON_ERROR_STOP=1 -q -d tafsirflow -v f="$folder" -v n="$name" <<'SQL'
INSERT INTO reciters (folder, slug, name, qc_id, sort) VALUES (:'f', :'f', :'n', NULL, 100)
ON CONFLICT (folder) DO UPDATE SET enabled = true;
SQL
}

added=0; used=$(du -s --block-size=1G "$AUDIO" 2>/dev/null | cut -f1 || echo 0)
for folder in "${FOLDERS[@]}"; do
  name=$(awk -F'\t' -v f="$folder" '$1==f{print $2}' "$TMP/cat.tsv")
  [ -n "$name" ] || { echo "SKIP $folder: not in the catalogue"; continue; }
  if installed "$folder"; then echo "OK   $folder already complete"; register "$folder" "$name"; continue; fi
  need=$(est_gb "$folder")
  if [ "$FORCE" = 0 ] && python3 -c "import sys; sys.exit(0 if $need + 8 > $(free_gb) else 1)"; then
    echo "STOP: $folder needs ~${need} GB, and 8 GB must stay free for site updates; only $(free_gb) GB are free."; break
  fi
  if [ "$MAX_GB" != 0 ] && python3 -c "import sys; sys.exit(0 if $used + $need > $MAX_GB else 1)"; then
    echo "STOP: --max-gb $MAX_GB would be exceeded."; break
  fi
  echo "==> $name ($folder, ~${need} GB)"
  bash "$HERE/download-audio.sh" "$folder"
  if installed "$folder"; then register "$folder" "$name"; echo "DONE $folder – now available in the app"; added=$((added+1)); used=$((used+${need%.*}))
  else echo "INCOMPLETE $folder – run the script again to resume (not enabled yet)"; fi
done
echo; echo "Finished. Newly enabled: $added. Free disk: $(free_gb) GB."
