# Fix: GoogleService-Info.plist Not Being Bundled

## Problem
Firebase is failing with: `No Firebase App '[DEFAULT]' has been created`

This means the `GoogleService-Info.plist` file exists but is NOT being included in the app bundle.

## Solution: Add Plist to Xcode Build Phases

### Step 1: Open Xcode Workspace
```bash
open /Users/adarshchaudhary/Desktop/artisthub/Shortsy-App/shortsy/ios/shortsy.xcworkspace
```

### Step 2: Add Plist to Build Phases
In Xcode:
1. **Select the project**: "shortsy" in the left sidebar
2. **Select the target**: "shortsy" (blue icon)
3. **Go to "Build Phases" tab**
4. **Open "Copy Bundle Resources"** section
5. **Click the "+" button**
6. **Find and select**: `GoogleService-Info.plist`
   - It's in: `shortsy/ios/shortsy/GoogleService-Info.plist`
7. **Click "Add"**

### Step 3: Verify It's Added
You should now see `GoogleService-Info.plist` listed under "Copy Bundle Resources"

### Step 4: Rebuild the App
```bash
cd /Users/adarshchaudhary/Desktop/artisthub/Shortsy-App/shortsy
./rebuild-ios.sh
```

## What This Does
- Copies the plist file into the app bundle
- React Native Firebase reads the plist on app startup
- Firebase initializes automatically with the credentials from the plist
- Your app can now use Firebase Cloud Messaging

## Expected Success Signs
Once fixed, you should see in console:
```
[Firebase] Firebase is ready
[notification] Requesting notification permission...
[notification] Auth status: 0 (AUTHORIZED)
[notification] FCM Token obtained: ...
===================================
YOUR DEVICE FCM TOKEN:
abc123...
===================================
```

## Troubleshooting

### Issue: Plist not showing in file browser
- Make sure you're in the correct directory: `ios/shortsy/shortsy/GoogleService-Info.plist`
- If missing, run: `ls -la ios/shortsy/shortsy/GoogleService-Info.plist`

### Issue: Still getting Firebase error after adding
- Clean Xcode build folder: `Cmd+Shift+K`
- Delete derived data: `rm -rf ~/Library/Developer/Xcode/DerivedData/shortsy*`
- Rebuild: `./rebuild-ios.sh`

### Issue: File appears but Firebase still not initializing
- Make sure the file name is exactly: `GoogleService-Info.plist`
- Check file size is not 0 bytes: `ls -lh ios/shortsy/shortsy/GoogleService-Info.plist`
- Verify it's valid XML: `file ios/shortsy/shortsy/GoogleService-Info.plist`
