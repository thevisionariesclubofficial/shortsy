/**
 * favoriteService.ts
 *
 * Service layer for user favourites (Section 8 of API_SPEC.md).
 *
 * ── Mock mode (USE_MOCK = true) ────────────────────────────────────────────
 *   In-memory Set of content IDs, looked up against mockContent for full
 *   Content objects. Persists for the session (survives component remounts).
 *
 * ── Real mode (USE_MOCK = false) ──────────────────────────────────────────
 *   GET    /users/me/favorites            → { favorites: Content[] }
 *   POST   /users/me/favorites            → body { contentId }
 *   DELETE /users/me/favorites/:contentId → 204 / { message }
 *   GET    /users/me/favorites/:contentId → { isFavorite: boolean }
 */

import type { Content } from '../data/mockData';
import { mockContent } from '../data/mockData';
import { USE_MOCK, apiClient, mockDelay } from './apiClient';
import { logger } from '../utils/logger';

// ─── Mock store ───────────────────────────────────────────────────────────────
const _mockFavorites = new Set<string>();

/** Resets mock favorites (call on logout). */
export function clearFavoritesStore(): void {
  _mockFavorites.clear();
  logger.info('FAVORITES', 'Favorites store cleared');
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /users/me/favorites
// ─────────────────────────────────────────────────────────────────────────────

export async function getFavorites(): Promise<Content[]> {
  if (USE_MOCK) {
    await mockDelay();
    const favorites = mockContent.filter(c => _mockFavorites.has(c.id));
    logger.info('FAVORITES', 'getFavorites (mock)', { count: favorites.length });
    return favorites;
  }
  try {
    const res = await apiClient.get<{ favorites: Content[] }>('/users/me/favorites');
    logger.info('FAVORITES', 'getFavorites', { count: res.favorites.length });
    return res.favorites;
  } catch (err) {
    logger.warn('FAVORITES', 'getFavorites failed', err as object);
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /users/me/favorites/:contentId
// ─────────────────────────────────────────────────────────────────────────────

export async function isFavorited(contentId: string): Promise<boolean> {
  if (USE_MOCK) {
    await mockDelay();
    return _mockFavorites.has(contentId);
  }
  try {
    const res = await apiClient.get<{ isFavorite: boolean }>(
      `/users/me/favorites/${contentId}`,
    );
    return res.isFavorite;
  } catch {
    return false;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /users/me/favorites
// ─────────────────────────────────────────────────────────────────────────────

export async function addFavorite(contentId: string): Promise<void> {
  if (USE_MOCK) {
    await mockDelay();
    _mockFavorites.add(contentId);
    logger.info('FAVORITES', 'addFavorite (mock)', { contentId });
    return;
  }
  await apiClient.post<{ message: string }>('/users/me/favorites', {
    body: { contentId },
  });
  logger.info('FAVORITES', 'addFavorite', { contentId });
}

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /users/me/favorites/:contentId
// ─────────────────────────────────────────────────────────────────────────────

export async function removeFavorite(contentId: string): Promise<void> {
  if (USE_MOCK) {
    await mockDelay();
    _mockFavorites.delete(contentId);
    logger.info('FAVORITES', 'removeFavorite (mock)', { contentId });
    return;
  }
  await apiClient.delete<{ message: string } | void>(
    `/users/me/favorites/${contentId}`,
  );
  logger.info('FAVORITES', 'removeFavorite', { contentId });
}
