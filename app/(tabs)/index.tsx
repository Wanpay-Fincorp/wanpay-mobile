import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useState, useCallback } from 'react';
import { Alert, SafeAreaView, StatusBar, Text, TouchableOpacity, View, ActivityIndicator, TextInput, Modal, KeyboardAvoidingView, Platform, Share } from 'react-native';
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

  const [showAddMoney, setShowAddMoney] = useState(false);
  const [addAmount, setAddAmount] = useState('');
  const [adding, setAdding] = useState(false);
  const [showReceive, setShowReceive] = useState(false);

  const handleAddMoney = async () => {
    const amount = parseFloat(addAmount);
    if (!amount || amount <= 0) {
      Alert.alert('Invalid amount', 'Please enter a valid amount');
      return;
    }
    const email = user?.email;
    if (!email) {
      Alert.alert('Email required', 'Please set your email in profile before funding your wallet.');
      setShowAddMoney(false);
      return;
    }
    setAdding(true);
    try {
      const res = await api.post<{ authorizationUrl: string; reference: string }>('/wallet/fund', { email, amount });
      setShowAddMoney(false);
      setAddAmount('');
      const result = await WebBrowser.openBrowserAsync(res.authorizationUrl);
      if (result.type === 'success' || result.type === 'dismiss') {
        await loadData();
      }
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to initiate payment');
    } finally {
      setAdding(false);
    }
  };

  const quickActions = [
    { id: 'transfer', name: 'Transfer', icon: 'arrow-forward-outline', screen: 'transfer', color: 'blue' },
    { id: 'bills',    name: 'Bills',    icon: 'document-text-outline', screen: 'bills',    color: 'blue' },
    { id: 'growth',   name: 'Growth',   icon: 'trending-up-outline',   screen: 'grants',   color: 'purple' },
    { id: 'receive',  name: 'Receive',  icon: 'arrow-down-outline',    screen: 'receive',  color: 'blue' },
  ];

  const getName = () => {
    const name = user?.fullName || user?.phone || 'User';
    return name.replace(/\b\w/g, c => c.toUpperCase());
  };
  const getInitials = () => {
    const name = getName();
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <SafeAreaView style={tw`flex-1 pb-8 bg-gray-50`}>
      <StatusBar barStyle="dark-content" />
      <RefreshableScrollView onRefresh={onRefresh} refreshing={refreshing} showsVerticalScrollIndicator={false}>
        <View style={tw`bg-blue-600 px-6 pt-16 pb-7 rounded-b-[32px]`}>
          <View style={tw`flex-row justify-between items-center mb-6`}>
            <View style={tw`flex-row items-center gap-3`}>
              <View style={tw`w-10 h-10 rounded-xl bg-white/20 items-center justify-center`}>
                <Text style={tw`text-white font-bold text-sm`}>{getInitials()}</Text>
              </View>
              <View>
                <Text style={tw`text-white/60 text-[12px] mb-0.5`}>Good morning</Text>
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

          <View style={tw`bg-white/15 border border-white/20 rounded-[20px] p-5`}>
            <View style={tw`flex-row justify-between items-center mb-1.5`}>
              <Text style={tw`text-white/70 text-[12px]`}>Wallet balance</Text>
              <TouchableOpacity onPress={() => setShowBalance(!showBalance)} activeOpacity={0.7}>
                <Ionicons name={showBalance ? 'eye-outline' : 'eye-off-outline'} size={17} color="rgba(255,255,255,0.7)" />
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
                onPress={() => setShowAddMoney(true)}
              >
                <Ionicons name="add" size={14} color="#1d4ed8" />
                <Text style={tw`text-blue-700 text-[12px] font-semibold`}>Add money</Text>
              </TouchableOpacity>
              <Text style={tw`text-white/70 text-[11px]`}>{wallet?.accountNumber || 'N/A'}</Text>
            </View>
          </View>
        </View>

        <View style={tw`px-5 pt-6 pb-24`}>
          <Text style={tw`text-gray-800 text-[14px] font-semibold tracking-tight mb-4`}>Quick actions</Text>
          <View style={tw`flex-row gap-2 mb-7`}>
            {quickActions.map(action => {
              const isGrowth = action.color === 'purple';
              return (
                <TouchableOpacity
                  key={action.id}
                  style={tw`flex-1 items-center gap-2`}
                  activeOpacity={0.75}
                  onPress={() => action.id === 'receive' ? setShowReceive(true) : router.push(`/(tabs)/${action.screen}` as any)}
                >
                  <View style={tw`w-14 h-14 rounded-2xl items-center justify-center ${isGrowth ? 'bg-violet-100 border border-violet-200' : 'bg-blue-100 border border-blue-200'}`}>
                    <Ionicons name={action.icon as any} size={22} color={isGrowth ? '#7c3aed' : '#2563eb'} />
                  </View>
                  <Text style={tw`text-gray-600 text-[11px] text-center`}>{action.name}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={tw`flex-row justify-between items-center mb-4`}>
            <Text style={tw`text-gray-800 text-[14px] font-semibold tracking-tight`}>Recent transactions</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/history')} activeOpacity={0.7}>
              <Text style={tw`text-blue-500 text-[12px] font-medium`}>See all</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={tw`items-center py-10`}>
              <ActivityIndicator color="#9CA3AF" />
            </View>
          ) : recentTransactions.length === 0 ? (
            <View style={tw`bg-white border border-gray-200 rounded-2xl p-6 items-center`}>
              <Ionicons name="receipt-outline" size={32} color="#D1D5DB" />
              <Text style={tw`text-gray-400 text-[13px] mt-3`}>No transactions yet</Text>
            </View>
          ) : (
            recentTransactions.map(txn => (
              <View key={txn.id} style={tw`bg-white border border-gray-200 rounded-2xl mb-2.5 overflow-hidden`}>
                <TransactionItem txn={txn} />
              </View>
            ))
          )}
        </View>
      </RefreshableScrollView>

      <Modal visible={showAddMoney} transparent animationType="slide" onRequestClose={() => setShowAddMoney(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={tw`flex-1 justify-end`}>
          <TouchableOpacity style={tw`flex-1`} activeOpacity={1} onPress={() => setShowAddMoney(false)} />
          <View style={tw`bg-white rounded-t-3xl p-6 pb-10 shadow-xl`}>
            <View style={tw`items-center mb-4`}>
              <View style={tw`w-10 h-1 bg-gray-300 rounded-full mb-4`} />
              <Text style={tw`text-gray-800 text-lg font-bold`}>Add Money</Text>
              <Text style={tw`text-gray-500 text-[13px] mt-1`}>Enter amount to fund your wallet</Text>
            </View>

            <View style={tw`bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3 mb-5 flex-row items-center`}>
              <Text style={tw`text-gray-800 text-2xl font-bold mr-1`}>₦</Text>
              <TextInput
                style={tw`flex-1 text-gray-800 text-2xl font-bold`}
                placeholder="0.00"
                placeholderTextColor="#9CA3AF"
                keyboardType="decimal-pad"
                value={addAmount}
                onChangeText={setAddAmount}
                autoFocus
              />
            </View>

            <TouchableOpacity
              style={tw`bg-blue-600 rounded-xl py-4 items-center ${adding ? 'opacity-50' : ''}`}
              activeOpacity={0.85}
              onPress={handleAddMoney}
              disabled={adding}
            >
              {adding ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={tw`text-white font-semibold text-base`}>
                  Add {addAmount ? `₦${parseFloat(addAmount).toLocaleString()}` : 'Money'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={tw`mt-3 py-3 items-center`}
              activeOpacity={0.7}
              onPress={() => setShowAddMoney(false)}
            >
              <Text style={tw`text-gray-500 text-[14px]`}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
      <Modal visible={showReceive} transparent animationType="slide" onRequestClose={() => setShowReceive(false)}>
        <TouchableOpacity style={tw`flex-1 bg-black/40 justify-end`} activeOpacity={1} onPress={() => setShowReceive(false)}>
          <TouchableOpacity activeOpacity={1} onPress={() => {}} style={tw`bg-white rounded-t-3xl p-6 pb-10`}>
            <View style={tw`items-center mb-2`}>
              <View style={tw`w-10 h-1 bg-gray-300 rounded-full mb-6`} />
              <View style={tw`w-16 h-16 rounded-2xl bg-green-100 items-center justify-center mb-4`}>
                <Ionicons name="arrow-down-outline" size={28} color="#16A34A" />
              </View>
              <Text style={tw`text-gray-900 text-xl font-bold`}>Receive Money</Text>
              <Text style={tw`text-gray-500 text-[13px] mt-1 mb-6 text-center`}>
                Share your account details below to receive money
              </Text>
            </View>

            <View style={tw`bg-gray-50 border border-gray-200 rounded-2xl p-5 mb-6`}>
              <Text style={tw`text-gray-400 text-[11px] font-semibold uppercase tracking-wider mb-2`}>Account Number</Text>
              <Text style={tw`text-gray-900 text-[28px] font-bold tracking-wider text-center mb-4`}>
                {wallet?.accountNumber || 'N/A'}
              </Text>
              <View style={tw`h-px bg-gray-200 mb-4`} />
              <Text style={tw`text-gray-400 text-[11px] font-semibold uppercase tracking-wider mb-2`}>Account Name</Text>
              <Text style={tw`text-gray-900 text-[16px] font-semibold text-center`}>
                {getName()}
              </Text>
              <View style={tw`h-px bg-gray-200 my-4`} />
              <Text style={tw`text-gray-400 text-[11px] font-semibold uppercase tracking-wider mb-2`}>Bank</Text>
              <Text style={tw`text-gray-900 text-[16px] font-semibold text-center`}>
                WanPay Microfinance Bank
              </Text>
            </View>

            <TouchableOpacity
              style={tw`bg-blue-600 rounded-xl py-4 items-center flex-row justify-center gap-2`}
              activeOpacity={0.85}
              onPress={async () => {
                try {
                  await Share.share({
                    message: `Bank: WanPay Microfinance Bank\nAccount Name: ${getName()}\nAccount Number: ${wallet?.accountNumber || 'N/A'}`,
                    title: 'My WanPay Account Details',
                  });
                } catch {}
              }}
            >
              <Ionicons name="share-outline" size={18} color="white" />
              <Text style={tw`text-white font-semibold text-base`}>Share Account Details</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}
