import React from 'react';
import { View, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AuthProvider } from './context/AuthContext';

import DashboardScreen from './screens/DashboardScreen';
import TransactionsScreen from './screens/TransactionsScreen';
import BudgetScreen from './screens/BudgetScreen';
import AnalyticsScreen from './screens/AnalyticsScreen';
import ReportsScreen from './screens/ReportsScreen';
import ProfileScreen from './screens/ProfileScreen';
import AddTransactionScreen from './screens/AddTransactionScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs() {
  return (
    <Tab.Navigator 
      screenOptions={({ route }) => ({ 
        headerShown: false, 
        tabBarActiveTintColor: '#28a745', 
        tabBarInactiveTintColor: 'gray',
        tabBarShowLabel: route.name !== 'Transactions',
        tabBarStyle: {
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
                backgroundColor: '#28a745',
                justifyContent: 'center',
                alignItems: 'center',
                shadowColor: '#28a745',
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

export default function App() {
  return (
    <AuthProvider>
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="AddTransactionScreen" component={AddTransactionScreen} options={{ presentation: 'modal' }} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </AuthProvider>
  );
}
