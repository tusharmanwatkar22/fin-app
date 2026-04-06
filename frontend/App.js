import React from 'react';
import { View, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { CategoryProvider } from './context/CategoryContext';

import DashboardScreen from './screens/DashboardScreen';
import TransactionsScreen from './screens/TransactionsScreen';
import BudgetScreen from './screens/BudgetScreen';
import BudgetTransactionsScreen from './screens/BudgetTransactionsScreen';
import AnalyticsScreen from './screens/AnalyticsScreen';
import ReportsScreen from './screens/ReportsScreen';
import ProfileScreen from './screens/ProfileScreen';
import AddTransactionScreen from './screens/AddTransactionScreen';
import ManageCategoriesScreen from './screens/ManageCategoriesScreen';
import SecuritySyncScreen from './screens/SecuritySyncScreen';
import PrivacyPolicyScreen from './screens/PrivacyPolicyScreen';
import HelpSupportScreen from './screens/HelpSupportScreen';

import WelcomeScreen from './screens/WelcomeScreen';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();

function MainTabs() {
  const { theme } = useTheme();

  return (
    <Tab.Navigator 
      screenOptions={({ route }) => ({ 
        headerShown: false, 
        tabBarActiveTintColor: theme.primary, 
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarShowLabel: route.name !== 'Transactions',
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          height: Platform.OS === 'ios' ? 85 : 65,
          paddingBottom: Platform.OS === 'ios' ? 25 : 10,
        },
        tabBarIcon: ({ focused, color, size }) => {
          if (route.name === 'Transactions') {
            return (
              <View style={{
                top: Platform.OS === 'ios' ? -10 : -20,
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: theme.primary,
                justifyContent: 'center',
                alignItems: 'center',
                shadowColor: theme.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 5,
              }}>
                <Ionicons name="add" size={32} color="#fff" />
              </View>
            );
          }

          let iconName;
          if (route.name === 'Dashboard') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Budget') iconName = focused ? 'pie-chart' : 'pie-chart-outline';
          else if (route.name === 'Analytics') iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          else if (route.name === 'Reports') iconName = focused ? 'document-text' : 'document-text-outline';
          
          return <Ionicons name={iconName} size={size} color={color} />;
        }
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Budget" component={BudgetScreen} />
      <Tab.Screen name="Transactions" component={TransactionsScreen} options={{ tabBarLabel: '' }} />
      <Tab.Screen name="Analytics" component={AnalyticsScreen} />
      <Tab.Screen name="Reports" component={ReportsScreen} />
    </Tab.Navigator>
  );
}

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Signup" component={SignupScreen} />
    </AuthStack.Navigator>
  );
}

function RootNavigator() {
  const { userId } = useAuth();
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {userId ? (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="BudgetTransactions" component={BudgetTransactionsScreen} options={{ headerShown: false }} />
            <Stack.Screen name="AddTransactionScreen" component={AddTransactionScreen} options={{ presentation: 'modal' }} />
            <Stack.Screen name="ManageCategories" component={ManageCategoriesScreen} options={{ headerShown: false }} />
            <Stack.Screen name="SecuritySync" component={SecuritySyncScreen} options={{ headerShown: false }} />
            <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} options={{ headerShown: false }} />
            <Stack.Screen name="HelpSupport" component={HelpSupportScreen} options={{ headerShown: false }} />
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CategoryProvider>
          <SafeAreaProvider>
            <RootNavigator />
          </SafeAreaProvider>
        </CategoryProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
