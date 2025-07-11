import React, { useState } from 'react';
import { View } from 'react-native';
import { Tabs, usePathname } from 'expo-router';
import { ChartBar as BarChart3, BookOpen, TrendingUp, Settings } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import AppHeader from '@/components/AppHeader';
import ProfileModal from '@/components/ProfileModal';

export default function TabLayout() {
  const pathname = usePathname();
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Map pathname to title
  const getPageTitle = (pathname: string) => {
    switch (pathname) {
      case '/':
        return 'Techniques';
      case '/sessions':
        return 'Sessions';
      case '/analytics':
        return 'Analytics';
      case '/settings':
        return 'Settings';
      default:
        return 'Techniques';
    }
  };

  return (
    <>
      <StatusBar style="dark" backgroundColor="#ffffff" translucent={true} />
      <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
        <AppHeader 
          title={getPageTitle(pathname)} 
          onProfilePress={() => setShowProfileModal(true)}
        />
        <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#000000',
          tabBarInactiveTintColor: '#6b7280',
          tabBarStyle: {
            backgroundColor: '#fff',
            borderTopWidth: 1,
            borderTopColor: '#e5e7eb',
            height: 60,
            paddingBottom: 5,
            paddingTop: 8,
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
          },
        }}
        >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Techniques',
          tabBarIcon: ({ size, color }) => (
            <BookOpen size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="sessions"
        options={{
          title: 'Sessions',
          tabBarIcon: ({ size, color }) => (
            <BarChart3 size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Analytics',
          tabBarIcon: ({ size, color }) => (
            <TrendingUp size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ size, color }) => (
            <Settings size={size} color={color} />
          ),
        }}
      />
    </Tabs>
        
        <ProfileModal
          visible={showProfileModal}
          profile={null}
          onSave={() => {}}
          onClose={() => setShowProfileModal(false)}
        />
      </View>
    </>
  );
}