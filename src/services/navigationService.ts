/**
 * navigationService.ts
 *
 * Pure functions that compute the next AppScreen based on application state.
 * No side-effects, no React hooks — fully unit-testable.
 */
import type { Content, Episode } from '../data/mockData';
import type { AppScreen } from '../types/navigation';
import type { WatchProgress } from '../types/api';

/**
 * Resolves the first screen the user should see after the splash animation.
 */
export function resolvePostSplashScreen(
  isAuthenticated: boolean,
  hasSeenOnboarding: boolean,
): AppScreen {
  if (isAuthenticated) return { type: 'home' };
  if (hasSeenOnboarding) return { type: 'login' };
  return { type: 'onboarding' };
}

/**
 * Resolves the screen to navigate to when a content card is tapped.
 *
 * Rules:
 *  - All content → always go to Detail (shows Watch Now if rented, Rent & Watch if not)
 *  - Only "Continue Watching" cards bypass Detail and go straight to Player.
 */
export function resolveContentScreen(
  content: Content,
  _isRented: boolean,
): AppScreen {
  return { type: 'detail', content };
}

/**
 * Resolves the screen to navigate to when a "Continue Watching" card is tapped,
 * taking saved watch progress into account.
 *
 * Rules:
 *  - Short film  → Player directly (PlayerScreen auto-seeks to saved position on load)
 *  - Vertical series with progress → Player at the last-watched episode
 *  - Vertical series without progress → Player at Episode 1
 *  - Vertical series with no episodeList → Detail (safety fallback)
 */
export function resolveRentedClickWithProgress(
  content: Content,
  progress: WatchProgress | null,
): AppScreen {
  if (content.type === 'vertical-series') {
    const epList = content.episodeList;
    if (!epList || epList.length === 0) {
      return { type: 'detail', content };
    }
    const epNumber = progress?.lastEpisodeNumber ?? 1;
    const rawIdx = epNumber - 1;
    const safeEpIdx = Math.max(0, Math.min(rawIdx, epList.length - 1));
    const ep = epList[safeEpIdx];
    if (!ep) return { type: 'detail', content };
    return { type: 'player', content, videoUrl: ep.videoUrl, episodeNumber: epNumber };
  }
  // Short film: go straight to player; PlayerScreen will seekTo saved position on load
  return { type: 'player', content, videoUrl: content.videoUrl };
}

/**
 * Builds the Player screen state for a specific episode.
 */
export function buildEpisodePlayerScreen(
  ep: Episode,
  content: Content,
  episodeNumber: number,
): AppScreen {
  return { type: 'player', content, videoUrl: ep.videoUrl, episodeNumber };
}

/**
 * Resolves the Player screen to navigate to immediately after a successful
 * payment ("Watch Now" button).
 *
 * Rules:
 *  - Short film  → Player with the film's videoUrl
 *  - Vertical series → Player starting at Episode 1 using the first
 *    episode's videoUrl (series have no top-level videoUrl)
 */
export function resolveWatchNowScreen(content: Content): AppScreen {
  if (content.type === 'vertical-series') {
    const firstEp = content.episodeList?.[0];
    return {
      type: 'player',
      content,
      videoUrl: firstEp?.videoUrl,
      episodeNumber: 1,
    };
  }
  return { type: 'player', content, videoUrl: content.videoUrl };
}
