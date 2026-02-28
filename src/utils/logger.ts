/**
 * logger.ts
 *
 * Generic structured logger for Shortsy.
 *
 * ── Namespaces ─────────────────────────────────────────────────────────────────
 *   'API'   → real HTTP requests/responses via apiClient
 *   'MOCK'  → mock service calls (USE_MOCK = true)
 *   'CACHE' → in-memory TTL cache hits / misses / writes
 *   'NAV'   → screen navigation events
 *   'APP'   → app-level lifecycle (auth, startup, etc.)
 *   any     → pass any string for custom namespaces
 *
 * ── Levels ────────────────────────────────────────────────────────────────────
 *   DEBUG → verbose detail (params, raw responses)
 *   INFO  → normal operation (request sent, cache hit, navigation)
 *   WARN  → non-fatal anomalies (cache expired, retry)
 *   ERROR → failures (HTTP errors, thrown exceptions)
 *
 * ── Zero cost in production ───────────────────────────────────────────────────
 *   LOG_ENABLED is tied to React Native's __DEV__ flag.
 *   In release builds __DEV__ = false, so every logger call is a no-op.
 *
 * ── Usage ─────────────────────────────────────────────────────────────────────
 *   import { logger } from '../utils/logger';
 *
 *   // Simple log
 *   logger.info('APP', 'User logged in', { userId: '42' });
 *
 *   // Timed span (logs start + end/fail with elapsed ms automatically)
 *   const timer = logger.startTimer('API', 'GET /content/featured');
 *   try {
 *     const data = await fetch(url);
 *     timer.end(data);   // ✓ GET /content/featured (312ms)
 *   } catch (e) {
 *     timer.fail(e);     // ✗ GET /content/featured (45ms)
 *   }
 *
 *   // Read full history for a debug panel or crash report
 *   const history = logger.getHistory();
 */

// ─── Config ───────────────────────────────────────────────────────────────────

/**
 * Master on/off switch.
 * Automatically false in release builds (Metro sets __DEV__ = false).
 * Override manually if needed: const LOG_ENABLED = true;
 */
const LOG_ENABLED: boolean =
  typeof __DEV__ !== 'undefined' ? __DEV__ : true;

/**
 * Minimum severity to print. Raise to 'INFO' or 'WARN' to reduce noise.
 * DEBUG → shows everything including raw params/bodies
 * INFO  → shows start/end of every call but not raw payloads
 */
const MIN_LEVEL: LogLevel = 'DEBUG';

/** How many entries to keep in the circular in-memory history. */
const MAX_HISTORY_SIZE = 300;

// ─── Types ────────────────────────────────────────────────────────────────────

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

export interface LogEntry {
  /** ISO-8601 timestamp */
  timestamp: string;
  level: LogLevel;
  namespace: string;
  message: string;
  /** Arbitrary structured data (params, response body, error, etc.) */
  data?: unknown;
  /** Elapsed milliseconds, populated by startTimer().end() / .fail() */
  durationMs?: number;
}

export interface Timer {
  /**
   * Call when the async operation succeeds.
   * Logs the elapsed duration and optional response data at INFO level.
   * @returns Elapsed milliseconds
   */
  end(data?: unknown): number;
  /**
   * Call when the async operation throws/rejects.
   * Logs the elapsed duration and the error at ERROR level.
   * @returns Elapsed milliseconds
   */
  fail(err: unknown): number;
}

// ─── Internals ────────────────────────────────────────────────────────────────

const LEVEL_RANK: Record<LogLevel, number> = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

const LEVEL_COLOR: Record<LogLevel, string> = {
  DEBUG: '\x1b[90m', // dim grey
  INFO:  '\x1b[36m', // cyan
  WARN:  '\x1b[33m', // yellow
  ERROR: '\x1b[31m', // red
};
const RESET = '\x1b[0m';
const BOLD  = '\x1b[1m';

/** Circular buffer of log entries */
const _history: LogEntry[] = [];

function _log(
  level: LogLevel,
  namespace: string,
  message: string,
  data?: unknown,
  durationMs?: number,
): void {
  if (!LOG_ENABLED) { return; }
  if (LEVEL_RANK[level] < LEVEL_RANK[MIN_LEVEL]) { return; }

  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    namespace,
    message,
    data,
    durationMs,
  };

  // Circular buffer — drop oldest when full
  if (_history.length >= MAX_HISTORY_SIZE) { _history.shift(); }
  _history.push(entry);

  // ── Format for Metro / Flipper terminal ──────────────────────────────────
  const color   = LEVEL_COLOR[level];
  const dur     = durationMs !== undefined ? ` ${BOLD}(${durationMs}ms)${RESET}` : '';
  const tag     = `${color}${BOLD}[${namespace}]${RESET}`;
  const msg     = `${color}${message}${RESET}${dur}`;
  const line    = `${tag} ${msg}`;

  // Pick the right console method so Flipper/Metro colours levels correctly
  if (level === 'ERROR') {
    data !== undefined ? console.error(line, data) : console.error(line);
  } else if (level === 'WARN') {
    data !== undefined ? console.warn(line, data) : console.warn(line);
  } else if (level === 'DEBUG') {
    data !== undefined ? console.debug(line, data) : console.debug(line);
  } else {
    data !== undefined ? console.log(line, data) : console.log(line);
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export const logger = {
  // ── Simple levelled logs ──────────────────────────────────────────────────

  debug(namespace: string, message: string, data?: unknown): void {
    _log('DEBUG', namespace, message, data);
  },

  info(namespace: string, message: string, data?: unknown): void {
    _log('INFO', namespace, message, data);
  },

  warn(namespace: string, message: string, data?: unknown): void {
    _log('WARN', namespace, message, data);
  },

  error(namespace: string, message: string, data?: unknown): void {
    _log('ERROR', namespace, message, data);
  },

  // ── Timed span ────────────────────────────────────────────────────────────

  /**
   * Starts a named timer for an async operation.
   * Logs a DEBUG "→ label" on start, then INFO "✓ label (Nms)" on .end()
   * or ERROR "✗ label (Nms)" on .fail().
   *
   * @example
   * const t = logger.startTimer('MOCK', 'listContent');
   * await mockDelay();
   * t.end({ count: results.length });
   */
  startTimer(namespace: string, label: string): Timer {
    _log('DEBUG', namespace, `→ ${label}`);
    const startedAt = Date.now();

    return {
      end(data?: unknown): number {
        const ms = Date.now() - startedAt;
        _log('INFO', namespace, `✓ ${label}`, data, ms);
        return ms;
      },
      fail(err: unknown): number {
        const ms = Date.now() - startedAt;
        _log('ERROR', namespace, `✗ ${label}`, err, ms);
        return ms;
      },
    };
  },

  // ── History ───────────────────────────────────────────────────────────────

  /**
   * Returns a snapshot of all stored log entries (oldest first).
   * Useful for attaching to crash reports, shake-to-debug panels, etc.
   */
  getHistory(): LogEntry[] {
    return [..._history];
  },

  /** Clears the in-memory log history. */
  clearHistory(): void {
    _history.length = 0;
  },

  /**
   * Prints the full history as a single formatted block.
   * Call from a dev debug screen or shake handler.
   *
   * @example
   * logger.printHistory();
   */
  printHistory(): void {
    if (!LOG_ENABLED) { return; }
    console.group?.('📋 Shortsy Log History');
    _history.forEach(e => {
      const dur = e.durationMs !== undefined ? ` (${e.durationMs}ms)` : '';
      const line = `[${e.timestamp}] [${e.level}] [${e.namespace}] ${e.message}${dur}`;
      e.data !== undefined ? console.log(line, e.data) : console.log(line);
    });
    console.groupEnd?.();
  },
};
