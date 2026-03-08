import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '../constants/colors';

interface MoodCardProps {
  name: string;
  emoji: string;
  onClick: () => void;
}

// Per-genre gradient palettes — cycles for genres without an explicit entry
const GENRE_GRADIENTS: Record<string, [string, string]> = {
  Drama:        [COLORS.brand.primaryDark, COLORS.accent.indigo600],
  Thriller:     [COLORS.accent.red600, COLORS.accent.red800],
  Romance:      [COLORS.brand.pink, COLORS.accent.rose700],
  Comedy:       [COLORS.accent.gold, COLORS.accent.amber600],
  Documentary:  [COLORS.accent.sky400, COLORS.accent.sky700],
  Experimental: [COLORS.accent.emerald, COLORS.accent.emerald800],
  Family:       [COLORS.brand.violet500, COLORS.brand.violet700],
  Action:       [COLORS.accent.red, COLORS.accent.red700],
  Horror:       [COLORS.accent.purple800, COLORS.accent.purple950],
  SciFi:        [COLORS.accent.cyan, COLORS.accent.cyan700],
};

const FALLBACK_GRADIENT: [string, string] = [COLORS.accent.indigo, COLORS.accent.indigo700];

export function MoodCard({ name, emoji, onClick }: MoodCardProps) {
  const colors = GENRE_GRADIENTS[name] ?? FALLBACK_GRADIENT;

  return (
    <TouchableOpacity
      onPress={onClick}
      activeOpacity={0.75}
      style={styles.shadow}>
      {/*
        Plain View drives layout — sizes naturally to emoji + name + padding.
        LinearGradient fills it absolutely so it never constrains child layout.
      */}
      <View style={styles.card}>
        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        {/* Blobs clipped to card shape */}
        <View style={styles.blobLayer}>
          <View style={styles.blob1} />
          <View style={styles.blob2} />
        </View>
        {/* Content */}
        <Text style={styles.emoji}>{emoji}</Text>
        <Text style={styles.name}>{name}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  shadow: {
    borderRadius: 16,
    alignSelf: 'flex-start',
    // iOS shadow
    shadowColor: COLORS.text.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    // Android
    elevation: 8,
  },
  card: {
    height: 72,
    borderRadius: 16,
    overflow: 'hidden',          // clips gradient + blobs to rounded corners
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 8,
  },
  blobLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
    overflow: 'hidden',
  },
  blob1: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.overlay.surfaceLight,
    top: -20,
    right: -10,
  },
  blob2: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.overlay.surfaceFaint,
    bottom: -16,
    left: 20,
  },
  emoji: {
    fontSize: 26,
  },
  name: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.text.primary,
    letterSpacing: 0.4,
    textShadowColor: COLORS.overlay.bgDim,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});
