#!/bin/bash

# Kiosk Mode Launcher for TV Display (Isolated Chrome Instance)
# This script launches Chrome in a completely separate profile to ensure kiosk flags work
# Use this for dedicated TV displays in hospital environments

# TV Display URL
TV_URL="https://geraldina-queue-manager-tv.web.app"

# Create a temporary user data directory for isolated Chrome instance
USER_DATA_DIR="/tmp/chrome-kiosk-tv-display-$$"
mkdir -p "$USER_DATA_DIR"

echo "🖥️  Launching TV Display in isolated kiosk mode (macOS)..."
echo "📁 Using isolated profile: $USER_DATA_DIR"
echo ""

# Launch Chrome with isolated profile and kiosk flags
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
    --user-data-dir="$USER_DATA_DIR" \
    --kiosk \
    --autoplay-policy=no-user-gesture-required \
    --disable-infobars \
    --disable-session-crashed-bubble \
    --disable-restore-session-state \
    --start-fullscreen \
    --no-first-run \
    --disable-sync \
    --disable-translate \
    --disable-features=TranslateUI \
    --app="$TV_URL" \
    2>&1

echo ""
echo "✅ TV Display closed"
echo "🧹 Cleaning up temporary profile..."
rm -rf "$USER_DATA_DIR"
echo "✅ Cleanup complete"
