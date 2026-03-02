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

interface CookiePolicyScreenProps {
  onBack: () => void;
}

export function CookiePolicyScreen({ onBack }: CookiePolicyScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#1a1a2e', '#16213e']} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cookie Policy</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}>
          
          <View style={styles.intro}>
            <Text style={styles.introIcon}>🍪</Text>
            <Text style={styles.lastUpdated}>Last Updated: March 2, 2026</Text>
          </View>

          <View style={styles.highlight}>
            <Text style={styles.highlightText}>
              This Cookie Policy explains how Shortsy uses cookies and similar technologies to recognize you when you visit our app.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What Are Cookies?</Text>
            <Text style={styles.paragraph}>
              Cookies are small data files stored on your device that help us provide better services. In mobile apps, we also use similar technologies like local storage, session tokens, and device identifiers.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Types of Cookies We Use</Text>
            
            <View style={styles.cookieCard}>
              <Text style={styles.cookieType}>🔐 Essential Cookies</Text>
              <Text style={styles.cookieDesc}>
                Required for basic app functionality and security. These cannot be disabled.
              </Text>
              <Text style={styles.cookieExample}>Examples:</Text>
              <Text style={styles.bulletPoint}>• Authentication tokens</Text>
              <Text style={styles.bulletPoint}>• Session management</Text>
              <Text style={styles.bulletPoint}>• Security features</Text>
            </View>

            <View style={styles.cookieCard}>
              <Text style={styles.cookieType}>⚙️ Functional Cookies</Text>
              <Text style={styles.cookieDesc}>
                Remember your preferences and settings to enhance your experience.
              </Text>
              <Text style={styles.cookieExample}>Examples:</Text>
              <Text style={styles.bulletPoint}>• Language preferences</Text>
              <Text style={styles.bulletPoint}>• Video quality settings</Text>
              <Text style={styles.bulletPoint}>• Volume and playback preferences</Text>
            </View>

            <View style={styles.cookieCard}>
              <Text style={styles.cookieType}>📊 Analytics Cookies</Text>
              <Text style={styles.cookieDesc}>
                Help us understand how you use the app to improve performance.
              </Text>
              <Text style={styles.cookieExample}>Examples:</Text>
              <Text style={styles.bulletPoint}>• Usage statistics</Text>
              <Text style={styles.bulletPoint}>• Error tracking</Text>
              <Text style={styles.bulletPoint}>• Performance metrics</Text>
            </View>

            <View style={styles.cookieCard}>
              <Text style={styles.cookieType}>🎯 Personalization Cookies</Text>
              <Text style={styles.cookieDesc}>
                Used to provide personalized content recommendations.
              </Text>
              <Text style={styles.cookieExample}>Examples:</Text>
              <Text style={styles.bulletPoint}>• Content recommendations</Text>
              <Text style={styles.bulletPoint}>• Watch history</Text>
              <Text style={styles.bulletPoint}>• Preference learning</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>How We Use Cookies</Text>
            <Text style={styles.paragraph}>
              We use cookies and similar technologies to:
            </Text>
            <Text style={styles.bulletPoint}>• Keep you signed in securely</Text>
            <Text style={styles.bulletPoint}>• Remember your watch progress</Text>
            <Text style={styles.bulletPoint}>• Provide personalized recommendations</Text>
            <Text style={styles.bulletPoint}>• Analyze app performance and usage</Text>
            <Text style={styles.bulletPoint}>• Prevent fraud and ensure security</Text>
            <Text style={styles.bulletPoint}>• Improve overall user experience</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Third-Party Cookies</Text>
            <Text style={styles.paragraph}>
              Some cookies are placed by third-party services:
            </Text>
            <Text style={styles.bulletPoint}>
              • <Text style={styles.bold}>Razorpay:</Text> Payment processing and fraud prevention
            </Text>
            <Text style={styles.bulletPoint}>
              • <Text style={styles.bold}>Analytics Services:</Text> App performance and usage tracking
            </Text>
            <Text style={styles.bulletPoint}>
              • <Text style={styles.bold}>Cloud Providers:</Text> Content delivery and infrastructure
            </Text>
            <Text style={styles.paragraph} style={{marginTop: 12}}>
              These parties have their own privacy policies governing cookie usage.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cookie Duration</Text>
            
            <Text style={styles.subheading}>Session Cookies</Text>
            <Text style={styles.paragraph}>
              Temporary cookies that expire when you close the app. Used for immediate functionality.
            </Text>
            
            <Text style={styles.subheading}>Persistent Cookies</Text>
            <Text style={styles.paragraph}>
              Remain on your device for a specified period or until manually deleted. Used to remember preferences across sessions.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Managing Your Cookie Preferences</Text>
            <Text style={styles.paragraph}>
              You can control cookie usage through:
            </Text>
            <Text style={styles.bulletPoint}>
              • <Text style={styles.bold}>Device Settings:</Text> Manage app data and storage permissions
            </Text>
            <Text style={styles.bulletPoint}>
              • <Text style={styles.bold}>App Settings:</Text> Toggle analytics and personalization features
            </Text>
            <Text style={styles.bulletPoint}>
              • <Text style={styles.bold}>Clear Data:</Text> Delete stored cookies and app data
            </Text>
            <Text style={styles.bulletPoint}>
              • <Text style={styles.bold}>Opt-Out:</Text> Disable non-essential tracking
            </Text>
            
            <View style={styles.warningBox}>
              <Text style={styles.warningIcon}>⚠️</Text>
              <Text style={styles.warningText}>
                Disabling essential cookies may affect app functionality and prevent you from accessing certain features.
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Do Not Track</Text>
            <Text style={styles.paragraph}>
              Some browsers and devices offer "Do Not Track" (DNT) signals. We respect your privacy choices and honor DNT signals where technically feasible.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Updates to This Policy</Text>
            <Text style={styles.paragraph}>
              We may update this Cookie Policy to reflect changes in technology or legal requirements. Continued use of Shortsy after updates indicates acceptance of changes.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Us</Text>
            <Text style={styles.paragraph}>
              Questions about our cookie practices?
            </Text>
            <Text style={styles.bulletPoint}>• Email: privacy@shortsy.com</Text>
            <Text style={styles.bulletPoint}>• Cookie Preferences: cookies@shortsy.com</Text>
            <Text style={styles.bulletPoint}>• Phone: +91 9876543210</Text>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              By using Shortsy, you consent to our use of cookies as described in this policy.
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
    backgroundColor: '#1a1a2e',
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
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    padding: 8,
  },
  backIcon: {
    fontSize: 24,
    color: '#fff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
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
    marginBottom: 12,
  },
  lastUpdated: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.5)',
    fontStyle: 'italic',
  },
  highlight: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  highlightText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 22,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f59e0b',
    marginBottom: 12,
  },
  subheading: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    marginTop: 12,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 22,
    marginBottom: 8,
  },
  bulletPoint: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 22,
    marginLeft: 16,
    marginBottom: 6,
  },
  bold: {
    fontWeight: '700',
    color: '#fff',
  },
  cookieCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cookieType: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  cookieDesc: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
    marginBottom: 8,
  },
  cookieExample: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 8,
    marginBottom: 4,
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  warningIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 18,
  },
  footer: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  footerText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 20,
  },
});
