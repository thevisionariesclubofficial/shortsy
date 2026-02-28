/**
 * navigationService.ts
 *
 * Pure functions that compute the next AppScreen based on application state.
 * No side-effects, no React hooks — fully unit-testable.
 */
import type { Content, Episode } from '../data/mockData';
import type { AppScreen } from '../types/navigation';

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
 * Resolves the screen to navigate to when a "Continue Watching" card is tapped.
 *
 * Rules:
 *  - Vertical series → Detail (user picks which episode to resume)
 *  - Short film → Player directly (already rented by definition)
 */
export function resolveRentedContentScreen(content: Content): AppScreen {
  if (content.type === 'vertical-series') return { type: 'detail', content };
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
