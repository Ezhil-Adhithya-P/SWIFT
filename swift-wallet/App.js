import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { WalletProvider } from './src/context/WalletContext';
import colors from './src/theme/colors';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import TopUpScreen from './src/screens/TopUpScreen';
import PaymentGatewayScreen from './src/screens/PaymentGatewayScreen';
import TransactionDetailScreen from './src/screens/TransactionDetailScreen';
import AnalyticsScreen from './src/screens/AnalyticsScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <WalletProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{
            headerStyle: {
              backgroundColor: colors.primary,
            },
            headerTintColor: colors.white,
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen 
            name="Login" 
            component={LoginScreen} 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="Dashboard" 
            component={DashboardScreen} 
            options={{ title: 'REC Student Wallet', headerBackVisible: false }} 
          />
          <Stack.Screen 
            name="TopUp" 
            component={TopUpScreen} 
            options={{ title: 'Add Funds' }} 
          />
          <Stack.Screen 
            name="PaymentGateway" 
            component={PaymentGatewayScreen} 
            options={{ title: 'Bank Payment' }} 
          />
          <Stack.Screen 
            name="TransactionDetail" 
            component={TransactionDetailScreen} 
            options={{ title: 'Transaction Details' }} 
          />
          <Stack.Screen 
            name="Analytics" 
            component={AnalyticsScreen} 
            options={{ title: 'Spending Analytics' }} 
          />
        </Stack.Navigator>
      </NavigationContainer>
    </WalletProvider>
  );
}
