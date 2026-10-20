#!/usr/bin/env bash
# Builds the iOS app of Quran Masterclass. Runs on a Mac with Xcode (not on the server).
#   bash scripts/build-ios.sh                    creates the Xcode project and opens it in Xcode
#   bash scripts/build-ios.sh TEAMID --upload    builds and uploads a new version to App Store Connect (TestFlight)
# TEAMID: developer.apple.com/account -> Membership details -> Team ID (remembered in ios/.team-id after the first run)
set -euo pipefail
cd "$(dirname "$0")/../ios"
[ "$(uname)" = Darwin ] || { echo "This script runs on a Mac with Xcode."; exit 1; }
command -v xcodebuild >/dev/null && xcodebuild -version >/dev/null 2>&1 || { echo "Install Xcode from the Mac App Store, open it once, then run this again."; exit 1; }
if ! command -v xcodegen >/dev/null; then
  command -v brew >/dev/null || { echo 'Install Homebrew first:  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"'; exit 1; }
  brew install xcodegen
fi

TEAM=""; UPLOAD=0
for a in "$@"; do case "$a" in --upload) UPLOAD=1 ;; *) TEAM=$a ;; esac; done
TEAM=${TEAM:-${IOS_TEAM_ID:-$(cat .team-id 2>/dev/null || true)}}
[ -n "$TEAM" ] && echo "$TEAM" > .team-id
export IOS_TEAM_ID=$TEAM
export IOS_BUILD_NUMBER=${IOS_BUILD_NUMBER:-$(date +%y%m%d%H%M)}   # always higher than the last one
xcodegen generate --quiet
echo "==> ios/QuranMasterclass.xcodeproj ready (build $IOS_BUILD_NUMBER, team ${TEAM:-not set yet})"

if [ "$UPLOAD" = 1 ]; then
  [ -n "$TEAM" ] || { echo "The Team ID is missing: bash scripts/build-ios.sh YOURTEAMID --upload"; exit 1; }
  rm -rf build && mkdir -p build
  echo "==> Archive"
  xcodebuild -project QuranMasterclass.xcodeproj -scheme QuranMasterclass -configuration Release \
    -destination 'generic/platform=iOS' -archivePath build/QuranMasterclass.xcarchive -allowProvisioningUpdates archive | tail -5
  cat > build/ExportOptions.plist <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>method</key><string>app-store-connect</string>
  <key>destination</key><string>upload</string>
  <key>teamID</key><string>$TEAM</string>
  <key>signingStyle</key><string>automatic</string>
  <key>manageAppVersionAndBuildNumber</key><false/>
</dict></plist>
PLIST
  echo "==> Upload to App Store Connect"
  xcodebuild -exportArchive -archivePath build/QuranMasterclass.xcarchive -exportOptionsPlist build/ExportOptions.plist \
    -exportPath build/export -allowProvisioningUpdates | tail -5
  echo "Done. The build appears in App Store Connect -> TestFlight within 10-30 minutes."
else
  open QuranMasterclass.xcodeproj
  echo "In Xcode: choose your iPhone (or a simulator) at the top and press Run (Cmd+R)."
fi
