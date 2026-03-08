import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '../constants/colors';

interface AboutScreenProps {
  onBack: () => void;
}

export function AboutScreen({ onBack }: AboutScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[COLORS.bg.legal, COLORS.bg.legalEnd]} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>About Shortsy</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}>
          
          {/* Hero */}
          <View style={styles.hero}>
            <LinearGradient
              colors={[COLORS.accent.blue500, COLORS.brand.violet500]}
              style={styles.logoContainer}>
              <Text style={styles.logo}>S</Text>
            </LinearGradient>
            <Text style={styles.appName}>Shortsy</Text>
            <Text style={styles.tagline}>Stories Worth Your Time</Text>
            <Text style={styles.version}>Version 1.0.0</Text>
          </View>

          {/* Mission */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Our Mission</Text>
            <Text style={styles.paragraph}>
              Shortsy is redefining entertainment for the mobile generation. We curate exceptional short films and vertical series that deliver cinematic experiences in bite-sized formats—perfect for your busy lifestyle.
            </Text>
            <Text style={styles.paragraph}>
              Whether you have 5 minutes or an hour, Shortsy brings you compelling stories from emerging creators and established filmmakers, all optimized for your mobile screen.
            </Text>
          </View>

          {/* What We Offer */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What We Offer</Text>
            
            <View style={styles.featureCard}>
              <Text style={styles.featureIcon}>🎬</Text>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Curated Short Films</Text>
                <Text style={styles.featureDesc}>
                  Award-winning shorts, indie gems, and festival favorites
                </Text>
              </View>
            </View>

            <View style={styles.featureCard}>
              <Text style={styles.featureIcon}>📱</Text>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Vertical Series</Text>
                <Text style={styles.featureDesc}>
                  Episodic storytelling designed for mobile-first viewing
                </Text>
              </View>
            </View>

            <View style={styles.featureCard}>
              <Text style={styles.featureIcon}>💎</Text>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Flexible Access</Text>
                <Text style={styles.featureDesc}>
                  Rent individual titles or go Premium for unlimited access
                </Text>
              </View>
            </View>

            <View style={styles.featureCard}>
              <Text style={styles.featureIcon}>🎯</Text>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Smart Recommendations</Text>
                <Text style={styles.featureDesc}>
                  Personalized content based on your taste and mood
                </Text>
              </View>
            </View>
          </View>

          {/* Why Choose Shortsy */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Why Choose Shortsy?</Text>
            <View style={styles.benefitsList}>
              <View style={styles.benefitItem}>
                <Text style={styles.checkmark}>✓</Text>
                <Text style={styles.benefitText}>HD quality streaming</Text>
              </View>
              <View style={styles.benefitItem}>
                <Text style={styles.checkmark}>✓</Text>
                <Text style={styles.benefitText}>Mobile-optimized experience</Text>
              </View>
              <View style={styles.benefitItem}>
                <Text style={styles.checkmark}>✓</Text>
                <Text style={styles.benefitText}>New content added weekly</Text>
              </View>
              <View style={styles.benefitItem}>
                <Text style={styles.checkmark}>✓</Text>
                <Text style={styles.benefitText}>Watch anytime, anywhere</Text>
              </View>
              <View style={styles.benefitItem}>
                <Text style={styles.checkmark}>✓</Text>
                <Text style={styles.benefitText}>Support independent creators</Text>
              </View>
              <View style={styles.benefitItem}>
                <Text style={styles.checkmark}>✓</Text>
                <Text style={styles.benefitText}>Affordable pricing options</Text>
              </View>
            </View>
          </View>

          {/* Our Values */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Our Values</Text>
            
            <View style={styles.valueCard}>
              <Text style={styles.valueEmoji}>🎨</Text>
              <Text style={styles.valueTitle}>Creativity First</Text>
              <Text style={styles.valueDesc}>
                We champion innovative storytelling and unique artistic visions
              </Text>
            </View>

            <View style={styles.valueCard}>
              <Text style={styles.valueEmoji}>🌟</Text>
              <Text style={styles.valueTitle}>Quality Content</Text>
              <Text style={styles.valueDesc}>
                Every title is carefully curated for excellence and impact
              </Text>
            </View>

            <View style={styles.valueCard}>
              <Text style={styles.valueEmoji}>👥</Text>
              <Text style={styles.valueTitle}>Creator Support</Text>
              <Text style={styles.valueDesc}>
                Fair compensation and promotion for filmmakers and artists
              </Text>
            </View>

            <View style={styles.valueCard}>
              <Text style={styles.valueEmoji}>🚀</Text>
              <Text style={styles.valueTitle}>Innovation</Text>
              <Text style={styles.valueDesc}>
                Pushing boundaries in mobile entertainment technology
              </Text>
            </View>
          </View>

          {/* Team */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Our Team</Text>
            <Text style={styles.paragraph}>
              Shortsy is built by a passionate team of filmmakers, technologists, and entertainment enthusiasts dedicated to revolutionizing how stories are told and consumed on mobile devices.
            </Text>
          </View>

          {/* Contact */}
          <View style={styles.contactSection}>
            <Text style={styles.contactTitle}>Get in Touch</Text>
            <Text style={styles.contactItem}>📧 hello@shortsy.com</Text>
            <Text style={styles.contactItem}>🌐 www.shortsy.com</Text>
            <Text style={styles.contactItem}>📍 Mumbai, India</Text>
            
            <View style={styles.socialRow}>
              <TouchableOpacity style={styles.socialButton}>
                <Text style={styles.socialEmoji}>📘</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton}>
                <Text style={styles.socialEmoji}>📷</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton}>
                <Text style={styles.socialEmoji}>🐦</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton}>
                <Text style={styles.socialEmoji}>▶️</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              © 2026 Shortsy. All rights reserved.
            </Text>
            <Text style={styles.footerSubtext}>
              Made with ❤️ for story lovers everywhere
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg.legal,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.overlay.white10,
  },
  backButton: {
    padding: 8,
  },
  backIcon: {
    fontSize: 24,
    color: COLORS.text.primary,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logo: {
    fontSize: 48,
    fontWeight: '900',
    color: COLORS.text.primary,
  },
  appName: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: COLORS.overlay.white80,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  version: {
    fontSize: 13,
    color: COLORS.overlay.white50,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.accent.blue500,
    marginBottom: 16,
  },
  paragraph: {
    fontSize: 14,
    color: COLORS.overlay.white80,
    lineHeight: 22,
    marginBottom: 12,
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.overlay.white05,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.overlay.white10,
  },
  featureIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 13,
    color: COLORS.overlay.white70,
    lineHeight: 18,
  },
  benefitsList: {
    gap: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkmark: {
    fontSize: 20,
    color: COLORS.accent.emerald,
    marginRight: 12,
    fontWeight: '700',
  },
  benefitText: {
    fontSize: 15,
    color: COLORS.overlay.white80,
  },
  valueCard: {
    alignItems: 'center',
    backgroundColor: COLORS.overlay.violet4Tint10,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.overlay.violet4Tint30,
  },
  valueEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  valueTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  valueDesc: {
    fontSize: 14,
    color: COLORS.overlay.white70,
    textAlign: 'center',
    lineHeight: 20,
  },
  contactSection: {
    backgroundColor: COLORS.overlay.infoBg,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 1,
    borderColor: COLORS.overlay.infoBorderStrong,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.accent.blue500,
    marginBottom: 16,
  },
  contactItem: {
    fontSize: 15,
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.overlay.white10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.overlay.white20,
  },
  socialEmoji: {
    fontSize: 24,
  },
  footer: {
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.overlay.white10,
  },
  footerText: {
    fontSize: 13,
    color: COLORS.overlay.white60,
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: COLORS.overlay.white50,
  },
});
