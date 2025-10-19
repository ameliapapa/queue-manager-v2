#!/bin/bash

echo "🚀 Deploying Queue Manager - Fix for Blank Screens"
echo "=================================================="
echo ""

# Step 1: Deploy Firestore rules first
echo "📋 Step 1: Deploying Firestore rules and indexes..."
firebase deploy --only firestore:rules,firestore:indexes
if [ $? -ne 0 ]; then
  echo "❌ Failed to deploy Firestore rules"
  exit 1
fi
echo "✅ Firestore rules deployed"
echo ""

# Step 2: Build all apps (frontend only, skip functions)
echo "🔨 Step 2: Building all frontend apps..."
npm run build:kiosk && npm run build:patient && npm run build:receptionist && npm run build:tv
if [ $? -ne 0 ]; then
  echo "❌ Build failed"
  exit 1
fi
echo "✅ Build complete"
echo ""

# Step 3: Deploy all hosting sites
echo "🌐 Step 3: Deploying to Firebase Hosting..."
firebase deploy --only hosting
if [ $? -ne 0 ]; then
  echo "❌ Deployment failed"
  exit 1
fi
echo "✅ Hosting deployed"
echo ""

echo "✨ Deployment complete!"
echo ""
echo "Your apps should now be live at:"
echo "- Kiosk: https://geraldina-queue-manager-kiosk.web.app"
echo "- Patient Registration: https://geraldina-queue-manager-patient.web.app"
echo "- Dashboard: https://geraldina-queue-manager-receptionist.web.app"
echo "- TV Display: https://geraldina-queue-manager-tv.web.app"
echo ""
echo "Next steps:"
echo "1. Open each app in your browser"
echo "2. Press F12 to open Developer Tools"
echo "3. Check the Console tab for Firebase initialization logs"
echo "4. Look for the '✅ Firestore initialized' message"
echo ""
