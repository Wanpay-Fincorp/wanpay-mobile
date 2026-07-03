import { Tabs, useRootNavigationState, Redirect } from 'expo-router';
import React from "react";
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';

import { HapticTab } from '@/components/haptic-tab';
import {
  PRIMARY_COLOR,
  ELECTRIC_BLUE,
  VIBRANT_ORANGE,
  DEEP_PURPLE,
  SUCCESS_GREEN,
  CHARCOAL,
  WARNING_AMBER,
} from "@/constants/customConstants";

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

type TabConfig = {
  name: string;
  title: string;
  icon: IoniconName;
  iconOutline: IoniconName;
  activeColor: string;
  activeBg: string;
};

const TABS: TabConfig[] = [
  {
    name: 'index',
    title: 'Home',
    icon: 'home',
    iconOutline: 'home-outline',
    activeColor: PRIMARY_COLOR,
    activeBg: `${PRIMARY_COLOR}18`,
  },
  {
    name: 'transfer',
    title: 'Transfer',
    icon: 'swap-horizontal',
    iconOutline: 'swap-horizontal-outline',
    activeColor: SUCCESS_GREEN,
    activeBg: `${SUCCESS_GREEN}18`,
  },
  {
    name: 'bills',
    title: 'Bills',
    icon: 'receipt',
    iconOutline: 'receipt-outline',
    activeColor: VIBRANT_ORANGE,
    activeBg: `${VIBRANT_ORANGE}18`,
  },
  {
    name: 'history',
    title: 'History',
    icon: 'time',
    iconOutline: 'time-outline',
    activeColor: ELECTRIC_BLUE,
    activeBg: `${ELECTRIC_BLUE}18`,
  },
  {
    name: 'grants',
    title: 'Growth',
    icon: 'trending-up',
    iconOutline: 'trending-up-outline',
    activeColor: DEEP_PURPLE,
    activeBg: `${DEEP_PURPLE}18`,
  },
  {
    name: 'profile',
    title: 'Profile',
    icon: 'person-circle',
    iconOutline: 'person-circle-outline',
    activeColor: WARNING_AMBER,
    activeBg: `${WARNING_AMBER}18`,
  },
];

export default function TabLayout() {
  const { user, isLoading } = useAuth();
  const navState = useRootNavigationState();

  if (!navState?.key) return null;
  if (isLoading) return null;
  if (!user) return <Redirect href="/welcome" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarButton: (props) => <HapticTab {...props} />,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          letterSpacing: 0.1,
          marginBottom: 4,
        },
        tabBarStyle: {
          position: 'absolute',
          left: 16,
          right: 16,
          bottom: 20,
          backgroundColor: '#FFFFFF',
          borderRadius: 26,
          borderTopWidth: 0,
          shadowColor: CHARCOAL,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.12,
          shadowRadius: 24,
          elevation: 0,
          height: 68,
          paddingBottom: 0,
          paddingTop: 0,
        },
        tabBarItemStyle: {
          paddingVertical: 6,
          borderRadius: 20,
        },
      }}
    >
      {TABS.map(({ name, title, icon, iconOutline, activeColor, activeBg }) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title,
            tabBarActiveTintColor: activeColor,
            tabBarIcon: ({ focused }) => (
              <Ionicons
                name={focused ? icon : iconOutline}
                size={22}
                color={focused ? activeColor : '#9CA3AF'}
                style={{
                  backgroundColor: focused ? activeBg : 'transparent',
                  borderRadius: 10,
                  padding: 3,
                  overflow: 'hidden',
                }}
              />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}