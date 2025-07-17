import React, { useEffect, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, View } from 'react-native';
import CrossPlatformTouchable from './CrossPlatformTouchable';
import { FloatingCloseButton } from './FloatingCloseButton';
import { Colors } from '@/constants/colors';

interface TermsOfServiceModalProps {
  visible: boolean;
  onClose: () => void;
}

const TermsOfServiceModal: React.FC<TermsOfServiceModalProps> = ({ visible, onClose }) => {
  const [termsText, setTermsText] = useState<string>('');

  useEffect(() => {
    if (visible) {
      // Load terms of service text
      // For now, we'll load it inline since importing txt files requires configuration
      setTermsText(`TERMS OF SERVICE

Effective Date: January 2025

Welcome to FlowRoll ("the App"). By downloading, installing, or using FlowRoll, you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use the App.

1. ACCEPTANCE OF TERMS
By accessing or using FlowRoll, you confirm that you are at least 13 years of age and have the legal capacity to enter into these Terms.

2. DESCRIPTION OF SERVICE
FlowRoll is a mobile application designed to help Brazilian Jiu-Jitsu practitioners track their techniques, training sessions, and progress. The App stores all data locally on your device and does not transmit personal information to external servers.

3. USER RESPONSIBILITIES
You agree to:
- Use the App only for lawful purposes
- Not attempt to reverse engineer, decompile, or hack the App
- Not use the App in any way that could damage, disable, or impair its functionality
- Maintain the confidentiality of any personal data you enter into the App

4. INTELLECTUAL PROPERTY
All content, features, and functionality of FlowRoll, including but not limited to text, graphics, logos, and software, are the exclusive property of FlowRoll and are protected by international copyright, trademark, and other intellectual property laws.

5. USER-GENERATED CONTENT
Any techniques, notes, or session data you create within the App remains your property. Since all data is stored locally on your device, you are responsible for backing up your data. We are not responsible for any loss of data due to device failure, app deletion, or other circumstances.

6. PRIVACY
Your privacy is important to us. Please review our Privacy Policy, which explains how we handle your information. By using FlowRoll, you consent to our Privacy Policy.

7. DISCLAIMERS
THE APP IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE APP WILL BE UNINTERRUPTED, ERROR-FREE, OR FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS.

The App is intended for tracking and educational purposes only. We are not responsible for any injuries or damages that may result from practicing Brazilian Jiu-Jitsu techniques. Always train under qualified supervision and within your physical capabilities.

8. LIMITATION OF LIABILITY
TO THE MAXIMUM EXTENT PERMITTED BY LAW, FLOWROLL SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.

9. INDEMNIFICATION
You agree to indemnify and hold harmless FlowRoll from any claims, damages, losses, liabilities, costs, and expenses arising from your use of the App or violation of these Terms.

10. MODIFICATIONS TO TERMS
We reserve the right to modify these Terms at any time. If we make material changes, we will notify you through the App. Your continued use of the App after such modifications constitutes your acceptance of the updated Terms.

11. TERMINATION
We may terminate or suspend your access to the App at any time, without prior notice or liability, for any reason whatsoever.

12. GOVERNING LAW
These Terms shall be governed by and construed in accordance with the laws of the United States, without regard to its conflict of law provisions.

13. CONTACT INFORMATION
If you have any questions about these Terms, please contact us at:
Email: flowrollapp@gmail.com

14. ENTIRE AGREEMENT
These Terms constitute the entire agreement between you and FlowRoll regarding the use of the App and supersede all prior agreements and understandings.

By using FlowRoll, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.`);
    }
  }, [visible]);

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Terms of Service</Text>
        </View>
        
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <Text style={styles.termsText}>{termsText}</Text>
        </ScrollView>
        
        <View style={styles.footer}>
          <CrossPlatformTouchable
            onPress={onClose}
            style={styles.acceptButton}
            accessibilityLabel="Accept and close"
            accessibilityRole="button"
          >
            <Text style={styles.acceptButtonText}>Accept</Text>
          </CrossPlatformTouchable>
        </View>
        
        <FloatingCloseButton onPress={onClose} />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.primary,
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  termsText: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.textPrimary,
    fontFamily: 'System',
  },
  footer: {
    padding: 20,
    backgroundColor: Colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  acceptButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default TermsOfServiceModal;