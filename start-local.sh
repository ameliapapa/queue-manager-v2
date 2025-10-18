#!/bin/bash

# Queue Manager V2 - Local Development Startup Script
# This script helps start all services for local development

set -e

echo "🏥 Queue Manager V2 - Local Development"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Java is installed and version
echo -e "${BLUE}Checking Java version...${NC}"
if command -v java &> /dev/null; then
    JAVA_VERSION=$(java -version 2>&1 | awk -F '"' '/version/ {print $2}' | cut -d'.' -f1)
    echo -e "${GREEN}✓ Java found${NC}"

    if [ "$JAVA_VERSION" -lt 11 ]; then
        echo -e "${RED}✗ Java 11+ required for Firebase Emulators${NC}"
        echo -e "${YELLOW}Current version: $(java -version 2>&1 | head -n 1)${NC}"
        echo ""
        echo "Please install Java 21:"
        echo "  macOS: brew install openjdk@21"
        echo "  Ubuntu: sudo apt-get install openjdk-21-jdk"
        echo ""
        echo "See FIREBASE_LOCAL_SETUP.md for detailed instructions"
        exit 1
    fi
else
    echo -e "${RED}✗ Java not found${NC}"
    echo "Please install Java 21 (see FIREBASE_LOCAL_SETUP.md)"
    exit 1
fi

# Check if Firebase CLI is installed
echo -e "${BLUE}Checking Firebase CLI...${NC}"
if command -v firebase &> /dev/null; then
    echo -e "${GREEN}✓ Firebase CLI found${NC}"
else
    echo -e "${RED}✗ Firebase CLI not found${NC}"
    echo "Installing Firebase CLI..."
    npm install -g firebase-tools
fi

echo ""
echo -e "${YELLOW}What would you like to start?${NC}"
echo "1) Firebase Emulators only"
echo "2) WebSocket Server only"
echo "3) All Frontend Apps (Kiosk + Registration + Dashboard + TV)"
echo "4) Everything (Emulators + WebSocket + All Apps)"
echo "5) Exit"
echo ""
read -p "Enter choice [1-5]: " choice

case $choice in
    1)
        echo -e "${BLUE}Starting Firebase Emulators...${NC}"
        firebase emulators:start --only firestore,auth
        ;;
    2)
        echo -e "${BLUE}Starting WebSocket Server...${NC}"
        cd apps/websocket-server && npm run dev
        ;;
    3)
        echo -e "${BLUE}Starting all frontend apps...${NC}"
        echo -e "${YELLOW}Note: Each app will start in its default port${NC}"
        echo ""

        # Use tmux if available, otherwise warn
        if command -v tmux &> /dev/null; then
            tmux new-session -d -s queue-manager
            tmux send-keys -t queue-manager 'cd apps/kiosk && npm run dev' C-m
            tmux split-window -t queue-manager
            tmux send-keys -t queue-manager 'cd apps/patient-registration && npm run dev' C-m
            tmux split-window -t queue-manager
            tmux send-keys -t queue-manager 'cd apps/dashboard && npm run dev' C-m
            tmux split-window -t queue-manager
            tmux send-keys -t queue-manager 'cd apps/tv-display && npm run dev' C-m
            tmux attach -t queue-manager
        else
            echo -e "${YELLOW}tmux not found. Please start each app manually:${NC}"
            echo "  Terminal 1: cd apps/kiosk && npm run dev"
            echo "  Terminal 2: cd apps/patient-registration && npm run dev"
            echo "  Terminal 3: cd apps/dashboard && npm run dev"
            echo "  Terminal 4: cd apps/tv-display && npm run dev"
        fi
        ;;
    4)
        echo -e "${BLUE}Starting everything...${NC}"
        echo -e "${YELLOW}This requires multiple terminals or tmux${NC}"
        echo ""

        if command -v tmux &> /dev/null; then
            tmux new-session -d -s queue-manager

            # Firebase Emulators
            tmux send-keys -t queue-manager 'firebase emulators:start --only firestore,auth' C-m

            # WebSocket Server
            tmux split-window -t queue-manager
            tmux send-keys -t queue-manager 'cd apps/websocket-server && npm run dev' C-m

            # Kiosk
            tmux split-window -t queue-manager
            tmux send-keys -t queue-manager 'cd apps/kiosk && npm run dev' C-m

            # Patient Registration
            tmux split-window -t queue-manager
            tmux send-keys -t queue-manager 'cd apps/patient-registration && npm run dev' C-m

            # Dashboard
            tmux split-window -t queue-manager
            tmux send-keys -t queue-manager 'cd apps/dashboard && npm run dev' C-m

            # TV Display
            tmux split-window -t queue-manager
            tmux send-keys -t queue-manager 'cd apps/tv-display && npm run dev' C-m

            tmux select-layout -t queue-manager tiled
            tmux attach -t queue-manager
        else
            echo -e "${YELLOW}tmux not found. Starting services in background...${NC}"
            echo ""

            # Start Firebase Emulators
            echo "Starting Firebase Emulators..."
            firebase emulators:start --only firestore,auth > logs/emulators.log 2>&1 &
            EMULATORS_PID=$!

            # Wait for emulators
            sleep 5

            # Start WebSocket Server
            echo "Starting WebSocket Server..."
            cd apps/websocket-server && npm run dev > ../../logs/websocket.log 2>&1 &
            cd ../..

            # Start Apps
            echo "Starting Kiosk..."
            cd apps/kiosk && npm run dev > ../../logs/kiosk.log 2>&1 &
            cd ../..

            echo "Starting Patient Registration..."
            cd apps/patient-registration && npm run dev > ../../logs/registration.log 2>&1 &
            cd ../..

            echo "Starting Dashboard..."
            cd apps/dashboard && npm run dev > ../../logs/dashboard.log 2>&1 &
            cd ../..

            echo "Starting TV Display..."
            cd apps/tv-display && npm run dev > ../../logs/tv-display.log 2>&1 &
            cd ../..

            echo ""
            echo -e "${GREEN}✓ All services started in background${NC}"
            echo ""
            echo "Access the apps at:"
            echo "  Kiosk:                http://localhost:3001"
            echo "  Patient Registration: http://localhost:3002"
            echo "  Dashboard:            http://localhost:3003"
            echo "  TV Display:           http://localhost:3004"
            echo "  Firebase Emulator UI: http://localhost:4000"
            echo ""
            echo "Logs are in the ./logs directory"
            echo "To stop all services: pkill -f 'firebase emulators' && pkill -f 'npm run dev'"
        fi
        ;;
    5)
        echo "Exiting..."
        exit 0
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac
