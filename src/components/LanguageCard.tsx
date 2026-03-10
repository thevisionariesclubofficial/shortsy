import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../constants/colors';

interface LanguageCardProps {
  name: string;
  code?: string;
  onClick: () => void;
}

export function LanguageCard({ name, code, onClick }: LanguageCardProps) {
  return (
    <TouchableOpacity
      onPress={onClick}
      activeOpacity={0.85}
      style={styles.shadow}
    >
      <View style={styles.card}>
        <View style={styles.blobLayer}>
          <View style={styles.blob1} />
          <View style={styles.blob2} />
        </View>
        <Text style={styles.name}>{name}</Text>
        {code && <Text style={styles.code}>{code.toUpperCase()}</Text>}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  shadow: {
    marginHorizontal: 8,
    marginVertical: 4,
    shadowColor: COLORS.bg.stoneBlack,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  card: {
    backgroundColor: COLORS.bg.stone900,
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 18,
    minWidth: 90,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  blobLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    opacity: 0.12,
  },
  blob1: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.accent.indigo600,
    marginLeft: 0,
    marginTop: 8,
  },
  blob2: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.accent.sky400,
    marginRight: 0,
    marginBottom: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    zIndex: 1,
  },
  code: {
    fontSize: 12,
    fontWeight: '400',
    color: COLORS.accent.indigo700,
    marginTop: 2,
    zIndex: 1,
  },
});
