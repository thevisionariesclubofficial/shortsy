/**
 * Shortsy App — Root Component
 *
 * Intentionally thin: all state and business logic lives in `useAppState`.
 * This component is responsible only for mapping screen state → UI.
 */
import React, { useEffect, useRef, useState } from 'react';
import { Linking, StatusBar, StyleSheet, View, Modal, Text, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BottomNav } from '../components/BottomNav';
import { RentalModal } from '../components/RentalModal';
import { useAppState } from '../hooks/useAppState';
import { AboutScreen } from '../screens/AboutScreen';
import { BrowsePage } from '../screens/BrowsePage';
import { ContactUsScreen } from '../screens/ContactUsScreen';
import { ContentDetailScreen } from '../screens/ContentDetailScreen';
import { CookiePolicyScreen } from '../screens/CookiePolicyScreen';
import { FAQScreen } from '../screens/FAQScreen';
import { ForgotPasswordScreen } from '../screens/ForgotPasswordScreen';
import { HelpCenterScreen } from '../screens/HelpCenterScreen';
import { HistoryScreen } from '../screens/HistoryScreen';
import { HomePage } from '../screens/HomePage';
import { LoginScreen } from '../screens/LoginScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { PaymentScreen } from '../screens/PaymentScreen';
import { PaymentHistoryScreen } from '../screens/PaymentHistoryScreen';
import { PaymentSuccessScreen } from '../screens/PaymentSuccessScreen';
import { PlayerScreen } from '../screens/PlayerScreen';
import { PremiumPaymentScreen } from '../screens/PremiumPaymentScreen';
import { PrivacyPolicyScreen } from '../screens/PrivacyPolicyScreen';
import { ProfilePage } from '../screens/ProfilePage';
import { SearchScreen } from '../screens/SearchScreen';
import { SignupScreen } from '../screens/SignupScreen';
import { OtpScreen } from '../screens/OtpScreen';
import { SplashScreen } from '../screens/SplashScreen';
import { TermsScreen } from '../screens/TermsScreen';
import { WelcomeChoice } from '../screens/WelcomeChoice';
import { resolveWatchNowScreen } from '../services/navigationService';
import { COLORS } from '../constants/colors';
import { BrowseDetailScreen } from '../screens/BrowseDetailScreen';
import { registerDevice } from '../services/notificationService';
import { initializeFirebase, isFirebaseInitialized } from '../services/firebaseService';
import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, AndroidStyle } from '@notifee/react-native';

function App() {
  const {
    screen,
    rentedContent,
    rentalMetadata,
    isPremium,
    premiumSubscription,
    user,
    paymentHistory,
    progressMap,
    showRentalModal,
    showExpiredModal,
    expiredMessage,
    needsAuth,
    showNav,
    activeTab,
    isRented,
    getProgress,
    updateProgress,
    onPremiumWatch,
    navigate,
    onSplashComplete,
    onOnboardingComplete,
    onLogin,
    onLogout,
    onSignup,
    onOtpVerified,
    onGoogleSignIn,
    onContentClick,
    onRentedClick,
    onRent,
    onEpisodePlay,
    onPaymentSuccess,
    onTabChange,
    onRentalModalClose,
    onRentalModalConfirm,
    onExpiredModalClose,
    onHistoryClick,
    onPaymentHistoryClick,
    onRefreshRentals,
    onRefreshPremium,
    onRefreshPaymentHistory,
    favorites,
    onToggleFavorite,
    hero,
    featuredContent,
    allContent,
    festivalWinners,
    verticalSeries,
    genreList,
    languageList,
    homeLoading,
    onRefreshContent,
  } = useAppState();

  // ── Deep link handler ─────────────────────────────────────────────────────
  // State (not ref) so that the flush effect re-runs whenever either
  // the ID arrives OR the screen type changes — whichever happens last.
  const [pendingDeepLinkId, setPendingDeepLinkId] = useState<string | null>(null);

  const getFCMToken = async () => {
    try {
      console.log('[FCM] Fetching FCM token...');
      
      // Initialize Firebase first
      const firebaseReady = await initializeFirebase();
      
      if (!firebaseReady) {
        console.log('[FCM] ❌ Firebase not available - FCM tokens will not be available');
        return;
      }
      
      console.log('[FCM] ✅ Firebase initialized');
      
      // Request permissions (especially for iOS and Android 13+)
      console.log('[FCM] Requesting notification permissions...');
      const authStatus = await messaging().requestPermission();
      console.log('[FCM] Auth status:', authStatus);
      
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('[FCM] ✅ Authorization granted (status:', authStatus, ')');
        
        // Get the token
        console.log('[FCM] Retrieving token...');
        const token = await messaging().getToken();
        console.log('[FCM] ✅ FCM Token acquired:', token);
        console.log('[FCM] Token length:', token?.length, 'chars');
        
        // You should save this token to your backend database
        // along with the user's ID for later use
      } else {
        console.log('[FCM] ❌ User denied notification permissions (status:', authStatus, ')');
      }

    } catch (error) {
      console.log('[FCM] ❌ Error getting FCM token:', error);
      console.log('[FCM] Error type:', typeof error);
      console.log('[FCM] Error message:', (error as any)?.message);
    }
  };

  // ── Display local notification (for foreground messages) ─────────────────────
  const displayLocalNotification = async (title?: string, body?: string, data?: any) => {
    try {
      console.log('[Notifee] Displaying local notification');
      console.log('[Notifee] Title:', title);
      console.log('[Notifee] Body:', body);
      console.log('[Notifee] Data:', data);

      // Extract image URL from all possible locations
      let imageUrl: string | undefined = undefined;
      if (data?.image) {
        imageUrl = data.image;
      } else if (data?.imageUrl) {
        imageUrl = data.imageUrl;
      }

      // Create Android channel (required for API 26+)
      if (Platform.OS === 'android') {
        try {
          await notifee.createChannel({
            id: 'shortsy-notifications',
            name: 'Shortsy Notifications',
            lightColor: '#FF6B00', // Shortsy orange
            vibration: true,
            lights: true,
            importance: AndroidImportance.HIGH,
          });
          console.log('[Notifee] ✅ Channel created');
        } catch (channelError) {
          console.log('[Notifee] Channel may already exist:', (channelError as any)?.message);
        }
      }

      // Display the notification with optional image banner
      await notifee.displayNotification({
        title: title || 'Shortsy',
        body: body || 'You have a new notification',
        data: data,
        android: {
          channelId: 'shortsy-notifications',
          color: '#FF6B00', // Shortsy orange
          lightUpScreen: true,
          pressAction: {
            id: 'default',
          },
          ...(imageUrl ? { style: { type: AndroidStyle.BIGPICTURE, picture: imageUrl } } : {}),
        },
        ios: {
          sound: 'default',
          ...(imageUrl ? { attachments: [{ url: imageUrl }] } : {}),
        },
      });

      console.log('[Notifee] ✅ Notification displayed');
    } catch (error) {
      console.log('[Notifee] ❌ Error displaying notification:', error);
      console.log('[Notifee] Error message:', (error as any)?.message);
    }
  };

  const handleTestNotification = async () => {
    console.log('[Notifee] Triggering test notification from button');
    await displayLocalNotification('Test Notification', 'This is a test from the button.', { debug: 'true' });
  };

  useEffect(() => {
    const unsubscribers: Array<() => void> = [];
    
    const setupMessaging = async () => {
      try {
        console.log('[FCM] Starting messaging setup...');
        const firebaseReady = await initializeFirebase();
        
        if (!firebaseReady) {
          console.log('[FCM] ❌ Firebase not ready - skipping messaging setup');
          return;
        }
        
        console.log('[FCM] ✅ Firebase ready');

        // Handle foreground messages (app in focus)
        console.log('[FCM] Setting up onMessage listener...');
        const unsubscribeMsg = messaging().onMessage(async remoteMessage => {
          console.log('[FCM] 💬 Foreground message received:', JSON.stringify(remoteMessage, null, 2));
          console.log('[FCM] Title:', remoteMessage.notification?.title);
          console.log('[FCM] Body:', remoteMessage.notification?.body);
          console.log('[FCM] Data:', remoteMessage.data);

          // Merge imageUrl from notification.android.imageUrl or notification.imageUrl into data
          let mergedData = { ...remoteMessage.data };
          let imageUrl: string | undefined = undefined;
          if (remoteMessage.notification?.android?.imageUrl) {
            imageUrl = remoteMessage.notification.android.imageUrl;
          } else if ((remoteMessage.notification as any)?.imageUrl) {
            imageUrl = (remoteMessage.notification as any).imageUrl;
          }
          if (imageUrl) {
            mergedData.image = imageUrl;
          }

          // Display the notification to the user
          const title = remoteMessage.notification?.title || 'Shortsy';
          const body = remoteMessage.notification?.body || 'New notification';
          await displayLocalNotification(title, body, mergedData);
        });
        unsubscribers.push(unsubscribeMsg);

        // Handle background messages (app killed or backgrounded)
        console.log('[FCM] Setting up setBackgroundMessageHandler...');
        messaging().setBackgroundMessageHandler(async remoteMessage => {
          console.log('[FCM] 🔔 Background message received:', JSON.stringify(remoteMessage, null, 2));
          console.log('[FCM] Title:', remoteMessage.notification?.title);
          console.log('[FCM] Body:', remoteMessage.notification?.body);
          console.log('[FCM] Data:', remoteMessage.data);
          
          // Display the notification (will be shown by system if app is backgrounded)
          // But we also display it locally for consistency
          const title = remoteMessage.notification?.title || 'Shortsy';
          const body = remoteMessage.notification?.body || 'New notification';
          await displayLocalNotification(title, body, remoteMessage.data);
        });

        // Listen for token refreshes
        console.log('[FCM] Setting up onTokenRefresh listener...');
        const unsubscribeToken = messaging().onTokenRefresh(newToken => {
          console.log('[FCM] 🔄 Token Refreshed:', newToken);
        });
        unsubscribers.push(unsubscribeToken);

        console.log('[FCM] ✅ All messaging handlers registered');
      } catch (error) {
        console.log('[FCM] ❌ Error setting up messaging:', error);
      }
    };

    setupMessaging();
    getFCMToken();

    return () => {
      console.log('[FCM] Cleaning up messaging subscriptions');
      unsubscribers.forEach(unsub => unsub());
    };
  }, []);

  useEffect(() => {
    const extractId = (url: string): string | null => {
      const match = url.match(/shortsy:\/\/content\/([^/?#]+)/);
      return match ? match[1] : null;
    };

    // Cold-start: app opened from the link
    Linking.getInitialURL().then(url => {
      if (url) {
        const id = extractId(url);
        if (id) { setPendingDeepLinkId(id); }
      }
    });

    // Warm-start: app already running, link tapped again
    const sub = Linking.addEventListener('url', ({ url }) => {
      const id = extractId(url);
      if (id) { setPendingDeepLinkId(id); }
    });
    return () => sub.remove();
  }, []);

  // Flush when BOTH conditions are true — whichever arrives last triggers this
  useEffect(() => {
    if (!pendingDeepLinkId) { return; }
    if (screen.type !== 'home' && screen.type !== 'browse' && screen.type !== 'profile') { return; }

    const id = pendingDeepLinkId;
    setPendingDeepLinkId(null);
    import('../services/contentService').then(({ getContentDetail }) =>
      getContentDetail(id)
        .then(content => navigate({ type: 'detail', content }))
        .catch(() => {}),
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingDeepLinkId, screen.type]);

  // ── Auth guard ────────────────────────────────────────────────────────────
  if (needsAuth) {
    return (
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <LoginScreen
          onLogin={onLogin}
          onSignup={() => navigate({ type: 'signup' })}
          onForgotPassword={() => navigate({ type: 'forgotPassword' })}
          onBack={() => navigate({ type: 'welcome' })}
          onGoogleSignIn={onGoogleSignIn}
        />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      {/* ── Pre-auth ── */}
      {screen.type === 'splash' && (
        <SplashScreen onComplete={onSplashComplete} />
      )}
      {screen.type === 'onboarding' && (
        <OnboardingScreen onComplete={onOnboardingComplete} />
      )}
      {screen.type === 'welcome' && (
        <WelcomeChoice
          onLogin={() => navigate({ type: 'login' })}
          onSignup={() => navigate({ type: 'signup' })}
        />
      )}
      {screen.type === 'login' && (
        <LoginScreen
          onLogin={onLogin}
          onSignup={() => navigate({ type: 'signup' })}
          onForgotPassword={() => navigate({ type: 'forgotPassword' })}
          onBack={() => navigate({ type: 'welcome' })}
          onGoogleSignIn={onGoogleSignIn}
        />
      )}
      {screen.type === 'forgotPassword' && (
        <ForgotPasswordScreen onBack={() => navigate({ type: 'login' })} />
      )}
      {screen.type === 'signup' && (
        <SignupScreen
          onSignup={onSignup}
          onLogin={() => navigate({ type: 'login' })}
          onBack={() => navigate({ type: 'login' })}
          onGoogleSignIn={onGoogleSignIn}
        />
      )}
      {screen.type === 'otpVerify' && (
        <OtpScreen
          email={screen.email}
          password={screen.password}
          onVerified={onOtpVerified}
          onBack={() => navigate({ type: 'signup' })}
        />
      )}

      {/* ── Main tabs ── */}
      {(screen.type === 'home' || screen.type === 'browse' || screen.type === 'profile') && (
        <View style={styles.main}>
          {screen.type === 'home' && (
            <HomePage
              onContentClick={onContentClick}
              onSearchClick={() => navigate({ type: 'search' })}
              rentedContent={rentedContent}
              rentalMetadata={rentalMetadata}
              progressMap={progressMap}
              onRentedClick={onRentedClick}
              onRefreshRentals={onRefreshRentals}
              onGenreClick={(genre) => navigate({ type: 'genreDetail', genre })}
              onLanguageClick={(language) => navigate({ type: 'languageDetail', language })}
              hero={hero}
              featuredContent={featuredContent}
              allContent={allContent}
              festivalWinners={festivalWinners}
              verticalSeries={verticalSeries}
              genreList={genreList}
              languageList={languageList}
              homeLoading={homeLoading}
            />
          )}
          {screen.type === 'browse' && (
            <BrowsePage
              onContentClick={onContentClick}
              allContent={allContent}
              genreList={genreList.map(g => g.name)}
              langList={languageList}
              loading={homeLoading}
              onRefreshContent={onRefreshContent}
            />
          )}
          {screen.type === 'profile' && (
            <ProfilePage
              onLogout={onLogout}
              rentedContent={rentedContent}
              onContentClick={onContentClick}
              onHistoryClick={onHistoryClick}
              onPaymentHistoryClick={onPaymentHistoryClick}
              navigate={navigate}
              isPremium={isPremium}
              premiumSubscription={premiumSubscription}
              user={user}
              paymentHistory={paymentHistory}
              favorites={favorites}
              onToggleFavorite={onToggleFavorite}
            />
          )}
          {showNav && (
            <BottomNav activeTab={activeTab} onTabChange={onTabChange} />
          )}
        </View>
      )}

      {/* ── Search ── */}
      {screen.type === 'search' && (
        <SearchScreen
          onBack={() => navigate({ type: 'home' })}
          onContentClick={onContentClick}
        />
      )}

      {/* ── Genre Detail ── */}
      {screen.type === 'genreDetail' && (
        <BrowseDetailScreen
          genre={screen.genre}
          onBack={() => navigate({ type: 'home' })}
          onContentClick={onContentClick}
        />
      )}
      {screen.type === 'languageDetail' && (
        <BrowseDetailScreen
          language={screen.language}
          onBack={() => navigate({ type: 'home' })}
          onContentClick={onContentClick}
        />
      )}

      {/* ── History ── */}
      {screen.type === 'history' && (
        <HistoryScreen
          rentedContent={rentedContent}
          onBack={() => navigate({ type: 'profile' })}
          onContentClick={onContentClick}
        />
      )}

      {/* ── Payment History ── */}
      {screen.type === 'paymentHistory' && (
        <PaymentHistoryScreen
          onBack={() => navigate({ type: 'profile' })}
          paymentHistory={paymentHistory}
          onRefreshPaymentHistory={onRefreshPaymentHistory}
        />
      )}

      {/* ── Premium Payment ── */}
      {screen.type === 'premiumPayment' && (
        <PremiumPaymentScreen
          onBack={() => navigate({ type: 'profile' })}
          onSuccess={async () => {
            await onRefreshPremium();
            navigate({ type: 'profile' });
          }}
          userEmail={undefined}
          userName={undefined}
        />
      )}

      {/* ── Detail ── */}
      {screen.type === 'detail' && (
        <ContentDetailScreen
          content={screen.content}
          onBack={() => navigate({ type: 'home' })}
          onRent={onRent}
          isRented={isRented(screen.content)}
          isPremium={isPremium}
          isFavorited={favorites.some(f => f.id === screen.content.id)}
          onToggleFavorite={onToggleFavorite}
          onWatchNow={() => {
            // If premium user watching non-rented content, add it to rentals first
            if (isPremium && !isRented(screen.content)) {
              onPremiumWatch(screen.content);
            }
            navigate(resolveWatchNowScreen(screen.content));
          }}
          onEpisodePlay={(ep, epNum) => onEpisodePlay(ep, screen.content, epNum)}
          onContentClick={(item) => navigate({ type: 'detail', content: item })}
        />
      )}

      {/* ── Payment ── */}
      {screen.type === 'payment' && (
        <PaymentScreen
          content={screen.content}
          onBack={() => navigate({ type: 'detail', content: screen.content })}
          onSuccess={(rental) => onPaymentSuccess(screen.content, rental)}
        />
      )}

      {/* ── Payment success ── */}
      {screen.type === 'paymentSuccess' && (
        <PaymentSuccessScreen
          content={screen.content}
          rental={screen.rental}
          onWatchNow={() => navigate(resolveWatchNowScreen(screen.content))}
          onGoHome={() => navigate({ type: 'home' })}
        />
      )}

      {/* ── Player ── */}
      {screen.type === 'player' && (
        <View style={styles.main}>
          <PlayerScreen
            content={screen.content}
            onBack={() => navigate({ type: 'home' })}
            videoUrl={screen.videoUrl}
            episodeNumber={screen.episodeNumber}
            updateProgress={updateProgress}
            getProgress={getProgress}
          />
          {showRentalModal && (
            <RentalModal
              content={screen.content}
              onClose={onRentalModalClose}
              onConfirm={() => onRentalModalConfirm(screen.content)}
            />
          )}
        </View>
      )}

      {/* ── Help & Support Screens ── */}
      {screen.type === 'helpCenter' && (
        <HelpCenterScreen
          onBack={() => navigate({ type: 'profile' })}
          onNavigateToFAQ={() => navigate({ type: 'faq' })}
          onNavigateToContact={() => navigate({ type: 'contactUs' })}
        />
      )}

      {screen.type === 'faq' && (
        <FAQScreen onBack={() => navigate({ type: 'helpCenter' })} />
      )}

      {screen.type === 'contactUs' && (
        <ContactUsScreen onBack={() => navigate({ type: 'helpCenter' })} />
      )}

      {/* ── Legal Screens ── */}
      {screen.type === 'terms' && (
        <TermsScreen onBack={() => navigate({ type: 'profile' })} />
      )}

      {screen.type === 'privacy' && (
        <PrivacyPolicyScreen onBack={() => navigate({ type: 'profile' })} />
      )}

      {screen.type === 'cookies' && (
        <CookiePolicyScreen onBack={() => navigate({ type: 'profile' })} />
      )}

      {/* ── About Screen ── */}
      {screen.type === 'about' && (
        <AboutScreen onBack={() => navigate({ type: 'profile' })} />
      )}

      {/* ── Expired Rental Modal ── */}
      <Modal
        visible={showExpiredModal}
        transparent
        animationType="fade"
        onRequestClose={onExpiredModalClose}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Rental Expired</Text>
            <Text style={styles.modalMessage}>{expiredMessage}</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={onExpiredModalClose}>
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: COLORS.bg.black,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay.dark80,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: COLORS.bg.elevated,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    borderWidth: 1,
    borderColor: COLORS.border.muted,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 15,
    color: COLORS.text.gray400,
    lineHeight: 22,
    marginBottom: 24,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: COLORS.brand.violet,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
});

export default App;
