#!/usr/bin/env bash
# Downloads per-verse recitation audio (all 114 surahs, 6,236 verses) from everyayah.com
# into /srv/tafsirflow/audio/<folder>/<SSSAAA>.mp3. Resumable: existing files are skipped.
# Usage: bash download-audio.sh [folder ...]   (default: the four reciters below)
# Run in tmux/screen – a full reciter takes 30–90 min.
set -uo pipefail

DEST=${DEST:-/srv/tafsirflow/audio}
BASE=https://everyayah.com/data
DEFAULT=(Alafasy_128kbps Abdul_Basit_Murattal_192kbps Husary_128kbps Minshawy_Murattal_128kbps)
# More available: Abdul_Basit_Mujawwad_128kbps Abdurrahmaan_As-Sudais_192kbps
#   Abu_Bakr_Ash-Shaatree_128kbps Hani_Rifai_192kbps Saood_ash-Shuraym_128kbps Maher_AlMuaiqly_64kbps
if [ $# -gt 0 ]; then RECITERS=("$@"); else RECITERS=("${DEFAULT[@]}"); fi

# verse counts per surah 1..114
COUNTS=(7 286 200 176 120 165 206 75 129 109 123 111 43 52 99 128 111 110 98 135 112 78 118 64 77 227 93 88 69 60 34 30 73 54 45 83 182 88 75 85 54 53 89 59 37 35 38 29 18 45 60 49 62 55 78 96 29 22 24 13 14 11 11 18 12 12 30 52 52 44 28 28 20 56 40 31 50 40 46 42 29 19 36 25 22 17 19 26 30 20 15 21 11 8 8 19 5 8 8 11 11 8 3 9 5 4 7 3 6 3 5 4 5 6)

for PASS in 1 2 3; do
for R in "${RECITERS[@]}"; do
  mkdir -p "$DEST/$R"
  echo "==> $R"
  LIST=$(mktemp)
  for s in $(seq 1 "${MAX_SURAH:-114}"); do
    n=${COUNTS[$((s-1))]}
    for a in $(seq 1 "$n"); do
      f=$(printf "%03d%03d.mp3" "$s" "$a")
      [ -s "$DEST/$R/$f" ] || echo "$f"
    done
  done > "$LIST"
  echo "    $(wc -l < "$LIST") files to download"
  # parallel downloads (default 3), retries, polite to the source
  xargs -a "$LIST" -P ${PARALLEL:-3} -I{} sh -c \
    'curl -fsS --retry 5 --retry-delay 4 --retry-all-errors -o "$0/{}.part" "$1/{}" && mv "$0/{}.part" "$0/{}" || echo "FAILED {}"' \
    "$DEST/$R" "$BASE/$R"
  rm -f "$LIST"
  echo "    $(ls "$DEST/$R" | grep -c '\.mp3$') / 6236 present, $(du -sh "$DEST/$R" | cut -f1)"
done
done  # passes: a later pass retries anything that failed
chown -R tafsir:tafsir "$DEST" 2>/dev/null || true
echo "Done."
