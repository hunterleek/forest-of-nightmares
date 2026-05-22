#!/bin/bash
# ═══════════════════════════════════════════
#  BUILD ANDROID APK FOR FOREST OF NIGHTMARES
#  Requires: Node.js, Android SDK, Java 17+
# ═══════════════════════════════════════════

set -e
GAME_DIR="$(cd "$(dirname "$0")" && pwd)"
BUILD_DIR="$GAME_DIR/android-build"

echo "📱 Building Forest of Nightmares APK..."
echo ""

# Step 1: Install Capacitor
echo "[1/5] Installing Capacitor..."
cd "$GAME_DIR"
npm install @capacitor/core @capacitor/cli @capacitor/android --save-dev 2>/dev/null

# Step 2: Initialize Capacitor
echo "[2/5] Initializing Capacitor project..."
npx cap init ForestOfNightmares com.forestofnightmares.game --web-dir=. 2>/dev/null || true

# Step 3: Add Android platform
echo "[3/5] Adding Android platform..."
npx cap add android 2>/dev/null || true

# Step 4: Copy assets to Android project
echo "[4/5] Syncing web assets..."
npx cap sync android

# Step 5: Build the APK
echo "[5/5] Building APK..."
cd "$GAME_DIR/android"
./gradlew assembleDebug 2>/dev/null || {
    echo ""
    echo "⚠️  Android SDK not found or gradle build failed."
    echo "   Make sure Android Studio and SDK are installed."
    echo ""
    echo "   To build manually:"
    echo "   1. Open android/ folder in Android Studio"
    echo "   2. Wait for Gradle sync"
    echo "   3. Build → Build Bundle(s) / APK(s) → Build APK(s)"
    echo "   4. Find APK in: android/app/build/outputs/apk/debug/"
    echo ""
}

# Check for APK
APK_PATH="$GAME_DIR/android/app/build/outputs/apk/debug/app-debug.apk"
if [ -f "$APK_PATH" ]; then
    cp "$APK_PATH" "$GAME_DIR/forest-of-nightmares.apk"
    echo ""
    echo "✅ APK built successfully!"
    echo "   📱 $GAME_DIR/forest-of-nightmares.apk"
    echo "   Transfer to your Android device and install!"
else
    echo ""
    echo "📦 ALTERNATIVE: Online APK Builder"
    echo "   Upload index.html + threejs/ to:"
    echo "   • https://www.pwabuilder.com/"
    echo "   • https://gonative.io/"
    echo "   • https://webintoapp.com/"
fi
