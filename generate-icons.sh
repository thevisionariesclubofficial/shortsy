#!/bin/bash

SOURCE_IMAGE="src/assets/logo.png"

# Android icons
echo "Generating Android icons..."
mkdir -p android/app/src/main/res/mipmap-mdpi
mkdir -p android/app/src/main/res/mipmap-hdpi
mkdir -p android/app/src/main/res/mipmap-xhdpi
mkdir -p android/app/src/main/res/mipmap-xxhdpi
mkdir -p android/app/src/main/res/mipmap-xxxhdpi

sips -z 48 48 "$SOURCE_IMAGE" --out android/app/src/main/res/mipmap-mdpi/ic_launcher.png
sips -z 72 72 "$SOURCE_IMAGE" --out android/app/src/main/res/mipmap-hdpi/ic_launcher.png
sips -z 96 96 "$SOURCE_IMAGE" --out android/app/src/main/res/mipmap-xhdpi/ic_launcher.png
sips -z 144 144 "$SOURCE_IMAGE" --out android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png
sips -z 192 192 "$SOURCE_IMAGE" --out android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png

# Round icons
sips -z 48 48 "$SOURCE_IMAGE" --out android/app/src/main/res/mipmap-mdpi/ic_launcher_round.png
sips -z 72 72 "$SOURCE_IMAGE" --out android/app/src/main/res/mipmap-hdpi/ic_launcher_round.png
sips -z 96 96 "$SOURCE_IMAGE" --out android/app/src/main/res/mipmap-xhdpi/ic_launcher_round.png
sips -z 144 144 "$SOURCE_IMAGE" --out android/app/src/main/res/mipmap-xxhdpi/ic_launcher_round.png
sips -z 192 192 "$SOURCE_IMAGE" --out android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.png

# iOS icons
echo "Generating iOS icons..."
mkdir -p ios/shortsy/Images.xcassets/AppIcon.appiconset

sips -z 40 40 "$SOURCE_IMAGE" --out ios/shortsy/Images.xcassets/AppIcon.appiconset/AppIcon-20x20@2x.png
sips -z 60 60 "$SOURCE_IMAGE" --out ios/shortsy/Images.xcassets/AppIcon.appiconset/AppIcon-20x20@3x.png
sips -z 58 58 "$SOURCE_IMAGE" --out ios/shortsy/Images.xcassets/AppIcon.appiconset/AppIcon-29x29@2x.png
sips -z 87 87 "$SOURCE_IMAGE" --out ios/shortsy/Images.xcassets/AppIcon.appiconset/AppIcon-29x29@3x.png
sips -z 80 80 "$SOURCE_IMAGE" --out ios/shortsy/Images.xcassets/AppIcon.appiconset/AppIcon-40x40@2x.png
sips -z 120 120 "$SOURCE_IMAGE" --out ios/shortsy/Images.xcassets/AppIcon.appiconset/AppIcon-40x40@3x.png
sips -z 120 120 "$SOURCE_IMAGE" --out ios/shortsy/Images.xcassets/AppIcon.appiconset/AppIcon-60x60@2x.png
sips -z 180 180 "$SOURCE_IMAGE" --out ios/shortsy/Images.xcassets/AppIcon.appiconset/AppIcon-60x60@3x.png
sips -z 1024 1024 "$SOURCE_IMAGE" --out ios/shortsy/Images.xcassets/AppIcon.appiconset/AppIcon-1024x1024@1x.png

echo "✅ Icons generated successfully!"
echo "Android icons: android/app/src/main/res/mipmap-*/ic_launcher.png"
echo "iOS icons: ios/shortsy/Images.xcassets/AppIcon.appiconset/"
