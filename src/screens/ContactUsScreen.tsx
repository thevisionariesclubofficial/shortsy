import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '../constants/colors';

interface ContactUsScreenProps {
  onBack: () => void;
}

export function ContactUsScreen({ onBack }: ContactUsScreenProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = () => {
    if (!name || !email || !subject || !message) {
      Alert.alert('Missing Information', 'Please fill in all fields');
      return;
    }
    Alert.alert(
      'Message Sent!',
      'Thank you for contacting us. We\'ll respond within 24 hours.',
      [{ text: 'OK', onPress: () => {
        setName('');
        setEmail('');
        setSubject('');
        setMessage('');
      }}]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[COLORS.bg.legal, COLORS.bg.legalEnd]} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Contact Us</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          
          {/* Intro */}
          <View style={styles.intro}>
            <Text style={styles.introIcon}>📧</Text>
            <Text style={styles.introTitle}>Get in Touch</Text>
            <Text style={styles.introSubtitle}>
              Have questions or feedback? We'd love to hear from you!
            </Text>
          </View>

          {/* Contact Methods */}
          <View style={styles.contactMethods}>
            <View style={styles.methodCard}>
              <Text style={styles.methodIcon}>📨</Text>
              <View style={styles.methodContent}>
                <Text style={styles.methodLabel}>Email</Text>
                <Text style={styles.methodValue}>support@shortsy.com</Text>
              </View>
            </View>
            <View style={styles.methodCard}>
              <Text style={styles.methodIcon}>📞</Text>
              <View style={styles.methodContent}>
                <Text style={styles.methodLabel}>Phone</Text>
                <Text style={styles.methodValue}>+91 9876543210</Text>
              </View>
            </View>
            <View style={styles.methodCard}>
              <Text style={styles.methodIcon}>🕐</Text>
              <View style={styles.methodContent}>
                <Text style={styles.methodLabel}>Hours</Text>
                <Text style={styles.methodValue}>Mon-Fri, 9AM-6PM IST</Text>
              </View>
            </View>
          </View>

          {/* Contact Form */}
          <View style={styles.formSection}>
            <Text style={styles.formTitle}>Send us a Message</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your name"
                placeholderTextColor={COLORS.overlay.white40}
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="your@email.com"
                placeholderTextColor={COLORS.overlay.white40}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Subject</Text>
              <TextInput
                style={styles.input}
                placeholder="What's this about?"
                placeholderTextColor={COLORS.overlay.white40}
                value={subject}
                onChangeText={setSubject}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Message</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Tell us more..."
                placeholderTextColor={COLORS.overlay.white40}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                value={message}
                onChangeText={setMessage}
              />
            </View>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              activeOpacity={0.8}>
              <LinearGradient
                colors={[COLORS.accent.blue500, COLORS.accent.blue600]}
                style={styles.submitGradient}>
                <Text style={styles.submitButtonText}>Send Message</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Social Links */}
          <View style={styles.socialSection}>
            <Text style={styles.socialTitle}>Follow Us</Text>
            <View style={styles.socialIcons}>
              <TouchableOpacity style={styles.socialIcon}>
                <Text style={styles.socialEmoji}>📘</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialIcon}>
                <Text style={styles.socialEmoji}>📷</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialIcon}>
                <Text style={styles.socialEmoji}>🐦</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialIcon}>
                <Text style={styles.socialEmoji}>▶️</Text>
              </TouchableOpacity>
            </View>
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
    marginBottom: 30,
  },
  introIcon: {
    fontSize: 50,
    marginBottom: 12,
  },
  introTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  introSubtitle: {
    fontSize: 14,
    color: COLORS.overlay.white70,
    textAlign: 'center',
  },
  contactMethods: {
    marginBottom: 30,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.overlay.white05,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.overlay.white10,
  },
  methodIcon: {
    fontSize: 28,
    marginRight: 16,
  },
  methodContent: {
    flex: 1,
  },
  methodLabel: {
    fontSize: 12,
    color: COLORS.overlay.white60,
    marginBottom: 4,
  },
  methodValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  formSection: {
    marginBottom: 30,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.overlay.white08,
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    color: COLORS.text.primary,
    borderWidth: 1,
    borderColor: COLORS.overlay.progress,
  },
  textArea: {
    height: 120,
    paddingTop: 14,
  },
  submitButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 10,
  },
  submitGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  socialSection: {
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.overlay.white10,
  },
  socialTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 16,
  },
  socialIcons: {
    flexDirection: 'row',
    gap: 16,
  },
  socialIcon: {
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
});
