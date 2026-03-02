import React, { useEffect, useState } from 'react';
import {
  Alert,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Content } from '../data/mockData';
import { getPremiumStatus, PremiumSubscription } from '../services/premiumService';
import { logger } from '../utils/logger';
import type { UserProfile, PaymentHistoryRecord } from '../types/api';

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

function ReceiptIcon() {
  return (
    <View style={iconStyles.receiptWrap}>
      <View style={iconStyles.receiptBody} />
      <View style={iconStyles.receiptLine1} />
      <View style={iconStyles.receiptLine2} />
      <View style={iconStyles.receiptLine3} />
      <View style={iconStyles.receiptNotch1} />
      <View style={iconStyles.receiptNotch2} />
      <View style={iconStyles.receiptNotch3} />
    </View>
  );
}

// ─── Settings-modal icons ─────────────────────────────────────────────────────
function HelpCircleIcon() {
  return (
    <View style={{ width: 18, height: 18, borderRadius: 9, borderWidth: 1.5, borderColor: '#a855f7', alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: 2, height: 5, backgroundColor: '#a855f7', borderRadius: 1 }} />
      <View style={{ width: 2, height: 2, borderRadius: 1, backgroundColor: '#a855f7', marginTop: 1 }} />
    </View>
  );
}

function ChatLinesIcon() {
  return (
    <View style={{ width: 18, height: 16, borderRadius: 4, borderWidth: 1.5, borderColor: '#a855f7', alignItems: 'flex-start', justifyContent: 'center', paddingLeft: 3, gap: 3 }}>
      <View style={{ width: 10, height: 1.5, backgroundColor: '#a855f7', borderRadius: 1 }} />
      <View style={{ width: 7, height: 1.5, backgroundColor: '#a855f7', borderRadius: 1 }} />
    </View>
  );
}

function EnvelopeSmIcon() {
  return (
    <View style={{ width: 18, height: 13, borderRadius: 2, borderWidth: 1.5, borderColor: '#a855f7', overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ position: 'absolute', width: 24, height: 1.5, backgroundColor: '#a855f7', top: 2, transform: [{ rotate: '25deg' }] }} />
      <View style={{ position: 'absolute', width: 24, height: 1.5, backgroundColor: '#a855f7', top: 2, transform: [{ rotate: '-25deg' }] }} />
    </View>
  );
}

function DocLinesIcon() {
  return (
    <View style={{ width: 14, height: 17, borderRadius: 2, borderWidth: 1.5, borderColor: '#a855f7', paddingHorizontal: 2, paddingTop: 3, gap: 2.5 }}>
      <View style={{ width: 8, height: 1.5, backgroundColor: '#a855f7', borderRadius: 1 }} />
      <View style={{ width: 6, height: 1.5, backgroundColor: '#a855f7', borderRadius: 1 }} />
      <View style={{ width: 8, height: 1.5, backgroundColor: '#a855f7', borderRadius: 1 }} />
      <View style={{ width: 5, height: 1.5, backgroundColor: '#a855f7', borderRadius: 1 }} />
    </View>
  );
}

function ShieldCheckIcon() {
  return (
    <View style={{ width: 16, height: 18, alignItems: 'center' }}>
      <View style={{ width: 16, height: 16, borderWidth: 1.5, borderColor: '#a855f7', borderTopLeftRadius: 8, borderTopRightRadius: 8, borderBottomLeftRadius: 3, borderBottomRightRadius: 3, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ position: 'absolute', width: 5, height: 1.5, backgroundColor: '#a855f7', borderRadius: 1, bottom: 6, left: 2, transform: [{ rotate: '45deg' }] }} />
        <View style={{ position: 'absolute', width: 8, height: 1.5, backgroundColor: '#a855f7', borderRadius: 1, bottom: 7, right: 2, transform: [{ rotate: '-45deg' }] }} />
      </View>
    </View>
  );
}

function InfoCircleIcon() {
  return (
    <View style={{ width: 18, height: 18, borderRadius: 9, borderWidth: 1.5, borderColor: '#a855f7', alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: 2, height: 2, borderRadius: 1, backgroundColor: '#a855f7' }} />
      <View style={{ width: 2, height: 5, backgroundColor: '#a855f7', borderRadius: 1, marginTop: 1 }} />
    </View>
  );
}

function XCloseIcon() {
  return (
    <View style={{ width: 14, height: 14, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ position: 'absolute', width: 12, height: 2, backgroundColor: '#a3a3a3', borderRadius: 1, transform: [{ rotate: '45deg' }] }} />
      <View style={{ position: 'absolute', width: 12, height: 2, backgroundColor: '#a3a3a3', borderRadius: 1, transform: [{ rotate: '-45deg' }] }} />
    </View>
  );
}

// ─── SettingsModal ────────────────────────────────────────────────────────────
function SettingsModal({ visible, onClose, navigate }: { visible: boolean; onClose: () => void; navigate: (screen: any) => void }) {
  const sections = [
    {
      title: 'Support',
      items: [
        { Icon: HelpCircleIcon,  label: 'Help Center',    screenType: 'helpCenter' },
        { Icon: ChatLinesIcon,   label: 'FAQs',           screenType: 'faq' },
        { Icon: EnvelopeSmIcon,  label: 'Contact Us',     screenType: 'contactUs' },
      ],
    },
    {
      title: 'Legal',
      items: [
        { Icon: DocLinesIcon,    label: 'Terms & Conditions', screenType: 'terms' },
        { Icon: ShieldCheckIcon, label: 'Privacy Policy',     screenType: 'privacy' },
        { Icon: DocLinesIcon,    label: 'Cookie Policy',      screenType: 'cookies' },
      ],
    },
    {
      title: 'About',
      items: [
        { Icon: InfoCircleIcon, label: 'About Shortsy', screenType: 'about' },
      ],
    },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}>
      <View style={modalStyles.root}>
        {/* Drag handle */}
        <View style={modalStyles.handle} />

        {/* Header */}
        <View style={modalStyles.header}>
          <Text style={modalStyles.headerTitle}>Settings</Text>
          <TouchableOpacity
            onPress={onClose}
            style={modalStyles.closeBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <XCloseIcon />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={modalStyles.scrollContent}>
          {sections.map(section => (
            <View key={section.title} style={modalStyles.section}>
              <Text style={modalStyles.sectionTitle}>{section.title}</Text>
              <View style={modalStyles.sectionCard}>
                {section.items.map(({ Icon, label, screenType }, idx) => (
                  <TouchableOpacity
                    key={label}
                    style={[
                      modalStyles.item,
                      idx < section.items.length - 1 && modalStyles.itemBorder,
                    ]}
                    onPress={() => {
                      onClose();
                      navigate({ type: screenType });
                    }}
                    activeOpacity={0.7}>
                    <View style={modalStyles.itemIconWrap}>
                      <Icon />
                    </View>
                    <Text style={modalStyles.itemLabel}>{label}</Text>
                    <View style={modalStyles.itemChevron} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}

          {/* App version footer */}
          <View style={modalStyles.footer}>
            <Text style={modalStyles.footerVersion}>Shortsy v1.0.0</Text>
            <Text style={modalStyles.footerCopy}>© 2026 Shortsy. All rights reserved.</Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface ProfilePageProps {
  onLogout: () => void;
  rentedContent: Content[];
  onContentClick: (content: Content) => void;
  onHistoryClick: () => void;
  onPaymentHistoryClick: () => void;
  navigate: (screen: any) => void;
  isPremium: boolean;
  premiumSubscription: PremiumSubscription | null;
  user: UserProfile | null;
  paymentHistory: PaymentHistoryRecord[];
}

// ─── Component ────────────────────────────────────────────────────────────────
export function ProfilePage({ onLogout, rentedContent, onContentClick, onHistoryClick, onPaymentHistoryClick, navigate, isPremium, premiumSubscription, user, paymentHistory }: ProfilePageProps) {
  const [totalSpent, setTotalSpent] = useState(0);
  const [contentWatched, setContentWatched] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  
  const menuItems: Array<{ Icon: React.ComponentType; label: string; onPress?: () => void }> = [
    { Icon: HeartIcon,    label: 'My Favorites' },
    { Icon: ClockIcon,    label: 'Watch History', onPress: onHistoryClick },
    { Icon: ReceiptIcon,  label: 'Payment History', onPress: onPaymentHistoryClick },
    { Icon: SettingsIcon, label: 'Settings',      onPress: () => setShowSettings(true) },
  ];
  
  useEffect(() => {
    // Calculate total spent and content watched from payment history (only paid orders)
    const paidOrders = paymentHistory.filter(order => order.status === 'paid');
    const total = paidOrders.reduce((sum, order) => sum + order.amountINR, 0);
    setTotalSpent(total);
    setContentWatched(paidOrders.length);
  }, [paymentHistory]);

  const handleUpgradePress = () => {
    logger.info('ProfilePage', 'Upgrade button pressed, navigating to premium payment screen');
    navigate({ type: 'premiumPayment' });
  };

  return (
    <>
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
            <Text style={styles.userName}>{user?.displayName ?? 'Film Lover'}</Text>
            <Text style={styles.userEmail}>{user?.email ?? 'filmfan@shortsy.app'}</Text>
          </View>
        </View>
        {/* ── Stats ── */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {rentedContent.length}
            </Text>
            <Text style={styles.statLabel}>Rentals</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>₹{totalSpent}</Text>
            <Text style={styles.statLabel}>Spent</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {contentWatched}
            </Text>
            <Text style={styles.statLabel}>Watched</Text>
          </View>
        </View>
        {/* ── Upgrade card ── */}
        {!isPremium && (
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
                  <Text style={styles.upgradeBadge}>SHORTSY +</Text>
                </View>
                <Text style={styles.upgradeTitle}>Get unlimited access</Text>
                <Text style={styles.upgradePrice}>₹199/month • Selected catalog</Text>
                <TouchableOpacity 
                  style={styles.upgradeBtn} 
                  activeOpacity={0.8}
                  onPress={() => {
                    logger.info('ProfilePage', 'TouchableOpacity pressed');
                    handleUpgradePress();
                  }}>
                  <Text style={styles.upgradeBtnText}>Upgrade Now</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        )}
        {isPremium && premiumSubscription && (
          <View style={styles.upgradeWrap}>
            <LinearGradient
              colors={['#10b981', '#059669']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.upgradeCard}>
              <View style={styles.upgradeCircle} />
              <View style={styles.upgradeContent}>
                <View style={styles.upgradeTopRow}>
                  <CrownIcon />
                  <Text style={styles.upgradeBadge}>PREMIUM ACTIVE</Text>
                </View>
                <Text style={styles.upgradeTitle}>You're a premium member!</Text>
                <Text style={styles.upgradePrice}>Unlimited access to premium content</Text>
                <View style={styles.premiumExpiryRow}>
                  <Text style={styles.premiumExpiryLabel}>Valid until:</Text>
                  <Text style={styles.premiumExpiryDate}>
                    {new Date(premiumSubscription.expiresAt).toLocaleDateString('en-US', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </View>
        )}
        {/* ── Menu ── */}
        <View style={styles.menuSection}>
          {menuItems.map(({ Icon, label, onPress }) => (
            <TouchableOpacity key={label} style={styles.menuItem} activeOpacity={0.7} onPress={onPress}>
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
      </ScrollView>
      <SettingsModal visible={showSettings} onClose={() => setShowSettings(false)} navigate={navigate} />
    </>
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
  premiumExpiryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  premiumExpiryLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },
  premiumExpiryDate: {
    fontSize: 13,
    color: '#ffffff',
    fontWeight: '700',
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

  // Receipt
  receiptWrap: { width: 18, height: 22, alignItems: 'center', position: 'relative' },
  receiptBody: { width: 18, height: 20, backgroundColor: '#a3a3a3', borderRadius: 2, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 },
  receiptLine1: { position: 'absolute', top: 4, width: 12, height: 1.5, backgroundColor: '#000', borderRadius: 1 },
  receiptLine2: { position: 'absolute', top: 8, width: 10, height: 1.5, backgroundColor: '#000', borderRadius: 1 },
  receiptLine3: { position: 'absolute', top: 12, width: 8, height: 1.5, backgroundColor: '#000', borderRadius: 1 },
  receiptNotch1: { position: 'absolute', bottom: 0, left: 2, width: 3, height: 3, backgroundColor: '#000', borderTopLeftRadius: 3, borderTopRightRadius: 3 },
  receiptNotch2: { position: 'absolute', bottom: 0, left: 7.5, width: 3, height: 3, backgroundColor: '#000', borderTopLeftRadius: 3, borderTopRightRadius: 3 },
  receiptNotch3: { position: 'absolute', bottom: 0, right: 2, width: 3, height: 3, backgroundColor: '#000', borderTopLeftRadius: 3, borderTopRightRadius: 3 },
});

const modalStyles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000000',
    paddingTop: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#333333',
    alignSelf: 'center',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1f1f1f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: 48,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#525252',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  sectionCard: {
    backgroundColor: '#111111',
    borderRadius: 14,
    overflow: 'hidden',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 12,
  },
  itemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  itemIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#1a0533',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemLabel: {
    flex: 1,
    fontSize: 15,
    color: '#ffffff',
    fontWeight: '500',
  },
  itemChevron: {
    width: 6,
    height: 6,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: '#525252',
    transform: [{ rotate: '45deg' }],
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 16,
    alignItems: 'center',
    gap: 4,
  },
  footerVersion: {
    fontSize: 13,
    color: '#525252',
    fontWeight: '500',
  },
  footerCopy: {
    fontSize: 11,
    color: '#333333',
  },
});
