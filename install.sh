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

# Ensure npm dependencies are installed
cd "$GAME_DIR"
if [ ! -d "node_modules/electron" ]; then
    echo "   Installing Electron..."
    npm install --silent 2>/dev/null
fi

# Create bin directory
mkdir -p "$BIN_DIR"

# Create CLI launcher script
cat > "$CLI_SCRIPT" << 'CLIEOF'
#!/bin/bash
GAME_DIR="GAME_DIR_PLACEHOLDER"
cd "$GAME_DIR"
npx electron . "$@"
CLIEOF
sed -i "s|GAME_DIR_PLACEHOLDER|$GAME_DIR|" "$CLI_SCRIPT"
chmod +x "$CLI_SCRIPT"

# Create desktop entry
mkdir -p "$HOME/.local/share/applications"
cat > "$DESKTOP_FILE" << DESKEOF
[Desktop Entry]
Type=Application
Name=Forest of Nightmares
Comment=Cinematic 3D Horror Survival Game
Exec=$CLI_SCRIPT
Icon=$GAME_DIR/icon.png
Terminal=false
Categories=Game;AdventureGame;
Keywords=game;horror;3d;survival;forest;
StartupWMClass=forest-of-nightmares
DESKEOF

# Update desktop database
update-desktop-database "$HOME/.local/share/applications/" 2>/dev/null || true

echo ""
echo "✅ Forest of Nightmares installed successfully!"
echo ""
echo "🎮 WAYS TO LAUNCH:"
echo "   Terminal:    $ forest-of-nightmares"
echo "   App menu:    Search 'Forest of Nightmares' in your app launcher"
echo "   Manual:      $ npx electron $GAME_DIR"
echo ""
echo "🌲 The forest awaits..."
