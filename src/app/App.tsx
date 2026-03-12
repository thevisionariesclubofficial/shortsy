/**
 * Shortsy App — Root Component
 *
 * Intentionally thin: all state and business logic lives in `useAppState`.
 * This component is responsible only for mapping screen state → UI.
 */
import React, { useEffect, useRef, useState } from 'react';
import { Linking, StatusBar, StyleSheet, View, Modal, Text, TouchableOpacity } from 'react-native';
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
import { GenreDetailScreen } from '../screens/GenreDetailScreen';
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
import { requestNotificationPermissionsAndGetToken, getDeviceTokenForTesting, setupNotificationListener } from '../services/notificationService';

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

  // Request notification permissions and get token on app load
  useEffect(() => {
    const initNotifications = async () => {
      try {
        // Add a small delay to ensure Firebase is fully initialized
        await new Promise(resolve => setTimeout(() => resolve(true), 500));
        
        const token = await requestNotificationPermissionsAndGetToken();
        if (token) {
          console.log('===================================');
          console.log('YOUR DEVICE FCM TOKEN:');
          console.log(token);
          console.log('===================================');
        } else {
          console.warn('[App] Failed to get FCM token - check logs');
        }
        
        // Set up listener for incoming notifications
        console.log('[App] Setting up notification listener...');
        setupNotificationListener((data: any) => {
          console.log('[App] Notification received in app:', data);
          // The listener will handle displaying foreground notifications
        });
      } catch (error) {
        console.error('[App] Error initializing notifications:', error);
      }
    };

    initNotifications();
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
