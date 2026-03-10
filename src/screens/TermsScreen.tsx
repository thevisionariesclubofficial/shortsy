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
import { ENV } from '../constants/env';
import { COLORS } from '../constants/colors';

interface TermsScreenProps {
  onBack: () => void;
}

export function TermsScreen({ onBack }: TermsScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[COLORS.bg.legal, COLORS.bg.legalEnd]} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Terms & Conditions</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}>
          
          <View style={styles.intro}>
            <Text style={styles.introIcon}>📋</Text>
            <Text style={styles.lastUpdated}>Last Updated: March 2, 2026</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
            <Text style={styles.paragraph}>
              By accessing and using Shortsy, you accept and agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our service.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. Service Description</Text>
            <Text style={styles.paragraph}>
              Shortsy provides a streaming platform for short films and vertical series. We offer both rental-based and subscription-based access models.
            </Text>
            <Text style={styles.bulletPoint}>{`• Short film rentals valid for ${ENV.RENTAL_EXPIRY_SHORT_FILM_DAYS} ${ENV.RENTAL_EXPIRY_SHORT_FILM_DAYS === 1 ? 'day' : 'days'}`}</Text>
            <Text style={styles.bulletPoint}>{`• Vertical series rentals valid for ${ENV.RENTAL_EXPIRY_VERTICAL_SERIES_DAYS} ${ENV.RENTAL_EXPIRY_VERTICAL_SERIES_DAYS === 1 ? 'day' : 'days'}`}</Text>
            <Text style={styles.bulletPoint}>• Premium subscription for unlimited access</Text>
            <Text style={styles.bulletPoint}>• HD quality streaming on mobile devices</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. User Accounts</Text>
            <Text style={styles.paragraph}>
              You are responsible for maintaining the confidentiality of your account credentials. You agree to:
            </Text>
            <Text style={styles.bulletPoint}>• Provide accurate registration information</Text>
            <Text style={styles.bulletPoint}>• Keep your password secure</Text>
            <Text style={styles.bulletPoint}>• Notify us of unauthorized account access</Text>
            <Text style={styles.bulletPoint}>• Be responsible for all activities under your account</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. Payment Terms</Text>
            <Text style={styles.paragraph}>
              All payments are processed securely through Razorpay. By making a purchase, you agree to:
            </Text>
            <Text style={styles.bulletPoint}>• Pay all applicable fees and taxes</Text>
            <Text style={styles.bulletPoint}>• Provide valid payment information</Text>
            <Text style={styles.bulletPoint}>• Accept that rentals are non-refundable once access is granted</Text>
            <Text style={styles.bulletPoint}>• Automatic renewal for subscription services (unless cancelled)</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>5. Content Usage Rights</Text>
            <Text style={styles.paragraph}>
              All content on Shortsy is protected by copyright and intellectual property laws. You may:
            </Text>
            <Text style={styles.bulletPoint}>• Stream content for personal, non-commercial use</Text>
            <Text style={styles.bulletPoint}>• Watch within the rental or subscription period</Text>
            <Text style={styles.paragraph}>
              You may NOT:
            </Text>
            <Text style={styles.bulletPoint}>• Download, copy, or redistribute content</Text>
            <Text style={styles.bulletPoint}>• Share account credentials with others</Text>
            <Text style={styles.bulletPoint}>• Use content for commercial purposes</Text>
            <Text style={styles.bulletPoint}>• Bypass or remove DRM protections</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>6. Subscription & Cancellation</Text>
            <Text style={styles.paragraph}>
              Premium subscriptions automatically renew monthly. You can cancel anytime from your account settings. Cancellation takes effect at the end of the current billing period.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>7. Prohibited Activities</Text>
            <Text style={styles.paragraph}>
              You agree not to engage in any of the following:
            </Text>
            <Text style={styles.bulletPoint}>• Violating any laws or regulations</Text>
            <Text style={styles.bulletPoint}>• Attempting to hack or disrupt the service</Text>
            <Text style={styles.bulletPoint}>• Using automated scripts or bots</Text>
            <Text style={styles.bulletPoint}>• Impersonating others or providing false information</Text>
            <Text style={styles.bulletPoint}>• Uploading malicious code or viruses</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>8. Limitation of Liability</Text>
            <Text style={styles.paragraph}>
              Shortsy is provided "as is" without warranties of any kind. We are not liable for:
            </Text>
            <Text style={styles.bulletPoint}>• Service interruptions or technical issues</Text>
            <Text style={styles.bulletPoint}>• Loss of data or content</Text>
            <Text style={styles.bulletPoint}>• Indirect or consequential damages</Text>
            <Text style={styles.bulletPoint}>• Third-party content or links</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>9. Termination</Text>
            <Text style={styles.paragraph}>
              We reserve the right to suspend or terminate your account if you violate these terms, engage in fraudulent activity, or for any reason we deem necessary to protect our service and users.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>10. Changes to Terms</Text>
            <Text style={styles.paragraph}>
              We may update these Terms and Conditions periodically. Continued use of Shortsy after changes constitutes acceptance of the updated terms.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>11. Governing Law</Text>
            <Text style={styles.paragraph}>
              These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Mumbai, India.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>12. Contact Information</Text>
            <Text style={styles.paragraph}>
              For questions about these terms, contact us at:
            </Text>
            <Text style={styles.bulletPoint}>• Email: legal@shortsy.com</Text>
            <Text style={styles.bulletPoint}>• Phone: +91 9876543210</Text>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              By using Shortsy, you acknowledge that you have read and understood these Terms and Conditions.
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
    flex: 1,
    textAlign: 'center',
    marginRight: 40,
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
    marginBottom: 24,
  },
  introIcon: {
    fontSize: 50,
    marginBottom: 12,
  },
  lastUpdated: {
    fontSize: 13,
    color: COLORS.overlay.white50,
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.accent.blue500,
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 14,
    marginTop: 12,
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
    backgroundColor: COLORS.overlay.infoBg,
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.overlay.infoBorderStrong,
  },
  footerText: {
    fontSize: 13,
    color: COLORS.overlay.white70,
    textAlign: 'center',
    lineHeight: 20,
  },
});
