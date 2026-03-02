import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

interface FAQScreenProps {
  onBack: () => void;
}

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

export function FAQScreen({ onBack }: FAQScreenProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const faqs: FAQItem[] = [
    {
      category: 'Getting Started',
      question: 'What is Shortsy?',
      answer: 'Shortsy is a premium streaming platform offering curated short films and vertical series. Enjoy cinematic storytelling in bite-sized formats, perfect for mobile viewing.',
    },
    {
      category: 'Getting Started',
      question: 'How do I create an account?',
      answer: 'Simply download the app, tap "Sign Up" on the welcome screen, and enter your email and password. You\'ll be ready to start browsing in seconds!',
    },
    {
      category: 'Rentals & Payments',
      question: 'How does content rental work?',
      answer: 'Browse our catalog and rent individual titles for 48 hours. Once rented, you can watch the content as many times as you want within that period. Payments are processed securely via Razorpay.',
    },
    {
      category: 'Rentals & Payments',
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit/debit cards, UPI, net banking, and digital wallets through our secure payment partner Razorpay.',
    },
    {
      category: 'Rentals & Payments',
      question: 'Can I get a refund for a rental?',
      answer: 'Once a rental is confirmed and content is accessible, refunds are not available. However, if you experience technical issues preventing playback, please contact our support team.',
    },
    {
      category: 'Premium Subscription',
      question: 'What is Premium subscription?',
      answer: 'Premium gives you unlimited access to all content on Shortsy for ₹199/month. No individual rentals needed - watch everything, anytime!',
    },
    {
      category: 'Premium Subscription',
      question: 'How do I cancel my Premium subscription?',
      answer: 'You can cancel anytime from your Profile > Premium section. Your access continues until the end of your current billing period.',
    },
    {
      category: 'Playback',
      question: 'Can I download content for offline viewing?',
      answer: 'Offline downloads are currently in development and will be available in a future update. Stay tuned!',
    },
    {
      category: 'Playback',
      question: 'What video quality does Shortsy support?',
      answer: 'We stream in HD quality (up to 1080p) based on your internet connection. The player automatically adjusts quality for smooth playback.',
    },
    {
      category: 'Account',
      question: 'How do I reset my password?',
      answer: 'On the login screen, tap "Forgot Password" and enter your email. You\'ll receive a password reset link within minutes.',
    },
    {
      category: 'Account',
      question: 'Can I watch on multiple devices?',
      answer: 'Yes! Log in with the same account on multiple devices. However, simultaneous streaming is limited based on your subscription tier.',
    },
  ];

  const categories = Array.from(new Set(faqs.map(faq => faq.category)));

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#1a1a2e', '#16213e']} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Frequently Asked Questions</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}>
          
          {/* Intro */}
          <View style={styles.intro}>
            <Text style={styles.introIcon}>❓</Text>
            <Text style={styles.introTitle}>Got Questions?</Text>
            <Text style={styles.introSubtitle}>
              Find quick answers to common questions about Shortsy
            </Text>
          </View>

          {/* FAQ by Category */}
          {categories.map((category, catIndex) => (
            <View key={catIndex} style={styles.categorySection}>
              <Text style={styles.categoryTitle}>{category}</Text>
              {faqs
                .filter(faq => faq.category === category)
                .map((faq, faqIndex) => {
                  const globalIndex = faqs.findIndex(
                    f => f.question === faq.question
                  );
                  const isExpanded = expandedIndex === globalIndex;

                  return (
                    <TouchableOpacity
                      key={faqIndex}
                      style={styles.faqCard}
                      onPress={() => toggleExpand(globalIndex)}
                      activeOpacity={0.7}>
                      <View style={styles.faqHeader}>
                        <Text style={styles.faqQuestion}>{faq.question}</Text>
                        <Text style={styles.faqIcon}>{isExpanded ? '−' : '+'}</Text>
                      </View>
                      {isExpanded && (
                        <Text style={styles.faqAnswer}>{faq.answer}</Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
            </View>
          ))}

          {/* Still Need Help */}
          <View style={styles.helpSection}>
            <Text style={styles.helpTitle}>Still need help?</Text>
            <Text style={styles.helpText}>
              Can't find what you're looking for? Our support team is here to help!
            </Text>
            <TouchableOpacity style={styles.contactButton}>
              <Text style={styles.contactButtonText}>Contact Support</Text>
            </TouchableOpacity>
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
    marginBottom: 30,
  },
  introIcon: {
    fontSize: 50,
    marginBottom: 12,
  },
  introTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  introSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3b82f6',
    marginBottom: 12,
  },
  faqCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
    marginRight: 12,
    lineHeight: 22,
  },
  faqIcon: {
    fontSize: 24,
    color: '#3b82f6',
    fontWeight: '300',
  },
  faqAnswer: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 12,
    lineHeight: 20,
  },
  helpSection: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  helpTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#10b981',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  contactButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  contactButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
