import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface BackButtonProps {
  onPress: () => void;
  style?: any;
  hitSlop?: { top: number; bottom: number; left: number; right: number };
}

function ArrowLeftIcon() {
  return (
    <View style={iconStyles.arrowWrap}>
      <View style={iconStyles.chevronTop} />
      <View style={iconStyles.chevronBottom} />
    </View>
  );
}

export function BackButton({ onPress, style, hitSlop = { top: 8, bottom: 8, left: 8, right: 8 } }: BackButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.backBtn, style]}
      activeOpacity={0.7}
      hitSlop={hitSlop}>
      <ArrowLeftIcon />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#00000088',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const iconStyles = StyleSheet.create({
  arrowWrap:     { width: 20, height: 20, justifyContent: 'center', alignItems: 'center' },
  chevronTop:    { position: 'absolute', width: 10, height: 2.5, backgroundColor: '#ffffff', borderRadius: 1.5, right: 6, top: 6, transform: [{ rotate: '-45deg' }] },
  chevronBottom: { position: 'absolute', width: 10, height: 2.5, backgroundColor: '#ffffff', borderRadius: 1.5, right: 6, bottom: 6, transform: [{ rotate: '45deg' }] },
});
