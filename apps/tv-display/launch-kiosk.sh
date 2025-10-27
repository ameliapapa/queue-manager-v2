#!/bin/bash

# Kiosk Mode Launcher for TV Display
# This script launches Chrome in kiosk mode with autoplay enabled
# Use this for dedicated TV displays in hospital environments

# TV Display URL
TV_URL="https://geraldina-queue-manager-tv.web.app"

# Detect OS and launch appropriate browser
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    echo "🖥️  Launching TV Display in kiosk mode (macOS)..."
    /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
        --kiosk \
        --autoplay-policy=no-user-gesture-required \
        --disable-infobars \
        --disable-session-crashed-bubble \
        --disable-restore-session-state \
        --start-fullscreen \
        --app="$TV_URL"

elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux (Raspberry Pi, Ubuntu, Debian, etc.)
    echo "🖥️  Launching TV Display in kiosk mode (Linux)..."

    # Try Chromium first (common on Raspberry Pi)
    if command -v chromium-browser &> /dev/null; then
        chromium-browser \
            --kiosk \
            --autoplay-policy=no-user-gesture-required \
            --disable-infobars \
            --disable-session-crashed-bubble \
            --disable-restore-session-state \
            --start-fullscreen \
            --noerrdialogs \
            --disable-translate \
            --no-first-run \
            --fast \
            --fast-start \
            --disable-features=TranslateUI \
            --disk-cache-dir=/dev/null \
            --password-store=basic \
            "$TV_URL"

    # Try Google Chrome
    elif command -v google-chrome &> /dev/null; then
        google-chrome \
            --kiosk \
            --autoplay-policy=no-user-gesture-required \
            --disable-infobars \
            --disable-session-crashed-bubble \
            --disable-restore-session-state \
            --start-fullscreen \
            --noerrdialogs \
            --disable-translate \
            --no-first-run \
            --fast \
            --fast-start \
            --disable-features=TranslateUI \
            --disk-cache-dir=/dev/null \
            --password-store=basic \
            "$TV_URL"

    else
        echo "❌ Error: Neither chromium-browser nor google-chrome found"
        echo "Please install Chromium or Google Chrome:"
        echo "  sudo apt-get install chromium-browser"
        exit 1
    fi

elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
    # Windows
    echo "🖥️  Launching TV Display in kiosk mode (Windows)..."
    "C:\Program Files\Google\Chrome\Application\chrome.exe" \
        --kiosk \
        --autoplay-policy=no-user-gesture-required \
        --disable-infobars \
        --disable-session-crashed-bubble \
        --disable-restore-session-state \
        --start-fullscreen \
        "$TV_URL"

else
    echo "❌ Unsupported operating system: $OSTYPE"
    exit 1
fi

echo "✅ TV Display launched in kiosk mode"
echo "🔊 Sound notifications will play automatically"
echo "📺 Press Alt+F4 (Windows/Linux) or Cmd+Q (macOS) to exit"
