/**
 * useAppState.ts
 *
 * Central state hook for the Shortsy app.
 * Owns all application state and exposes stable handler callbacks to the UI.
 * App.tsx should remain a pure render component — all logic lives here.
 */
import { useCallback, useState } from 'react';
import type { BottomTab } from '../components/BottomNav';
import type { Content, Episode } from '../data/mockData';
import {
  buildEpisodePlayerScreen,
  resolveContentScreen,
  resolvePostSplashScreen,
  resolveRentedContentScreen,
} from '../services/navigationService';
import type { AppScreen } from '../types/navigation';
import { AUTH_EXEMPT_SCREENS, SCREENS_WITHOUT_NAV } from '../types/navigation';

// ─── Public shape returned by this hook ───────────────────────────────────────
export interface AppStateHook {
  // ── Derived state ──
  screen: AppScreen;
  isAuthenticated: boolean;
  rentedContent: Content[];
  showRentalModal: boolean;
  /** True when the current screen requires auth but the user is not logged in. */
  needsAuth: boolean;
  /** True when the bottom nav bar should be visible. */
  showNav: boolean;
  activeTab: BottomTab;

  // ── Helpers ──
  isRented: (c: Content) => boolean;

  // ── Navigation ──
  navigate: (screen: AppScreen) => void;

  // ── Auth handlers ──
  onSplashComplete: () => void;
  onOnboardingComplete: () => void;
  onLogin: () => void;
  onLogout: () => void;
  onSignup: () => void;

  // ── Content handlers ──
  onContentClick: (content: Content) => void;
  onRentedClick: (content: Content) => void;
  onRent: (content: Content) => void;
  onEpisodePlay: (ep: Episode, content: Content, episodeNumber: number) => void;
  onPaymentSuccess: (content: Content) => void;

  // ── UI handlers ──
  onTabChange: (tab: BottomTab) => void;
  onRentalModalClose: () => void;
  onRentalModalConfirm: (content: Content) => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useAppState(): AppStateHook {
  const [screen,           setScreen]           = useState<AppScreen>({ type: 'splash' });
  const [isAuthenticated,  setIsAuthenticated]  = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [rentedContent,    setRentedContent]    = useState<Content[]>([]);
  const [showRentalModal,  setShowRentalModal]  = useState(false);

  // ── Core navigation ─────────────────────────────────────────────────────────
  const navigate = useCallback((next: AppScreen) => setScreen(next), []);

  // ── Rental helpers ──────────────────────────────────────────────────────────
  const isRented = useCallback(
    (c: Content) => rentedContent.some(r => r.id === c.id),
    [rentedContent],
  );

  const addRented = useCallback((c: Content) => {
    setRentedContent(prev =>
      prev.find(r => r.id === c.id) ? prev : [...prev, c],
    );
  }, []);

  // ── Auth handlers ───────────────────────────────────────────────────────────
  const onSplashComplete = useCallback(() => {
    navigate(resolvePostSplashScreen(isAuthenticated, hasSeenOnboarding));
  }, [isAuthenticated, hasSeenOnboarding, navigate]);

  const onOnboardingComplete = useCallback(() => {
    setHasSeenOnboarding(true);
    navigate({ type: 'welcome' });
  }, [navigate]);

  const onLogin = useCallback(() => {
    setIsAuthenticated(true);
    navigate({ type: 'home' });
  }, [navigate]);

  const onLogout = useCallback(() => {
    setIsAuthenticated(false);
    navigate({ type: 'login' });
  }, [navigate]);

  const onSignup = useCallback(() => {
    setIsAuthenticated(true);
    navigate({ type: 'home' });
  }, [navigate]);

  // ── Content handlers ────────────────────────────────────────────────────────
  const onContentClick = useCallback(
    (content: Content) =>
      navigate(resolveContentScreen(content, isRented(content))),
    [navigate, isRented],
  );

  const onRentedClick = useCallback(
    (content: Content) => navigate(resolveRentedContentScreen(content)),
    [navigate],
  );

  const onRent = useCallback(
    (content: Content) => navigate({ type: 'payment', content }),
    [navigate],
  );

  const onEpisodePlay = useCallback(
    (ep: Episode, content: Content, episodeNumber: number) =>
      navigate(buildEpisodePlayerScreen(ep, content, episodeNumber)),
    [navigate],
  );

  const onPaymentSuccess = useCallback(
    (content: Content) => {
      addRented(content);
      navigate({ type: 'paymentSuccess', content });
    },
    [addRented, navigate],
  );

  // ── UI handlers ─────────────────────────────────────────────────────────────
  const TAB_SCREEN_MAP: Record<BottomTab, AppScreen> = {
    home:    { type: 'home' },
    browse:  { type: 'browse' },
    profile: { type: 'profile' },
  };

  const onTabChange = useCallback(
    (tab: BottomTab) => navigate(TAB_SCREEN_MAP[tab]),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [navigate],
  );

  const onRentalModalClose = useCallback(
    () => setShowRentalModal(false),
    [],
  );

  const onRentalModalConfirm = useCallback(
    (content: Content) => {
      addRented(content);
      setShowRentalModal(false);
    },
    [addRented],
  );

  // ── Derived values ──────────────────────────────────────────────────────────
  const needsAuth =
    !isAuthenticated && !AUTH_EXEMPT_SCREENS.includes(screen.type);

  const showNav =
    !SCREENS_WITHOUT_NAV.includes(screen.type) && isAuthenticated;

  const activeTab: BottomTab =
    screen.type === 'browse'  ? 'browse'  :
    screen.type === 'profile' ? 'profile' :
    'home';

  return {
    screen,
    isAuthenticated,
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
  };
}
