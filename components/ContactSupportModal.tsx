import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Linking,
  Alert,
} from 'react-native';
import { X, Mail, Globe, MessageCircle, HelpCircle } from 'lucide-react-native';

interface ContactSupportModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function ContactSupportModal({ visible, onClose }: ContactSupportModalProps) {
  const handleEmailPress = () => {
    const email = 'support@bjjflowapp.com';
    const subject = 'Flow Roll App Support';
    const body = 'Hi Flow Roll team,\n\nI need help with:\n\n[Please describe your issue or question]\n\nApp Version: 1.0.0\nDevice: [Your device info]\n\nThanks!';
    
    const mailto = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    Linking.openURL(mailto).catch(() => {
      Alert.alert(
        'Email Not Available',
        `Please send an email to:\n${email}`,
        [{ text: 'OK' }]
      );
    });
  };

  const handleWebsitePress = () => {
    const url = 'https://bjjflowapp.com';
    Linking.openURL(url).catch(() => {
      Alert.alert(
        'Cannot Open Website',
        `Please visit:\n${url}`,
        [{ text: 'OK' }]
      );
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Contact Support</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#6b7280" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.welcomeSection}>
            <HelpCircle size={48} color="#5271ff" />
            <Text style={styles.welcomeTitle}>How can we help?</Text>
            <Text style={styles.welcomeText}>
              Get in touch with the Flow Roll team for support, feedback, or questions about the app.
            </Text>
          </View>

          <View style={styles.contactMethods}>
            {/* Email Support */}
            <TouchableOpacity style={styles.contactItem} onPress={handleEmailPress}>
              <View style={styles.contactIcon}>
                <Mail size={24} color="#ef4444" />
              </View>
              <View style={styles.contactContent}>
                <Text style={styles.contactTitle}>Email Support</Text>
                <Text style={styles.contactSubtitle}>support@bjjflowapp.com</Text>
                <Text style={styles.contactDescription}>
                  Send us an email for detailed support, bug reports, or feature requests
                </Text>
              </View>
            </TouchableOpacity>

            {/* Website */}
            <TouchableOpacity style={styles.contactItem} onPress={handleWebsitePress}>
              <View style={styles.contactIcon}>
                <Globe size={24} color="#3b82f6" />
              </View>
              <View style={styles.contactContent}>
                <Text style={styles.contactTitle}>Visit Our Website</Text>
                <Text style={styles.contactSubtitle}>bjjflowapp.com</Text>
                <Text style={styles.contactDescription}>
                  Find documentation, FAQs, and latest updates about Flow Roll
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.helpSection}>
            <Text style={styles.helpTitle}>Common Questions</Text>
            
            <View style={styles.faqItem}>
              <Text style={styles.faqQuestion}>How do I backup my data?</Text>
              <Text style={styles.faqAnswer}>
                Use the "Export Data" option in Settings to create a JSON backup of all your techniques and sessions.
              </Text>
            </View>

            <View style={styles.faqItem}>
              <Text style={styles.faqQuestion}>Is my data private?</Text>
              <Text style={styles.faqAnswer}>
                Yes! All your data is stored locally on your device. We don't collect or store any of your information on our servers.
              </Text>
            </View>

            <View style={styles.faqItem}>
              <Text style={styles.faqQuestion}>Can I sync across devices?</Text>
              <Text style={styles.faqAnswer}>
                Currently, Flow Roll stores data locally. You can export from one device and import to another to transfer your data.
              </Text>
            </View>
          </View>

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 32,
    paddingVertical: 20,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  contactMethods: {
    marginBottom: 32,
  },
  contactItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contactContent: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  contactSubtitle: {
    fontSize: 14,
    color: '#5271ff',
    fontWeight: '500',
    marginBottom: 8,
  },
  contactDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  helpSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  helpTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  faqItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 40,
  },
});