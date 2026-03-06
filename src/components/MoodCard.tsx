import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

interface MoodCardProps {
  name: string;
  emoji: string;
  onClick: () => void;
}

// Per-genre gradient palettes — cycles for genres without an explicit entry
const GENRE_GRADIENTS: Record<string, [string, string]> = {
  Drama:        ['#7c3aed', '#4f46e5'],
  Thriller:     ['#dc2626', '#991b1b'],
  Romance:      ['#ec4899', '#be185d'],
  Comedy:       ['#f59e0b', '#d97706'],
  Documentary:  ['#0ea5e9', '#0369a1'],
  Experimental: ['#10b981', '#065f46'],
  Family:       ['#8b5cf6', '#6d28d9'],
  Action:       ['#ef4444', '#b91c1c'],
  Horror:       ['#6b21a8', '#3b0764'],
  SciFi:        ['#06b6d4', '#0e7490'],
};

const FALLBACK_GRADIENT: [string, string] = ['#6366f1', '#4338ca'];

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
    shadowColor: '#ffffff',
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
    backgroundColor: '#ffffff18',
    top: -20,
    right: -10,
  },
  blob2: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ffffff12',
    bottom: -16,
    left: 20,
  },
  emoji: {
    fontSize: 26,
  },
  name: {
    fontSize: 14,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 0.4,
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});
