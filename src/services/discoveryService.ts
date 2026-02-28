/**
 * discoveryService.ts
 *
 * Service layer for Discovery APIs (Section 6 of API_SPEC.md).
 *
 * Section 6 maps to `GET /content` with different filter params — the same
 * endpoint already covered by `contentService.listContent`. This service
 * provides named, intent-revealing wrappers so call-sites read clearly:
 *
 *   browseByMood('Suspense')    vs.  listContent({ mood: 'Suspense' })
 *   browseByGenre('Thriller')   vs.  listContent({ genre: 'Thriller' })
 *   browseByLanguage('Hindi')   vs.  listContent({ language: 'Hindi' })
 *
 * ── Caching ────────────────────────────────────────────────────────────────────
 *   All four functions delegate to listContent / searchContent which already
 *   have the 5-minute TTL cache wired in. No additional cache layer needed.
 *
 * ── Mock mode (USE_MOCK = true) ───────────────────────────────────────────────
 *   Delegates to contentService functions which filter the local mockContent array.
 *
 * ── Real mode (USE_MOCK = false) ─────────────────────────────────────────────
 *   Same delegation — contentService's real API path fires automatically.
 *   No changes needed here when switching.
 */

import type { Content } from '../data/mockData';
import type { ListContentResponse } from '../types/api';
import { listContent } from './contentService';
import { logger } from '../utils/logger';

// ─────────────────────────────────────────────────────────────────────────────
// Shared options
// ─────────────────────────────────────────────────────────────────────────────

interface BrowseOptions {
  page?: number;
  limit?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// 6.1  Browse by Mood
// GET  /content?mood=Suspense
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns all content matching the given mood tag.
 * Used by the Mood Discovery section on HomePage and MoodCard taps.
 *
 * @example
 * const { data } = await browseByMood('Late Night');
 */
export async function browseByMood(
  mood: string,
  options: BrowseOptions = {},
): Promise<ListContentResponse> {
  logger.debug('DISCOVERY', `browseByMood("${mood}")`);
  return listContent({ mood, ...options });
}

// ─────────────────────────────────────────────────────────────────────────────
// 6.2  Browse by Genre
// GET  /content?genre=Drama
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns all content matching the given genre.
 * Used by genre filter pills in BrowsePage (BrowsePage uses listContent
 * directly with params; this wrapper is available for any standalone genre
 * pages or genre badges that need a direct call).
 *
 * @example
 * const { data } = await browseByGenre('Thriller');
 */
export async function browseByGenre(
  genre: string,
  options: BrowseOptions = {},
): Promise<ListContentResponse> {
  logger.debug('DISCOVERY', `browseByGenre("${genre}")`);
  return listContent({ genre, ...options });
}

// ─────────────────────────────────────────────────────────────────────────────
// 6.3  Browse by Language
// GET  /content?language=Hindi
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns all content in the given language.
 *
 * @example
 * const { data } = await browseByLanguage('Tamil');
 */
export async function browseByLanguage(
  language: string,
  options: BrowseOptions = {},
): Promise<ListContentResponse> {
  logger.debug('DISCOVERY', `browseByLanguage("${language}")`);
  return listContent({ language, ...options });
}

// ─────────────────────────────────────────────────────────────────────────────
// Popular Content  (not a Section 6 endpoint but used by SearchScreen)
// Real API equivalent: GET /content?sort=views&order=desc&limit=N
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns the most-viewed content items, sorted descending by view count.
 *
 * In mock mode: fetches all content via listContent (cached) and sorts
 * client-side by `views`. In a real API this would be a server-sorted call.
 *
 * Used by SearchScreen's "Popular This Week" section on idle state.
 *
 * @example
 * const popular = await getPopularContent(6);
 */
export async function getPopularContent(limit = 10): Promise<Content[]> {
  logger.debug('DISCOVERY', `getPopularContent(limit=${limit})`);
  // listContent with a high limit so we sort the full set client-side.
  // In mock mode: 8 items total, so limit=20 gets everything.
  const { data } = await listContent({ limit: 20 });
  const sorted = [...data].sort((a, b) => b.views - a.views).slice(0, limit);
  logger.debug('DISCOVERY', `getPopularContent → ${sorted.length} items`);
  return sorted;
}
