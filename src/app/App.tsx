/**
 * Shortsy App — Root Component
 *
 * Intentionally thin: all state and business logic lives in `useAppState`.
 * This component is responsible only for mapping screen state → UI.
 */
import React from 'react';
import { StatusBar, StyleSheet, View, Modal, Text, TouchableOpacity } from 'react-native';
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
import { SplashScreen } from '../screens/SplashScreen';
import { TermsScreen } from '../screens/TermsScreen';
import { WelcomeChoice } from '../screens/WelcomeChoice';
import { resolveWatchNowScreen } from '../services/navigationService';

function App() {
  const {
    screen,
    rentedContent,
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
  } = useAppState();

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
              progressMap={progressMap}
              onRentedClick={onRentedClick}
              onRefreshRentals={onRefreshRentals}
              onGenreClick={(genre) => navigate({ type: 'genreDetail', genre })}
            />
          )}
          {screen.type === 'browse' && (
            <BrowsePage onContentClick={onContentClick} />
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
        <GenreDetailScreen
          genre={screen.genre}
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
          onWatchNow={() => {
            // If premium user watching non-rented content, add it to rentals first
            if (isPremium && !isRented(screen.content)) {
              onPremiumWatch(screen.content);
            }
            navigate(resolveWatchNowScreen(screen.content));
          }}
          onEpisodePlay={(ep, epNum) => onEpisodePlay(ep, screen.content, epNum)}
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
    backgroundColor: '#000000',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 15,
    color: '#9ca3af',
    lineHeight: 22,
    marginBottom: 24,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#a855f7',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default App;
