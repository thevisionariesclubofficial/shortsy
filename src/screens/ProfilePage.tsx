import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Content } from '../data/mockData';
import { ContentCard } from '../components/ContentCard';

// ─── Icons ────────────────────────────────────────────────────────────────────
function UserIcon() {
  return (
    <View style={iconStyles.userWrap}>
      <View style={iconStyles.userHead} />
      <View style={iconStyles.userShoulders} />
    </View>
  );
}

function HeartIcon() {
  return (
    <View style={iconStyles.heartWrap}>
      <View style={iconStyles.heartLeft} />
      <View style={iconStyles.heartRight} />
      <View style={iconStyles.heartBottom} />
    </View>
  );
}

function ClockIcon() {
  return (
    <View style={iconStyles.clockOuter}>
      <View style={iconStyles.clockHand} />
      <View style={iconStyles.clockHandM} />
    </View>
  );
}

function SettingsIcon() {
  return (
    <View style={iconStyles.settingsOuter}>
      <View style={iconStyles.settingsInner} />
      {[0, 60, 120, 180, 240, 300].map(deg => (
        <View
          key={deg}
          style={[
            iconStyles.settingsTooth,
            { transform: [{ rotate: `${deg}deg` }] },
          ]}
        />
      ))}
    </View>
  );
}

function LogOutIcon() {
  return (
    <View style={iconStyles.logoutWrap}>
      <View style={iconStyles.logoutBox} />
      <View style={iconStyles.logoutArrow} />
      <View style={iconStyles.logoutArrowUp} />
      <View style={iconStyles.logoutArrowDown} />
    </View>
  );
}

function CrownIcon() {
  return (
    <View style={iconStyles.crownWrap}>
      <View style={iconStyles.crownBase} />
      <View style={[iconStyles.crownSpike, iconStyles.crownSpikeL]} />
      <View style={[iconStyles.crownSpike, iconStyles.crownSpikeC]} />
      <View style={[iconStyles.crownSpike, iconStyles.crownSpikeR]} />
    </View>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface ProfilePageProps {
  onLogout: () => void;
  rentedContent: Content[];
  onContentClick: (content: Content) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function ProfilePage({ onLogout, rentedContent, onContentClick }: ProfilePageProps) {
  const totalSpent = rentedContent.reduce((sum, c) => sum + c.price, 0);

  const menuItems = [
    { Icon: HeartIcon, label: 'My Favorites', color: '#a3a3a3', danger: false },
    { Icon: ClockIcon, label: 'Watch History', color: '#a3a3a3', danger: false },
    { Icon: SettingsIcon, label: 'Settings', color: '#a3a3a3', danger: false },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      {/* ── Avatar + name ── */}
      <View style={styles.avatarRow}>
        <LinearGradient
          colors={['#a855f7', '#ec4899']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.avatarCircle}>
          <UserIcon />
        </LinearGradient>
        <View style={styles.avatarInfo}>
          <Text style={styles.userName}>Film Lover</Text>
          <Text style={styles.userEmail}>filmfan@indieplay.com</Text>
        </View>
      </View>

      {/* ── Stats ── */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{rentedContent.length}</Text>
          <Text style={styles.statLabel}>Rentals</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>₹{totalSpent}</Text>
          <Text style={styles.statLabel}>Spent</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>Favorites</Text>
        </View>
      </View>

      {/* ── Upgrade card ── */}
      <View style={styles.upgradeWrap}>
        <LinearGradient
          colors={['#7c3aed', '#db2777']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.upgradeCard}>
          {/* Decorative circle */}
          <View style={styles.upgradeCircle} />
          <View style={styles.upgradeContent}>
            <View style={styles.upgradeTopRow}>
              <CrownIcon />
              <Text style={styles.upgradeBadge}>INDIEPLAY Plus</Text>
            </View>
            <Text style={styles.upgradeTitle}>Get unlimited access</Text>
            <Text style={styles.upgradePrice}>₹199/month • Selected catalog</Text>
            <TouchableOpacity style={styles.upgradeBtn} activeOpacity={0.8}>
              <Text style={styles.upgradeBtnText}>Upgrade Now</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      {/* ── Menu ── */}
      <View style={styles.menuSection}>
        {menuItems.map(({ Icon, label }) => (
          <TouchableOpacity key={label} style={styles.menuItem} activeOpacity={0.7}>
            <Icon />
            <Text style={styles.menuLabel}>{label}</Text>
            <View style={styles.menuChevron} />
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.menuItem} activeOpacity={0.7} onPress={onLogout}>
          <LogOutIcon />
          <Text style={[styles.menuLabel, styles.menuDanger]}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* ── My Rentals ── */}
      {rentedContent.length > 0 && (
        <View style={styles.rentalsSection}>
          <Text style={styles.rentalsTitle}>My Rentals</Text>
          <View style={styles.rentalsGrid}>
            {(() => {
              const rows = [];
              for (let i = 0; i < rentedContent.length; i += 2) {
                rows.push(rentedContent.slice(i, i + 2));
              }
              return rows.map((row, ri) => (
                <View key={ri} style={styles.rentalRow}>
                  {row.map(c => (
                    <View key={c.id} style={styles.rentalCard}>
                      <ContentCard content={c} onClick={() => onContentClick(c)} />
                    </View>
                  ))}
                  {row.length === 1 && <View style={styles.rentalCard} />}
                </View>
              ));
            })()}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scroll: {
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    paddingBottom: 14,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 8,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
  },
  userEmail: {
    fontSize: 13,
    color: '#737373',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#111111',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#a855f7',
  },
  statLabel: {
    fontSize: 11,
    color: '#737373',
    marginTop: 4,
  },
  upgradeWrap: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  upgradeCard: {
    borderRadius: 16,
    overflow: 'hidden',
    padding: 24,
  },
  upgradeCircle: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.1)',
    top: -40,
    right: -30,
  },
  upgradeContent: {
    zIndex: 1,
  },
  upgradeTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  upgradeBadge: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff',
  },
  upgradeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  upgradePrice: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    marginBottom: 16,
  },
  upgradeBtn: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignSelf: 'flex-start',
  },
  upgradeBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#7c3aed',
  },
  menuSection: {
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#111111',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    color: '#ffffff',
    fontWeight: '500',
  },
  menuDanger: {
    color: '#ef4444',
  },
  menuChevron: {
    width: 6,
    height: 6,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: '#525252',
    transform: [{ rotate: '45deg' }],
  },
  rentalsSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  rentalsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  rentalsGrid: {
    gap: 12,
  },
  rentalRow: {
    flexDirection: 'row',
    gap: 12,
  },
  rentalCard: {
    flex: 1,
  },
});

const iconStyles = StyleSheet.create({
  // User
  userWrap: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  userHead: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#ffffff', marginBottom: 3 },
  userShoulders: { width: 24, height: 12, borderTopLeftRadius: 12, borderTopRightRadius: 12, backgroundColor: '#ffffff' },

  // Heart (simple diamond shape)
  heartWrap: { width: 20, height: 20, alignItems: 'center', justifyContent: 'center' },
  heartLeft: { position: 'absolute', left: 0, top: 3, width: 10, height: 10, borderRadius: 5, backgroundColor: '#a3a3a3' },
  heartRight: { position: 'absolute', right: 0, top: 3, width: 10, height: 10, borderRadius: 5, backgroundColor: '#a3a3a3' },
  heartBottom: { position: 'absolute', bottom: 0, width: 14, height: 14, backgroundColor: '#a3a3a3', transform: [{ rotate: '45deg' }] },

  // Clock
  clockOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#a3a3a3', alignItems: 'center', justifyContent: 'center' },
  clockHand: { position: 'absolute', width: 2, height: 6, backgroundColor: '#a3a3a3', borderRadius: 1, bottom: '50%', left: '50%', marginLeft: -1, transformOrigin: 'bottom' },
  clockHandM: { position: 'absolute', width: 2, height: 5, backgroundColor: '#a3a3a3', borderRadius: 1, bottom: '50%', left: '50%', marginLeft: -1, transform: [{ rotate: '90deg' }] },

  // Settings gear (simplified)
  settingsOuter: { width: 20, height: 20, alignItems: 'center', justifyContent: 'center' },
  settingsInner: { width: 8, height: 8, borderRadius: 4, borderWidth: 2, borderColor: '#a3a3a3' },
  settingsTooth: { position: 'absolute', width: 3, height: 20, borderRadius: 1, backgroundColor: 'transparent', borderTopWidth: 2, borderTopColor: '#a3a3a3' },

  // Logout
  logoutWrap: { width: 20, height: 20, alignItems: 'center', justifyContent: 'center' },
  logoutBox: { position: 'absolute', left: 0, width: 12, height: 16, borderWidth: 2, borderColor: '#ef4444', borderRadius: 2 },
  logoutArrow: { position: 'absolute', right: 0, top: 9, width: 10, height: 2, backgroundColor: '#ef4444', borderRadius: 1 },
  logoutArrowUp: { position: 'absolute', right: 0, top: 6, width: 5, height: 2, backgroundColor: '#ef4444', borderRadius: 1, transform: [{ rotate: '-45deg' }] },
  logoutArrowDown: { position: 'absolute', right: 0, top: 12, width: 5, height: 2, backgroundColor: '#ef4444', borderRadius: 1, transform: [{ rotate: '45deg' }] },

  // Crown
  crownWrap: { width: 20, height: 16, justifyContent: 'flex-end' },
  crownBase: { width: 20, height: 7, backgroundColor: '#fde047', borderRadius: 2 },
  crownSpike: { position: 'absolute', bottom: 6, width: 4, height: 10, backgroundColor: '#fde047', borderRadius: 2 },
  crownSpikeL: { left: 1, transform: [{ rotate: '-20deg' }] },
  crownSpikeC: { left: 8, height: 12, bottom: 6 },
  crownSpikeR: { right: 1, transform: [{ rotate: '20deg' }] },
});
