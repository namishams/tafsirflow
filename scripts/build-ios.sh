#!/usr/bin/env bash
# The iOS app of Quran Masterclass – runs on a Mac with Xcode (not on the server).
#   bash scripts/build-ios.sh                    opens the project in Xcode (same as double-clicking ios/QuranMasterclass.xcodeproj)
#   bash scripts/build-ios.sh TEAMID --upload    builds and uploads a new version to App Store Connect (TestFlight)
# TEAMID: developer.apple.com/account -> Membership details -> Team ID (remembered in ios/.team-id after the first run)
set -euo pipefail
cd "$(dirname "$0")/../ios"
[ "$(uname)" = Darwin ] || { echo "This script runs on a Mac with Xcode."; exit 1; }
command -v xcodebuild >/dev/null && xcodebuild -version >/dev/null 2>&1 || { echo "Install Xcode from the Mac App Store, open it once, then run this again."; exit 1; }

TEAM=""; UPLOAD=0
for a in "$@"; do case "$a" in --upload) UPLOAD=1 ;; *) TEAM=$a ;; esac; done
TEAM=${TEAM:-${IOS_TEAM_ID:-$(cat .team-id 2>/dev/null || true)}}
[ -n "$TEAM" ] && echo "$TEAM" > .team-id

if [ "$UPLOAD" != 1 ]; then
  open QuranMasterclass.xcodeproj
  echo "In Xcode: Signing & Capabilities -> choose your Team, pick your iPhone or a simulator at the top, press Run (Cmd+R)."
  exit 0
fi

[ -n "$TEAM" ] || { echo "The Team ID is missing: bash scripts/build-ios.sh YOURTEAMID --upload"; exit 1; }
BUILD=$(date +%y%m%d%H%M)   # always higher than the last upload
rm -rf build && mkdir -p build
echo "==> Archive (build $BUILD)"
xcodebuild -project QuranMasterclass.xcodeproj -scheme QuranMasterclass -configuration Release \
  -destination 'generic/platform=iOS' -archivePath build/QuranMasterclass.xcarchive -allowProvisioningUpdates \
  DEVELOPMENT_TEAM="$TEAM" CURRENT_PROJECT_VERSION="$BUILD" archive | tail -5
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
