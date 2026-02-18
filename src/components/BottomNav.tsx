import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// ─── Home icon ────────────────────────────────────────────────────────────────
function HomeIcon({ active }: { active: boolean }) {
  const c = active ? '#a855f7' : '#737373';
  return (
    <View style={iconStyles.homeWrap}>
      {/* Roof triangle: two diagonal bars */}
      <View style={[iconStyles.homeRoofLeft, { backgroundColor: c }]} />
      <View style={[iconStyles.homeRoofRight, { backgroundColor: c }]} />
      {/* Body */}
      <View style={[iconStyles.homeBody, { borderColor: c }]}>
        {/* Door */}
        <View style={[iconStyles.homeDoor, { backgroundColor: c }]} />
      </View>
    </View>
  );
}

// ─── Compass icon ─────────────────────────────────────────────────────────────
function CompassIcon({ active }: { active: boolean }) {
  const c = active ? '#a855f7' : '#737373';
  return (
    <View style={[iconStyles.compassOuter, { borderColor: c }]}>
      {/* North-East needle */}
      <View style={[iconStyles.compassNeedle, iconStyles.compassNE, { backgroundColor: c }]} />
      {/* South-West needle (dimmer) */}
      <View style={[iconStyles.compassNeedle, iconStyles.compassSW, { backgroundColor: active ? '#7c3aed' : '#525252' }]} />
      {/* Centre dot */}
      <View style={[iconStyles.compassDot, { backgroundColor: c }]} />
    </View>
  );
}

// ─── User icon ────────────────────────────────────────────────────────────────
function UserIcon({ active }: { active: boolean }) {
  const c = active ? '#a855f7' : '#737373';
  return (
    <View style={iconStyles.userWrap}>
      {/* Head */}
      <View style={[iconStyles.userHead, { borderColor: c }]} />
      {/* Shoulders arc */}
      <View style={[iconStyles.userShoulders, { borderColor: c }]} />
    </View>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────
export type BottomTab = 'home' | 'browse' | 'profile';

interface BottomNavProps {
  activeTab: BottomTab;
  onTabChange: (tab: BottomTab) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const tabs: { key: BottomTab; label: string; Icon: React.FC<{ active: boolean }> }[] = [
    { key: 'home',    label: 'Home',    Icon: HomeIcon },
    { key: 'browse',  label: 'Browse',  Icon: CompassIcon },
    { key: 'profile', label: 'Profile', Icon: UserIcon },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.inner}>
        {tabs.map(({ key, label, Icon }) => {
          const active = activeTab === key;
          return (
            <TouchableOpacity
              key={key}
              style={styles.tab}
              onPress={() => onTabChange(key)}
              activeOpacity={0.7}>
              <Icon active={active} />
              <Text style={[styles.label, active && styles.labelActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.97)',
    borderTopWidth: 1,
    borderTopColor: '#262626',
    zIndex: 40,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 8,
    paddingBottom: 24, // safe area padding for home bar
  },
  tab: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
  },
  label: {
    fontSize: 11,
    color: '#737373',
    marginTop: 3,
  },
  labelActive: {
    color: '#a855f7',
  },
});

const iconStyles = StyleSheet.create({
  // ── Home ──────────────────────────────────────────────────────────────────
  homeWrap: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  homeRoofLeft: {
    position: 'absolute',
    top: 4,
    left: 3,
    width: 12,
    height: 3,
    borderRadius: 1,
    transform: [{ rotate: '-35deg' }],
  },
  homeRoofRight: {
    position: 'absolute',
    top: 4,
    right: 3,
    width: 12,
    height: 3,
    borderRadius: 1,
    transform: [{ rotate: '35deg' }],
  },
  homeBody: {
    width: 14,
    height: 10,
    borderWidth: 2,
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 1,
  },
  homeDoor: {
    width: 5,
    height: 6,
    borderRadius: 1,
    marginBottom: -2,
  },

  // ── Compass ───────────────────────────────────────────────────────────────
  compassOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compassNeedle: {
    position: 'absolute',
    width: 3,
    height: 7,
    borderRadius: 2,
  },
  compassNE: {
    top: 2,
    right: 7,
    transform: [{ rotate: '45deg' }],
  },
  compassSW: {
    bottom: 2,
    left: 7,
    transform: [{ rotate: '45deg' }],
  },
  compassDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },

  // ── User ──────────────────────────────────────────────────────────────────
  userWrap: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userHead: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    marginBottom: 2,
  },
  userShoulders: {
    width: 16,
    height: 8,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderWidth: 2,
    borderBottomWidth: 0,
  },
});
