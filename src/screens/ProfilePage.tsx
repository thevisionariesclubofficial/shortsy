import React, { useEffect, useRef, useState } from 'react';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import {
  Alert,
  Image,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Content } from '../data/mockData';
import { getPremiumStatus, PremiumSubscription } from '../services/premiumService';
import { logger } from '../utils/logger';
import type { UserProfile, PaymentHistoryRecord } from '../types/api';
import { COLORS } from '../constants/colors';


// ─── SettingsModal ────────────────────────────────────────────────────────────
function SettingsModal({ visible, onClose, navigate }: { visible: boolean; onClose: () => void; navigate: (screen: any) => void }) {
  const sections = [
    {
      title: 'Support',
      items: [
        { iconName: 'help-circle-outline',  label: 'Help Center',    screenType: 'helpCenter' },
        { iconName: 'chatbubble-outline',   label: 'FAQs',           screenType: 'faq' },
        { iconName: 'mail-outline',         label: 'Contact Us',     screenType: 'contactUs' },
      ],
    },
    {
      title: 'Legal',
      items: [
        { iconName: 'document-text-outline',    label: 'Terms & Conditions', screenType: 'terms' },
        { iconName: 'shield-checkmark-outline', label: 'Privacy Policy',     screenType: 'privacy' },
        { iconName: 'document-text-outline',    label: 'Cookie Policy',      screenType: 'cookies' },
      ],
    },
    {
      title: 'About',
      items: [
        { iconName: 'information-circle-outline', label: 'About Shortsy', screenType: 'about' },
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
            <Ionicons name="close" size={16} color={COLORS.text.tertiary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={modalStyles.scrollContent}>
          {sections.map(section => (
            <View key={section.title} style={modalStyles.section}>
              <Text style={modalStyles.sectionTitle}>{section.title}</Text>
              <View style={modalStyles.sectionCard}>
                {section.items.map(({ iconName, label, screenType }, idx) => (
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
                      <Ionicons name={iconName as any} size={20} color={COLORS.brand.violet} />
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
  favorites: Content[];
}

// ─── Component ────────────────────────────────────────────────────────────────
export function ProfilePage({ onLogout, rentedContent, onContentClick, onHistoryClick, onPaymentHistoryClick, navigate, isPremium, premiumSubscription, user, paymentHistory, favorites }: ProfilePageProps) {
  const [totalSpent, setTotalSpent] = useState(0);
  const [contentWatched, setContentWatched] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const favoritesRef = useRef<ScrollView>(null);
  
  const menuItems: Array<{ iconName: string; label: string; onPress?: () => void }> = [
    
    { iconName: 'time-outline',     label: 'Watch History', onPress: onHistoryClick },
    { iconName: 'receipt-outline',  label: 'Payment History', onPress: onPaymentHistoryClick },
    { iconName: 'settings-outline', label: 'Settings',      onPress: () => setShowSettings(true) },
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
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}>
        {/* ── Avatar + name ── */}
        <View style={styles.avatarRow}>
          <LinearGradient
            colors={[COLORS.brand.violet, COLORS.brand.pink]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatarCircle}>
            <Ionicons name="person" size={32} color={COLORS.text.primary} />
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
              colors={[COLORS.accent.violetBg, COLORS.brand.primaryDark, COLORS.brand.fuchsia]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.upgradeCard}>
              {/* Decorative blobs */}
              <View style={styles.blobTL} />
              <View style={styles.blobBR} />

              <View style={styles.upgradeInner}>
                {/* Left: text + CTA */}
                <View style={styles.upgradeLeft}>
                  {/* Badge row */}
                  <View style={styles.upgradePill}>
                    <Ionicons name="diamond" size={12} color={COLORS.accent.yellow} />
                    <Text style={styles.upgradePillText}>SHORTSY+</Text>
                  </View>

                  <Text style={styles.upgradeTitle}>Unlimited Access</Text>
                  <Text style={styles.upgradePrice}>₹199 / month</Text>
                  
                  <TouchableOpacity
                    style={styles.upgradeBtn}
                    activeOpacity={0.85}
                    onPress={() => {
                      logger.info('ProfilePage', 'TouchableOpacity pressed');
                      handleUpgradePress();
                    }}>
                    <Text style={styles.upgradeBtnText}>Get Started</Text>
                    <Ionicons name="arrow-forward" size={14} color={COLORS.brand.primaryDark} />
                  </TouchableOpacity>
                </View>

                {/* Right: decorative icon stack */}
                <View style={styles.upgradeRight}>
                  <View style={styles.upgradeIconRing}>
                    <Ionicons name="diamond" size={36} color={COLORS.overlay.yellowStrong} />
                  </View>
                  
                </View>
              </View>
            </LinearGradient>
          </View>
        )}
        {isPremium && premiumSubscription && (
          <View style={styles.upgradeWrap}>
            <LinearGradient
              colors={[COLORS.accent.emerald900, COLORS.accent.emerald, COLORS.accent.emerald600]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.upgradeCard}>
              <View style={styles.blobTL} />
              <View style={styles.blobBR} />

              <View style={styles.upgradeInner}>
                {/* Left */}
                <View style={styles.upgradeLeft}>
                  <View style={[styles.upgradePill, styles.upgradePillGreen]}>
                    <Ionicons name="checkmark-circle" size={12} color={COLORS.accent.emerald300} />
                    <Text style={[styles.upgradePillText, styles.upgradePillTextGreen]}>ACTIVE</Text>
                  </View>

                  <Text style={styles.upgradeTitle}>SHORTSY +</Text>
                  <Text style={styles.upgradePrice}>Unlimited premium access{"\n\n"}</Text>

                  <View style={styles.premiumExpiryRow}>
                    <Ionicons name="calendar-outline" size={13} color={COLORS.overlay.white60} />
                    <Text style={styles.premiumExpiryLabel}>Valid until </Text>
                    <Text style={styles.premiumExpiryDate}>
                      {new Date(premiumSubscription.expiresAt).toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </Text>
                  </View>
                </View>

                {/* Right */}
                <View style={styles.upgradeRight}>
                  <View style={[styles.upgradeIconRing, styles.upgradeIconRingGreen]}>
                    <Ionicons name="shield-checkmark" size={36} color={COLORS.overlay.emeraldStrong} />
                  </View>
                </View>
              </View>
            </LinearGradient>
          </View>
        )}
        {/* ── My Favorites ── */}
        <View style={styles.favSection}>
          <View style={styles.favHeader}>
            <Ionicons name="heart" size={16} color={COLORS.accent.red} />
            <Text style={styles.favTitle}>My Favorites</Text>
            <Text style={styles.favCount}>
              {`${favorites.length}`}
            </Text>
          </View>
          {favorites.length === 0 ? (
            <View style={styles.favEmpty}>
              <Ionicons name="heart-outline" size={32} color={COLORS.border.medium} />
              <Text style={styles.favEmptyText}>No favorites yet</Text>
              <Text style={styles.favEmptyHint}>Tap ♥ on any content to save it here</Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.favScroll}>
              {favorites.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.favCard}
                  activeOpacity={0.8}
                  onPress={() => onContentClick(item)}>
                  <View style={styles.favThumb}>
                    {item.thumbnail ? (
                      <Image
                        source={{ uri: item.thumbnail }}
                        style={StyleSheet.absoluteFillObject}
                        resizeMode="cover"
                      />
                    ) : null}
                    <LinearGradient
                      colors={['transparent', COLORS.overlay.dark75]}
                      style={styles.favGradient}
                    />
                    {item.type === 'vertical-series' && (
                      <View style={styles.favBadge}>
                        <Text style={styles.favBadgeText}>Series</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.favCardTitle} numberOfLines={2}>{item.title}</Text>
                  <Text style={styles.favCardMeta}>{item.genre} · {item.duration}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
        {/* ── Menu ── */}
        <View style={styles.menuSection}>
          {menuItems.map(({ iconName, label, onPress }) => (
            <TouchableOpacity key={label} style={styles.menuItem} activeOpacity={0.7} onPress={onPress}>
              <Ionicons name={iconName as any} size={20} color={COLORS.text.tertiary} />
              <Text style={styles.menuLabel}>{label}</Text>
              <View style={styles.menuChevron} />
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.menuItem} activeOpacity={0.7} onPress={() => setShowLogoutConfirm(true)}>
            <Ionicons name="log-out-outline" size={20} color={COLORS.accent.red} />
            <Text style={[styles.menuLabel, styles.menuDanger]}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <SettingsModal visible={showSettings} onClose={() => setShowSettings(false)} navigate={navigate} />

      {/* ── Logout Confirmation Modal ── */}
      <Modal
        visible={showLogoutConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoutConfirm(false)}>
        <View style={styles.logoutOverlay}>
          <View style={styles.logoutModal}>
            {/* Icon */}
            <View style={styles.logoutIconWrap}>
              <Ionicons name="log-out-outline" size={24} color={COLORS.accent.red} />
            </View>
            <Text style={styles.logoutTitle}>Log Out?</Text>
            <Text style={styles.logoutSubtitle}>
              You'll need to sign in again to access your account.
            </Text>
            <View style={styles.logoutBtnRow}>
              <TouchableOpacity
                style={[styles.logoutBtn, styles.logoutBtnCancel]}
                activeOpacity={0.8}
                onPress={() => setShowLogoutConfirm(false)}>
                <Text style={styles.logoutBtnCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.logoutBtn, styles.logoutBtnConfirm]}
                activeOpacity={0.8}
                onPress={() => { setShowLogoutConfirm(false); onLogout(); }}>
                <Text style={styles.logoutBtnConfirmText}>Log Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bg.black,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.bg.black,
  },
  scroll: {
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.bg.elevated,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text.primary,
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
    color: COLORS.text.primary,
  },
  userEmail: {
    fontSize: 13,
    color: COLORS.text.muted,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.bg.subtle,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.brand.violet,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.text.muted,
    marginTop: 4,
  },
  upgradeWrap: {
    paddingHorizontal: 10,
    paddingVertical: 20
  },
  upgradeCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginHorizontal: 10
  },
  // Decorative blobs
  blobTL: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: COLORS.overlay.white07,
    top: -50,
    left: -40,
  },
  blobBR: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.overlay.white07,
    bottom: -30,
    right: -20,
  },
  upgradeInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 10,
    paddingHorizontal: 20
  },
  upgradeLeft: {
    flex: 1,
    gap: 6,
  },
  upgradeRight: {
    alignItems: 'center',
    gap: 10,
    paddingLeft: 4,
  },
  upgradePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.overlay.progress,
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
  },
  upgradePillGreen: {
    backgroundColor: COLORS.overlay.emeraldLight20,
  },
  upgradePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.accent.yellowLight,
    letterSpacing: 0.8,
  },
  upgradePillTextGreen: {
    color: COLORS.accent.emerald300,
  },
  upgradeTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text.primary,
    lineHeight: 28,
  },
  upgradePrice: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.overlay.white95,
  },
  upgradeSub: {
    fontSize: 12,
    color: COLORS.overlay.white55,
    marginTop: -2,
  },
  upgradeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.text.primary,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  upgradeBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.brand.primaryDark,
  },
  upgradeIconRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.overlay.white12,
    borderWidth: 1.5,
    borderColor: COLORS.overlay.white20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  upgradeIconRingGreen: {
    backgroundColor: COLORS.overlay.emeraldLight15,
    borderColor: COLORS.overlay.emeraldLight30,
  },
  upgradeFeatureTags: {
    gap: 5,
  },
  featureTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.overlay.white10,
    borderRadius: 6,
    paddingVertical: 3,
    paddingHorizontal: 7,
  },
  featureTagGreen: {
    backgroundColor: COLORS.overlay.emeraldTint,
  },
  featureTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.overlay.white80,
  },
  premiumExpiryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.overlay.progress,
  },
  premiumExpiryLabel: {
    fontSize: 12,
    color: COLORS.overlay.white60,
    fontWeight: '500',
  },
  premiumExpiryDate: {
    fontSize: 13,
    color: COLORS.text.primary,
    fontWeight: '700',
  },
  menuSection: {
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 8,
  },

  // ── Favorites shelf ──
  favSection: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  favHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  favTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  favCount: {
    fontSize: 13,
    color: COLORS.text.muted,
    fontWeight: '500',
  },
  favScroll: {
    gap: 12,
    paddingRight: 4,
  },
  favCard: {
    width: 110,
  },
  favThumb: {
    width: 110,
    height: 160,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: COLORS.bg.elevated,
    marginBottom: 6,
  },
  favGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  favBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: COLORS.overlay.violetStrong,
    borderRadius: 4,
    paddingVertical: 2,
    paddingHorizontal: 5,
  },
  favBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.text.primary,
    letterSpacing: 0.3,
  },
  favCardTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text.primary,
    lineHeight: 16,
  },
  favCardMeta: {
    fontSize: 10,
    color: COLORS.text.muted,
    marginTop: 2,
  },
  favEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 28,
    gap: 6,
    backgroundColor: COLORS.bg.subtle,
    borderRadius: 14,
  },
  favEmptyText: {
    fontSize: 14,
    color: COLORS.text.dimmed,
    fontWeight: '500',
  },
  favEmptyHint: {
    fontSize: 12,
    color: COLORS.border.medium,
    textAlign: 'center',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: COLORS.bg.subtle,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  menuDanger: {
    color: COLORS.accent.red,
  },
  menuChevron: {
    width: 6,
    height: 6,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: COLORS.text.dimmed,
    transform: [{ rotate: '45deg' }],
  },

  // Logout confirmation modal
  logoutOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay.dark70,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  logoutModal: {
    width: '100%',
    backgroundColor: COLORS.bg.elevated,
    borderRadius: 20,
    paddingTop: 28,
    paddingBottom: 24,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border.muted,
  },
  logoutIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.overlay.redTint12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    transform: [{ scale: 1.6 }],
  },
  logoutTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  logoutSubtitle: {
    fontSize: 13,
    color: COLORS.text.tertiary,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 24,
  },
  logoutBtnRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  logoutBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutBtnCancel: {
    backgroundColor: COLORS.border.muted,
  },
  logoutBtnConfirm: {
    backgroundColor: COLORS.accent.red,
  },
  logoutBtnCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  logoutBtnConfirmText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
});

const modalStyles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bg.black,
    paddingTop: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border.handle,
    alignSelf: 'center',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.bg.elevated,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.bg.modal,
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
    color: COLORS.text.dimmed,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  sectionCard: {
    backgroundColor: COLORS.bg.subtle,
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
    borderBottomColor: COLORS.bg.elevated,
  },
  itemIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: COLORS.bg.heroStart,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemLabel: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  itemChevron: {
    width: 6,
    height: 6,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: COLORS.text.dimmed,
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
    color: COLORS.text.dimmed,
    fontWeight: '500',
  },
  footerCopy: {
    fontSize: 11,
    color: COLORS.border.handle,
  },
});
