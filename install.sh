#!/bin/bash
# ═══════════════════════════════════════════
#  FOREST OF NIGHTMARES — Desktop Installer
# ═══════════════════════════════════════════

GAME_DIR="$HOME/games/forest-of-nightmares"
DESKTOP_FILE="$HOME/.local/share/applications/forest-of-nightmares.desktop"
BIN_DIR="$HOME/.local/bin"
GAME_BIN="$BIN_DIR/forest-of-nightmares"

echo "🌲 Installing FOREST OF NIGHTMARES..."
echo ""

# Create directories
mkdir -p "$GAME_DIR" "$BIN_DIR" "$HOME/.local/share/applications"

# Copy game files
cp "$(dirname "$0")/index.html" "$GAME_DIR/index.html"
echo "✅ Game files installed to: $GAME_DIR"

# Create launcher script
cat > "$GAME_BIN" << 'LAUNCHER'
#!/bin/bash
BROWSER=""
for b in google-chrome-stable google-chrome chromium-browser chromium firefox xdg-open; do
    if command -v "$b" &>/dev/null; then BROWSER="$b"; break; fi
done
if [ -z "$BROWSER" ]; then
    echo "❌ No browser found! Install Chrome, Firefox, or Chromium."
    exit 1
fi
exec "$BROWSER" "$HOME/games/forest-of-nightmares/index.html" &
LAUNCHER
chmod +x "$GAME_BIN"
echo "✅ Launcher created: forest-of-nightmares (run from terminal)"

# Create .desktop file
cat > "$DESKTOP_FILE" << DESKTOP
[Desktop Entry]
Type=Application
Name=Forest of Nightmares
Comment=Horror survival game — Defeat Cartoon Cat and Siren Head
Exec=$GAME_BIN
Icon=applications-games
Terminal=false
Categories=Game;ActionGame;
Keywords=horror;game;forest;nightmares;cartoon cat;siren head;bendy;cuphead
StartupWMClass=Forest of Nightmares
DESKTOP
echo "✅ Desktop shortcut created"

# Update desktop database
update-desktop-database "$HOME/.local/share/applications/" 2>/dev/null || true

echo ""
echo "╔═══════════════════════════════════════╗"
echo "║  🌲 INSTALLATION COMPLETE! 🌲       ║"
echo "╠═══════════════════════════════════════╣"
echo "║  Launch from terminal:               ║"
echo "║    $ forest-of-nightmares            ║"
echo "║                                      ║"
echo "║  Or find in app menu:                ║"
echo "║    Applications → Games →            ║"
echo "║    Forest of Nightmares              ║"
echo "║                                      ║"
echo "║  Controls:                           ║"
echo "║    WASD = Move | SPACE = Jump        ║"
echo "║    E = Attack | ENTER = Start        ║"
echo "╚═══════════════════════════════════════╝"
