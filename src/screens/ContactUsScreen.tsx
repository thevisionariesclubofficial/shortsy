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
      <LinearGradient colors={['#1a1a2e', '#16213e']} style={styles.gradient}>
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
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="your@email.com"
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
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
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                value={subject}
                onChangeText={setSubject}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Message</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Tell us more..."
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
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
                colors={['#3b82f6', '#2563eb']}
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
  contactMethods: {
    marginBottom: 30,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
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
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 4,
  },
  methodValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  formSection: {
    marginBottom: 30,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    color: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
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
    color: '#fff',
  },
  socialSection: {
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  socialTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  socialEmoji: {
    fontSize: 24,
  },
});
