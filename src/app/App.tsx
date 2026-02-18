/**
 * Shortsy App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useState } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Content } from '../data/mockData';
import { SplashScreen } from '../screens/SplashScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { WelcomeChoice } from '../screens/WelcomeChoice';
import { LoginScreen } from '../screens/LoginScreen';
import { SignupScreen } from '../screens/SignupScreen';
import { ForgotPasswordScreen } from '../screens/ForgotPasswordScreen';
import { HomePage } from '../screens/HomePage';
import { BrowsePage } from '../screens/BrowsePage';
import { ProfilePage } from '../screens/ProfilePage';
import { ContentDetailScreen } from '../screens/ContentDetailScreen';
import { PaymentScreen } from '../screens/PaymentScreen';
import { PaymentSuccessScreen } from '../screens/PaymentSuccessScreen';
import { PlayerScreen } from '../screens/PlayerScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { RentalModal } from '../components/RentalModal';
import { BottomNav, BottomTab } from '../components/BottomNav';

// ─── App state (mirrors reference discriminated union) ────────────────────────
type AppState =
  | { type: 'splash' }
  | { type: 'onboarding' }
  | { type: 'welcome' }
  | { type: 'login' }
  | { type: 'signup' }
  | { type: 'forgotPassword' }
  | { type: 'home' }
  | { type: 'search' }
  | { type: 'browse' }
  | { type: 'profile' }
  | { type: 'detail';          content: Content }
  | { type: 'payment';         content: Content }
  | { type: 'paymentSuccess';  content: Content }
  | { type: 'player';          content: Content };

// Screens where BottomNav should be hidden
const HIDE_NAV: AppState['type'][] = ['player', 'detail', 'payment', 'paymentSuccess', 'search'];

function App() {
  const [appState,          setAppState]          = useState<AppState>({ type: 'splash' });
  const [isAuthenticated,   setIsAuthenticated]   = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [rentedContent,     setRentedContent]     = useState<Content[]>([]);
  const [showRentalModal,   setShowRentalModal]   = useState(false);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const isRented = (c: Content) => rentedContent.some(r => r.id === c.id);

  const addRented = (c: Content) =>
    setRentedContent(prev => prev.find(r => r.id === c.id) ? prev : [...prev, c]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleSplashComplete = () => {
    if (isAuthenticated)       { setAppState({ type: 'home' });        return; }
    if (hasSeenOnboarding)     { setAppState({ type: 'login' });       return; }
                                 setAppState({ type: 'onboarding' });
  };

  const handleOnboardingComplete = () => {
    setHasSeenOnboarding(true);
    setAppState({ type: 'welcome' });   // keep WelcomeChoice in our flow
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
    setAppState({ type: 'home' });
  };

  const handleSignup = () => {
    setIsAuthenticated(true);
    setAppState({ type: 'home' });
  };

  // If already rented → go straight to player; otherwise → detail
  const handleContentClick = (content: Content) => {
    if (isRented(content)) {
      setAppState({ type: 'player', content });
    } else {
      setAppState({ type: 'detail', content });
    }
  };

  const handleRent = (content: Content) =>
    setAppState({ type: 'payment', content });

  const handlePaymentSuccess = (content: Content) => {
    addRented(content);
    setAppState({ type: 'paymentSuccess', content });
  };

  const handleTabChange = (tab: BottomTab) => {
    if (tab === 'home')    setAppState({ type: 'home' });
    if (tab === 'browse')  setAppState({ type: 'browse' });
    if (tab === 'profile') setAppState({ type: 'profile' });
  };

  const getActiveTab = (): BottomTab => {
    if (appState.type === 'browse')  return 'browse';
    if (appState.type === 'profile') return 'profile';
    return 'home';
  };

  const showNav = !HIDE_NAV.includes(appState.type) && isAuthenticated;

  // ── Auth guard: unauthenticated users past onboarding see login ────────────
  const needsAuth =
    !isAuthenticated &&
    !['splash', 'onboarding', 'welcome', 'login', 'signup', 'forgotPassword'].includes(appState.type);

  if (needsAuth) {
    return (
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <LoginScreen
          onLogin={handleLogin}
          onSignup={() => setAppState({ type: 'signup' })}
          onForgotPassword={() => setAppState({ type: 'forgotPassword' })}
          onBack={() => setAppState({ type: 'welcome' })}
        />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* ── Pre-auth screens ── */}
      {appState.type === 'splash' && (
        <SplashScreen onComplete={handleSplashComplete} />
      )}
      {appState.type === 'onboarding' && (
        <OnboardingScreen onComplete={handleOnboardingComplete} />
      )}
      {appState.type === 'welcome' && (
        <WelcomeChoice
          onLogin={() => setAppState({ type: 'login' })}
          onSignup={() => setAppState({ type: 'signup' })}
        />
      )}
      {appState.type === 'login' && (
        <LoginScreen
          onLogin={handleLogin}
          onSignup={() => setAppState({ type: 'signup' })}
          onForgotPassword={() => setAppState({ type: 'forgotPassword' })}
          onBack={() => setAppState({ type: 'welcome' })}
        />
      )}
      {appState.type === 'forgotPassword' && (
        <ForgotPasswordScreen onBack={() => setAppState({ type: 'login' })} />
      )}
      {appState.type === 'signup' && (
        <SignupScreen
          onSignup={handleSignup}
          onLogin={() => setAppState({ type: 'login' })}
          onBack={() => setAppState({ type: 'login' })}
        />
      )}

      {/* ── Authenticated tab screens (BottomNav rendered here) ── */}
      {(appState.type === 'home' || appState.type === 'browse' || appState.type === 'profile') && (
        <View style={styles.main}>
          {appState.type === 'home' && (
            <HomePage
              onContentClick={handleContentClick}
              onSearchClick={() => setAppState({ type: 'search' })}
            />
          )}
          {appState.type === 'browse' && (
            <BrowsePage onContentClick={handleContentClick} />
          )}
          {appState.type === 'profile' && (
            <ProfilePage
              onLogout={() => { setIsAuthenticated(false); setAppState({ type: 'login' }); }}
              rentedContent={rentedContent}
              onContentClick={handleContentClick}
            />
          )}
          {showNav && (
            <BottomNav activeTab={getActiveTab()} onTabChange={handleTabChange} />
          )}
        </View>
      )}

      {/* ── Search (no BottomNav) ── */}
      {appState.type === 'search' && (
        <SearchScreen
          onBack={() => setAppState({ type: 'home' })}
          onContentClick={handleContentClick}
        />
      )}

      {/* ── Detail / payment / player (no BottomNav) ── */}
      {appState.type === 'detail' && (
        <ContentDetailScreen
          content={appState.content}
          onBack={() => setAppState({ type: 'home' })}
          onRent={handleRent}
          isRented={isRented(appState.content)}
        />
      )}
      {appState.type === 'payment' && (
        <PaymentScreen
          content={appState.content}
          onBack={() => setAppState({ type: 'detail', content: appState.content })}
          onSuccess={() => handlePaymentSuccess(appState.content)}
        />
      )}
      {appState.type === 'paymentSuccess' && (
        <PaymentSuccessScreen
          content={appState.content}
          onWatchNow={() => setAppState({ type: 'player', content: appState.content })}
          onGoHome={() => setAppState({ type: 'home' })}
        />
      )}
      {appState.type === 'player' && (
        <View style={styles.main}>
          <PlayerScreen
            content={appState.content}
            onBack={() => setAppState({ type: 'home' })}
          />
          {showRentalModal && (
            <RentalModal
              content={appState.content}
              onClose={() => setShowRentalModal(false)}
              onConfirm={() => { addRented(appState.content); setShowRentalModal(false); }}
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
