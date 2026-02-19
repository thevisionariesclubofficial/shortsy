/**
 * Shortsy App — Root Component
 *
 * Intentionally thin: all state and business logic lives in `useAppState`.
 * This component is responsible only for mapping screen state → UI.
 */
import React from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BottomNav } from '../components/BottomNav';
import { RentalModal } from '../components/RentalModal';
import { useAppState } from '../hooks/useAppState';
import { BrowsePage } from '../screens/BrowsePage';
import { ContentDetailScreen } from '../screens/ContentDetailScreen';
import { ForgotPasswordScreen } from '../screens/ForgotPasswordScreen';
import { HomePage } from '../screens/HomePage';
import { LoginScreen } from '../screens/LoginScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { PaymentScreen } from '../screens/PaymentScreen';
import { PaymentSuccessScreen } from '../screens/PaymentSuccessScreen';
import { PlayerScreen } from '../screens/PlayerScreen';
import { ProfilePage } from '../screens/ProfilePage';
import { SearchScreen } from '../screens/SearchScreen';
import { SignupScreen } from '../screens/SignupScreen';
import { SplashScreen } from '../screens/SplashScreen';
import { WelcomeChoice } from '../screens/WelcomeChoice';

function App() {
  const {
    screen,
    rentedContent,
    showRentalModal,
    needsAuth,
    showNav,
    activeTab,
    isRented,
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
              onRentedClick={onRentedClick}
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

      {/* ── Detail ── */}
      {screen.type === 'detail' && (
        <ContentDetailScreen
          content={screen.content}
          onBack={() => navigate({ type: 'home' })}
          onRent={onRent}
          isRented={isRented(screen.content)}
          onEpisodePlay={(ep, epNum) => onEpisodePlay(ep, screen.content, epNum)}
        />
      )}

      {/* ── Payment ── */}
      {screen.type === 'payment' && (
        <PaymentScreen
          content={screen.content}
          onBack={() => navigate({ type: 'detail', content: screen.content })}
          onSuccess={() => onPaymentSuccess(screen.content)}
        />
      )}

      {/* ── Payment success ── */}
      {screen.type === 'paymentSuccess' && (
        <PaymentSuccessScreen
          content={screen.content}
          onWatchNow={() => navigate({ type: 'player', content: screen.content })}
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
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: '#000000',
  },
});

export default App;
