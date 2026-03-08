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
import { clearRentalStore, getUserRentals, addPremiumRental } from '../services/rentalService';
import { clearProgressStore, getWatchProgress, getStreamUrl, getEpisodeStreamUrl } from '../services/playbackService';
import type { WatchProgress } from '../types/api';
import { clearProfileStore, getCurrentUser } from '../services/profileService';
import { getPaymentHistory } from '../services/rentalService';
import { getPremiumStatus, PremiumSubscription } from '../services/premiumService';
import { getContentDetail } from '../services/contentService';
import { getFavorites, addFavorite, removeFavorite } from '../services/favoriteService';
import { getSession, logout as authLogout, restoreSession, googleSignIn, confirmOtp, resendOtp, registerForceLogoutCallback } from '../services/authService';
import { setAccessToken } from '../services/apiClient';
import { logger } from '../utils/logger';
import type { AppScreen } from '../types/navigation';
import { AUTH_EXEMPT_SCREENS, SCREENS_WITHOUT_NAV } from '../types/navigation';
import type { RentalRecord, UserProfile, PaymentHistoryRecord } from '../types/api';

// ─── Public shape returned by this hook ───────────────────────────────────────
export interface AppStateHook {
  // ── Derived state ──
  screen: AppScreen;
  isAuthenticated: boolean;
  rentedContent: Content[];
  isPremium: boolean;
  premiumSubscription: PremiumSubscription | null;
  user: UserProfile | null;
  paymentHistory: PaymentHistoryRecord[];
  progressMap: Map<string, WatchProgress>;
  favorites: Content[];
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
  getProgress: (contentId: string) => WatchProgress | null;
  updateProgress: (contentId: string, progress: WatchProgress) => void;
  onPremiumWatch: (content: Content) => Promise<void>;
  onToggleFavorite: (contentId: string, currentlyFavorited: boolean) => Promise<void>;

  // ── Navigation ──
  navigate: (screen: AppScreen) => void;

  // ── Auth handlers ──
  onSplashComplete: () => void;
  onOnboardingComplete: () => void;
  onLogin: () => void;
  onLogout: () => void;
  /** Called after signup succeeds — navigates to OTP screen */
  onSignup: (email: string, password: string) => void;
  /** Called after OTP is confirmed — sets session and navigates home */
  onOtpVerified: () => void;
  onGoogleSignIn: () => Promise<void>;

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
  onRefreshPremium: () => Promise<void>;
  onRefreshProfile: () => Promise<void>;
  onRefreshPaymentHistory: () => Promise<void>;
  onRefreshProgress: () => Promise<void>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useAppState(): AppStateHook {
  const [screen,           setScreen]           = useState<AppScreen>({ type: 'splash' });
  const [isAuthenticated,  setIsAuthenticated]  = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [rentedContent,    setRentedContent]    = useState<Content[]>([]);
  const [isPremium,        setIsPremium]        = useState(false);
  const [premiumSubscription, setPremiumSubscription] = useState<PremiumSubscription | null>(null);
  const [user,             setUser]             = useState<UserProfile | null>(null);
  const [paymentHistory,   setPaymentHistory]   = useState<PaymentHistoryRecord[]>([]);
  const [progressMap,      setProgressMap]      = useState<Map<string, WatchProgress>>(new Map());
  const [favorites,        setFavorites]        = useState<Content[]>([]);
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

  const getProgress = useCallback(
    (contentId: string) => progressMap.get(contentId) || null,
    [progressMap],
  );

  const updateProgress = useCallback((contentId: string, progress: WatchProgress) => {
    setProgressMap(prev => {
      const newMap = new Map(prev);
      newMap.set(contentId, progress);
      return newMap;
    });
  }, []);

  const onToggleFavorite = useCallback(async (contentId: string, currentlyFavorited: boolean) => {
    // Optimistic update
    if (currentlyFavorited) {
      setFavorites(prev => prev.filter(c => c.id !== contentId));
      try { await removeFavorite(contentId); }
      catch { setFavorites(prev => [...prev]); /* revert handled by re-fetch */ }
    } else {
      try {
        await addFavorite(contentId);
        // Re-fetch to get the full Content object from the backend
        const updated = await getFavorites();
        setFavorites(updated);
      } catch {
        // nothing to revert — item was never added visually
      }
    }
  }, []);

  const addRented = useCallback((c: Content) => {
    setRentedContent(prev =>
      prev.find(r => r.id === c.id) ? prev : [...prev, c],
    );
  }, []);

  const onPremiumWatch = useCallback(async (content: Content) => {
    // Add free rental for premium users so content appears in Continue Watching
    const alreadyRented = rentedContent.some(r => r.id === content.id);
    if (!alreadyRented) {
      try {
        await addPremiumRental(content.id);
        // Refresh rentals to include the new premium rental
        const { rentals } = await getUserRentals({ active: true });
        setRentedContent(rentals.map(r => r.content));
        logger.info('APP_STATE', 'Added premium rental and refreshed rentals');
      } catch (error) {
        logger.error('APP_STATE', 'Failed to add premium rental', error);
      }
    }
  }, [rentedContent]);

  // Refresh rentals from the API
  const onRefreshRentals = useCallback(async () => {
    const session = getSession();
    if (session) {
      const { rentals } = await getUserRentals({ active: true });
      setRentedContent(rentals.map(r => r.content));
      logger.info('APP', `Refreshed ${rentals.length} active rental(s) from service`);
    }
  }, []);

  // Refresh premium status from the API
  const onRefreshPremium = useCallback(async () => {
    const session = getSession();
    if (session) {
      try {
        const status = await getPremiumStatus();
        setIsPremium(status.isPremium);
        setPremiumSubscription(status.subscription);
        logger.info('APP', `Refreshed premium status: ${status.isPremium}`);
      } catch (err) {
        logger.error('APP', 'Failed to refresh premium status', err);
        setIsPremium(false);
        setPremiumSubscription(null);
      }
    }
  }, []);

  // Refresh user profile from the API
  const onRefreshProfile = useCallback(async () => {
    const session = getSession();
    if (session) {
      try {
        const profile = await getCurrentUser();
        setUser(profile);
        logger.info('APP', `Refreshed user profile: ${profile.email}`);
      } catch (err) {
        logger.error('APP', 'Failed to refresh user profile', err);
        setUser(null);
      }
    }
  }, []);

  // Refresh payment history from the API
  const onRefreshPaymentHistory = useCallback(async () => {
    const session = getSession();
    if (session) {
      try {
        const { orders } = await getPaymentHistory();
        setPaymentHistory(orders);
        logger.info('APP', `Refreshed payment history: ${orders.length} orders`);
      } catch (err) {
        logger.error('APP', 'Failed to refresh payment history', err);
        setPaymentHistory([]);
      }
    }
  }, []);

  // Refresh watch progress for all rented content
  const onRefreshProgress = useCallback(async () => {
    if (rentedContent.length === 0) {
      setProgressMap(new Map());
      return;
    }

    try {
      const progressPromises = rentedContent.map(content =>
        getWatchProgress(content.id)
          .then(progress => ({ contentId: content.id, progress }))
          .catch(() => ({ contentId: content.id, progress: null }))
      );

      const results = await Promise.all(progressPromises);
      const newProgressMap = new Map<string, WatchProgress>();
      
      results.forEach(({ contentId, progress }) => {
        if (progress) {
          newProgressMap.set(contentId, progress);
        }
      });

      setProgressMap(newProgressMap);
      logger.info('APP', `Refreshed progress for ${newProgressMap.size}/${rentedContent.length} rented content`);
    } catch (err) {
      logger.error('APP', 'Failed to refresh progress', err);
    }
  }, [rentedContent]);

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
        // Fetch rentals
        getUserRentals({ active: true })
          .then(async ({ rentals }) => {
            if (rentals.length > 0) {
              setRentedContent(rentals.map(r => r.content));
              logger.info('APP', `Loaded ${rentals.length} active rental(s) from service`);
              
              // Fetch progress for all rented content
              const progressPromises = rentals.map(rental =>
                getWatchProgress(rental.content.id)
                  .then(progress => ({ contentId: rental.content.id, progress }))
                  .catch(() => ({ contentId: rental.content.id, progress: null }))
              );

              const results = await Promise.all(progressPromises);
              const newProgressMap = new Map<string, WatchProgress>();
              
              results.forEach(({ contentId, progress }) => {
                if (progress) {
                  newProgressMap.set(contentId, progress);
                }
              });

              setProgressMap(newProgressMap);
              logger.info('APP', `Loaded progress for ${newProgressMap.size}/${rentals.length} rented content`);
            }
          })
          .catch(err => logger.error('APP', 'Failed to load rentals', err));
        
        // Fetch premium status
        getPremiumStatus()
          .then(status => {
            setIsPremium(status.isPremium);
            setPremiumSubscription(status.subscription);
            logger.info('APP', `Loaded premium status: ${status.isPremium}`);
          })
          .catch(err => {
            logger.error('APP', 'Failed to load premium status', err);
            setIsPremium(false);
            setPremiumSubscription(null);
          });
        
        // Fetch user profile
        getCurrentUser()
          .then(profile => {
            setUser(profile);
            logger.info('APP', `Loaded user profile: ${profile.email}`);
          })
          .catch(err => {
            logger.error('APP', 'Failed to load user profile', err);
            setUser(null);
          });
        
        // Fetch payment history
        getPaymentHistory()
          .then(({ orders }) => {
            setPaymentHistory(orders);
            logger.info('APP', `Loaded payment history: ${orders.length} orders`);
          })
          .catch(err => {
            logger.error('APP', 'Failed to load payment history', err);
            setPaymentHistory([]);
          });

        // Fetch favorites (once on login, then updated via onToggleFavorite)
        getFavorites()
          .then(favs => {
            setFavorites(favs);
            logger.info('APP', `Loaded ${favs.length} favorite(s)`);
          })
          .catch(err => logger.warn('APP', 'Failed to load favorites', err));
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
    setIsPremium(false);
    setPremiumSubscription(null);
    setUser(null);
    setPaymentHistory([]);
    setProgressMap(new Map());
    setFavorites([]);
    navigate({ type: 'login' });
  }, [navigate]);

  // Keep the force-logout callback up to date so apiClient can trigger it
  // when the refresh token is found to be expired or invalid.
  useEffect(() => {
    registerForceLogoutCallback(onLogout);
  }, [onLogout]);

  const onSignup = useCallback((email: string, password: string) => {
    // Signup succeeded — OTP has been sent, navigate to verification screen
    navigate({ type: 'otpVerify', email, password });
  }, [navigate]);

  const onOtpVerified = useCallback(() => {
    // OTP confirmed: confirmOtp() already stored the session via authService
    const session = getSession();
    if (session) {
      setAccessToken(session.tokens.accessToken);
      logger.info('APP', `OTP verified, account confirmed: ${session.user.email}`);
    }
    setIsAuthenticated(true);
    navigate({ type: 'home' });
  }, [navigate]);

  const onGoogleSignIn = useCallback(async () => {
    try {
      await googleSignIn();
      const session = getSession();
      if (session) {
        setAccessToken(session.tokens.accessToken);
        logger.info('APP', `Google sign-in: ${session.user.email}`);
      }
      setIsAuthenticated(true);
      navigate({ type: 'home' });
    } catch (err: any) {
      // GOOGLE_SIGN_IN_CANCELLED is expected — rethrow so the screen can handle it
      throw err;
    }
  }, [navigate]);

  // ── Content handlers ────────────────────────────────────────────────────────
  const onContentClick = useCallback(
    async (content: Content) => {
      // For vertical series the list endpoint returns episodeList: null.
      // Fetch full details so the episode list is available on the detail screen.
      let fullContent = content;
      if (content.type === 'vertical-series' && (!content.episodeList || content.episodeList.length === 0)) {
        try {
          fullContent = await getContentDetail(content.id);
        } catch (err) {
          logger.warn('APP', `Failed to fetch full details for ${content.id}, using list data`, err);
        }
      }
      navigate(resolveContentScreen(fullContent, isRented(fullContent)));
    },
    [navigate, isRented],
  );

  const onRentedClick = useCallback(
    async (content: Content) => {
      try {
        // Fetch full content details to ensure all fields (director, etc.) are populated
        let fullContent = content;
        if (content.type === 'vertical-series' && (!content.episodeList || content.episodeList.length === 0)) {
          logger.info('APP', `Fetching full content details for vertical series ${content.id}`);
          fullContent = await getContentDetail(content.id);
          logger.info('APP', 'Fetched fullContent for vertical-series', { id: fullContent.id, type: fullContent.type, episodeCount: fullContent.episodeList?.length ?? 0 });
        } else if (!content.director || !content.description) {
          // Fetch full details if key fields are missing (director, description, etc.)
          logger.info('APP', `Fetching full content details for ${content.id}`);
          fullContent = await getContentDetail(content.id);
          logger.info('APP', 'Fetched fullContent for content', { id: fullContent.id, type: fullContent.type, episodeCount: fullContent.episodeList?.length ?? 0 });
        }
        
        // First, get saved progress from cache to determine which episode for vertical series
        const progress = progressMap.get(fullContent.id) || null;
        
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
            // Log the episode list and progress to aid debugging of continue-watch crashes
            try {
              logger.info('APP', 'Vertical-series continue-watch debug', {
                contentId: fullContent.id,
                episodeCount: epList.length,
                episodeIdsSample: epList.slice(0, 5).map(e => e.id),
                progress: progress || null,
              });
            } catch (logErr) {
              logger.error('APP', 'Failed to log epList debug info', logErr);
            }
          const epNumber = progress?.lastEpisodeNumber ?? 1;
          const rawIdx = epNumber - 1;
          const safeEpIdx = Math.max(0, Math.min(rawIdx, epList.length - 1));
          const ep = epList[safeEpIdx];

          if (!ep) {
            logger.error('APP', `Failed to resolve episode for continue-watch`, {
              contentId: fullContent.id,
              requestedEpisodeNumber: epNumber,
              safeEpIdx,
              episodeCount: epList.length,
            });
            navigate({ type: 'detail', content: fullContent });
            return;
          }

          if (ep) {
            logger.info('APP', `Checking episode stream for ${fullContent.id}, episode: ${ep.id}`);
            // Check episode stream URL
            streamData = await getEpisodeStreamUrl(fullContent.id, ep.id);
          } else {
            logger.error('APP', `No episode resolved for series ${fullContent.id} — aborting stream check`, { safeEpIdx, episodeCount: epList.length });
            navigate({ type: 'detail', content: fullContent });
            return;
          }
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
    [navigate, progressMap],
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
    async (content: Content, rental: RentalRecord) => {
      addRented(content);
      // Refresh payment history to update "Spent" amount in profile
      await onRefreshPaymentHistory().catch(err => 
        logger.error('APP', 'Failed to refresh payment history after payment', err)
      );
      navigate({ type: 'paymentSuccess', content, rental });
    },
    [addRented, navigate, onRefreshPaymentHistory],
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
    isPremium,
    premiumSubscription,
    user,
    paymentHistory,
    progressMap,
    favorites,
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
    onToggleFavorite,
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
    onRefreshProfile,
    onRefreshPaymentHistory,
    onRefreshProgress,
  };
}
