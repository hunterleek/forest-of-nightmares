#!/bin/bash
# Start the Forest of Nightmares game server on LAN
# Run this to share the game with all devices on your WiFi

PORT=8888
DIR="$HOME/games/forest-of-nightmares"
IP=$(hostname -I | awk '{print $1}')

echo "🌲 Starting Forest of Nightmares server..."
echo ""
echo "╔══════════════════════════════════════════╗"
echo "║  📡 GAME SERVER ONLINE                  ║"
echo "╠══════════════════════════════════════════╣"
echo "║                                          ║"
echo "║  From any device on your WiFi:          ║"
echo "║    http://${IP}:${PORT}                ║"
echo "║                                          ║"
echo "║  From this PC:                          ║"
echo "║    http://127.0.0.1:${PORT}            ║"
echo "║                                          ║"
echo "║  Press Ctrl+C to stop                   ║"
echo "╚══════════════════════════════════════════╝"
echo ""

cd "$DIR" && python3 -m http.server "$PORT" --bind 0.0.0.0
