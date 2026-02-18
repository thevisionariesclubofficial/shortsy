import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  GestureResponderEvent,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { Content } from '../data/mockData';

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

// ─── Types ────────────────────────────────────────────────────────────────────
interface PlayerScreenProps {
  content: Content;
  onBack: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function PlayerScreen({ content, onBack }: PlayerScreenProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted,   setIsMuted]   = useState(false);
  const [progress,  setProgress]  = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [currentEp, setCurrentEp] = useState(1);

  const controlsOpacity = useRef(new Animated.Value(1)).current;
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressBarRef = useRef<View>(null);

  // ── Control visibility ──────────────────────────────────────────────────────
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

  // ── Progress ticker ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (isPlaying) {
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
  }, [isPlaying]);

  const togglePlay = () => {
    setIsPlaying(v => !v);
    showControlsNow();
  };

  // ── Format time from percentage ─────────────────────────────────────────────
  const formatTime = (pct: number) => {
    const rawMin = parseInt(content.duration) || 10;
    const totalSec = rawMin * 60;
    const elapsed  = Math.floor((pct / 100) * totalSec);
    const m = Math.floor(elapsed / 60);
    const s = elapsed % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // ── Tap on progress track ───────────────────────────────────────────────────
  const [trackWidth, setTrackWidth] = useState(1);
  const handleProgressTap = (e: GestureResponderEvent) => {
    const x = e.nativeEvent.locationX;
    setProgress(Math.max(0, Math.min(100, (x / trackWidth) * 100)));
  };

  return (
    <TouchableWithoutFeedback onPress={showControlsNow}>
      <View style={styles.container}>
        {/* ── Video area: blurred bg + centred image ── */}
        <View style={styles.videoArea}>
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
        </View>

        {/* ── Controls overlay ── */}
        <Animated.View style={[styles.overlay, { opacity: controlsOpacity }]} pointerEvents={showControls ? 'box-none' : 'none'}>

          {/* Top bar */}
          <View style={styles.topBar}>
            <TouchableOpacity
              onPress={(e) => { e.stopPropagation?.(); onBack(); }}
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
              <Text style={styles.timeText}>{formatTime(progress)}</Text>
              <Text style={styles.timeSep}>/</Text>
              <Text style={styles.timeDim}>{content.duration}</Text>
            </View>
            <View
              style={styles.track}
              onLayout={e => setTrackWidth(e.nativeEvent.layout.width)}
              onStartShouldSetResponder={() => true}
              onResponderGrant={handleProgressTap}
              onResponderMove={handleProgressTap}>
              <View style={styles.trackBg} />
              <View style={[styles.trackFill, { width: `${progress}%` }]} />
              <View style={[styles.trackThumb, { left: `${progress}%` as any }]} />
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
                  onPress={(e) => { e.stopPropagation?.(); setIsMuted(v => !v); }}
                  style={styles.iconBtn}
                  activeOpacity={0.7}>
                  <VolumeIcon muted={isMuted} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* ── Episodes sidebar (vertical-series only) ── */}
        {content.type === 'vertical-series' && content.episodes && showControls && (
          <View style={styles.sidebar}>
            <Text style={styles.sidebarLabel}>Episodes</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {Array.from({ length: content.episodes }, (_, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.epBtn, currentEp === i + 1 && styles.epBtnActive]}
                  onPress={() => setCurrentEp(i + 1)}
                  activeOpacity={0.7}>
                  <Text style={[styles.epText, currentEp === i + 1 && styles.epTextActive]}>
                    {i + 1}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },

  videoArea:  { ...StyleSheet.absoluteFillObject },
  bgBlur:     { ...StyleSheet.absoluteFillObject, opacity: 0.35 },
  bgDim:      { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  mainImage:  { flex: 1, width: '100%' },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
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
