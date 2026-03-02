import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  BackHandler,
  GestureResponderEvent,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  useWindowDimensions,
} from 'react-native';
import { VideoView, useVideoPlayer } from 'react-native-video';
import { Content } from '../data/mockData';
import { getWatchProgress, saveWatchProgress, getStreamUrl, getEpisodeStreamUrl } from '../services/playbackService';
import { USE_MOCK } from '../services/apiClient';
import { logger } from '../utils/logger';
import type { SaveProgressRequest } from '../types/api';

// ─── Icons ────────────────────────────────────────────────────────────────────
function ArrowLeftIcon() {
  return (
    <View style={iconStyles.arrowWrap}>
      <View style={iconStyles.arrowStem} />
      <View style={[iconStyles.arrowTip, iconStyles.arrowTipUp]} />
      <View style={[iconStyles.arrowTip, iconStyles.arrowTipDown]} />
    </View>
  );
}

function PlayIcon({ size = 40 }: { size?: number }) {
  return (
    <View
      style={{
        width: 0, height: 0,
        borderTopWidth: size * 0.55,
        borderBottomWidth: size * 0.55,
        borderLeftWidth: size,
        borderTopColor: 'transparent',
        borderBottomColor: 'transparent',
        borderLeftColor: '#ffffff',
        marginLeft: size * 0.15,
      }}
    />
  );
}

function PauseIcon({ size = 36 }: { size?: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: size * 0.2 }}>
      <View style={{ width: size * 0.25, height: size, backgroundColor: '#ffffff', borderRadius: 3 }} />
      <View style={{ width: size * 0.25, height: size, backgroundColor: '#ffffff', borderRadius: 3 }} />
    </View>
  );
}

function VolumeIcon({ muted }: { muted: boolean }) {
  const c = '#ffffff';
  return (
    <View style={iconStyles.volWrap}>
      {/* Speaker body */}
      <View style={[iconStyles.volBody, { borderColor: c }]} />
      <View style={[iconStyles.volCone, { borderTopColor: 'transparent', borderBottomColor: 'transparent', borderLeftColor: c }]} />
      {muted ? (
        <>
          <View style={[iconStyles.volX1, { backgroundColor: c }]} />
          <View style={[iconStyles.volX2, { backgroundColor: c }]} />
        </>
      ) : (
        <View style={[iconStyles.volWave, { borderColor: c }]} />
      )}
    </View>
  );
}

function MoreVertIcon() {
  return (
    <View style={iconStyles.moreWrap}>
      {[0, 1, 2].map(i => (
        <View key={i} style={iconStyles.moreDot} />
      ))}
    </View>
  );
}

function LoadingSpinner() {
  const spin = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(spin, { toValue: 1, duration: 900, useNativeDriver: true })
    ).start();
  }, [spin]);
  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  return (
    <Animated.View style={[spinnerStyles.ring, { transform: [{ rotate }] }]} />
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface PlayerScreenProps {
  content: Content;
  onBack: () => void;
  videoUrl?: string;
  episodeNumber?: number;
  updateProgress: (contentId: string, progress: WatchProgress) => void;
  getProgress: (contentId: string) => WatchProgress | null;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function PlayerScreen({ content, onBack, videoUrl, episodeNumber, updateProgress, getProgress }: PlayerScreenProps) {
  // true when the player has (or will fetch) a real video file.
  // In real API mode, content.videoUrl / ep.videoUrl are null — signed URLs must be
  // fetched via getStreamUrl / getEpisodeStreamUrl. hasRealVideo = true in that case too,
  // so all player controls, VideoView, and buffering spinner activate immediately.
  const hasRealVideo = !!videoUrl || !USE_MOCK;
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted,   setIsMuted]   = useState(false);
  const [progress,  setProgress]  = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [currentEp, setCurrentEp] = useState(episodeNumber ?? 1);
  const [isBuffering, setIsBuffering] = useState<boolean>(hasRealVideo); // true while video / signed URL loads
  // Real video tracking (only used when videoUrl is provided)
  const [duration,    setDuration]    = useState(0);   // total seconds
  const [currentTime, setCurrentTime] = useState(0);   // elapsed seconds

  const controlsOpacity = useRef(new Animated.Value(1)).current;
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressBarRef = useRef<View>(null);
  const autoPlayOnLoad = useRef(false);
  const currentEpRef = useRef(episodeNumber ?? 1);
  // Progress tracking refs (used inside event listener closures to avoid stale state)
  const currentTimeRef  = useRef(0);   // mirrors currentTime state
  const durationRef     = useRef(0);   // mirrors duration state
  const lastSaveRef     = useRef(0);   // Date.now() of last progress save (10s throttle)
  const hasRestored     = useRef(false); // true once we've attempted to restore progress

  // ── Helper: Save progress to backend and update local cache ──────────────────
  const saveAndUpdateProgress = async (req: SaveProgressRequest) => {
    try {
      const response = await saveWatchProgress(content.id, req);
      if (response.saved) {
        // Calculate progress data to match what the backend would return
        const progressPercent = req.duration > 0
          ? Math.round((req.currentTime / req.duration) * 1000) / 10
          : 0;
        
        const existing = getProgress(content.id);
        const completedEpisodes = existing?.completedEpisodes ?? [];
        
        // Track completed episodes for vertical-series
        if (content.type === 'vertical-series' && req.episodeId && req.completed) {
          if (!completedEpisodes.includes(req.episodeId)) {
            completedEpisodes.push(req.episodeId);
          }
        }

        const progressData: WatchProgress = {
          contentId: content.id,
          type: content.type,
          currentTime: req.currentTime,
          duration: req.duration,
          progressPercent,
          completed: req.completed,
          lastWatchedAt: new Date().toISOString(),
          ...(req.episodeId && { lastEpisodeId: req.episodeId }),
          ...(req.episodeNumber && { lastEpisodeNumber: req.episodeNumber }),
          completedEpisodes,
        };
        
        updateProgress(content.id, progressData);
      }
    } catch (error) {
      // Silently fail - progress saving is not critical
    }
  };

  const isShortFilm = content.type === 'short-film';
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  // ── Control visibility ──────────────────────────────────────────────────────
  const toggleControls = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    
    if (showControls) {
      // Hide controls
      Animated.timing(controlsOpacity, { toValue: 0, duration: 300, useNativeDriver: true }).start(() =>
        setShowControls(false),
      );
    } else {
      // Show controls
      setShowControls(true);
      Animated.timing(controlsOpacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
      // Auto-hide after 3 seconds if playing
      if (isPlaying) {
        scheduleHide();
      }
    }
  };

  const showControlsNow = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setShowControls(true);
    Animated.timing(controlsOpacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
  };

  const scheduleHide = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (isPlaying) {
        Animated.timing(controlsOpacity, { toValue: 0, duration: 400, useNativeDriver: true }).start(() =>
          setShowControls(false),
        );
      }
    }, 3000);
  };

  useEffect(() => {
    if (showControls && isPlaying) scheduleHide();
    return () => { if (hideTimer.current) clearTimeout(hideTimer.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showControls, isPlaying]);

  // ── Fake progress ticker (mock thumbnail mode only — disabled when hasRealVideo) ──
  useEffect(() => {
    if (!hasRealVideo && isPlaying) {
      progressTimer.current = setInterval(() => {
        setProgress(p => {
          if (p >= 100) { setIsPlaying(false); return 100; }
          return p + 0.5;
        });
      }, 500);
    } else {
      if (progressTimer.current) clearInterval(progressTimer.current);
    }
    return () => { if (progressTimer.current) clearInterval(progressTimer.current); };
  }, [isPlaying, hasRealVideo]);

  const togglePlay = () => {
    if (hasRealVideo) {
      if (isPlaying) {
        epPlayer.pause();
      } else {
        // If the video has ended, restart from the beginning
        if (duration > 0 && currentTime >= duration - 0.5) {
          epPlayer.seekTo(0);
        }
        epPlayer.play();
      }
      // isPlaying state will be synced via onPlaybackStateChange event
    } else {
      setIsPlaying(v => !v);
    }
    showControlsNow();
  };

  // Save progress then navigate back
  const handleBack = () => {
    if (hasRealVideo && currentTimeRef.current > 0) {
      const req: SaveProgressRequest = {
        currentTime: currentTimeRef.current,
        duration: durationRef.current,
        completed: false,
      };
      if (content.type === 'vertical-series') {
        const ep = content.episodeList?.[currentEpRef.current - 1];
        if (ep) { req.episodeId = ep.id; req.episodeNumber = currentEpRef.current; }
      }
      saveAndUpdateProgress(req);
    }
    onBack();
  };

  // Handle Android hardware back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      handleBack();
      return true; // Prevent default behavior (app exit)
    });

    return () => backHandler.remove();
  }, [hasRealVideo, content]);

  // ── Switch episode from sidebar ─────────────────────────────────────────────
  const switchEpisode = async (epIndex: number) => {
    const epList = content.episodeList;
    if (!epList || epIndex < 1 || epIndex > epList.length) return;
    // Save current episode progress (completed) before switching
    if (currentTimeRef.current > 0) {
      const ep = epList[currentEpRef.current - 1];
      if (ep) {
        const req: SaveProgressRequest = {
          currentTime: currentTimeRef.current,
          duration: durationRef.current,
          completed: true,
          episodeId: ep.id,
          episodeNumber: currentEpRef.current,
        };
        saveAndUpdateProgress(req);
      }
    }
    currentEpRef.current = epIndex;
    setCurrentEp(epIndex);
    setCurrentTime(0);
    currentTimeRef.current = 0;
    setDuration(0);
    durationRef.current = 0;
    setProgress(0);
    setIsBuffering(true);
    autoPlayOnLoad.current = true;
    try {
      // In real API mode, ep.videoUrl is null — fetch a fresh signed URL from the Playback API
      const epUrl = videoUrl
        ? epList[epIndex - 1].videoUrl
        : (await getEpisodeStreamUrl(content.id, epList[epIndex - 1].id)).streamUrl;
      await epPlayer.replaceSourceAsync(epUrl);
    } catch (err) {
      logger.error('PLAYER', 'Episode stream URL resolution failed', err as object);
      setIsBuffering(false);
    }
  };

  // ── Format seconds → m:ss ──────────────────────────────────────────────────
  const fmt = (sec: number) => {
    const s = Math.floor(sec);
    const m = Math.floor(s / 60);
    return `${m}:${(s % 60).toString().padStart(2, '0')}`;
  };

  // Fallback formatter for mock content (uses content.duration string)
  const formatTime = (pct: number) => {
    const rawMin = parseInt(content.duration) || 10;
    const totalSec = rawMin * 60;
    const elapsed  = Math.floor((pct / 100) * totalSec);
    return fmt(elapsed);
  };

  // Derived progress percentage (real video vs mock thumbnail)
  const realProgress = hasRealVideo && duration > 0
    ? (currentTime / duration) * 100
    : progress;

  // ── Tap on progress track ───────────────────────────────────────────────────
  const [trackWidth, setTrackWidth] = useState(1);
  const handleProgressTap = (e: GestureResponderEvent) => {
    const x = e.nativeEvent.locationX;
    const pct = Math.max(0, Math.min(1, x / trackWidth));
    if (hasRealVideo && duration > 0) {
      epPlayer.seekTo(pct * duration);
    } else {
      setProgress(pct * 100);
    }
  };

  // Real video player for episode URLs.
  // react-native-video requires a non-empty string source at construction time.
  // In real-API mode videoUrl is undefined (signed URLs are fetched below via
  // getStreamUrl/getEpisodeStreamUrl), so we supply a placeholder URI.
  // The init callback intentionally does NOT call play() in that case, so the
  // native player stays idle until replaceSourceAsync() loads the real URL.
  const PENDING_SOURCE = 'https://localhost/stream-pending';
  const epPlayer = useVideoPlayer(
    videoUrl ?? PENDING_SOURCE,
    p => {
      if (videoUrl) {
        p.loop = false;
        p.play();
      }
    },
  );

  // ── Real video event listeners ──────────────────────────────────────────────
  useEffect(() => {
    if (!hasRealVideo) return;

    const loadSub = epPlayer.addEventListener('onLoad', (data: any) => {
      const dur = data.duration ?? 0;
      durationRef.current = dur;
      setDuration(dur);
      const t = data.currentTime ?? 0;
      currentTimeRef.current = t;
      setCurrentTime(t);
      setIsBuffering(false);

      if (autoPlayOnLoad.current) {
        // Episode switch — just play, don't restore progress
        autoPlayOnLoad.current = false;
        epPlayer.play();
        return;
      }

      // First load: restore saved watch progress then play
      if (!hasRestored.current && dur > 10) {
        hasRestored.current = true;
        getWatchProgress(content.id)
          .then(saved => {
            if (saved && !saved.completed && saved.currentTime > 5 && saved.currentTime < dur - 5) {
              // For vertical-series: restore the right episode first
              if (
                content.type === 'vertical-series' &&
                saved.lastEpisodeNumber &&
                saved.lastEpisodeNumber !== currentEpRef.current
              ) {
                switchEpisode(saved.lastEpisodeNumber);
                return;
              }
              epPlayer.seekTo(saved.currentTime);
              currentTimeRef.current = saved.currentTime;
              setCurrentTime(saved.currentTime);
            }
          })
          .catch(() => {})
          .finally(() => epPlayer.play());
      } else {
        epPlayer.play();
      }
    });

    const progressSub = epPlayer.addEventListener('onProgress', (data: any) => {
      const t = data.currentTime ?? 0;
      currentTimeRef.current = t;
      setCurrentTime(t);
      // Throttled auto-save every 10 seconds
      const now = Date.now();
      if (now - lastSaveRef.current >= 10_000 && t > 0 && durationRef.current > 0) {
        lastSaveRef.current = now;
        const req: SaveProgressRequest = {
          currentTime: t,
          duration: durationRef.current,
          completed: false,
        };
        if (content.type === 'vertical-series') {
          const ep = content.episodeList?.[currentEpRef.current - 1];
          if (ep) { req.episodeId = ep.id; req.episodeNumber = currentEpRef.current; }
        }
        saveAndUpdateProgress(req);
      }
    });

    const stateSub = epPlayer.addEventListener('onPlaybackStateChange', (data: any) => {
      setIsPlaying(data.isPlaying ?? false);
    });

    const bufferSub = epPlayer.addEventListener('onBuffer', (buffering: any) => {
      // onBuffer passes a boolean directly in v7
      setIsBuffering(typeof buffering === 'boolean' ? buffering : buffering?.isBuffering ?? false);
    });

    // When video ends: save completed progress then advance or reset
    const endSub = epPlayer.addEventListener('onEnd', () => {
      if (durationRef.current > 0) {
        const req: SaveProgressRequest = {
          currentTime: durationRef.current,
          duration: durationRef.current,
          completed: true,
        };
        if (content.type === 'vertical-series') {
          const ep = content.episodeList?.[currentEpRef.current - 1];
          if (ep) { req.episodeId = ep.id; req.episodeNumber = currentEpRef.current; }
        }
        saveAndUpdateProgress(req);
      }
      const epList = content.episodeList;
      const nextEp = currentEpRef.current + 1;
      if (epList && nextEp <= epList.length) {
        // Auto-advance to next episode
        switchEpisode(nextEp);
      } else {
        // Last episode (or non-series): seek to beginning and show controls
        epPlayer.seekTo(0);
        currentTimeRef.current = 0;
        setCurrentTime(0);
        setIsPlaying(false);
        showControlsNow();
      }
    });

    return () => {
      loadSub.remove();
      progressSub.remove();
      stateSub.remove();
      bufferSub.remove();
      endSub.remove();
    };
  // epPlayer reference is stable for the lifetime of this screen
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoUrl]);
  // ── Fetch signed stream URL when videoUrl is not provided (real API mode) ───
  // In real mode, Content.videoUrl and Episode.videoUrl are null from the API
  // (spec §3.2: "videoUrl is null until rental confirmed; use GET /content/:id/stream").
  // This effect calls the Playback API, loads the signed URL into the player, then
  // the existing onLoad handler takes over (seek to resume position + play).
  useEffect(() => {
    if (videoUrl) return; // direct URL provided — mock mode or explicit passthrough
    let cancelled = false;
    async function resolveStreamUrl() {
      try {
        let signedUrl: string;
        if (content.type === 'short-film') {
          const res = await getStreamUrl(content.id);
          signedUrl = res.streamUrl;
        } else {
          const ep = content.episodeList?.[currentEpRef.current - 1];
          if (!ep) {
            logger.warn('PLAYER', 'No episode found for stream URL resolution');
            return;
          }
          const res = await getEpisodeStreamUrl(content.id, ep.id);
          signedUrl = res.streamUrl;
        }
        if (!cancelled) {
          // replaceSourceAsync fires onLoad → getWatchProgress → seekTo → play
          await epPlayer.replaceSourceAsync(signedUrl);
        }
      } catch (err) {
        logger.error('PLAYER', 'Stream URL resolution failed', err as object);
        if (!cancelled) setIsBuffering(false);
      }
    }
    resolveStreamUrl();
    return () => { cancelled = true; };
    // videoUrl and content are stable for the lifetime of this screen instance
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <View style={styles.container}>
      {/* ── Video area ── */}
      <View style={styles.videoArea}>
        {hasRealVideo ? (
          <VideoView
            player={epPlayer}
            resizeMode='contain'
            style={StyleSheet.absoluteFill}
            controls={false}
          />
        ) : (
          <>
            <Image
              source={{ uri: content.thumbnail }}
              style={styles.bgBlur}
              blurRadius={18}
            />
            <View style={styles.bgDim} />
            <Image
              source={{ uri: content.thumbnail }}
              style={styles.mainImage}
              resizeMode="contain"
            />
          </>
        )}
      </View>

      {/* ── Loading spinner ── */}
      {isBuffering && hasRealVideo ? (
        <View style={styles.loadingWrap} pointerEvents="none">
          <LoadingSpinner />
        </View>
      ) : null}

      {/* ── Tap overlay to toggle controls ── */}
      <TouchableOpacity 
        style={styles.tapOverlay}
        activeOpacity={1}
        onPress={toggleControls}
      />

      {/* ── Controls overlay ── */}
      <Animated.View style={[styles.overlay, styles.controlsLayer, { opacity: controlsOpacity }]} pointerEvents={showControls ? 'box-none' : 'none'}>

          {/* Top bar */}
          <View style={styles.topBar}>
            <TouchableOpacity
              onPress={(e) => { e.stopPropagation?.(); handleBack(); }}
              style={styles.iconBtn}
              activeOpacity={0.7}>
              <ArrowLeftIcon />
            </TouchableOpacity>
            <View style={styles.topTitleWrap}>
              <Text style={styles.topTitle} numberOfLines={1}>{content.title}</Text>
              <Text style={styles.topDir}>{content.director}</Text>
            </View>
            <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
              <MoreVertIcon />
            </TouchableOpacity>
          </View>

          {/* Centre play/pause */}
          <View style={styles.centreWrap}>
            <TouchableOpacity
              onPress={(e) => { e.stopPropagation?.(); togglePlay(); }}
              style={styles.bigPlayBtn}
              activeOpacity={0.8}>
              {isPlaying ? <PauseIcon size={36} /> : <PlayIcon size={36} />}
            </TouchableOpacity>
          </View>

          {/* Bottom controls */}
          <View style={styles.bottomBar}>
            {/* Time + progress */}
            <View style={styles.timeRow}>
              <Text style={styles.timeText}>{hasRealVideo ? fmt(currentTime) : formatTime(progress)}</Text>
              <Text style={styles.timeSep}>/</Text>
              <Text style={styles.timeDim}>{hasRealVideo ? fmt(duration) : content.duration}</Text>
            </View>
            <View
              style={styles.track}
              onLayout={e => setTrackWidth(e.nativeEvent.layout.width)}
              onStartShouldSetResponder={() => true}
              onResponderGrant={handleProgressTap}
              onResponderMove={handleProgressTap}>
              <View style={styles.trackBg} />
              <View style={[styles.trackFill, { width: `${realProgress}%` }]} />
              <View style={[styles.trackThumb, { left: `${realProgress}%` as any }]} />
            </View>

            {/* Playback buttons */}
            <View style={styles.controlRow}>
              <View style={styles.controlLeft}>
                <TouchableOpacity
                  onPress={(e) => { e.stopPropagation?.(); togglePlay(); }}
                  style={styles.iconBtn}
                  activeOpacity={0.7}>
                  {isPlaying ? <PauseIcon size={20} /> : <PlayIcon size={20} />}
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation?.();
                    setIsMuted(v => {
                      const next = !v;
                      if (hasRealVideo) epPlayer.muted = next;
                      return next;
                    });
                  }}
                  style={styles.iconBtn}
                  activeOpacity={0.7}>
                  <VolumeIcon muted={isMuted} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

        {/* ── Episodes sidebar (vertical-series only) ── */}
        {content.type === 'vertical-series' && content.episodeList && content.episodeList.length > 0 && showControls && (
          <View style={styles.sidebar}>
            <Text style={styles.sidebarLabel}>Episodes</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {content.episodeList.map((ep, i) => (
                <TouchableOpacity
                  key={ep.id}
                  style={[styles.epBtn, currentEp === i + 1 && styles.epBtnActive]}
                  onPress={() => switchEpisode(i + 1)}
                  activeOpacity={0.7}>
                  <Text style={[styles.epText, currentEp === i + 1 && styles.epTextActive]}>
                    {i + 1}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </Animated.View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },

  videoArea:  { ...StyleSheet.absoluteFillObject },
  bgBlur:     { ...StyleSheet.absoluteFillObject, opacity: 0.35 },
  bgDim:      { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  mainImage:  { flex: 1, width: '100%' },

  loadingWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },

  tapOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },

  controlsLayer: {
    zIndex: 20,
  },

  // Top bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 52,
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 12,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  topTitleWrap: { flex: 1 },
  topTitle: { fontSize: 16, fontWeight: '600', color: '#ffffff' },
  topDir:   { fontSize: 12, color: '#d4d4d4', marginTop: 1 },

  // Centre
  centreWrap:  { flex: 1, alignItems: 'center', justifyContent: 'center' },
  bigPlayBtn: {
    width: 80, height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Bottom
  bottomBar: {
    paddingHorizontal: 16,
    paddingBottom: 36,
    paddingTop: 12,
    gap: 10,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  timeRow:  { flexDirection: 'row', alignItems: 'center', gap: 4 },
  timeText: { fontSize: 12, color: '#ffffff', fontWeight: '500' },
  timeSep:  { fontSize: 12, color: '#737373' },
  timeDim:  { fontSize: 12, color: '#737373' },

  track: {
    height: 20,
    justifyContent: 'center',
  },
  trackBg:    { position: 'absolute', left: 0, right: 0, height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.2)' },
  trackFill:  { position: 'absolute', left: 0, height: 3, borderRadius: 2, backgroundColor: '#a855f7' },
  trackThumb: {
    position: 'absolute',
    width: 12, height: 12,
    borderRadius: 6,
    backgroundColor: '#a855f7',
    marginLeft: -6,
    top: 4,
  },

  controlRow:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  controlLeft: { flexDirection: 'row', alignItems: 'center', gap: 4 },

  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },

  // Sidebar
  sidebar: {
    position: 'absolute',
    right: 12,
    top: '25%',
    maxHeight: '55%',
    width: 56,
    backgroundColor: 'rgba(0,0,0,0.82)',
    borderRadius: 14,
    padding: 8,
  },
  sidebarLabel: { fontSize: 9, fontWeight: '600', color: '#737373', textTransform: 'uppercase', textAlign: 'center', marginBottom: 6 },
  epBtn:        { paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  epBtnActive:  { backgroundColor: 'rgba(168,85,247,0.25)' },
  epText:       { fontSize: 13, color: '#a3a3a3', fontWeight: '500' },
  epTextActive: { color: '#a855f7', fontWeight: '700' },
});

const iconStyles = StyleSheet.create({
  // ArrowLeft
  arrowWrap:    { width: 22, height: 22, justifyContent: 'center' },
  arrowStem:    { position: 'absolute', left: 2, right: 2, height: 2, backgroundColor: '#ffffff', borderRadius: 1 },
  arrowTip:     { position: 'absolute', left: 2, width: 9, height: 2, backgroundColor: '#ffffff', borderRadius: 1 },
  arrowTipUp:   { transform: [{ rotate: '45deg' }], top: 5 },
  arrowTipDown: { transform: [{ rotate: '-45deg' }], bottom: 5 },

  // Volume
  volWrap: { width: 22, height: 18, alignItems: 'center', justifyContent: 'center' },
  volBody: { position: 'absolute', left: 0, width: 7, height: 10, borderWidth: 1.5, borderRightWidth: 0, borderRadius: 1 },
  volCone: { position: 'absolute', left: 5, width: 0, height: 0, borderTopWidth: 7, borderBottomWidth: 7, borderLeftWidth: 6, borderStyle: 'solid' },
  volWave: { position: 'absolute', right: 0, width: 8, height: 12, borderTopRightRadius: 8, borderBottomRightRadius: 8, borderWidth: 1.5, borderLeftWidth: 0 },
  volX1:   { position: 'absolute', right: 0, width: 9, height: 1.5, borderRadius: 1, transform: [{ rotate: '45deg' }] },
  volX2:   { position: 'absolute', right: 0, width: 9, height: 1.5, borderRadius: 1, transform: [{ rotate: '-45deg' }] },

  // More vertical
  moreWrap: { width: 20, height: 20, alignItems: 'center', justifyContent: 'space-between', paddingVertical: 2 },
  moreDot:  { width: 4, height: 4, borderRadius: 2, backgroundColor: '#ffffff' },
});

const spinnerStyles = StyleSheet.create({
  ring: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 4,
    borderColor: 'rgba(168,85,247,0.25)',
    borderTopColor: '#a855f7',
  },
});
