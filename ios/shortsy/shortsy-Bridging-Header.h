//
//  shortsy-Bridging-Header.h
//  shortsy
//

#import <React/RCTBridgeModule.h>
#import <React/RCTViewManager.h>
// Expose orientation-locker's getOrientation() to Swift via pure ObjC-runtime
// lookup — avoids module/header import issues entirely.
#import <UIKit/UIKit.h>
#import <objc/runtime.h>
#import <objc/message.h>

static inline UIInterfaceOrientationMask OrientationGetSupportedMask(void) {
#if TARGET_OS_TV
    return UIInterfaceOrientationMaskAll;
#else
    Class cls = objc_lookUpClass("Orientation");
    if (!cls) { return UIInterfaceOrientationMaskAllButUpsideDown; }
    SEL sel = sel_registerName("getOrientation");
    typedef UIInterfaceOrientationMask (*GetOrientationFn)(id, SEL);
    GetOrientationFn fn = (GetOrientationFn)(void *)objc_msgSend;
    return fn((id)cls, sel);
#endif
}
