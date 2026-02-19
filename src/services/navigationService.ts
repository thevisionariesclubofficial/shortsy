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
 *  - Vertical series → always go to Detail (episode picker)
 *  - Short film, rented → go to Player with its video URL
 *  - Short film, not rented → go to Detail (to rent/preview)
 */
export function resolveContentScreen(
  content: Content,
  isRented: boolean,
): AppScreen {
  if (content.type === 'vertical-series') return { type: 'detail', content };
  if (isRented) return { type: 'player', content, videoUrl: content.videoUrl };
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
