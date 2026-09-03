import React from 'react';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AppState } from 'react-native';
import { SafeAreaProvider, initialWindowMetrics, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from './src/components/AppText';
import { hapticKeyPress } from './src/haptics';
import { MeasurementProvider } from './src/context/MeasurementContext';
import { LocaleProvider, useLocale } from './src/context/LocaleContext';
import { colors } from './src/theme/colors';
import { InputTabIcon, TrendsTabIcon, ListTabIcon, GraphTabIcon } from './src/components/icons/TabIcons';
import InputScreen from './screens/InputScreen';
import MonthlyScreen from './screens/MonthlyScreen';
import TrendsScreen from './screens/TrendsScreen';
import GraphScreen from './screens/GraphScreen';

const Tab = createBottomTabNavigator();

// バックグラウンド退避からこの時間以上経って復帰したら、入力画面に戻す。
// （完全終了→再起動は先頭タブ=Inputで起動するため、この監視は不要）
const RESUME_RESET_MS = 5 * 60 * 1000; // しばらく = 5分

const navigationRef = createNavigationContainerRef();

function renderTabLabel(label: string) {
  return ({ color, focused }: { color: string; focused: boolean }) => (
    <Text style={{ fontSize: 13, color, fontWeight: focused ? '600' : '500' }}>{label}</Text>
  );
}

function AppNavigator() {
  const { t } = useLocale();
  const insets = useSafeAreaInsets();

  React.useEffect(() => {
    let lastBackground: number | null = null;
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'background') {
        lastBackground = Date.now();
      } else if (state === 'active' && lastBackground != null) {
        const elapsed = Date.now() - lastBackground;
        lastBackground = null;
        if (elapsed >= RESUME_RESET_MS && navigationRef.isReady()) {
          navigationRef.navigate('Input' as never);
        }
      }
    });
    return () => sub.remove();
  }, []);

  return (
    <NavigationContainer ref={navigationRef}>
      <Tab.Navigator
        screenListeners={{
          tabPress: () => hapticKeyPress(),
        }}
        screenOptions={{
          tabBarActiveTintColor: colors.textPrimary,
          tabBarInactiveTintColor: colors.textLabel,
          tabBarActiveBackgroundColor: colors.background,
          tabBarInactiveBackgroundColor: colors.background,
          // ホームインジケータ領域(insets.bottom)を加算しないと、
          // iPhone 17 Pro Max など下部セーフエリアのある端末でタブが潰れる。
          tabBarStyle: {
            height: 64 + insets.bottom,
            backgroundColor: colors.background,
            borderTopWidth: 1,
            borderTopColor: colors.borderMain,
          },
          tabBarItemStyle: { paddingTop: 6 },
          headerShown: false,
        }}
      >
        <Tab.Screen
          name="Input"
          component={InputScreen}
          options={{
            tabBarLabel: renderTabLabel(t('tab_input')),
            tabBarIcon: ({ color }) => <InputTabIcon color={color} />,
          }}
        />
        <Tab.Screen
          name="Trends"
          component={TrendsScreen}
          options={{
            tabBarLabel: renderTabLabel(t('tab_trends')),
            tabBarIcon: ({ color }) => <TrendsTabIcon color={color} />,
          }}
        />
        <Tab.Screen
          name="List"
          component={MonthlyScreen}
          options={{
            tabBarLabel: renderTabLabel(t('tab_list')),
            tabBarIcon: ({ color }) => <ListTabIcon color={color} />,
          }}
        />
        <Tab.Screen
          name="Graph"
          component={GraphScreen}
          options={{
            tabBarLabel: renderTabLabel(t('tab_graph')),
            tabBarIcon: ({ color }) => <GraphTabIcon color={color} />,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <LocaleProvider>
        <MeasurementProvider>
          <AppNavigator />
        </MeasurementProvider>
      </LocaleProvider>
    </SafeAreaProvider>
  );
}
