import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform, StatusBar } from 'react-native';
import { User } from 'lucide-react-native';

interface AppHeaderProps {
  title: string;
  onProfilePress: () => void;
}

export default function AppHeader({ title, onProfilePress }: AppHeaderProps) {
  return (
    <View style={styles.header}>
      <Image 
        source={require('@/assets/images/FlowRoll.png')} 
        style={styles.logo}
      />
      <Text style={styles.title}>{title}</Text>
      <TouchableOpacity 
        style={styles.profileButton}
        onPress={onProfilePress}
        activeOpacity={0.7}
      >
        <User size={20} color="#000000" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.select({
      ios: 6,
      android: (StatusBar.currentHeight || 0) + 6,
    }),
    paddingBottom: 9,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
    height: Platform.select({
      ios: 48,
      android: 48 + (StatusBar.currentHeight || 0),
    }),
  },
  logo: {
    width: 38,
    height: 38,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 18,
    fontWeight: '500',
    color: '#000000',
    flex: 1,
    textAlign: 'center',
  },
  profileButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
});