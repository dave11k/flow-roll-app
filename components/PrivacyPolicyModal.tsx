import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { X } from 'lucide-react-native';

interface PrivacyPolicyModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function PrivacyPolicyModal({ visible, onClose }: PrivacyPolicyModalProps) {
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
            <Text style={styles.headerTitle}>Privacy Policy</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#6b7280" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.lastUpdated}>Last updated: July 2025</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Introduction</Text>
            <Text style={styles.text}>
              Flow Roll ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we handle information when you use our Brazilian Jiu-Jitsu tracking mobile application (the "App").
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Data Collection and Storage</Text>
            <Text style={styles.text}>
              Flow Roll is designed with privacy in mind. All your data is stored locally on your device using SQLite database technology. This includes:
            </Text>
            <Text style={styles.bulletPoint}>• Technique information and notes</Text>
            <Text style={styles.bulletPoint}>• Training session records</Text>
            <Text style={styles.bulletPoint}>• Personal profile information (name, belt rank)</Text>
            <Text style={styles.bulletPoint}>• App preferences and settings</Text>
            <Text style={styles.text}>
              We do not collect, transmit, or store any of your personal data on our servers.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>No Internet Connection Required</Text>
            <Text style={styles.text}>
              The App functions completely offline. Your data never leaves your device unless you explicitly choose to export it. We do not have access to your training information, personal details, or usage patterns.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Data Export and Import</Text>
            <Text style={styles.text}>
              The App provides optional export functionality that allows you to:
            </Text>
            <Text style={styles.bulletPoint}>• Export your data to a JSON file for backup purposes</Text>
            <Text style={styles.bulletPoint}>• Import previously exported data to restore your information</Text>
            <Text style={styles.text}>
              These features are entirely under your control, and any exported files remain on your device or cloud storage service of your choice.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Third-Party Services</Text>
            <Text style={styles.text}>
              Flow Roll does not integrate with third-party analytics, advertising, or data collection services. The App does not contain:
            </Text>
            <Text style={styles.bulletPoint}>• Analytics tracking</Text>
            <Text style={styles.bulletPoint}>• Advertising networks</Text>
            <Text style={styles.bulletPoint}>• Social media integrations</Text>
            <Text style={styles.bulletPoint}>• External data sharing mechanisms</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Device Permissions</Text>
            <Text style={styles.text}>
              The App may request the following device permissions:
            </Text>
            <Text style={styles.bulletPoint}>• Storage access: To save and retrieve your local data</Text>
            <Text style={styles.bulletPoint}>• Notifications: To send optional training reminders (can be disabled)</Text>
            <Text style={styles.text}>
              These permissions are used solely for app functionality and not for data collection.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Data Security</Text>
            <Text style={styles.text}>
              Since your data is stored locally on your device, its security depends on your device's security measures. We recommend:
            </Text>
            <Text style={styles.bulletPoint}>• Using device lock screens (PIN, password, biometric)</Text>
            <Text style={styles.bulletPoint}>• Keeping your device's operating system updated</Text>
            <Text style={styles.bulletPoint}>• Regularly backing up your device</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Children's Privacy</Text>
            <Text style={styles.text}>
              The App does not collect any personal information from users of any age. Since all data is stored locally, parents and guardians maintain full control over any information entered into the App on devices they manage.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Data Deletion</Text>
            <Text style={styles.text}>
              You can delete your data at any time by:
            </Text>
            <Text style={styles.bulletPoint}>• Using the "Clear All Data" function in the App settings</Text>
            <Text style={styles.bulletPoint}>• Uninstalling the App from your device</Text>
            <Text style={styles.text}>
              Since we don't store your data on our servers, uninstalling the App completely removes all associated data.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>App Store and Platform Data</Text>
            <Text style={styles.text}>
              When you download Flow Roll from app stores (Apple App Store, Google Play Store), those platforms may collect data according to their own privacy policies. This collection is independent of our App and subject to the respective platform's terms.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Changes to This Policy</Text>
            <Text style={styles.text}>
              We may update this Privacy Policy from time to time. Any changes will be posted within the App and will take effect immediately upon posting. Your continued use of the App after any changes constitutes acceptance of the new Privacy Policy.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Information</Text>
            <Text style={styles.text}>
              If you have any questions about this Privacy Policy or the App's privacy practices, please contact us at:
            </Text>
            <Text style={styles.contactText}>
              Email: support@bjjflowapp.com{'\n'}
              Website: bjjflowapp.com
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Summary</Text>
            <Text style={styles.text}>
              Flow Roll is built with privacy as a core principle. Your data stays on your device, we don't track you, and you maintain complete control over your information. Train with confidence knowing your BJJ journey data is private and secure.
            </Text>
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
  lastUpdated: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
    marginBottom: 24,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
    marginBottom: 12,
  },
  bulletPoint: {
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
    marginBottom: 8,
    paddingLeft: 16,
  },
  contactText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#5271ff',
    fontFamily: 'monospace',
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  bottomSpacing: {
    height: 40,
  },
});