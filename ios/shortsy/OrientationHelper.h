//
//  OrientationHelper.h
//  shortsy
//
//  Wraps react-native-orientation-locker's Orientation class so that
//  AppDelegate.swift can request the current orientation mask without
//  needing a static Swift reference to the ObjC `Orientation` class.
//

#import <UIKit/UIKit.h>

/// Returns the UIInterfaceOrientationMask currently managed by
/// react-native-orientation-locker, or UIInterfaceOrientationMaskAllButUpsideDown
/// if the native module is not available.
UIInterfaceOrientationMask OrientationHelperGetSupportedInterfaceOrientations(void);
