import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import React, { useState, useCallback } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import tw from 'twrnc';
import { DARK_BG } from '@/constants/customConstants';
import { api } from '@/lib/api';
import type { UserLimits } from '@/lib/types';
import RefreshableScrollView from '@/components/RefreshableScrollView';

interface Limit {
  id: string;
  type: string;
  current: string;
  max: string;
  icon: string;
  color: string;
  description: string;
}

export default function TransactionLimitsScreen() {
  const router = useRouter();
  const [limits, setLimits] = useState<Limit[]>([]);
  const [tier, setTier] = useState('TIER_2');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadLimits();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLimits();
    setRefreshing(false);
  };

  const loadLimits = async () => {
    setLoading(true);
    try {
      const data = await api.get<UserLimits>('/users/limits');
      if (data) {
        setTier(data.tier);
        setLimits([
          { id: 'daily', type: 'Daily Transfer Limit', current: `₦${(data.dailyTransfer?.current || 0).toLocaleString()}`, max: `₦${(data.dailyTransfer?.max || 5000000).toLocaleString()}`, icon: 'arrow-forward-circle', color: '#2563eb', description: 'Maximum amount you can transfer per day' },
          { id: 'monthly', type: 'Monthly Transfer Limit', current: `₦${(data.monthlyTransfer?.current || 0).toLocaleString()}`, max: `₦${(data.monthlyTransfer?.max || 50000000).toLocaleString()}`, icon: 'calendar-outline', color: '#7c3aed', description: 'Maximum amount you can transfer per month' },
          { id: 'single', type: 'Single Transaction Limit', current: `₦${(data.singleTransaction?.current || 0).toLocaleString()}`, max: `₦${(data.singleTransaction?.max || 10000000).toLocaleString()}`, icon: 'cash-outline', color: '#10b981', description: 'Maximum amount for a single transaction' },
          { id: 'bill', type: 'Daily Bill Payment Limit', current: `₦${(data.dailyBillPayment?.current || 0).toLocaleString()}`, max: `₦${(data.dailyBillPayment?.max || 1000000).toLocaleString()}`, icon: 'document-text-outline', color: '#f59e0b', description: 'Maximum amount for bill payments per day' },
        ]);
      }
    } catch {
      // silently fail - use defaults
    } finally {
      setLoading(false);
    }
  };

  const getLimitPercentage = (current: string, max: string) => {
    const currentNum = parseInt(current.replace(/[^0-9]/g, ''));
    const maxNum = parseInt(max.replace(/[^0-9]/g, ''));
    if (!maxNum) return 0;
    return Math.min(Math.round((currentNum / maxNum) * 100), 100);
  };

  const tierLabel = tier.replace('_', ' ');

  return (
    <SafeAreaView style={tw`flex-1 pb-8 bg-[${DARK_BG}]`}>
      <View style={tw`px-3 pt-12 pb-4 border-b border-gray-200`}>
        <View style={tw`flex-row items-center`}>
          <TouchableOpacity onPress={() => router.back()} style={tw`mr-4`} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <View>
            <Text style={tw`text-xl font-bold text-gray-900`}>Transaction Limits</Text>
            <Text style={tw`text-xs text-gray-400`}>View and manage your account limits</Text>
          </View>
        </View>
      </View>

      <RefreshableScrollView style={tw`flex-1 px-3 pt-6`} showsVerticalScrollIndicator={false} contentContainerStyle={tw`pb-8`} refreshing={refreshing} onRefresh={onRefresh}>
        <LinearGradient colors={['#2563eb', '#7c3aed']} style={tw`rounded-2xl p-5 mb-6`} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
          <View style={tw`flex-row items-center mb-3`}>
            <View style={tw`bg-white/20 w-12 h-12 rounded-full items-center justify-center`}>
              <Ionicons name="shield-checkmark" size={24} color="#fff" />
            </View>
            <View style={tw`ml-3 flex-1`}>
              <Text style={tw`text-white font-bold text-lg`}>{tierLabel} Account</Text>
              <Text style={tw`text-white/80 text-sm`}>Verified Account</Text>
            </View>
          </View>
          <Text style={tw`text-white/90 text-sm`}>Manage your transaction limits and request increases.</Text>
        </LinearGradient>

        {loading ? (
          <View style={tw`items-center py-10`}>
            <ActivityIndicator color="#D1D5DB" />
          </View>
        ) : (
          <View style={tw`mb-6`}>
            <Text style={tw`text-gray-500 text-xs font-semibold uppercase mb-3`}>Current Limits</Text>
            {limits.length === 0 ? (
              <View style={tw`bg-gray-50 border border-gray-200 rounded-2xl p-6 items-center`}>
                <Text style={tw`text-gray-300 text-sm`}>No limit data available</Text>
              </View>
            ) : (
              limits.map((limit) => {
                const percentage = getLimitPercentage(limit.current, limit.max);
                return (
                  <View key={limit.id} style={tw`bg-gray-50 border border-gray-200 rounded-2xl p-5 mb-4`}>
                    <View style={tw`flex-row items-center mb-4`}>
                      <View style={tw`bg-blue-500/15 w-12 h-12 rounded-full items-center justify-center mr-3`}>
                        <Ionicons name={limit.icon as any} size={24} color={limit.color} />
                      </View>
                      <View style={tw`flex-1`}>
                        <Text style={tw`text-gray-900 font-bold text-base`}>{limit.type}</Text>
                        <Text style={tw`text-gray-400 text-xs mt-1`}>{limit.description}</Text>
                      </View>
                    </View>
                    <View style={tw`mb-4`}>
                      <View style={tw`flex-row justify-between items-center mb-2`}>
                        <Text style={tw`text-gray-700 font-semibold`}>Current: {limit.current}</Text>
                        <Text style={tw`text-gray-400 text-sm`}>{percentage}% used</Text>
                      </View>
                      <View style={tw`h-2 bg-gray-100 rounded-full overflow-hidden`}>
                        <View style={[tw`h-full rounded-full`, { width: `${percentage}%`, backgroundColor: limit.color }]} />
                      </View>
                      <Text style={tw`text-gray-400 text-xs mt-2`}>Maximum: {limit.max}</Text>
                    </View>
                    <TouchableOpacity
                      style={tw`bg-blue-500/15 border border-blue-500/20 py-3 rounded-xl flex-row items-center justify-center`}
                      onPress={() => router.push('/profile/increase-limits' as any)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="trending-up" size={18} color="#60a5fa" />
                      <Text style={tw`text-blue-600 font-semibold ml-2`}>Request Increase</Text>
                    </TouchableOpacity>
                  </View>
                );
              })
            )}
          </View>
        )}

        {tier === 'TIER_1' ? (
          <View style={tw`bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 mb-6`}>
            <View style={tw`flex-row items-center mb-3`}>
              <Ionicons name="shield-checkmark" size={24} color="#10b981" />
              <Text style={tw`text-emerald-300 font-bold text-lg ml-3`}>Verify Your Identity</Text>
            </View>
            <Text style={tw`text-emerald-400/70 text-sm mb-4`}>Complete BVN verification to upgrade to Tier 2 and unlock higher limits.</Text>
            <TouchableOpacity style={tw`bg-emerald-600 py-3 rounded-xl`} onPress={() => router.push('/profile/bvn-verification')} activeOpacity={0.8}>
              <Text style={tw`text-white text-center font-bold`}>Verify BVN Now</Text>
            </TouchableOpacity>
          </View>
        ) : tier === 'TIER_2' ? (
          <View style={tw`bg-purple-500/10 border border-purple-500/20 rounded-2xl p-5 mb-6`}>
            <View style={tw`flex-row items-center mb-3`}>
              <Ionicons name="star" size={24} color="#a78bfa" />
              <Text style={tw`text-purple-300 font-bold text-lg ml-3`}>Upgrade to Tier 3</Text>
            </View>
            <Text style={tw`text-purple-400/70 text-sm mb-4`}>Unlock higher transaction limits by upgrading to Tier 3.</Text>
            <TouchableOpacity style={tw`bg-purple-600 py-3 rounded-xl`} activeOpacity={0.8} onPress={() => router.push('/profile/increase-limits')}>
              <Text style={tw`text-white text-center font-bold`}>Request Upgrade</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <View style={tw`bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl`}>
          <View style={tw`flex-row items-center mb-2`}>
            <Ionicons name="information-circle" size={20} color="#60a5fa" />
            <Text style={tw`text-blue-300 font-semibold ml-2`}>About Limits</Text>
          </View>
          <Text style={tw`text-xs text-gray-400 mb-1`}>• Limits are set based on your account tier and verification level</Text>
          <Text style={tw`text-xs text-gray-400 mb-1`}>• Limit increase requests are reviewed within 24-48 hours</Text>
          <Text style={tw`text-xs text-gray-400`}>• Higher limits may require additional verification documents</Text>
        </View>
      </RefreshableScrollView>
    </SafeAreaView>
  );
}
