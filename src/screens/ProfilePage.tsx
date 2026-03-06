import React, { useEffect, useState } from 'react';
import { Ionicons } from '@react-native-vector-icons/ionicons';
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
            <Ionicons name="close" size={16} color="#a3a3a3" />
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
                      <Ionicons name={iconName as any} size={20} color="#a855f7" />
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
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  const menuItems: Array<{ iconName: string; label: string; onPress?: () => void }> = [
    { iconName: 'heart-outline',    label: 'My Favorites' },
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
            <Ionicons name="person" size={32} color="#ffffff" />
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
              colors={['#4f1fa3', '#7c3aed', '#c026d3']}
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
                    <Ionicons name="diamond" size={12} color="#fde047" />
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
                    <Ionicons name="arrow-forward" size={14} color="#7c3aed" />
                  </TouchableOpacity>
                </View>

                {/* Right: decorative icon stack */}
                <View style={styles.upgradeRight}>
                  <View style={styles.upgradeIconRing}>
                    <Ionicons name="diamond" size={36} color="rgba(253,224,71,0.9)" />
                  </View>
                  
                </View>
              </View>
            </LinearGradient>
          </View>
        )}
        {isPremium && premiumSubscription && (
          <View style={styles.upgradeWrap}>
            <LinearGradient
              colors={['#064e35', '#10b981', '#059669']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.upgradeCard}>
              <View style={styles.blobTL} />
              <View style={styles.blobBR} />

              <View style={styles.upgradeInner}>
                {/* Left */}
                <View style={styles.upgradeLeft}>
                  <View style={[styles.upgradePill, styles.upgradePillGreen]}>
                    <Ionicons name="checkmark-circle" size={12} color="#6ee7b7" />
                    <Text style={[styles.upgradePillText, styles.upgradePillTextGreen]}>PREMIUM ACTIVE</Text>
                  </View>

                  <Text style={styles.upgradeTitle}>You're all{`\n`}set! 🎉</Text>
                  <Text style={styles.upgradePrice}>Unlimited premium access</Text>

                  <View style={styles.premiumExpiryRow}>
                    <Ionicons name="calendar-outline" size={13} color="rgba(255,255,255,0.6)" />
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
                    <Ionicons name="shield-checkmark" size={36} color="rgba(110,231,183,0.9)" />
                  </View>
                  <View style={styles.upgradeFeatureTags}>
                    {['HD Access', 'No Ads', 'Offline'].map(tag => (
                      <View key={tag} style={[styles.featureTag, styles.featureTagGreen]}>
                        <Ionicons name="checkmark" size={10} color="#34d399" />
                        <Text style={styles.featureTagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            </LinearGradient>
          </View>
        )}
        {/* ── Menu ── */}
        <View style={styles.menuSection}>
          {menuItems.map(({ iconName, label, onPress }) => (
            <TouchableOpacity key={label} style={styles.menuItem} activeOpacity={0.7} onPress={onPress}>
              <Ionicons name={iconName as any} size={20} color="#a3a3a3" />
              <Text style={styles.menuLabel}>{label}</Text>
              <View style={styles.menuChevron} />
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.menuItem} activeOpacity={0.7} onPress={() => setShowLogoutConfirm(true)}>
            <Ionicons name="log-out-outline" size={20} color="#ef4444" />
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
              <Ionicons name="log-out-outline" size={24} color="#ef4444" />
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
    paddingVertical: 10,
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
    backgroundColor: 'rgba(255,255,255,0.07)',
    top: -50,
    left: -40,
  },
  blobBR: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.07)',
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
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
  },
  upgradePillGreen: {
    backgroundColor: 'rgba(110,231,183,0.2)',
  },
  upgradePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fde68a',
    letterSpacing: 0.8,
  },
  upgradePillTextGreen: {
    color: '#6ee7b7',
  },
  upgradeTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
    lineHeight: 28,
  },
  upgradePrice: {
    fontSize: 15,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.95)',
  },
  upgradeSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.55)',
    marginTop: -2,
  },
  upgradeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  upgradeBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#7c3aed',
  },
  upgradeIconRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  upgradeIconRingGreen: {
    backgroundColor: 'rgba(110,231,183,0.15)',
    borderColor: 'rgba(110,231,183,0.3)',
  },
  upgradeFeatureTags: {
    gap: 5,
  },
  featureTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 6,
    paddingVertical: 3,
    paddingHorizontal: 7,
  },
  featureTagGreen: {
    backgroundColor: 'rgba(52,211,153,0.15)',
  },
  featureTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
  },
  premiumExpiryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
  },
  premiumExpiryLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '500',
  },
  premiumExpiryDate: {
    fontSize: 13,
    color: '#ffffff',
    fontWeight: '700',
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

  // Logout confirmation modal
  logoutOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  logoutModal: {
    width: '100%',
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    paddingTop: 28,
    paddingBottom: 24,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  logoutIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(239,68,68,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    transform: [{ scale: 1.6 }],
  },
  logoutTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  logoutSubtitle: {
    fontSize: 13,
    color: '#a3a3a3',
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
    backgroundColor: '#2a2a2a',
  },
  logoutBtnConfirm: {
    backgroundColor: '#ef4444',
  },
  logoutBtnCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },
  logoutBtnConfirmText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },
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
