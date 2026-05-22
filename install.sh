#!/bin/bash
# ═══════════════════════════════════════════
#  FOREST OF NIGHTMARES — Desktop Installer
#  Installs as native app + CLI command
# ═══════════════════════════════════════════

set -e
GAME_DIR="$(cd "$(dirname "$0")" && pwd)"
APP_NAME="forest-of-nightmares"
DESKTOP_FILE="$HOME/.local/share/applications/${APP_NAME}.desktop"
BIN_DIR="$HOME/.local/bin"
CLI_SCRIPT="$BIN_DIR/${APP_NAME}"

echo "🌲 Installing Forest of Nightmares..."
echo "   Game directory: $GAME_DIR"

# Ensure npm dependencies
cd "$GAME_DIR"
if [ ! -d "node_modules/electron" ]; then
    echo "   Installing dependencies (one-time)..."
    npm install --silent 2>/dev/null || npm install 2>/dev/null
fi

# Ensure Electron binary is downloaded
echo "   Checking Electron..."
npx electron --version >/dev/null 2>&1 || {
    echo "   Downloading Electron (one-time, ~100MB)..."
    npx electron --version 2>/dev/null &
}

# Create bin directory
mkdir -p "$BIN_DIR"

# Create CLI launcher
cat > "$CLI_SCRIPT" << 'CLIEOF'
#!/bin/bash
GAME_DIR="__GAME_DIR__"
cd "$GAME_DIR"
exec npx electron . "$@"
CLIEOF
sed -i "s|__GAME_DIR__|$GAME_DIR|g" "$CLI_SCRIPT"
chmod +x "$CLI_SCRIPT"

# Create desktop entry
mkdir -p "$HOME/.local/share/applications"
cat > "$DESKTOP_FILE" << DESKEOF
[Desktop Entry]
Type=Application
Name=Forest of Nightmares
Comment=Ultra-Realistic Cinematic 3D Horror Survival Game
Exec=$CLI_SCRIPT
Icon=$GAME_DIR/icon.png
Terminal=false
Categories=Game;AdventureGame;ActionGame;
Keywords=game;horror;3d;survival;forest;nightmares;
StartupWMClass=forest-of-nightmares
StartupNotify=true
X-GNOME-FullName=Forest of Nightmares
DESKEOF

# Update desktop database
update-desktop-database "$HOME/.local/share/applications/" 2>/dev/null || true
xdg-desktop-menu forceupdate 2>/dev/null || true

echo ""
echo "✅ Forest of Nightmares installed!"
echo ""
echo "🎮 LAUNCH OPTIONS:"
echo "   Terminal:     forest-of-nightmares"
echo "   App Launcher: Search 'Forest of Nightmares'"
echo "   Direct:       npx electron $GAME_DIR"
echo ""
echo "📱 ALSO AVAILABLE:"
echo "   Online:  https://hunterleek.github.io/forest-of-nightmares/"
echo "   Mobile:  Install as PWA from Chrome → 'Add to Home Screen'"
echo "   APK:     bash $GAME_DIR/build-apk.sh"
echo ""
echo "🌲 Enter the forest... if you dare."
