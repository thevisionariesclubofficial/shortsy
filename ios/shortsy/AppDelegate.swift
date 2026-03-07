import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider

@main
class AppDelegate: UIResponder, UIApplicationDelegate, RNAppAuthAuthorizationFlowManager {
  var window: UIWindow?

  // Required by react-native-app-auth to hand back the OAuth redirect URL
  weak var authorizationFlowManagerDelegate: RNAppAuthAuthorizationFlowManagerDelegate?

  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    let delegate = ReactNativeDelegate()
    let factory = RCTReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory

    window = UIWindow(frame: UIScreen.main.bounds)

    factory.startReactNative(
      withModuleName: "shortsy",
      in: window,
      launchOptions: launchOptions
    )

    return true
  }

  // Handle OAuth redirect URL coming back from SFSafariViewController
  func application(
    _ app: UIApplication,
    open url: URL,
    options: [UIApplication.OpenURLOptionsKey: Any] = [:]
  ) -> Bool {
    return authorizationFlowManagerDelegate?.resumeExternalUserAgentFlow(with: url) ?? false
  }

  func application(_ application: UIApplication, supportedInterfaceOrientationsFor window: UIWindow?) -> UIInterfaceOrientationMask {
    // Delegate to ObjC helper which calls Orientation.getOrientation() from
    // react-native-orientation-locker so JS can lock orientation per-screen.
    return OrientationGetSupportedMask()
  }
}

class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
#else
    Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}
