import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import React, { useState, useCallback } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, Switch, Text, TouchableOpacity, View } from 'react-native';
import tw from 'twrnc';
import { DARK_BG } from '@/constants/customConstants';
import { api } from '@/lib/api';
import type { NotificationSetting } from '@/lib/types';
import RefreshableScrollView from '@/components/RefreshableScrollView';

interface SettingDef {
  key: keyof NotificationSetting;
  label: string;
}

const SECTIONS: { title: string; icon: string; color: string; settings: SettingDef[] }[] = [
  {
    title: 'Transaction Notifications',
    icon: 'swap-horizontal-outline',
    color: '#3b82f6',
    settings: [
      { key: 'transactionAlerts', label: 'Transaction Alerts' },
    ],
  },
  {
    title: 'Bill Payment Notifications',
    icon: 'receipt-outline',
    color: '#10b981',
    settings: [
      { key: 'billPaymentAlerts', label: 'Bill Payment Alerts' },
      { key: 'paymentReminders', label: 'Payment Reminders' },
    ],
  },
  {
    title: 'Balance & Account',
    icon: 'wallet-outline',
    color: '#f59e0b',
    settings: [
      { key: 'balanceUpdates', label: 'Balance Updates' },
    ],
  },
  {
    title: 'Security',
    icon: 'shield-outline',
    color: '#ef4444',
    settings: [
      { key: 'securityAlerts', label: 'Security Alerts' },
    ],
  },
  {
    title: 'Preferences',
    icon: 'settings-outline',
    color: '#a78bfa',
    settings: [
      { key: 'pushEnabled', label: 'Push Notifications' },
      { key: 'emailEnabled', label: 'Email Notifications' },
      { key: 'smsEnabled', label: 'SMS Notifications' },
    ],
  },
  {
    title: 'Marketing',
    icon: 'megaphone-outline',
    color: '#ec4899',
    settings: [
      { key: 'promotionalNotifications', label: 'Promotional Notifications' },
      { key: 'grantOpportunities', label: 'Grant Opportunities' },
    ],
  },
];

export default function NotificationsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<NotificationSetting | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadSettings();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSettings();
    setRefreshing(false);
  };

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await api.get<{ pushEnabled: boolean; emailEnabled: boolean; smsEnabled: boolean; transactionAlerts: boolean; paymentReminders: boolean; billPaymentAlerts: boolean; balanceUpdates: boolean; securityAlerts: boolean; promotionalNotifications: boolean; grantOpportunities: boolean; quietHoursEnabled: boolean; quietHoursStart: string | null; quietHoursEnd: string | null }>('/users/notification-settings');
      if (data) {
        setSettings(data as NotificationSetting);
      } else {
        setSettings({
          pushEnabled: true, emailEnabled: true, smsEnabled: false,
          transactionAlerts: true, paymentReminders: true, billPaymentAlerts: true,
          balanceUpdates: true, securityAlerts: true,
          promotionalNotifications: false, grantOpportunities: false,
          quietHoursEnabled: false, quietHoursStart: null, quietHoursEnd: null,
        });
      }
    } catch {
      setSettings({
        pushEnabled: true, emailEnabled: true, smsEnabled: false,
        transactionAlerts: true, paymentReminders: true, billPaymentAlerts: true,
        balanceUpdates: true, securityAlerts: true,
        promotionalNotifications: false, grantOpportunities: false,
        quietHoursEnabled: false, quietHoursStart: null, quietHoursEnd: null,
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleSetting = async (key: keyof NotificationSetting, currentValue: boolean) => {
    setSaving(key);
    const updated = { ...settings!, [key]: !currentValue };
    setSettings(updated as NotificationSetting);
    try {
      await api.put('/users/notification-settings', updated);
    } catch {
      setSettings({ ...updated, [key]: currentValue } as NotificationSetting);
      Alert.alert('Error', 'Failed to update notification setting.');
    } finally {
      setSaving(null);
    }
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-[${DARK_BG}]`}>
      <View style={tw`px-3 py-4 border-b border-white/7`}>
        <View style={tw`flex-row items-center`}>
          <TouchableOpacity onPress={() => router.back()} style={tw`mr-4`} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color="rgba(255,255,255,0.75)" />
          </TouchableOpacity>
          <View>
            <Text style={tw`text-xl font-bold text-white`}>Notifications</Text>
            <Text style={tw`text-xs text-white/40`}>Manage your notification preferences</Text>
          </View>
        </View>
      </View>

      <RefreshableScrollView style={tw`flex-1 px-3 pt-6`} showsVerticalScrollIndicator={false} contentContainerStyle={tw`pb-8`} refreshing={refreshing} onRefresh={onRefresh}>
        {loading ? (
          <View style={tw`items-center py-10`}>
            <ActivityIndicator color="rgba(255,255,255,0.3)" />
          </View>
        ) : !settings ? null : (
          SECTIONS.map((section, sectionIndex) => (
            <View key={sectionIndex} style={tw`mb-6`}>
              <Text style={tw`text-white/45 text-xs font-semibold uppercase mb-3`}>{section.title}</Text>
              <View style={tw`bg-white/4 border border-white/7 rounded-2xl`}>
                {section.settings.map((setting, settingIndex) => {
                  const value = settings[setting.key] as boolean;
                  return (
                    <TouchableOpacity
                      key={setting.key}
                      style={tw`flex-row justify-between items-center px-5 py-4 ${settingIndex !== section.settings.length - 1 ? 'border-b border-white/7' : ''}`}
                      onPress={() => toggleSetting(setting.key, value)}
                      activeOpacity={0.75}
                    >
                      <View style={tw`flex-row items-center flex-1`}>
                        {settingIndex === 0 && (
                          <View style={tw`w-10 h-10 rounded-full items-center justify-center mr-3`}>
                            <Ionicons name={section.icon as any} size={20} color={section.color} />
                          </View>
                        )}
                        <View style={tw`${settingIndex !== 0 ? 'ml-[52px]' : ''} flex-1`}>
                          <Text style={tw`text-white font-semibold`}>{setting.label}</Text>
                        </View>
                      </View>
                      <Switch
                        value={value}
                        onValueChange={() => toggleSetting(setting.key, value)}
                        trackColor={{ false: '#374151', true: '#3b82f6' }}
                        thumbColor="#fff"
                        disabled={saving === setting.key}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))
        )}
      </RefreshableScrollView>
    </SafeAreaView>
  );
}
