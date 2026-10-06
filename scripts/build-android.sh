#!/usr/bin/env bash
# Build the Android app of Quran Masterclass (Trusted Web Activity: the complete website, full screen, no browser bar,
# always up to date) on the server. Run as root:   bash /srv/tafsirflow/app/scripts/build-android.sh
# First run: installs JDK 17, the Android SDK and Bubblewrap (~1.5 GB), creates the signing key and asks for its password.
# Every run: builds a new version (version code +1) and stores
#   /srv/tafsirflow/android/out/quranmasterclass.aab   – upload this to Google Play
#   /srv/tafsirflow/android/out/quranmasterclass.apk   – direct install, offered on quranmasterclass.com/app
# KEEP /srv/tafsirflow/android/keystore.jks AND ITS PASSWORD SAFE (copy both off the server). Without them no update of
# the app can ever be published again.
set -euo pipefail
BASE=/srv/tafsirflow/android
if [ "${1:-}" = "--add-fingerprint" ]; then
  FP=${2:?usage: build-android.sh --add-fingerprint <SHA-256>}; ENV_APP=/srv/tafsirflow/.env.app; touch "$ENV_APP"
  CUR=$(grep '^ANDROID_SHA256=' "$ENV_APP" | cut -d= -f2- || true)
  grep -v '^ANDROID_SHA256=' "$ENV_APP" > "$ENV_APP.tmp" || true; echo "ANDROID_SHA256=${CUR:+$CUR,}$FP" >> "$ENV_APP.tmp"; mv "$ENV_APP.tmp" "$ENV_APP"
  chmod 600 "$ENV_APP"; chown tafsir:tafsir "$ENV_APP"
  sudo -u tafsir bash -c "cd /srv/tafsirflow/app && pm2 startOrReload ecosystem.config.cjs --update-env && pm2 save" >/dev/null
  echo "Added. Check: https://quranmasterclass.com/.well-known/assetlinks.json"; exit 0
fi
APP=/srv/tafsirflow/app
ENV_APP=/srv/tafsirflow/.env.app
SDK=$BASE/sdk
PROJ=$BASE/project
mkdir -p "$BASE/out" "$PROJ"

echo "==> Tools"
# Bubblewrap needs exactly JDK 17
[ -d /usr/lib/jvm/java-17-openjdk-amd64 ] || apt-get install -y -qq openjdk-17-jdk-headless unzip >/dev/null
JDK=/usr/lib/jvm/java-17-openjdk-amd64
command -v unzip >/dev/null || apt-get install -y -qq unzip >/dev/null
if [ ! -x "$SDK/cmdline-tools/latest/bin/sdkmanager" ]; then
  echo "    Android SDK command-line tools"
  TMP=$(mktemp -d)
  curl -fsSL -o "$TMP/tools.zip" https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip
  mkdir -p "$SDK/cmdline-tools" && unzip -q "$TMP/tools.zip" -d "$TMP" && mv "$TMP/cmdline-tools" "$SDK/cmdline-tools/latest" && rm -rf "$TMP"
fi
export ANDROID_HOME=$SDK JAVA_HOME=$JDK
# Bubblewrap looks for <sdk>/bin/sdkmanager (layout of its own installer); the tools stay in their standard place
[ -e "$SDK/bin" ] || ln -s cmdline-tools/latest/bin "$SDK/bin"
command -v bubblewrap >/dev/null || npm install -g @bubblewrap/cli >/dev/null
# install exactly the build-tools and platform this Bubblewrap version builds with
BW=$(npm root -g)/@bubblewrap
BT=$(grep -rhoE "BUILD_TOOLS_VERSION = '[0-9.]+'" "$BW" 2>/dev/null | head -1 | grep -oE "[0-9.]+" || true)
API=$(grep -rhoE "compileSdkVersion [0-9]+" "$BW" 2>/dev/null | head -1 | grep -oE "[0-9]+" || true)
BT=${BT:-36.1.0}; API=${API:-36}
echo "    SDK: platform android-$API, build-tools $BT"
yes | "$SDK/cmdline-tools/latest/bin/sdkmanager" --sdk_root="$SDK" --licenses >/dev/null || true
"$SDK/cmdline-tools/latest/bin/sdkmanager" --sdk_root="$SDK" "platform-tools" "platforms;android-$API" "build-tools;$BT" >/dev/null
mkdir -p ~/.bubblewrap && printf '{"jdkPath":"%s","androidSdkPath":"%s"}\n' "$JDK" "$SDK" > ~/.bubblewrap/config.json

echo "==> Signing key"
if [ -z "${BUBBLEWRAP_KEYSTORE_PASSWORD:-}" ]; then read -rsp "Password for the signing key (min. 8 characters, write it down!): " BUBBLEWRAP_KEYSTORE_PASSWORD; echo; fi
export BUBBLEWRAP_KEYSTORE_PASSWORD BUBBLEWRAP_KEY_PASSWORD=$BUBBLEWRAP_KEYSTORE_PASSWORD
if [ ! -f "$BASE/keystore.jks" ]; then
  "$JDK/bin/keytool" -genkeypair -v -keystore "$BASE/keystore.jks" -alias quranmasterclass -keyalg RSA -keysize 2048 -validity 10000 \
    -storepass "$BUBBLEWRAP_KEYSTORE_PASSWORD" -keypass "$BUBBLEWRAP_KEYSTORE_PASSWORD" \
    -dname "CN=Quran Masterclass, O=Nami Shams, L=Dubai, C=AE" >/dev/null
  chmod 600 "$BASE/keystore.jks"
  echo "    New key created: $BASE/keystore.jks  – copy it and the password somewhere safe now."
fi
SHA=$("$JDK/bin/keytool" -list -v -keystore "$BASE/keystore.jks" -alias quranmasterclass -storepass "$BUBBLEWRAP_KEYSTORE_PASSWORD" | awk '/SHA256:/{print $2; exit}')

echo "==> Project (version code +1)"
CODE=$(( $(cat "$BASE/version" 2>/dev/null || echo 0) + 1 ))
python3 - "$APP/android/twa-manifest.json" "$PROJ/twa-manifest.json" "$CODE" <<'PY'
import json,sys
m=json.load(open(sys.argv[1])); code=int(sys.argv[3])
m["appVersionCode"]=code; m["appVersionName"]=m["appVersion"]=f"1.{code}"
json.dump(m,open(sys.argv[2],"w"),indent=2)
PY
cd "$PROJ"
bubblewrap update --skipVersionUpgrade --manifest="$PROJ/twa-manifest.json" >/dev/null
bubblewrap build --skipPwaValidation --manifest="$PROJ/twa-manifest.json"
echo "$CODE" > "$BASE/version"
cp -f "$PROJ/app-release-bundle.aab" "$BASE/out/quranmasterclass.aab"
cp -f "$PROJ/app-release-signed.apk" "$BASE/out/quranmasterclass.apk"
chmod 644 "$BASE/out/"*; chmod o+x "$BASE" "$BASE/out"

echo "==> Link the app with the domain (Digital Asset Links)"
touch "$ENV_APP"
CUR=$(grep '^ANDROID_SHA256=' "$ENV_APP" | cut -d= -f2- || true)
case ",$CUR," in *",$SHA,"*) ;; *) NEW=${CUR:+$CUR,}$SHA; grep -v '^ANDROID_SHA256=' "$ENV_APP" > "$ENV_APP.tmp" || true; echo "ANDROID_SHA256=$NEW" >> "$ENV_APP.tmp"; mv "$ENV_APP.tmp" "$ENV_APP" ;; esac
chmod 600 "$ENV_APP"; chown tafsir:tafsir "$ENV_APP"
sudo -u tafsir bash -c "cd $APP && pm2 startOrReload ecosystem.config.cjs --update-env && pm2 save" >/dev/null
echo
echo "Done – version 1.$CODE"
echo "  Google Play:   $BASE/out/quranmasterclass.aab"
echo "  Direct APK:    https://quranmasterclass.com/api/app/android  (also linked on /app)"
echo "  Check:         https://quranmasterclass.com/.well-known/assetlinks.json"
echo "If Google Play signs the app for you (Play App Signing), copy the SHA-256 of the 'App signing key' from the Play Console"
echo "and add it:  bash $APP/scripts/build-android.sh --add-fingerprint <SHA-256>"
