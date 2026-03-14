#!/bin/bash
# Add GoogleService-Info.plist to Xcode build using xcodebuild

TARGET_PROJECT="ios/shortsy.xcodeproj"
PLIST_FILE="ios/shortsy/GoogleService-Info.plist"
TARGET_NAME="shortsy"

if [ ! -f "$PLIST_FILE" ]; then
    echo "Error: $PLIST_FILE not found"
    exit 1
fi

echo "Adding $PLIST_FILE to Xcode project $TARGET_PROJECT..."

# Try using xcodebuild's file reference approach through a build phase
# This is a workaround since we can't easily add files via command line

# For now, we'll document the manual step needed
echo ""
echo "⚠️  To properly add GoogleService-Info.plist to Xcode:"
echo "1. Open $TARGET_PROJECT in Xcode"
echo "2. Select target '$TARGET_NAME'"
echo "3. Go to Build Phases tab"
echo "4. In 'Copy Bundle Resources', add GoogleService-Info.plist"
echo ""
echo "Alternatively, you can open: open '$TARGET_PROJECT'"
echo ""

# Try to open Xcode
if command -v open &> /dev/null; then
    echo "Opening Xcode workspace..."
    open ios/shortsy.xcworkspace
fi
