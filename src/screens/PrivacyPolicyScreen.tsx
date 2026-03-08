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

interface PrivacyPolicyScreenProps {
  onBack: () => void;
}

export function PrivacyPolicyScreen({ onBack }: PrivacyPolicyScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[COLORS.bg.legal, COLORS.bg.legalEnd]} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Privacy Policy</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}>
          
          <View style={styles.intro}>
            <Text style={styles.introIcon}>🔒</Text>
            <Text style={styles.subtitle}>Your Privacy Matters</Text>
            <Text style={styles.lastUpdated}>Last Updated: March 2, 2026</Text>
          </View>

          <View style={styles.highlight}>
            <Text style={styles.highlightText}>
              At Shortsy, we are committed to protecting your privacy and personal information. This policy explains how we collect, use, and safeguard your data.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. Information We Collect</Text>
            <Text style={styles.subheading}>Account Information:</Text>
            <Text style={styles.bulletPoint}>• Email address and password</Text>
            <Text style={styles.bulletPoint}>• Profile name and preferences</Text>
            <Text style={styles.bulletPoint}>• Payment information (processed by Razorpay)</Text>
            
            <Text style={styles.subheading}>Usage Data:</Text>
            <Text style={styles.bulletPoint}>• Content watched and viewing history</Text>
            <Text style={styles.bulletPoint}>• Watch progress and preferences</Text>
            <Text style={styles.bulletPoint}>• Search queries and browsing behavior</Text>
            <Text style={styles.bulletPoint}>• Device information and app usage patterns</Text>
            
            <Text style={styles.subheading}>Technical Data:</Text>
            <Text style={styles.bulletPoint}>• IP address and location data</Text>
            <Text style={styles.bulletPoint}>• Device type, OS version, and app version</Text>
            <Text style={styles.bulletPoint}>• Network and connection information</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
            <Text style={styles.paragraph}>
              We use collected information to:
            </Text>
            <Text style={styles.bulletPoint}>• Provide and personalize our streaming service</Text>
            <Text style={styles.bulletPoint}>• Process payments and manage subscriptions</Text>
            <Text style={styles.bulletPoint}>• Recommend content based on your preferences</Text>
            <Text style={styles.bulletPoint}>• Improve service quality and user experience</Text>
            <Text style={styles.bulletPoint}>• Send important account and service updates</Text>
            <Text style={styles.bulletPoint}>• Prevent fraud and ensure security</Text>
            <Text style={styles.bulletPoint}>• Comply with legal obligations</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. Information Sharing</Text>
            <Text style={styles.paragraph}>
              We do NOT sell your personal information. We may share data with:
            </Text>
            <Text style={styles.bulletPoint}>• Payment processors (Razorpay) for transactions</Text>
            <Text style={styles.bulletPoint}>• Cloud service providers for infrastructure</Text>
            <Text style={styles.bulletPoint}>• Analytics partners to improve our service</Text>
            <Text style={styles.bulletPoint}>• Legal authorities when required by law</Text>
            <Text style={styles.paragraph} style={{marginTop: 12}}>
              All third-party partners are contractually bound to protect your data.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. Data Security</Text>
            <Text style={styles.paragraph}>
              We implement industry-standard security measures:
            </Text>
            <Text style={styles.bulletPoint}>• Encrypted data transmission (HTTPS/TLS)</Text>
            <Text style={styles.bulletPoint}>• Secure password hashing</Text>
            <Text style={styles.bulletPoint}>• Regular security audits and updates</Text>
            <Text style={styles.bulletPoint}>• Access controls and authentication</Text>
            <Text style={styles.bulletPoint}>• Monitoring for suspicious activity</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>5. Your Privacy Rights</Text>
            <Text style={styles.paragraph}>
              You have the right to:
            </Text>
            <Text style={styles.bulletPoint}>• Access your personal data</Text>
            <Text style={styles.bulletPoint}>• Correct inaccurate information</Text>
            <Text style={styles.bulletPoint}>• Delete your account and data</Text>
            <Text style={styles.bulletPoint}>• Opt-out of marketing communications</Text>
            <Text style={styles.bulletPoint}>• Export your data</Text>
            <Text style={styles.bulletPoint}>• Object to data processing</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>6. Cookies and Tracking</Text>
            <Text style={styles.paragraph}>
              We use cookies and similar technologies to:
            </Text>
            <Text style={styles.bulletPoint}>• Keep you logged in</Text>
            <Text style={styles.bulletPoint}>• Remember your preferences</Text>
            <Text style={styles.bulletPoint}>• Analyze app performance</Text>
            <Text style={styles.bulletPoint}>• Improve content recommendations</Text>
            <Text style={styles.paragraph} style={{marginTop: 12}}>
              You can manage cookie preferences in your device settings.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>7. Children's Privacy</Text>
            <Text style={styles.paragraph}>
              Shortsy is not intended for users under 13 years of age. We do not knowingly collect information from children. If you believe we have collected data from a child, please contact us immediately.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>8. Data Retention</Text>
            <Text style={styles.paragraph}>
              We retain your data as long as your account is active or as needed to provide services. After account deletion:
            </Text>
            <Text style={styles.bulletPoint}>• Personal data deleted within 30 days</Text>
            <Text style={styles.bulletPoint}>• Transaction records kept for legal compliance (7 years)</Text>
            <Text style={styles.bulletPoint}>• Anonymized analytics data may be retained</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>9. International Transfers</Text>
            <Text style={styles.paragraph}>
              Your data may be processed in servers located in different countries. We ensure adequate protection through standard contractual clauses and security measures.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>10. Policy Updates</Text>
            <Text style={styles.paragraph}>
              We may update this Privacy Policy periodically. We'll notify you of significant changes via email or in-app notification. Continued use after changes indicates acceptance.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>11. Contact Us</Text>
            <Text style={styles.paragraph}>
              Questions about privacy or data protection?
            </Text>
            <Text style={styles.bulletPoint}>• Email: privacy@shortsy.com</Text>
            <Text style={styles.bulletPoint}>• Data Protection Officer: dpo@shortsy.com</Text>
            <Text style={styles.bulletPoint}>• Phone: +91 9876543210</Text>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              By using Shortsy, you consent to this Privacy Policy and our data practices.
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
  intro: {
    alignItems: 'center',
    marginBottom: 20,
  },
  introIcon: {
    fontSize: 50,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  lastUpdated: {
    fontSize: 13,
    color: COLORS.overlay.white50,
    fontStyle: 'italic',
  },
  highlight: {
    backgroundColor: COLORS.overlay.emeraldBg,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.overlay.emeraldBorder,
  },
  highlightText: {
    fontSize: 14,
    color: COLORS.overlay.white90,
    lineHeight: 22,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.accent.emerald,
    marginBottom: 12,
  },
  subheading: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginTop: 12,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 14,
    color: COLORS.overlay.white80,
    lineHeight: 22,
    marginBottom: 8,
  },
  bulletPoint: {
    fontSize: 14,
    color: COLORS.overlay.white70,
    lineHeight: 22,
    marginLeft: 16,
    marginBottom: 6,
  },
  footer: {
    backgroundColor: COLORS.overlay.emeraldBg,
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.overlay.emeraldBorder,
  },
  footerText: {
    fontSize: 13,
    color: COLORS.overlay.white70,
    textAlign: 'center',
    lineHeight: 20,
  },
});
