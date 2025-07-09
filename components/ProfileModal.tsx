import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { X, ChevronDown, Star } from 'lucide-react-native';
import { UserProfile, BeltRank, BELT_RANKS, MAX_STRIPES } from '@/types/profile';

interface ProfileModalProps {
  visible: boolean;
  profile: UserProfile | null;
  onSave: (profile: UserProfile) => void;
  onClose: () => void;
}

export default function ProfileModal({ visible, profile, onSave, onClose }: ProfileModalProps) {
  const [name, setName] = useState('');
  const [beltRank, setBeltRank] = useState<BeltRank>('white');
  const [stripes, setStripes] = useState(0);
  const [showBeltDropdown, setShowBeltDropdown] = useState(false);

  useEffect(() => {
    if (visible && profile) {
      setName(profile.name);
      setBeltRank(profile.beltRank);
      setStripes(profile.stripes);
    } else if (visible && !profile) {
      // Reset to defaults for new profile
      setName('');
      setBeltRank('white');
      setStripes(0);
    }
  }, [visible, profile]);

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    const newProfile: UserProfile = {
      name: name.trim(),
      beltRank,
      stripes,
    };

    onSave(newProfile);
    onClose();
  };

  const handleBeltSelect = (selectedBelt: BeltRank) => {
    setBeltRank(selectedBelt);
    setStripes(0); // Reset stripes when belt changes
    setShowBeltDropdown(false);
  };

  const selectedBeltInfo = BELT_RANKS.find(belt => belt.value === beltRank)!;

  const renderBeltImage = () => {
    const isBlackBelt = beltRank === 'black';
    const stripeSectionColor = isBlackBelt ? '#dc2626' : '#000000'; // Red for black belt, black for others
    const stripeColor = isBlackBelt ? '#ffffff' : '#ffffff'; // White stripes for both black belt and others
    
    return (
      <View style={styles.beltContainer}>
        <View style={[styles.beltImage, { backgroundColor: selectedBeltInfo.color }]}>
          {/* Main belt text */}
          <Text style={[
            styles.beltText, 
            { color: beltRank === 'white' ? '#000000' : '#ffffff' }
          ]}>
            {selectedBeltInfo.label.toUpperCase()}
          </Text>
          
          {/* Stripe section on the right */}
          <View style={[styles.stripeSection, { backgroundColor: stripeSectionColor }]}>
            {/* Render stripes */}
            <View style={styles.stripesContainer}>
              {Array.from({ length: stripes }, (_, index) => (
                <View 
                  key={index} 
                  style={[styles.stripe, { backgroundColor: stripeColor }]} 
                />
              ))}
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderStripesSelector = () => {
    return (
      <View style={styles.stripesSelector}>
        <Text style={styles.stripesLabel}>Stripes</Text>
        <View style={styles.stripesButtons}>
          {Array.from({ length: MAX_STRIPES + 1 }, (_, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.stripeButton,
                stripes === index && styles.stripeButtonActive
              ]}
              onPress={() => setStripes(index)}
            >
              <Text style={[
                styles.stripeButtonText,
                stripes === index && styles.stripeButtonTextActive
              ]}>
                {index}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
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
            <Text style={styles.headerTitle}>Profile</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#6b7280" />
          </TouchableOpacity>
        </View>

        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
            {/* Belt Visual */}
            {renderBeltImage()}

            {/* Name Input */}
            <View style={styles.section}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                placeholderTextColor="#9ca3af"
                autoCapitalize="words"
                returnKeyType="done"
              />
            </View>

            {/* Belt Rank Dropdown */}
            <View style={styles.section}>
              <Text style={styles.label}>Belt Rank</Text>
              <TouchableOpacity
                style={styles.dropdown}
                onPress={() => setShowBeltDropdown(!showBeltDropdown)}
              >
                <View style={styles.dropdownLeft}>
                  <View 
                    style={[styles.beltColorIndicator, { backgroundColor: selectedBeltInfo.color }]}
                  />
                  <Text style={styles.dropdownText}>{selectedBeltInfo.label}</Text>
                </View>
                <ChevronDown size={20} color="#6b7280" />
              </TouchableOpacity>

              {showBeltDropdown && (
                <View style={styles.dropdownMenu}>
                  {BELT_RANKS.map((belt) => (
                    <TouchableOpacity
                      key={belt.value}
                      style={[
                        styles.dropdownItem,
                        beltRank === belt.value && styles.dropdownItemActive
                      ]}
                      onPress={() => handleBeltSelect(belt.value)}
                    >
                      <View 
                        style={[styles.beltColorIndicator, { backgroundColor: belt.color }]}
                      />
                      <Text style={[
                        styles.dropdownItemText,
                        beltRank === belt.value && styles.dropdownItemTextActive
                      ]}>
                        {belt.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Stripes Selector */}
            <View style={styles.section}>
              {renderStripesSelector()}
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>

        {/* Save Button */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save Profile</Text>
          </TouchableOpacity>
        </View>
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
  beltContainer: {
    alignItems: 'center',
    marginBottom: 32,
    paddingHorizontal: 10, // Reduced padding to make belt wider
  },
  beltImage: {
    width: '100%',
    height: 50, // Made slightly taller for better proportions
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: 20,
    position: 'relative',
    flexDirection: 'row',
  },
  beltText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
    flex: 1,
    textAlign: 'left',
    alignSelf: 'center',
  },
  stripeSection: {
    position: 'absolute',
    right: '5%', // 5% margin from the right
    top: 0, // Cover full vertical height
    bottom: 0, // Cover full vertical height
    width: '20%', // 20% of the belt width
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stripesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    gap: 4, // Increased spacing between stripes
  },
  stripe: {
    width: 4, // Made narrower
    height: '100%', // Fill entire height of the belt
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  dropdown: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdownText: {
    fontSize: 16,
    color: '#1f2937',
  },
  beltColorIndicator: {
    width: 20,
    height: 20,
    borderRadius: 4,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  dropdownMenu: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  dropdownItemActive: {
    backgroundColor: '#f0fdf4',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#1f2937',
  },
  dropdownItemTextActive: {
    color: '#059669',
    fontWeight: '600',
  },
  stripesSelector: {
    alignItems: 'center',
  },
  stripesLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  stripesButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  stripeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stripeButtonActive: {
    backgroundColor: '#5271ff',
    borderColor: '#5271ff',
  },
  stripeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  stripeButtonTextActive: {
    color: '#fff',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  saveButton: {
    backgroundColor: '#5271ff',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});