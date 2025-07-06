import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity, 
  Switch,
  Alert 
} from 'react-native';
import { 
  Settings, 
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
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

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

  const handleContactSupport = () => {
    Alert.alert(
      'Contact Support',
      'Need help? Send us an email at support@flowroll.app',
      [
        { text: 'OK' }
      ]
    );
  };

  const handleAbout = () => {
    Alert.alert(
      'About Flow Roll',
      'Version 1.0.0\n\nTrack your BJJ journey with techniques, sessions, and analytics.\n\nBuilt with ❤️ for the BJJ community.',
      [
        { text: 'OK' }
      ]
    );
  };

  const settings: SettingItem[] = [
    // Account & Profile
    {
      id: 'profile',
      title: 'Profile',
      subtitle: 'Edit your profile and belt rank',
      icon: <User size={20} color="#3b82f6" />,
      type: 'navigate',
      onPress: () => console.log('Navigate to profile')
    },

    // Notifications
    {
      id: 'notifications',
      title: 'Push Notifications',
      subtitle: 'Receive training reminders',
      icon: <Bell size={20} color="#f59e0b" />,
      type: 'toggle',
      value: notificationsEnabled,
      onToggle: setNotificationsEnabled
    },
    {
      id: 'sounds',
      title: 'Sound Effects',
      subtitle: 'Play sounds for interactions',
      icon: <Volume2 size={20} color="#10b981" />,
      type: 'toggle',
      value: soundEnabled,
      onToggle: setSoundEnabled
    },

    // App Preferences
    {
      id: 'darkmode',
      title: 'Dark Mode',
      subtitle: 'Use dark theme',
      icon: <Moon size={20} color="#6366f1" />,
      type: 'toggle',
      value: darkModeEnabled,
      onToggle: setDarkModeEnabled
    },
    {
      id: 'language',
      title: 'Language',
      subtitle: 'English',
      icon: <Globe size={20} color="#8b5cf6" />,
      type: 'navigate',
      onPress: () => console.log('Navigate to language settings')
    },

    // Data & Storage
    {
      id: 'export',
      title: 'Export Data',
      subtitle: 'Download your data as JSON',
      icon: <Download size={20} color="#059669" />,
      type: 'action',
      onPress: handleExportData
    },
    {
      id: 'import',
      title: 'Import Data',
      subtitle: 'Restore from backup file',
      icon: <Upload size={20} color="#0891b2" />,
      type: 'action',
      onPress: handleImportData
    },
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
      onPress: () => console.log('Navigate to privacy policy')
    },

    // Support
    {
      id: 'support',
      title: 'Contact Support',
      subtitle: 'Get help and report issues',
      icon: <HelpCircle size={20} color="#ea580c" />,
      type: 'action',
      onPress: handleContactSupport
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
    }
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
            trackColor={{ false: '#e5e7eb', true: '#1e3a2e' }}
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
      items: settings.filter(s => ['privacy'].includes(s.id))
    },
    {
      title: 'Support',
      items: settings.filter(s => ['support', 'about'].includes(s.id))
    },
    {
      title: 'Danger Zone',
      items: settings.filter(s => ['clear'].includes(s.id))
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Settings size={24} color="#fff" />
        <Text style={styles.title}>Settings</Text>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {sections.map((section, index) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionContent}>
              {section.items.map(renderSettingItem)}
            </View>
          </View>
        ))}
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>Flow Roll v1.0.0</Text>
          <Text style={styles.footerSubtext}>
            Made with ❤️ for the BJJ community
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: '#1e3a2e',
    borderBottomWidth: 1,
    borderBottomColor: '#2d5a3d',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
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