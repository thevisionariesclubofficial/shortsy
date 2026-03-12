#!/bin/bash

# Kill any existing Metro servers
lsof -ti:8081 | xargs kill -9 2>/dev/null || true
sleep 1

# Clear React Native cache
rm -rf ~/Library/Caches/com.facebook.ReactNativeFlipper 2>/dev/null

# Start Metro in background
echo "Starting Metro bundler..."
npm start -- --reset-cache &
METRO_PID=$!

# Wait for Metro to start
sleep 8

# Build and deploy iOS
echo "Building and deploying to iOS..."
npx react-native run-ios --device

# Kill Metro when done
kill $METRO_PID 2>/dev/null || true
