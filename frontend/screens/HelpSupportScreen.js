import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export default function HelpSupportScreen({ navigation }) {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const handleEmailSupport = () => {
    Linking.openURL('mailto:support@fintracker.com?subject=Help %26 Support Inquiry').catch(() => {
      Alert.alert("Error", "Could not open email client. Please ensure you have an email app installed.");
    });
  };

  const handleFAQ = () => {
    Alert.alert("FAQ", "Frequently Asked Questions will be available soon in a future update!");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.heroSection}>
          <Ionicons name="help-buoy-outline" size={64} color={theme.primary} />
          <Text style={styles.heroTitle}>How can we help you?</Text>
          <Text style={styles.heroSubtitle}>We're here to assist you with any issues or queries related to Finance Tracker.</Text>
        </View>

        <Text style={styles.sectionTitle}>Contact Options</Text>
        
        <TouchableOpacity style={styles.contactCard} onPress={handleEmailSupport}>
          <View style={[styles.iconBox, { backgroundColor: '#3B82F6' }]}>
            <Ionicons name="mail" size={24} color="#FFF" />
          </View>
          <View style={styles.contactTextContainer}>
            <Text style={styles.contactTitle}>Email Support</Text>
            <Text style={styles.contactSubtitle}>Get help via email (Replies in 24h)</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.contactCard} onPress={handleFAQ}>
          <View style={[styles.iconBox, { backgroundColor: '#10B981' }]}>
            <Ionicons name="help-circle" size={24} color="#FFF" />
          </View>
          <View style={styles.contactTextContainer}>
            <Text style={styles.contactTitle}>FAQs</Text>
            <Text style={styles.contactSubtitle}>Find answers to common questions</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
        </TouchableOpacity>
        
        <View style={styles.appInfoSection}>
          <Text style={styles.appVersion}>Finance Tracker v1.0.0</Text>
          <Text style={styles.madeWith}>Made with ❤️ for Better Personal Finance</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    paddingTop: 10, 
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.border
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: theme.text },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },
  
  heroSection: {
    alignItems: 'center',
    marginVertical: 30,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.text,
    marginTop: 15,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 15,
    color: theme.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 22,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 15,
  },
  
  contactCard: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 15,
    shadowColor: theme.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    borderWidth: 1,
    borderColor: theme.border
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  contactTextContainer: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 4,
  },
  contactSubtitle: {
    fontSize: 13,
    color: theme.textSecondary,
  },

  appInfoSection: {
    marginTop: 40,
    alignItems: 'center',
  },
  appVersion: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.textSecondary,
    marginBottom: 6,
  },
  madeWith: {
    fontSize: 13,
    color: theme.textSecondary,
    opacity: 0.8
  }
});
