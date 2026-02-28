// ─────────────────────────────────────────────────────────────────────────────
// 3.x  Add Content (Upload)
// POST /content
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Uploads new content to the database via POST /content.
 * Requires authentication (Bearer token).
 *
 * @param payload Content fields (title, description, type, genre, language, mood, etc.)
 * @returns Promise resolving to the created content object
 */
export async function addContent(payload: Record<string, any>): Promise<any> {
  // You may want to type payload more strictly based on your API spec
  return apiClient.post<any>('/content', { body: payload });
}
/**
 * contentService.ts
 *
 * Service layer for all Content APIs (Section 3 of API_SPEC.md).
 *
 * ── Mock mode (USE_MOCK = true) ───────────────────────────────────────────────
 *   Applies filters/search/pagination against the local mockContent array
 *   and resolves after a short simulated delay. No network calls are made.
 *
 * ── Real mode (USE_MOCK = false) ─────────────────────────────────────────────
 *   Delegates to apiClient which calls the live REST endpoints.
 *   No call-site changes required — the public function signatures stay the same.
 *
 * ── Switching ─────────────────────────────────────────────────────────────────
 *   In src/services/apiClient.ts, set USE_MOCK = false.
 *   That's it.
 */

import {
  genres,
  languages,
  mockContent,
  moods,
  type Content,
} from '../data/mockData';
import type {
  GetContentDetailResponse,
  GetFeaturedResponse,
  GetMetadataResponse,
  ListContentParams,
  ListContentResponse,
  SearchContentParams,
  SearchContentResponse,
} from '../types/api';
import { USE_MOCK, apiClient, mockDelay } from './apiClient';
import { logger } from '../utils/logger';

// ─────────────────────────────────────────────────────────────────────────────
// In-memory TTL cache
//
// WHY: Every time a screen mounts (navigating back/forth) it calls useEffect
//      and fires the service functions again — even in mock mode this causes
//      a 300 ms loading flash on every navigation.
//
// HOW: Module-level Map persists across component mount/unmount cycles.
//      Cache hits resolve synchronously in a single microtask (no spinner).
//      Entries expire after CACHE_TTL_MS so data stays reasonably fresh.
//
// ALTERNATIVES CONSIDERED:
//   useMemo        → dies when the component unmounts; not cross-screen
//   AsyncStorage   → disk I/O + JSON overhead; good for cross-session, overkill here
//   React Context  → useful for sharing, but someone still has to fetch+store
//   React Query    → best-in-class but adds a dependency; cache here is equivalent
// ─────────────────────────────────────────────────────────────────────────────

/** How long a cache entry is valid. Adjust freely. */
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _cache = new Map<string, CacheEntry<any>>();

function getCache<T>(key: string): T | null {
  const entry = _cache.get(key) as CacheEntry<T> | undefined;
  if (!entry) {
    logger.debug('CACHE', `MISS ${key}`);
    return null;
  }
  if (Date.now() > entry.expiresAt) {
    _cache.delete(key);
    logger.debug('CACHE', `EXPIRED ${key}`);
    return null;
  }
  const remainingSec = Math.round((entry.expiresAt - Date.now()) / 1000);
  logger.debug('CACHE', `HIT ${key}`, { ttlRemainingSeconds: remainingSec });
  return entry.data;
}

function setCache<T>(key: string, data: T): void {
  _cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
  logger.debug('CACHE', `SET ${key}`, { ttlSeconds: CACHE_TTL_MS / 1000 });
}

/**
 * Clears all cached content.
 * Call this on logout, or when the user pulls-to-refresh, to force a fresh fetch.
 *
 * @example
 * import { clearContentCache } from '../services/contentService';
 * clearContentCache(); // inside a pull-to-refresh handler
 */
export function clearContentCache(): void {
  _cache.clear();
}

/**
 * Invalidates the cached detail for one content item.
 * Useful after a rental or progress update for that specific item.
 *
 * @example
 * invalidateContentDetail('2'); // forces next getContentDetail('2') to re-fetch
 */
export function invalidateContentDetail(id: string): void {
  _cache.delete(`detail:${id}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 3.1  List All Content
// GET  /content
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns a paginated, filtered list of all content.
 *
 * Supported filters: type, genre, language, mood, featured, festivalWinner
 * Pagination:        page (1-based), limit (default 20)
 *
 * @example
 * const { data } = await listContent({ genre: 'Drama', page: 1, limit: 10 });
 */
export async function listContent(
  params: ListContentParams = {},
): Promise<ListContentResponse> {
  const key = `list:${JSON.stringify(params)}`;
  const cached = getCache<ListContentResponse>(key);
  if (cached) { return cached; }

  let result: ListContentResponse;
  if (USE_MOCK) {
    const timer = logger.startTimer('MOCK', 'listContent');
    await mockDelay();
    result = mockListContent(params);
    timer.end({ count: result.data.length, total: result.pagination.total });
  } else {
    result = await apiClient.get<ListContentResponse>('/content', {
      params: params as Record<string, string | number | boolean | undefined>,
    });
  }

  setCache(key, result);
  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3.2  Get Content Detail
// GET  /content/:id
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns the full Content object for the given id.
 * For vertical-series, the full episodeList is included.
 * For short-films, episodeList is null / absent.
 *
 * Throws ApiClientError with code CONTENT_NOT_FOUND (404) if id is unknown.
 *
 * @example
 * const content = await getContentDetail('2');
 */
export async function getContentDetail(id: string): Promise<GetContentDetailResponse> {
  const key = `detail:${id}`;
  const cached = getCache<GetContentDetailResponse>(key);
  if (cached) { return cached; }

  let result: GetContentDetailResponse;
  if (USE_MOCK) {
    const timer = logger.startTimer('MOCK', `getContentDetail(${id})`);
    await mockDelay();
    result = mockGetContentDetail(id);
    timer.end({ id: result.id, title: result.title, type: result.type });
  } else {
    result = await apiClient.get<GetContentDetailResponse>(`/content/${id}`);
  }

  setCache(key, result);
  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3.3  Search Content
// GET  /content/search?q=...
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Full-text search across title, director, genre, and mood.
 * Optionally filtered by content type.
 *
 * @example
 * const results = await searchContent({ q: 'midnight', type: 'vertical-series' });
 */
export async function searchContent(
  params: SearchContentParams,
): Promise<SearchContentResponse> {
  const key = `search:${JSON.stringify(params)}`;
  const cached = getCache<SearchContentResponse>(key);
  if (cached) { return cached; }

  let result: SearchContentResponse;
  if (USE_MOCK) {
    const timer = logger.startTimer('MOCK', `searchContent("${params.q}")`);
    await mockDelay();
    result = mockSearchContent(params);
    timer.end({ hits: result.total });
  } else {
    result = await apiClient.get<SearchContentResponse>('/content/search', {
      params: params as unknown as Record<string, string | number | boolean | undefined>,
    });
  }

  setCache(key, result);
  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3.4  Get Featured Content
// GET  /content/featured
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns the hero item (first featured content) and the featured content list.
 * Used by HomePage to populate the hero video + featured horizontal row.
 *
 * @example
 * const { hero, featured } = await getFeaturedContent();
 */
export async function getFeaturedContent(): Promise<GetFeaturedResponse> {
  const key = 'featured';
  const cached = getCache<GetFeaturedResponse>(key);
  if (cached) { return cached; }

  let result: GetFeaturedResponse;
  if (USE_MOCK) {
    const timer = logger.startTimer('MOCK', 'getFeaturedContent');
    await mockDelay();
    result = mockGetFeaturedContent();
    timer.end({ hero: result.hero.title, featuredCount: result.featured.length });
  } else {
    result = await apiClient.get<GetFeaturedResponse>('/content/featured');
  }

  setCache(key, result);
  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3.5  Get Discovery Metadata
// GET  /content/metadata
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns static discovery lists: moods, genres, and languages.
 * Used by BrowsePage and SearchScreen to populate filter chips.
 *
 * @example
 * const { moods, genres, languages } = await getContentMetadata();
 */
export async function getContentMetadata(): Promise<GetMetadataResponse> {
  const key = 'metadata';
  const cached = getCache<GetMetadataResponse>(key);
  if (cached) { return cached; }

  let result: GetMetadataResponse;
  if (USE_MOCK) {
    const timer = logger.startTimer('MOCK', 'getContentMetadata');
    await mockDelay();
    result = mockGetContentMetadata();
    timer.end({ moods: result.moods.length, genres: result.genres.length, languages: result.languages.length });
  } else {
    result = await apiClient.get<GetMetadataResponse>('/content/metadata');
  }

  setCache(key, result);
  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// Mock implementations
// ─────────────────────────────────────────────────────────────────────────────

function mockListContent(params: ListContentParams): ListContentResponse {
  const {
    type,
    genre,
    language,
    mood,
    featured,
    festivalWinner,
    page = 1,
    limit = 20,
  } = params;

  let results = [...mockContent];

  if (type)           results = results.filter(c => c.type === type);
  if (genre)          results = results.filter(c => c.genre === genre);
  if (language)       results = results.filter(c => c.language === language);
  if (mood)           results = results.filter(c => c.mood === mood);
  if (featured  != null) results = results.filter(c => !!c.featured  === featured);
  if (festivalWinner != null) results = results.filter(c => !!c.festivalWinner === festivalWinner);

  const total      = results.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start      = (page - 1) * limit;
  const data       = results.slice(start, start + limit);

  return {
    data,
    pagination: { page, limit, total, totalPages },
  };
}

function mockGetContentDetail(id: string): GetContentDetailResponse {
  const content = mockContent.find(c => c.id === id);
  if (!content) {
    // Mirror the ApiClientError shape the real client would throw
    const err = Object.assign(new Error(`No content found with id '${id}'`), {
      status: 404,
      code: 'CONTENT_NOT_FOUND',
    });
    throw err;
  }
  return content;
}

function mockSearchContent(params: SearchContentParams): SearchContentResponse {
  const { q, type, limit = 20 } = params;
  const query = q.toLowerCase().trim();

  let results = mockContent.filter(c =>
    c.title.toLowerCase().includes(query)    ||
    c.director.toLowerCase().includes(query) ||
    c.genre.toLowerCase().includes(query)    ||
    c.mood.toLowerCase().includes(query)     ||
    c.language.toLowerCase().includes(query),
  );

  if (type) results = results.filter(c => c.type === type);

  const data = results.slice(0, limit);

  return { query: q, data, total: data.length };
}

function mockGetFeaturedContent(): GetFeaturedResponse {
  const featuredList = mockContent.filter(c => c.featured);

  // Hero = the first featured short-film that has a hero video, fallback to first featured
  const heroSource: Content =
    featuredList.find(c => c.type === 'short-film' && c.videoUrl) ??
    featuredList[0] ??
    mockContent[0];

  const hero = {
    id:          heroSource.id,
    title:       heroSource.title,
    type:        heroSource.type,
    thumbnail:   heroSource.thumbnail,
    videoUrl:    heroSource.videoUrl,
    genre:       heroSource.genre,
    rating:      heroSource.rating,
    description: heroSource.description,
  };

  return { hero, featured: featuredList };
}

function mockGetContentMetadata(): GetMetadataResponse {
  return { moods, genres, languages };
}
