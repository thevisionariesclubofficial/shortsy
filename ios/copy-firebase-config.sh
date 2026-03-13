#!/bin/bash
# Build phase script to copy GoogleService-Info.plist to the app bundle
# This script should be added to Xcode as a "Copy Files" build phase

PLIST_SOURCE="${SRCROOT}/shortsy/GoogleService-Info.plist"
PLIST_DEST="${BUILT_PRODUCTS_DIR}/${EXECUTABLE_FOLDER_PATH}/GoogleService-Info.plist"

if [ -f "$PLIST_SOURCE" ]; then
    echo "Copying GoogleService-Info.plist to app bundle..."
    cp -v "$PLIST_SOURCE" "$PLIST_DEST"
    echo "✓ GoogleService-Info.plist copied successfully"
else
    echo "⚠️  GoogleService-Info.plist not found at $PLIST_SOURCE"
    echo "Make sure GoogleService-Info.plist is in the shortsy folder"
fi
