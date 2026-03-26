#!/usr/bin/env bash
# setup-android-env.sh
#
# Run this script once per Replit session to rebuild the Android SDK at
# /home/runner/android-sdk and export ANDROID_HOME / PATH.
#
# Usage (from any directory):
#   source BiteOverlay/setup-android-env.sh
#
# After sourcing, you can run:
#   cd BiteOverlay && npm run android
#   adb devices

set -e

ANDROID_HOME=/home/runner/android-sdk
CMDLINE_TOOLS_ZIP=/tmp/cmdline-tools.zip
CMDLINE_TOOLS_URL="https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip"

# ── 1. Download and extract cmdline-tools if missing ────────────────────────
if [ ! -f "$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager" ]; then
  echo "[setup] Downloading Android cmdline-tools..."
  mkdir -p "$ANDROID_HOME/cmdline-tools"
  curl -s -o "$CMDLINE_TOOLS_ZIP" "$CMDLINE_TOOLS_URL"
  unzip -q "$CMDLINE_TOOLS_ZIP" -d /tmp/ct-extract
  mv /tmp/ct-extract/cmdline-tools "$ANDROID_HOME/cmdline-tools/latest"
  rm -rf /tmp/ct-extract "$CMDLINE_TOOLS_ZIP"
  echo "[setup] cmdline-tools installed."
else
  echo "[setup] cmdline-tools already present."
fi

# ── 2. Export environment variables ─────────────────────────────────────────
export ANDROID_HOME="$ANDROID_HOME"
export ANDROID_SDK_ROOT="$ANDROID_HOME"
export JAVA_HOME
JAVA_HOME=$(dirname "$(dirname "$(readlink -f "$(which java)")")")
export PATH="$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$JAVA_HOME/bin:$PATH"

echo "[setup] ANDROID_HOME=$ANDROID_HOME"
echo "[setup] JAVA_HOME=$JAVA_HOME"

# ── 3. Accept licenses ───────────────────────────────────────────────────────
yes | sdkmanager --licenses > /dev/null 2>&1
echo "[setup] SDK licenses accepted."

# ── 4. Install platform-tools, build-tools, emulator if missing ─────────────
if [ ! -f "$ANDROID_HOME/platform-tools/adb" ]; then
  echo "[setup] Installing platform-tools, build-tools;34.0.0, emulator..."
  sdkmanager "platform-tools" "build-tools;34.0.0" "emulator" > /dev/null 2>&1
  echo "[setup] SDK packages installed."
else
  echo "[setup] platform-tools already present."
fi

# ── 5. Write local.properties for Gradle ────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOCAL_PROPS="$SCRIPT_DIR/android/local.properties"
echo "sdk.dir=$ANDROID_HOME" > "$LOCAL_PROPS"
echo "[setup] local.properties written → $LOCAL_PROPS"

# ── 6. Ensure gradlew is executable ─────────────────────────────────────────
chmod +x "$SCRIPT_DIR/android/gradlew"
echo "[setup] gradlew marked executable."

echo ""
echo "✓ Android environment ready."
echo "  adb:  $(which adb)"
echo "  java: $(java -version 2>&1 | head -1)"
