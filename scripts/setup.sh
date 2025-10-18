#!/bin/bash

# Hospital Queue Management System - Setup Script
# This script helps set up the project for first-time use

set -e  # Exit on error

echo "================================================"
echo "Hospital Queue Management System - Setup"
echo "================================================"
echo ""

# Check Node.js version
echo "Checking Node.js version..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Error: Node.js 18 or higher is required"
    echo "Current version: $(node -v)"
    exit 1
fi
echo "✅ Node.js version: $(node -v)"
echo ""

# Check npm
echo "Checking npm..."
if ! command -v npm &> /dev/null; then
    echo "❌ Error: npm is not installed"
    exit 1
fi
echo "✅ npm version: $(npm -v)"
echo ""

# Check Firebase CLI
echo "Checking Firebase CLI..."
if ! command -v firebase &> /dev/null; then
    echo "⚠️  Firebase CLI not found"
    echo "Installing Firebase CLI globally..."
    npm install -g firebase-tools
else
    echo "✅ Firebase CLI version: $(firebase --version)"
fi
echo ""

# Install dependencies
echo "Installing dependencies..."
echo "This may take a few minutes..."
echo ""

echo "📦 Installing root dependencies..."
npm install

echo "📦 Installing Functions dependencies..."
cd functions && npm install && cd ..

echo "📦 Installing Kiosk app dependencies..."
cd apps/kiosk && npm install && cd ../..

echo "📦 Installing Patient Registration app dependencies..."
cd apps/patient-registration && npm install && cd ../..

echo "📦 Installing Receptionist Dashboard app dependencies..."
cd apps/receptionist-dashboard && npm install && cd ../..

echo "📦 Installing TV Display app dependencies..."
cd apps/tv-display && npm install && cd ../..

echo ""
echo "✅ All dependencies installed successfully!"
echo ""

# Create .env files from examples
echo "Creating .env files from examples..."

if [ ! -f "functions/.env" ]; then
    cp functions/.env.example functions/.env
    echo "✅ Created functions/.env"
fi

if [ ! -f "apps/kiosk/.env" ]; then
    cp apps/kiosk/.env.example apps/kiosk/.env
    echo "✅ Created apps/kiosk/.env"
fi

if [ ! -f "apps/patient-registration/.env" ]; then
    cp apps/patient-registration/.env.example apps/patient-registration/.env
    echo "✅ Created apps/patient-registration/.env"
fi

if [ ! -f "apps/receptionist-dashboard/.env" ]; then
    cp apps/receptionist-dashboard/.env.example apps/receptionist-dashboard/.env
    echo "✅ Created apps/receptionist-dashboard/.env"
fi

if [ ! -f "apps/tv-display/.env" ]; then
    cp apps/tv-display/.env.example apps/tv-display/.env
    echo "✅ Created apps/tv-display/.env"
fi

echo ""
echo "================================================"
echo "✅ Setup Complete!"
echo "================================================"
echo ""
echo "Next steps:"
echo ""
echo "1. Configure Firebase:"
echo "   - Update .firebaserc with your project ID"
echo "   - Update .env files with your Firebase config"
echo "   - See docs/DEPLOYMENT.md for details"
echo ""
echo "2. Start development:"
echo "   - Run: npm run emulators:start (in one terminal)"
echo "   - Run: npm run dev:kiosk (in another terminal)"
echo "   - Run: npm run dev:patient"
echo "   - Run: npm run dev:receptionist"
echo "   - Run: npm run dev:tv"
echo ""
echo "3. Read the documentation:"
echo "   - README.md - Overview"
echo "   - docs/DEPLOYMENT.md - Deployment guide"
echo "   - docs/ARCHITECTURE.md - System architecture"
echo "   - docs/PRINTER_SETUP.md - Printer configuration"
echo ""
echo "Happy coding! 🚀"
echo ""
