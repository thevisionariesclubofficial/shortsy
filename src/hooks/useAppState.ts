/**
 * useAppState.ts
 *
 * Central state hook for the Shortsy app.
 * Owns all application state and exposes stable handler callbacks to the UI.
 * App.tsx should remain a pure render component — all logic lives here.
 */
import { useCallback, useEffect, useState } from 'react';
import type { BottomTab } from '../components/BottomNav';
import type { Content, Episode } from '../data/mockData';
import {
  buildEpisodePlayerScreen,
  resolveContentScreen,
  resolvePostSplashScreen,
  resolveRentedClickWithProgress,
} from '../services/navigationService';
import { clearRentalStore, getUserRentals } from '../services/rentalService';
import { clearProgressStore, getWatchProgress, getStreamUrl, getEpisodeStreamUrl } from '../services/playbackService';
import { clearProfileStore } from '../services/profileService';
import { getContentDetail } from '../services/contentService';
import { getSession, logout as authLogout, restoreSession } from '../services/authService';
import { setAccessToken } from '../services/apiClient';
import { logger } from '../utils/logger';
import type { AppScreen } from '../types/navigation';
import { AUTH_EXEMPT_SCREENS, SCREENS_WITHOUT_NAV } from '../types/navigation';
import type { RentalRecord } from '../types/api';

// ─── Public shape returned by this hook ───────────────────────────────────────
export interface AppStateHook {
  // ── Derived state ──
  screen: AppScreen;
  isAuthenticated: boolean;
  rentedContent: Content[];
  showRentalModal: boolean;
  showExpiredModal: boolean;
  expiredMessage: string;
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
  onPaymentSuccess: (content: Content, rental: RentalRecord) => void;

  // ── UI handlers ──
  onTabChange: (tab: BottomTab) => void;
  onRentalModalClose: () => void;
  onRentalModalConfirm: (content: Content) => void;
  onExpiredModalClose: () => void;
  onHistoryClick: () => void;
  onPaymentHistoryClick: () => void;
  onRefreshRentals: () => Promise<void>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useAppState(): AppStateHook {
  const [screen,           setScreen]           = useState<AppScreen>({ type: 'splash' });
  const [isAuthenticated,  setIsAuthenticated]  = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [rentedContent,    setRentedContent]    = useState<Content[]>([]);
  const [showRentalModal,  setShowRentalModal]  = useState(false);
  const [showExpiredModal, setShowExpiredModal] = useState(false);
  const [expiredMessage,   setExpiredMessage]   = useState('');
  const [isRestoringSession, setIsRestoringSession] = useState(true);

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

  // Refresh rentals from the API
  const onRefreshRentals = useCallback(async () => {
    const session = getSession();
    if (session) {
      const { rentals } = await getUserRentals({ active: true });
      setRentedContent(rentals.map(r => r.content));
      logger.info('APP', `Refreshed ${rentals.length} active rental(s) from service`);
    }
  }, []);

  // Restore session from AsyncStorage on app initialization
  useEffect(() => {
    const initializeAuth = async () => {
      const restored = await restoreSession();
      if (restored) {
        setIsAuthenticated(true);
        logger.info('APP', 'Authentication restored from storage');
      }
      setIsRestoringSession(false);
    };
    
    initializeAuth();
  }, []);

  // Navigate from splash once session is restored and splash animation completes
  useEffect(() => {
    if (!isRestoringSession && screen.type === 'splash') {
      // Give splash screen a moment to finish its animation before navigating
      const timer = setTimeout(() => {
        navigate(resolvePostSplashScreen(isAuthenticated, hasSeenOnboarding));
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isRestoringSession, screen.type, isAuthenticated, hasSeenOnboarding, navigate]);

  // Load any active rentals from the service after authentication.
  // This triggers both on app start (if session is restored) and after login/signup.
  useEffect(() => {
    if (isAuthenticated && !isRestoringSession) {
      const session = getSession();
      if (session) {
        getUserRentals({ active: true })
          .then(({ rentals }) => {
            if (rentals.length > 0) {
              setRentedContent(rentals.map(r => r.content));
              logger.info('APP', `Loaded ${rentals.length} active rental(s) from service`);
            }
          })
          .catch(err => logger.error('APP', 'Failed to load rentals', err));
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isRestoringSession]);

  // ── Auth handlers ───────────────────────────────────────────────────────────
  const onSplashComplete = useCallback(() => {
    // Trigger navigation once splash animation completes
    // The navigation itself is handled by the useEffect above
  }, []);

  const onOnboardingComplete = useCallback(() => {
    setHasSeenOnboarding(true);
    navigate({ type: 'welcome' });
  }, [navigate]);

  const onLogin = useCallback(() => {
    // Wire the access token from the auth session into apiClient so all
    // subsequent service calls carry the correct Bearer header.
    const session = getSession();
    if (session) {
      setAccessToken(session.tokens.accessToken);
      logger.info('APP', `User logged in: ${session.user.email}`);
    }
    setIsAuthenticated(true);
    navigate({ type: 'home' });
  }, [navigate]);

  const onLogout = useCallback(() => {
    // Fire-and-forget: invalidate server session (mock: instant; real: POST /auth/logout)
    authLogout().catch(() => {});
    // Clear all module-level stores so the next user starts fresh
    clearRentalStore();
    clearProgressStore();
    clearProfileStore();
    setIsAuthenticated(false);
    setRentedContent([]);
    navigate({ type: 'login' });
  }, [navigate]);

  const onSignup = useCallback(() => {
    // Same token wiring as onLogin
    const session = getSession();
    if (session) {
      setAccessToken(session.tokens.accessToken);
      logger.info('APP', `New account created: ${session.user.email}`);
    }
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
    async (content: Content) => {
      try {
        // For vertical series, ensure we have episodeList - fetch full details if missing
        let fullContent = content;
        if (content.type === 'vertical-series' && (!content.episodeList || content.episodeList.length === 0)) {
          logger.info('APP', `Fetching full content details for vertical series ${content.id}`);
          const detailResponse = await getContentDetail(content.id);
          fullContent = detailResponse.content;
        }
        
        // First, fetch saved progress to determine which episode for vertical series
        const progress = await getWatchProgress(fullContent.id).catch(() => null);
        
        // Check if the stream URL is still valid
        logger.info('APP', `Checking stream URL for rented content: ${fullContent.id}, type: ${fullContent.type}`);
        
        let streamData;
        if (fullContent.type === 'vertical-series') {
          // For vertical series, get the episode to check
          const epList = fullContent.episodeList;
          if (!epList || epList.length === 0) {
            logger.error('APP', `Vertical series ${fullContent.id} has no episodes in episodeList`, { 
              hasEpisodeList: !!epList, 
              episodeCount: epList?.length ?? 0 
            });
            navigate({ type: 'detail', content: fullContent });
            return;
          }
          const epNumber = progress?.lastEpisodeNumber ?? 1;
          const safeEpIdx = Math.min(epNumber - 1, epList.length - 1);
          const ep = epList[safeEpIdx];
          
          logger.info('APP', `Checking episode stream for ${fullContent.id}, episode: ${ep.id}`);
          // Check episode stream URL
          streamData = await getEpisodeStreamUrl(fullContent.id, ep.id);
        } else {
          // For short films, use the film stream endpoint
          logger.info('APP', `Checking film stream for ${fullContent.id}`);
          streamData = await getStreamUrl(fullContent.id);
        }
        
        // Check if the stream has expired
        const expiresAt = new Date(streamData.expiresAt);
        const now = new Date();
        
        if (expiresAt <= now) {
          logger.warn('APP', `Stream expired for content ${fullContent.id}`, { expiresAt: streamData.expiresAt });
          setExpiredMessage('Your rental has expired. Please rent this content again to continue watching.');
          setShowExpiredModal(true);
          return;
        }
        
        // Stream is valid, navigate to player
        logger.info('APP', `Stream valid for content ${fullContent.id}, navigating to player`);
        navigate(resolveRentedClickWithProgress(fullContent, progress));
      } catch (error) {
        logger.error('APP', 'Failed to check stream URL', error);
        // If we get a 403 or rental error, show expired message
        if ((error as any)?.status === 403 || (error as any)?.code === 'NOT_RENTED') {
          setExpiredMessage('Your rental has expired or is no longer active. Please rent this content again.');
          setShowExpiredModal(true);
        } else {
          // For other errors, still try to navigate (fallback behavior)
          logger.warn('APP', 'Stream check failed, attempting to navigate anyway');
          const progress = await getWatchProgress(content.id).catch(() => null);
          navigate(resolveRentedClickWithProgress(content, progress));
        }
      }
    },
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
    (content: Content, rental: RentalRecord) => {
      addRented(content);
      navigate({ type: 'paymentSuccess', content, rental });
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

  const onExpiredModalClose = useCallback(
    async () => {
      setShowExpiredModal(false);
      setExpiredMessage('');
      // Refresh rentals to update the list after expiry
      await onRefreshRentals();
    },
    [onRefreshRentals],
  );

  const onRentalModalConfirm = useCallback(
    (content: Content) => {
      addRented(content);
      setShowRentalModal(false);
    },
    [addRented],
  );

  const onHistoryClick = useCallback(
    () => navigate({ type: 'history' }),
    [navigate],
  );

  const onPaymentHistoryClick = useCallback(
    () => navigate({ type: 'paymentHistory' }),
    [navigate],
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
    showExpiredModal,
    expiredMessage,
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
    onExpiredModalClose,
    onHistoryClick,
    onPaymentHistoryClick,
    onRefreshRentals,
  };
}
