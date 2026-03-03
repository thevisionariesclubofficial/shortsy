//
//  OrientationHelper.m
//  shortsy
//

#import "OrientationHelper.h"
#import <react-native-orientation-locker/Orientation.h>

UIInterfaceOrientationMask OrientationHelperGetSupportedInterfaceOrientations(void) {
#if (!TARGET_OS_TV)
    return [Orientation getOrientation];
#else
    return UIInterfaceOrientationMaskAllButUpsideDown;
#endif
}
