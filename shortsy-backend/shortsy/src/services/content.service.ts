import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { nanoid } from 'nanoid';
export async function addContent(data: Omit<Content, 'id'>): Promise<Content> {
  const id = nanoid();
  const item: Content = {
    ...data,
    id,
    views: data.views ?? 0,
    rating: data.rating ?? 0,
    featuredKey: data.featured ? 'true' : 'false',
  };
  await dynamo.send(new PutCommand({
    TableName: TABLES.CONTENT,
    Item: item,
  }));
  return item;
}
import { ScanCommand, GetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { dynamo, TABLES } from '../config/aws';

// ── Types (mirror API spec §1) ────────────────────────────────────────────────
export interface Episode {
  id: string;
  title: string;
  duration: string;
  thumbnail: string;
  videoUrl: string | null;
}

export interface Content {
  id: string;
  title: string;
  type: 'short-film' | 'vertical-series';
  thumbnail: string;
  duration: string;
  price: number;
  director: string;
  language: string;
  genre: string;
  mood: string;
  rating: number;
  views: number;
  description: string;
  trailer?: string | null;
  videoUrl?: string | null;
  episodes?: number | null;
  episodeList?: Episode[] | null;
  featured?: boolean;
  featuredKey?: string; // 'true' | 'false' — string for DynamoDB GSI key
  festivalWinner?: boolean;
}

export interface ContentFilters {
  type?: string;
  genre?: string;
  language?: string;
  mood?: string;
  featured?: boolean;
  festivalWinner?: boolean;
  page?: number;
  limit?: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function strip(item: Content): Content {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { featuredKey, ...rest } = item;
  return rest;
}

function nullEpisodeList(item: Content): Content {
  return { ...item, episodeList: null };
}

// ── Operations ────────────────────────────────────────────────────────────────

/** List content with optional filters + page-based pagination. */
export async function listContent(filters: ContentFilters = {}): Promise<{
  data: Content[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}> {
  const page  = Math.max(1, filters.page  ?? 1);
  const limit = Math.min(100, Math.max(1, filters.limit ?? 20));

  let items: Content[];

  // Use type-index GSI when filtering by type (avoids full table scan)
  if (filters.type) {
    const res = await dynamo.send(new QueryCommand({
      TableName:                 TABLES.CONTENT,
      IndexName:                 'type-index',
      KeyConditionExpression:    '#t = :t',
      ExpressionAttributeNames:  { '#t': 'type' },
      ExpressionAttributeValues: { ':t': filters.type },
    }));
    items = (res.Items ?? []) as Content[];
  } else {
    const res = await dynamo.send(new ScanCommand({ TableName: TABLES.CONTENT }));
    items = (res.Items ?? []) as Content[];
  }

  // In-memory secondary filters (dataset is small)
  if (filters.genre)        items = items.filter(i => i.genre    === filters.genre);
  if (filters.language)     items = items.filter(i => i.language === filters.language);
  if (filters.mood)         items = items.filter(i => i.mood     === filters.mood);
  if (filters.featured   !== undefined) items = items.filter(i => !!i.featured      === filters.featured);
  if (filters.festivalWinner !== undefined) items = items.filter(i => !!i.festivalWinner === filters.festivalWinner);

  // Strip episodeList from list responses — only returned on detail
  items = items.map(i => strip(nullEpisodeList(i)));

  const total      = items.length;
  const totalPages = Math.ceil(total / limit);
  const data       = items.slice((page - 1) * limit, page * limit);

  return { data, pagination: { page, limit, total, totalPages } };
}

/** Get single content item with full episodeList. */
export async function getContentById(id: string): Promise<Content | null> {
  const res = await dynamo.send(new GetCommand({
    TableName: TABLES.CONTENT,
    Key: { id },
  }));
  if (!res.Item) return null;
  return strip(res.Item as Content);
}

/** Full-text search across title, director, genre. */
export async function searchContent(
  q: string,
  type?: string,
  limit = 20,
): Promise<{ query: string; data: Content[]; total: number }> {
  const lower = q.toLowerCase();
  const res   = await dynamo.send(new ScanCommand({ TableName: TABLES.CONTENT }));
  let items   = (res.Items ?? []) as Content[];

  items = items.filter(i =>
    i.title.toLowerCase().includes(lower)    ||
    i.director.toLowerCase().includes(lower) ||
    i.genre.toLowerCase().includes(lower),
  );

  if (type) items = items.filter(i => i.type === type);

  const mapped = items.map(i => strip(nullEpisodeList(i)));
  return { query: q, data: mapped.slice(0, limit), total: mapped.length };
}

/** Return hero item + featured array (uses featured-index GSI). */
export async function getFeaturedContent(): Promise<{
  hero: Partial<Content> | null;
  featured: Partial<Content>[];
}> {
  const res   = await dynamo.send(new QueryCommand({
    TableName:                 TABLES.CONTENT,
    IndexName:                 'featured-index',
    KeyConditionExpression:    'featuredKey = :fk',
    ExpressionAttributeValues: { ':fk': 'true' },
  }));
  const items = (res.Items ?? []) as Content[];

  const hero = items[0]
    ? {
        id:          items[0].id,
        title:       items[0].title,
        type:        items[0].type,
        thumbnail:   items[0].thumbnail,
        videoUrl:    items[0].trailer ?? null,
        genre:       items[0].genre,
        rating:      items[0].rating,
        description: items[0].description,
      }
    : null;

  const featured = items.map(i => ({
    id:        i.id,
    title:     i.title,
    type:      i.type,
    thumbnail: i.thumbnail,
    price:     i.price,
  }));

  return { hero, featured };
}
