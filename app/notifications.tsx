import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import React, { useState, useCallback } from 'react';
import { SafeAreaView, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import tw from 'twrnc';
import { api } from '@/lib/api';
import RefreshableScrollView from '@/components/RefreshableScrollView';
import { LIGHT_GRAY, PRIMARY_COLOR } from '@/constants/customConstants';

interface NotificationItem {
  id: string;
  type: 'transaction' | 'bill' | 'security' | 'promo' | 'grant' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  data?: Record<string, any>;
}

const TYPE_CONFIG: Record<string, { icon: string; color: string }> = {
  transaction: { icon: 'arrow-forward-circle', color: PRIMARY_COLOR },
  bill:        { icon: 'document-text',         color: '#f59e0b' },
  security:    { icon: 'shield-checkmark',      color: '#10b981' },
  promo:       { icon: 'megaphone',             color: '#ec4899' },
  grant:       { icon: 'trending-up',           color: '#7c3aed' },
  system:      { icon: 'information-circle',    color: '#6b7280' },
};

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
}

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useFocusEffect(
    useCallback(() => {
      loadNotifications();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await api.get<NotificationItem[]>('/notifications');
      setNotifications(data || []);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`, {});
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
    } catch {}
  };

  const displayed = filter === 'unread'
    ? notifications.filter(n => !n.read)
    : notifications;

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <SafeAreaView style={tw`flex-1 bg-[${LIGHT_GRAY}]`}>
      <View style={tw`px-4 pt-12 pb-4`}>
        <View style={tw`flex-row items-center justify-between`}>
          <View style={tw`flex-row items-center`}>
            <TouchableOpacity onPress={() => router.back()} style={tw`rounded-full bg-white border border-gray-200 w-10 h-10 items-center justify-center mr-4`} activeOpacity={0.7}>
              <Ionicons name="arrow-back" size={22} color="#374151" />
            </TouchableOpacity>
            <View>
              <Text style={tw`text-xl font-bold text-gray-900`}>Notifications</Text>
              <Text style={tw`text-xs text-gray-500`}>
                {unreadCount > 0 ? `${unreadCount} unread` : 'No new notifications'}
              </Text>
            </View>
          </View>
          {unreadCount > 0 && (
            <TouchableOpacity
              style={tw`px-3 py-2 rounded-full bg-[${PRIMARY_COLOR}]`}
              activeOpacity={0.75}
              onPress={() => setFilter(filter === 'unread' ? 'all' : 'unread')}
            >
              <Text style={tw`text-white text-[12px] font-semibold`}>{filter === 'unread' ? 'All' : 'Unread'}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <RefreshableScrollView style={tw`flex-1 px-4`} showsVerticalScrollIndicator={false} contentContainerStyle={tw`pb-28`} refreshing={refreshing} onRefresh={onRefresh}>
        {loading ? (
          <View style={tw`items-center py-20`}>
            <ActivityIndicator color="#D1D5DB" size="large" />
          </View>
        ) : displayed.length === 0 ? (
          <View style={tw`items-center py-20`}>
            <View style={tw`w-20 h-20 rounded-full bg-gray-100 items-center justify-center mb-4`}>
              <Ionicons name="notifications-off-outline" size={36} color="#D1D5DB" />
            </View>
            <Text style={tw`text-gray-500 text-[16px] font-semibold`}>No notifications</Text>
            <Text style={tw`text-gray-400 text-[13px] mt-1`}>
              {filter === 'unread' ? 'No unread notifications' : 'You are all caught up'}
            </Text>
          </View>
        ) : (
          displayed.map((item, index) => {
            const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.system;
            return (
              <TouchableOpacity
                key={item.id}
                style={tw`bg-white border border-gray-200 rounded-2xl p-4 mb-3 ${!item.read ? 'border-l-4 border-l-[${PRIMARY_COLOR}]' : ''}`}
                activeOpacity={0.75}
                onPress={() => {
                  if (!item.read) handleMarkRead(item.id);
                }}
              >
                <View style={tw`flex-row items-start`}>
                  <View style={tw`w-10 h-10 rounded-xl bg-gray-100 items-center justify-center mr-3 mt-0.5`}>
                    <Ionicons name={cfg.icon as any} size={20} color={cfg.color} />
                  </View>
                  <View style={tw`flex-1`}>
                    <View style={tw`flex-row items-center justify-between mb-1`}>
                      <Text style={tw`text-gray-900 text-[14px] font-semibold flex-1 mr-2 ${!item.read ? 'font-bold' : ''}`} numberOfLines={1}>{item.title}</Text>
                      <Text style={tw`text-gray-400 text-[11px] flex-shrink-0`}>{formatTime(item.createdAt)}</Text>
                    </View>
                    <Text style={tw`text-gray-500 text-[13px] leading-5`} numberOfLines={2}>{item.message}</Text>
                    {!item.read && (
                      <View style={tw`w-2 h-2 rounded-full bg-[${PRIMARY_COLOR}] mt-2`} />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </RefreshableScrollView>
    </SafeAreaView>
  );
}
