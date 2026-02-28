/**
 * playbackService.ts
 *
 * Service layer for all Playback APIs (Section 5 of API_SPEC.md).
 *
 * ── Mock mode (USE_MOCK = true) ───────────────────────────────────────────────
 *   5.1 getStreamUrl       → returns content.videoUrl from mockData (no signed URL needed)
 *   5.2 getEpisodeStreamUrl → returns episode.videoUrl + nextEpisode metadata
 *   5.3 saveWatchProgress  → upserts into in-memory _progressStore Map
 *   5.4 getWatchProgress   → reads from _progressStore; returns null if never watched
 *
 * ── Real mode (USE_MOCK = false) ─────────────────────────────────────────────
 *   5.1 getStreamUrl       → GET /content/:id/stream          (signed CDN URL, rental-checked)
 *   5.2 getEpisodeStreamUrl → GET /content/:id/episodes/:epId/stream
 *   5.3 saveWatchProgress  → POST /content/:id/progress
 *   5.4 getWatchProgress   → GET  /content/:id/progress
 *
 * ── Progress auto-save pattern used in PlayerScreen ──────────────────────────
 *   • Every 10 seconds during playback (throttled via lastSaveRef)
 *   • On episode switch (completed = true for the leaving episode)
 *   • On back navigation (completed = false, saves resume position)
 *   • On video end (completed = true)
 *
 * ── Resume pattern ────────────────────────────────────────────────────────────
 *   On first `onLoad` (not episode-switch triggered loads), PlayerScreen calls
 *   getWatchProgress → if currentTime > 5s and < duration−5s, seekTo(currentTime).
 *   For vertical-series, also restores the correct episode number.
 */

import { mockContent } from '../data/mockData';
import type {
  GetEpisodeStreamUrlResponse,
  GetStreamUrlResponse,
  SaveProgressRequest,
  SaveProgressResponse,
  WatchProgress,
} from '../types/api';
import { USE_MOCK, ApiClientError, apiClient, mockDelay } from './apiClient';
import { logger } from '../utils/logger';

// ─────────────────────────────────────────────────────────────────────────────
// In-memory progress store (module-level → survives component remounts)
// ─────────────────────────────────────────────────────────────────────────────

const _progressStore = new Map<string, WatchProgress>();

/**
 * Clears all saved watch progress.
 * Call on logout so a different user starts fresh.
 */
export function clearProgressStore(): void {
  _progressStore.clear();
  logger.info('PLAYBACK', 'Progress store cleared (logout)');
}

// ─────────────────────────────────────────────────────────────────────────────
// 5.1  Get Stream URL — Short Film
// GET  /content/:id/stream
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns the streaming URL for a short film.
 *
 * In mock mode: returns the raw Firebase URL from mockData.
 * In real mode: returns a signed CDN URL that expires in 1 hour.
 *
 * @throws ApiClientError(403, 'NOT_RENTED')    – no active rental
 * @throws ApiClientError(404, 'CONTENT_NOT_FOUND') – unknown id
 *
 * @example
 * const { streamUrl } = await getStreamUrl('1');
 * player.replaceSourceAsync(streamUrl);
 */
export async function getStreamUrl(contentId: string): Promise<GetStreamUrlResponse> {
  if (USE_MOCK) {
    const timer = logger.startTimer('PLAYBACK', `getStreamUrl(${contentId})`);
    await mockDelay();

    const content = mockContent.find(c => c.id === contentId);
    if (!content) {
      timer.fail({ code: 'CONTENT_NOT_FOUND' });
      throw new ApiClientError(404, 'CONTENT_NOT_FOUND', `No content found with id '${contentId}'`);
    }
    if (content.type !== 'short-film' || !content.videoUrl) {
      timer.fail({ code: 'CONTENT_NOT_FOUND', reason: 'Not a short-film or missing videoUrl' });
      throw new ApiClientError(404, 'CONTENT_NOT_FOUND', `Content '${contentId}' is not a streamable short-film`);
    }

    const result: GetStreamUrlResponse = {
      contentId,
      type: 'short-film',
      streamUrl: content.videoUrl,
      trailerUrl: content.trailer,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1h mock expiry
    };

    timer.end({ contentId, title: content.title });
    return result;
  }

  return apiClient.get<GetStreamUrlResponse>(`/content/${contentId}/stream`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 5.2  Get Episode Stream URL — Vertical Series
// GET  /content/:id/episodes/:episodeId/stream
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns the streaming URL for a single episode plus next-episode metadata.
 *
 * In mock mode: looks up the episode in episodeList, returns its videoUrl.
 *
 * @throws ApiClientError(403, 'NOT_RENTED')      – no active rental for the series
 * @throws ApiClientError(404, 'EPISODE_NOT_FOUND') – episodeId not in this series
 *
 * @example
 * const { streamUrl, nextEpisode } = await getEpisodeStreamUrl('2', '2-3');
 */
export async function getEpisodeStreamUrl(
  contentId: string,
  episodeId: string,
): Promise<GetEpisodeStreamUrlResponse> {
  if (USE_MOCK) {
    const timer = logger.startTimer('PLAYBACK', `getEpisodeStreamUrl(${contentId}, ${episodeId})`);
    await mockDelay();

    const content = mockContent.find(c => c.id === contentId);
    if (!content || !content.episodeList) {
      timer.fail({ code: 'CONTENT_NOT_FOUND' });
      throw new ApiClientError(404, 'CONTENT_NOT_FOUND', `No series found with id '${contentId}'`);
    }

    const epIndex = content.episodeList.findIndex(ep => ep.id === episodeId);
    if (epIndex === -1) {
      timer.fail({ code: 'EPISODE_NOT_FOUND', episodeId });
      throw new ApiClientError(404, 'EPISODE_NOT_FOUND', `Episode '${episodeId}' not found in series '${contentId}'`);
    }

    const ep = content.episodeList[epIndex];
    const nextEp = content.episodeList[epIndex + 1] ?? null;

    const result: GetEpisodeStreamUrlResponse = {
      contentId,
      episodeId: ep.id,
      episodeNumber: epIndex + 1,
      episodeTitle: ep.title,
      streamUrl: ep.videoUrl,
      nextEpisode: nextEp
        ? { episodeId: nextEp.id, episodeNumber: epIndex + 2, title: nextEp.title }
        : null,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    };

    timer.end({ episodeTitle: ep.title, episodeNumber: epIndex + 1, hasNext: !!nextEp });
    return result;
  }

  return apiClient.get<GetEpisodeStreamUrlResponse>(
    `/content/${contentId}/episodes/${episodeId}/stream`,
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 5.3  Save Watch Progress
// POST /content/:id/progress
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Persists the current watch position for resume playback.
 *
 * For vertical-series, pass `episodeId` + `episodeNumber` so the server
 * (or mock store) knows which episode to resume.
 *
 * Call sites:
 *   - Every 10 s during playback (throttled in PlayerScreen)
 *   - On episode switch (completed = true for the departing episode)
 *   - On video end (completed = true)
 *   - On back navigation (completed = false)
 *
 * @example
 * await saveWatchProgress('2', {
 *   currentTime: 87, duration: 132, completed: false,
 *   episodeId: '2-3', episodeNumber: 3,
 * });
 */
export async function saveWatchProgress(
  contentId: string,
  params: SaveProgressRequest,
): Promise<SaveProgressResponse> {
  if (USE_MOCK) {
    const timer = logger.startTimer('PLAYBACK', `saveWatchProgress(${contentId})`);
    await mockDelay();

    const content = mockContent.find(c => c.id === contentId);
    const progressPercent = params.duration > 0
      ? Math.round((params.currentTime / params.duration) * 1000) / 10
      : 0;

    const existing = _progressStore.get(contentId);
    const completedEpisodes = existing?.completedEpisodes ?? [];

    // Track completed episodes for vertical-series
    if (content?.type === 'vertical-series' && params.episodeId && params.completed) {
      if (!completedEpisodes.includes(params.episodeId)) {
        completedEpisodes.push(params.episodeId);
      }
    }

    const entry: WatchProgress = {
      contentId,
      type: content?.type ?? 'short-film',
      currentTime: params.currentTime,
      duration: params.duration,
      progressPercent,
      completed: params.completed,
      lastWatchedAt: new Date().toISOString(),
      ...(params.episodeId     && { lastEpisodeId:     params.episodeId }),
      ...(params.episodeNumber && { lastEpisodeNumber: params.episodeNumber }),
      completedEpisodes,
    };

    _progressStore.set(contentId, entry);

    const result: SaveProgressResponse = { saved: true, progressPercent };
    timer.end({ contentId, progressPercent, completed: params.completed });
    return result;
  }

  return apiClient.post<SaveProgressResponse>(`/content/${contentId}/progress`, {
    body: params,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 5.4  Get Watch Progress
// GET  /content/:id/progress
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns saved watch progress for a content item, or `null` if the user
 * has never watched it.
 *
 * Used by PlayerScreen on first load to seek to the saved position.
 *
 * @example
 * const saved = await getWatchProgress('2');
 * if (saved && !saved.completed && saved.currentTime > 5) {
 *   player.seekTo(saved.currentTime);
 * }
 */
export async function getWatchProgress(contentId: string): Promise<WatchProgress | null> {
  if (USE_MOCK) {
    const timer = logger.startTimer('PLAYBACK', `getWatchProgress(${contentId})`);
    await mockDelay();

    const saved = _progressStore.get(contentId) ?? null;
    timer.end({ found: !!saved, progressPercent: saved?.progressPercent ?? 0 });
    return saved;
  }

  try {
    return await apiClient.get<WatchProgress>(`/content/${contentId}/progress`);
  } catch (err: unknown) {
    // 404 = never watched; treat as null, not an error
    if (err instanceof ApiClientError && err.status === 404) { return null; }
    throw err;
  }
}
