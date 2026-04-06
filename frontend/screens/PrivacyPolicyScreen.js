import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export default function PrivacyPolicyScreen({ navigation }) {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>1. Introduction</Text>
        <Text style={styles.paragraph}>
          Welcome to the Finance Tracker App. We value your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard your information when you use our mobile application.
        </Text>

        <Text style={styles.sectionTitle}>2. Information We Collect</Text>
        <Text style={styles.paragraph}>
          <Text style={{fontWeight: 'bold'}}>Personal Data:</Text> We may collect personal information such as your name, email address, and mobile number when you register for an account. {'\n'}
          <Text style={{fontWeight: 'bold'}}>Financial Data:</Text> We collect data related to your incomes, expenses, budgets, and financial goals to provide the core functionality of the app. This data is securely stored.
        </Text>

        <Text style={styles.sectionTitle}>3. How We Use Your Information</Text>
        <Text style={styles.paragraph}>
          We use your information to operate and maintain the application, personalize your user experience, and provide actionable financial insights. We do not sell your personal data to third parties.
        </Text>

        <Text style={styles.sectionTitle}>4. Data Security</Text>
        <Text style={styles.paragraph}>
          Your security is important to us. We implement appropriate technical measures to protect your personal and financial data against unauthorized access or alteration. However, no method of transmission over the internet is 100% secure.
        </Text>

        <Text style={styles.sectionTitle}>5. Contact Us</Text>
        <Text style={styles.paragraph}>
          If you have any questions or concerns about this Privacy Policy, please contact our support team from the Profile Settings page.
        </Text>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Last Updated: {new Date().toLocaleDateString()}</Text>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.primary,
    marginTop: 20,
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 24,
    color: theme.text,
    opacity: 0.85,
    textAlign: 'justify'
  },
  footer: {
    marginTop: 40,
    borderTopWidth: 1,
    borderTopColor: theme.border,
    paddingTop: 20,
    alignItems: 'center'
  },
  footerText: {
    fontSize: 14,
    color: theme.textSecondary,
    fontStyle: 'italic'
  }
});
