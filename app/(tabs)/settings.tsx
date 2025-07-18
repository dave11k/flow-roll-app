import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity, 
  Switch,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { 
  User, 
  Bell, 
  Database, 
  Shield, 
  Download, 
  Upload,
  HelpCircle, 
  Info, 
  ChevronRight,
  Trash2,
  Moon,
  Globe,
  Volume2
} from 'lucide-react-native';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/contexts/ToastContext';
import ProfileModal from '@/components/ProfileModal';
import PrivacyPolicyModal from '@/components/PrivacyPolicyModal';
import ContactSupportModal from '@/components/ContactSupportModal';
import TermsOfServiceModal from '@/components/TermsOfServiceModal';
import { UserProfile } from '@/types/profile';
import { loadTestData } from '@/services/testData';

interface SettingItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  type: 'navigate' | 'toggle' | 'action';
  value?: boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
}

export default function SettingsPage() {
  const { profile, updateProfile, refreshData } = useData();
  const { showSuccess, showError } = useToast();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // Modal states
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const handleExportData = () => {
    Alert.alert(
      'Export Data',
      'Export your techniques and sessions data to a JSON file?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Export', onPress: () => console.log('Export data') }
      ]
    );
  };

  const handleImportData = () => {
    Alert.alert(
      'Import Data',
      'This will replace your current data. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Import', style: 'destructive', onPress: () => console.log('Import data') }
      ]
    );
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all your techniques and sessions. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear Data', 
          style: 'destructive', 
          onPress: () => console.log('Clear all data') 
        }
      ]
    );
  };

  const handleProfileSave = async (newProfile: UserProfile) => {
    try {
      await updateProfile(newProfile);
      showSuccess('Profile updated successfully!');
    } catch {
      showError('Failed to update profile. Please try again.');
    }
  };

  const getProfileSubtitle = () => {
    if (profile) {
      const beltName = profile.beltRank.charAt(0).toUpperCase() + profile.beltRank.slice(1);
      return `${profile.name} - ${beltName} Belt`;
    }
    return 'Set up your profile';
  };

  const handleAbout = () => {
    Alert.alert(
      'About FlowRoll',
      'Version 1.0.0\n\nTrack your BJJ journey with techniques, sessions, and analytics.\n\n© 2025 FlowRoll. All rights reserved.',
      [
        { text: 'OK' }
      ]
    );
  };

  const handleLoadTestData = () => {
    Alert.alert(
      'Load Test Data',
      'This will add 20 sample techniques and 20 training sessions spread over the past year. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Load Test Data', 
          onPress: async () => {
            try {
              await loadTestData(true);
              await refreshData();
              showSuccess('Test data loaded successfully!');
            } catch (error) {
              showError('Failed to load test data');
              console.error('Error loading test data:', error);
            }
          }
        }
      ]
    );
  };

  const settings: SettingItem[] = [
    // Account & Profile
    {
      id: 'profile',
      title: 'Profile',
      subtitle: getProfileSubtitle(),
      icon: <User size={20} color="#3b82f6" />,
      type: 'navigate',
      onPress: () => setShowProfileModal(true)
    },

    // Notifications (Commented out until implementation)
    // {
    //   id: 'notifications',
    //   title: 'Push Notifications',
    //   subtitle: 'Receive training reminders',
    //   icon: <Bell size={20} color="#f59e0b" />,
    //   type: 'toggle',
    //   value: notificationsEnabled,
    //   onToggle: setNotificationsEnabled
    // },
    // {
    //   id: 'sounds',
    //   title: 'Sound Effects',
    //   subtitle: 'Play sounds for interactions',
    //   icon: <Volume2 size={20} color="#10b981" />,
    //   type: 'toggle',
    //   value: soundEnabled,
    //   onToggle: setSoundEnabled
    // },

    // App Preferences (Commented out until implementation)
    // {
    //   id: 'darkmode',
    //   title: 'Dark Mode',
    //   subtitle: 'Use dark theme',
    //   icon: <Moon size={20} color="#6366f1" />,
    //   type: 'toggle',
    //   value: darkModeEnabled,
    //   onToggle: setDarkModeEnabled
    // },
    // {
    //   id: 'language',
    //   title: 'Language',
    //   subtitle: 'English',
    //   icon: <Globe size={20} color="#8b5cf6" />,
    //   type: 'navigate',
    //   onPress: () => console.log('Navigate to language settings')
    // },

    // Data & Storage (Commented out until implementation)
    // {
    //   id: 'export',
    //   title: 'Export Data',
    //   subtitle: 'Download your data as JSON',
    //   icon: <Download size={20} color="#059669" />,
    //   type: 'action',
    //   onPress: handleExportData
    // },
    // {
    //   id: 'import',
    //   title: 'Import Data',
    //   subtitle: 'Restore from backup file',
    //   icon: <Upload size={20} color="#0891b2" />,
    //   type: 'action',
    //   onPress: handleImportData
    // },
    {
      id: 'storage',
      title: 'Data Storage',
      subtitle: 'Manage local data and cache',
      icon: <Database size={20} color="#7c3aed" />,
      type: 'navigate',
      onPress: () => console.log('Navigate to storage settings')
    },

    // Privacy & Security
    {
      id: 'privacy',
      title: 'Privacy Policy',
      subtitle: 'View our privacy policy',
      icon: <Shield size={20} color="#dc2626" />,
      type: 'navigate',
      onPress: () => setShowPrivacyModal(true)
    },
    {
      id: 'terms',
      title: 'Terms of Service',
      subtitle: 'View terms and conditions',
      icon: <Shield size={20} color="#7c3aed" />,
      type: 'navigate',
      onPress: () => setShowTermsModal(true)
    },

    // Support
    {
      id: 'support',
      title: 'Contact Support',
      subtitle: 'Get help and report issues',
      icon: <HelpCircle size={20} color="#ea580c" />,
      type: 'action',
      onPress: () => setShowContactModal(true)
    },
    {
      id: 'about',
      title: 'About',
      subtitle: 'App version and information',
      icon: <Info size={20} color="#6b7280" />,
      type: 'action',
      onPress: handleAbout
    },

    // Danger Zone
    {
      id: 'clear',
      title: 'Clear All Data',
      subtitle: 'Permanently delete everything',
      icon: <Trash2 size={20} color="#ef4444" />,
      type: 'action',
      onPress: handleClearData
    },
    // Only show test data in development
    ...__DEV__ ? [{
      id: 'loadtest',
      title: 'Load Test Data',
      subtitle: 'Add sample techniques and sessions',
      icon: <Database size={20} color="#5271ff" />,
      type: 'action' as const,
      onPress: handleLoadTestData
    }] : []
  ];

  const renderSettingItem = (item: SettingItem) => (
    <TouchableOpacity
      key={item.id}
      style={styles.settingItem}
      onPress={item.onPress}
      activeOpacity={item.type === 'toggle' ? 1 : 0.7}
    >
      <View style={styles.settingLeft}>
        <View style={styles.settingIcon}>
          {item.icon}
        </View>
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{item.title}</Text>
          {item.subtitle && (
            <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
          )}
        </View>
      </View>
      <View style={styles.settingRight}>
        {item.type === 'toggle' ? (
          <Switch
            value={item.value}
            onValueChange={item.onToggle}
            trackColor={{ false: '#e5e7eb', true: '#5271ff' }}
            thumbColor={item.value ? '#fff' : '#f4f3f4'}
          />
        ) : (
          <ChevronRight size={20} color="#9ca3af" />
        )}
      </View>
    </TouchableOpacity>
  );

  const sections = [
    {
      title: 'Account',
      items: settings.filter(s => ['profile'].includes(s.id))
    },
    // {
    //   title: 'Notifications',
    //   items: settings.filter(s => ['notifications', 'sounds'].includes(s.id))
    // },
    // {
    //   title: 'App Preferences',
    //   items: settings.filter(s => ['darkmode', 'language'].includes(s.id))
    // },
    // {
    //   title: 'Data & Storage',
    //   items: settings.filter(s => ['export', 'import', 'storage'].includes(s.id))
    // },
    {
      title: 'Privacy & Security',
      items: settings.filter(s => ['privacy', 'terms'].includes(s.id))
    },
    {
      title: 'Support',
      items: settings.filter(s => ['support', 'about'].includes(s.id))
    },
    {
      title: 'Danger Zone',
      items: settings.filter(s => ['clear', 'loadtest'].includes(s.id))
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.content}>
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {sections.map((section, index) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionContent}>
              {section.items.map(renderSettingItem)}
            </View>
          </View>
        ))}
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>FlowRoll v1.0.0</Text>
          <Text style={styles.footerSubtext}>© 2025 FlowRoll. All rights reserved.</Text>
        </View>
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
      
      {/* Modals */}
      <ProfileModal
        visible={showProfileModal}
        profile={profile}
        onSave={handleProfileSave}
        onClose={() => setShowProfileModal(false)}
      />
      
      <PrivacyPolicyModal
        visible={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
      />
      
      <ContactSupportModal
        visible={showContactModal}
        onClose={() => setShowContactModal(false)}
      />
      
      <TermsOfServiceModal
        visible={showTermsModal}
        onClose={() => setShowTermsModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginHorizontal: 20,
  },
  sectionContent: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  settingRight: {
    marginLeft: 16,
  },
  footer: {
    alignItems: 'center',
    padding: 40,
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
});