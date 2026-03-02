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

interface HelpCenterScreenProps {
  onBack: () => void;
  onNavigateToFAQ: () => void;
  onNavigateToContact: () => void;
}

export function HelpCenterScreen({ onBack, onNavigateToFAQ, onNavigateToContact }: HelpCenterScreenProps) {
  const helpTopics = [
    {
      icon: '🎬',
      title: 'Getting Started',
      description: 'Learn how to browse, rent, and watch content',
    },
    {
      icon: '💳',
      title: 'Payments & Rentals',
      description: 'Understanding rental periods and payment methods',
    },
    {
      icon: '👑',
      title: 'Premium Subscription',
      description: 'Access unlimited content with premium',
    },
    {
      icon: '📱',
      title: 'Account Management',
      description: 'Update profile, password, and preferences',
    },
    {
      icon: '🎥',
      title: 'Playback Issues',
      description: 'Troubleshoot video quality and streaming',
    },
    {
      icon: '🔒',
      title: 'Privacy & Security',
      description: 'How we protect your data',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#1a1a2e', '#16213e']} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Help Center</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}>
          
          {/* Hero Section */}
          <View style={styles.hero}>
            <Text style={styles.heroIcon}>💡</Text>
            <Text style={styles.heroTitle}>How can we help you?</Text>
            <Text style={styles.heroSubtitle}>
              Find answers to common questions or reach out to our support team
            </Text>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={onNavigateToFAQ}>
              <Text style={styles.actionIcon}>❓</Text>
              <Text style={styles.actionText}>View FAQs</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={onNavigateToContact}>
              <Text style={styles.actionIcon}>📧</Text>
              <Text style={styles.actionText}>Contact Us</Text>
            </TouchableOpacity>
          </View>

          {/* Help Topics */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Browse Help Topics</Text>
            {helpTopics.map((topic, index) => (
              <View key={index} style={styles.topicCard}>
                <Text style={styles.topicIcon}>{topic.icon}</Text>
                <View style={styles.topicContent}>
                  <Text style={styles.topicTitle}>{topic.title}</Text>
                  <Text style={styles.topicDescription}>{topic.description}</Text>
                </View>
                <Text style={styles.topicArrow}>→</Text>
              </View>
            ))}
          </View>

          {/* Support Hours */}
          <View style={styles.supportInfo}>
            <Text style={styles.supportTitle}>Support Hours</Text>
            <Text style={styles.supportText}>Monday - Friday: 9:00 AM - 6:00 PM IST</Text>
            <Text style={styles.supportText}>Saturday - Sunday: 10:00 AM - 4:00 PM IST</Text>
            <Text style={styles.supportNote}>We typically respond within 24 hours</Text>
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
  hero: {
    alignItems: 'center',
    marginBottom: 30,
  },
  heroIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 20,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 30,
  },
  actionButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
  },
  topicCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  topicIcon: {
    fontSize: 28,
    marginRight: 16,
  },
  topicContent: {
    flex: 1,
  },
  topicTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  topicDescription: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    lineHeight: 18,
  },
  topicArrow: {
    fontSize: 20,
    color: 'rgba(255, 255, 255, 0.4)',
  },
  supportInfo: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  supportTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3b82f6',
    marginBottom: 12,
  },
  supportText: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 6,
  },
  supportNote: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 8,
    fontStyle: 'italic',
  },
});
