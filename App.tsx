import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MeasurementProvider } from './src/context/MeasurementContext';
import InputScreen from './screens/InputScreen';
import MonthlyScreen from './screens/MonthlyScreen';
import GraphScreen from './screens/GraphScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <MeasurementProvider>
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={{
              tabBarLabelStyle: { fontSize: 16, fontWeight: 'bold' },
              tabBarStyle: { height: 64 },
              tabBarItemStyle: { paddingBottom: 8 },
              headerShown: false,
            }}
          >
            <Tab.Screen
              name="入力"
              component={InputScreen}
              options={{ tabBarIcon: () => <Text style={{ fontSize: 24 }}>📋</Text> }}
            />
            <Tab.Screen
              name="一覧"
              component={MonthlyScreen}
              options={{ tabBarIcon: () => <Text style={{ fontSize: 24 }}>📅</Text> }}
            />
            <Tab.Screen
              name="グラフ"
              component={GraphScreen}
              options={{ tabBarIcon: () => <Text style={{ fontSize: 24 }}>📈</Text> }}
            />
          </Tab.Navigator>
        </NavigationContainer>
      </MeasurementProvider>
    </SafeAreaProvider>
  );
}
