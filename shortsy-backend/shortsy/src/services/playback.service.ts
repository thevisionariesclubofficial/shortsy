import { GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { dynamo, s3, TABLES, ENV } from '../config/aws';
import type { Content } from './content.service';

// ── Types ─────────────────────────────────────────────────────────────────────
export interface ProgressRecord {
  userId:           string;
  contentId:        string;
  type:             'short-film' | 'vertical-series';
  currentTime:      number;
  duration:         number;
  progressPercent:  number;
  completed:        boolean;
  lastWatchedAt:    string;
  // Series-specific
  lastEpisodeId?:     string;
  lastEpisodeNumber?: number;
  completedEpisodes?: string[];
}

// ── Stream URL generation ─────────────────────────────────────────────────────
/**
 * Resolve a streaming URL:
 *  - If the stored URL is absolute (Firebase / CDN), return it directly.
 *  - If the bucket is configured, generate an S3 pre-signed URL.
 *  - Otherwise return a CDN-style fallback for local dev.
 */
async function resolveUrl(
  storedUrl: string | null | undefined,
  contentId: string,
  suffix: string, // e.g. 'film.mp4' or 'episodes/2-1.mp4'
): Promise<string> {
  if (storedUrl && (storedUrl.startsWith('http://') || storedUrl.startsWith('https://'))) {
    return storedUrl;
  }

  const key = storedUrl || `content/${contentId}/${suffix}`;

  if (ENV.s3Bucket) {
    const cmd = new GetObjectCommand({ Bucket: ENV.s3Bucket, Key: key });
    return getSignedUrl(s3, cmd, { expiresIn: ENV.streamExpiry });
  }

  // Fallback: CDN URL with a dev token
  return `${ENV.cdnBase}/signed/${key}?token=dev&expires=${Date.now() + ENV.streamExpiry * 1000}`;
}

export async function buildFilmStream(content: Content) {
  const streamUrl = await resolveUrl(content.videoUrl, content.id, 'film.mp4');
  return {
    contentId:  content.id,
    type:       'short-film',
    streamUrl,
    trailerUrl: content.trailer ?? null,
    expiresAt:  new Date(Date.now() + ENV.streamExpiry * 1000).toISOString(),
  };
}

export async function buildEpisodeStream(content: Content, episodeId: string) {
  const epList  = content.episodeList ?? [];
  const epIndex = epList.findIndex(e => e.id === episodeId);
  if (epIndex === -1) return null;

  const ep   = epList[epIndex];
  const next = epList[epIndex + 1] ?? null;

  const streamUrl = await resolveUrl(ep.videoUrl, content.id, `episodes/${ep.id}.mp4`);

  return {
    contentId:    content.id,
    episodeId:    ep.id,
    episodeNumber: epIndex + 1,
    episodeTitle: ep.title,
    streamUrl,
    nextEpisode: next
      ? { episodeId: next.id, episodeNumber: epIndex + 2, title: next.title }
      : null,
    expiresAt: new Date(Date.now() + ENV.streamExpiry * 1000).toISOString(),
  };
}

// ── Watch progress ────────────────────────────────────────────────────────────
export async function saveProgress(
  userId:      string,
  contentId:   string,
  contentType: 'short-film' | 'vertical-series',
  data: {
    currentTime:    number;
    duration:       number;
    completed?:     boolean;
    episodeId?:     string;
    episodeNumber?: number;
  },
): Promise<{ saved: boolean; progressPercent: number }> {
  const progressPercent =
    data.duration > 0
      ? Math.round((data.currentTime / data.duration) * 1000) / 10
      : 0;

  // Merge completedEpisodes for series
  let completedEpisodes: string[] = [];
  if (contentType === 'vertical-series' && data.episodeId && data.completed) {
    const existing = await getProgress(userId, contentId);
    completedEpisodes = [
      ...new Set([...(existing?.completedEpisodes ?? []), data.episodeId]),
    ];
  }

  const record: ProgressRecord = {
    userId,
    contentId,
    type:            contentType,
    currentTime:     data.currentTime,
    duration:        data.duration,
    progressPercent,
    completed:       data.completed ?? false,
    lastWatchedAt:   new Date().toISOString(),
    ...(contentType === 'vertical-series' && {
      lastEpisodeId:    data.episodeId,
      lastEpisodeNumber: data.episodeNumber,
      completedEpisodes,
    }),
  };

  await dynamo.send(new PutCommand({ TableName: TABLES.PROGRESS, Item: record }));
  return { saved: true, progressPercent };
}

export async function getProgress(
  userId:    string,
  contentId: string,
): Promise<ProgressRecord | null> {
  const res = await dynamo.send(new GetCommand({
    TableName: TABLES.PROGRESS,
    Key: { userId, contentId },
  }));
  return res.Item ? (res.Item as ProgressRecord) : null;
}
