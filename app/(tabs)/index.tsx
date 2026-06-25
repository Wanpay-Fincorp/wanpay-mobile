import { DARK_BG } from '@/constants/customConstants';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import React, { useState, useCallback } from 'react';
import { Alert, SafeAreaView, StatusBar, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import tw from 'twrnc';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import RefreshableScrollView from '@/components/RefreshableScrollView';
import TransactionItem from '@/components/TransactionItem';
import type { Wallet, Transaction } from '@/lib/types';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [showBalance, setShowBalance] = useState(true);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      const [walletData, transactions] = await Promise.all([
        api.get<Wallet>('/wallet'),
        api.get<Transaction[]>('/transactions/recent?limit=5'),
      ]);
      setWallet(walletData as Wallet);
      setRecentTransactions(transactions as Transaction[]);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const quickActions = [
    { id: 'transfer', name: 'Transfer', icon: 'arrow-forward-outline', screen: 'transfer', color: 'blue' },
    { id: 'bills',    name: 'Bills',    icon: 'document-text-outline', screen: 'bills',    color: 'blue' },
    { id: 'growth',   name: 'Growth',   icon: 'trending-up-outline',   screen: 'grants',   color: 'purple' },
    { id: 'receive',  name: 'Receive',  icon: 'arrow-down-outline',    screen: 'receive',  color: 'blue' },
  ];

  const getName = () => user?.fullName || user?.phone || 'User';
  const getInitials = () => {
    const name = getName();
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <SafeAreaView style={tw`flex-1 pb-5 bg-[${DARK_BG}]`}>
      <StatusBar barStyle="light-content" />
      <RefreshableScrollView onRefresh={onRefresh} refreshing={refreshing} showsVerticalScrollIndicator={false}>
        <View style={tw`bg-blue-700 px-6 pt-7 pb-7 rounded-b-[32px]`}>
          <View style={tw`flex-row justify-between items-center mb-6`}>
            <View style={tw`flex-row items-center gap-3`}>
              <View style={tw`w-10 h-10 rounded-xl bg-white/20 items-center justify-center`}>
                <Text style={tw`text-white font-bold text-sm`}>{getInitials()}</Text>
              </View>
              <View>
                <Text style={tw`text-white/50 text-[12px] mb-0.5`}>Good morning</Text>
                <Text style={tw`text-white text-[20px] font-bold tracking-tight`}>{getName()}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={tw`w-[38px] h-[38px] rounded-xl bg-white/12 border border-white/15 items-center justify-center`}
              activeOpacity={0.75}
              onPress={() => router.push('/profile/notifications')}
            >
              <Ionicons name="notifications-outline" size={20} color="rgba(255,255,255,0.85)" />
            </TouchableOpacity>
          </View>

          <View style={tw`bg-white/10 border border-white/12 rounded-[20px] p-5`}>
            <View style={tw`flex-row justify-between items-center mb-1.5`}>
              <Text style={tw`text-white/55 text-[12px]`}>Wallet balance</Text>
              <TouchableOpacity onPress={() => setShowBalance(!showBalance)} activeOpacity={0.7}>
                <Ionicons name={showBalance ? 'eye-outline' : 'eye-off-outline'} size={17} color="rgba(255,255,255,0.55)" />
              </TouchableOpacity>
            </View>
            {loading ? (
              <ActivityIndicator color="rgba(255,255,255,0.5)" style={tw`mb-4`} />
            ) : (
              <Text style={tw`text-white text-[30px] font-bold tracking-tight mb-4`}>
                {showBalance ? `₦${(wallet?.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '₦ ••••••'}
              </Text>
            )}
            <View style={tw`flex-row justify-between items-center`}>
              <TouchableOpacity
                style={tw`bg-white rounded-full py-1.5 px-4 flex-row items-center gap-1`}
                activeOpacity={0.85}
                onPress={() => Alert.alert('Add Money', 'Funding your wallet will be available soon.')}
              >
                <Ionicons name="add" size={14} color="#1d4ed8" />
                <Text style={tw`text-blue-700 text-[12px] font-semibold`}>Add money</Text>
              </TouchableOpacity>
              <Text style={tw`text-white/65 text-[11px]`}>{wallet?.accountNumber || 'N/A'}</Text>
            </View>
          </View>
        </View>

        <View style={tw`px-5 pt-6 pb-24`}>
          <Text style={tw`text-white text-[14px] font-semibold tracking-tight mb-4`}>Quick actions</Text>
          <View style={tw`flex-row gap-2 mb-7`}>
            {quickActions.map(action => {
              const isGrowth = action.color === 'purple';
              return (
                <TouchableOpacity
                  key={action.id}
                  style={tw`flex-1 items-center gap-2`}
                  activeOpacity={0.75}
                  onPress={() => action.id === 'receive' ? Alert.alert('Receive Money', 'Receiving money into your account will be available soon.') : router.push(`/(tabs)/${action.screen}` as any)}
                >
                  <View style={tw`w-14 h-14 rounded-2xl items-center justify-center ${isGrowth ? 'bg-violet-500/15 border border-violet-500/20' : 'bg-blue-500/15 border border-blue-500/20'}`}>
                    <Ionicons name={action.icon as any} size={22} color={isGrowth ? '#a78bfa' : '#60a5fa'} />
                  </View>
                  <Text style={tw`text-white/50 text-[11px] text-center`}>{action.name}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={tw`flex-row justify-between items-center mb-4`}>
            <Text style={tw`text-white text-[14px] font-semibold tracking-tight`}>Recent transactions</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/history')} activeOpacity={0.7}>
              <Text style={tw`text-blue-400 text-[12px] font-medium`}>See all</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={tw`items-center py-10`}>
              <ActivityIndicator color="rgba(255,255,255,0.3)" />
            </View>
          ) : recentTransactions.length === 0 ? (
            <View style={tw`bg-white/4 border border-white/7 rounded-2xl p-6 items-center`}>
              <Ionicons name="receipt-outline" size={32} color="rgba(255,255,255,0.15)" />
              <Text style={tw`text-white/30 text-[13px] mt-3`}>No transactions yet</Text>
            </View>
          ) : (
            recentTransactions.map(txn => (
              <View key={txn.id} style={tw`bg-white/4 border border-white/7 rounded-2xl mb-2.5 overflow-hidden`}>
                <TransactionItem txn={txn} />
              </View>
            ))
          )}
        </View>
      </RefreshableScrollView>
    </SafeAreaView>
  );
}
