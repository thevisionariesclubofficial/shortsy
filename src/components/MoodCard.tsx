import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

interface MoodCardProps {
  name: string;
  emoji: string;
  onClick: () => void;
}

export function MoodCard({ name, emoji, onClick }: MoodCardProps) {
  return (
    <TouchableOpacity onPress={onClick} activeOpacity={0.8}>
      <LinearGradient
        colors={['#7c3aed30', '#ec489930']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}>
        <Text style={styles.emoji}>{emoji}</Text>
        <Text style={styles.name}>{name}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 112,
    height: 112,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ffffff18',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 8,
  },
  emoji: {
    fontSize: 36,
  },
  name: {
    fontSize: 12,
    color: '#e5e5e5',
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 16,
  },
});
