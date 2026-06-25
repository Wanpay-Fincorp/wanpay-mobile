import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import tw from 'twrnc';
import { DARK_BG } from '@/constants/customConstants';
import { api } from '@/lib/api';
import RefreshableScrollView from '@/components/RefreshableScrollView';
import TransactionItem from '@/components/TransactionItem';
import type { Transaction } from '@/lib/types';

export default function HistoryScreen() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadTransactions();
    }, [])
  );

  const loadTransactions = async () => {
    try {
      const data = await api.get<Transaction[]>('/transactions?limit=50');
      if (Array.isArray(data)) setTransactions(data);
    } catch {
      // silently fail
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTransactions();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={tw`flex-1 py-4 bg-[${DARK_BG}]`}>
      <StatusBar style="light" />
      <View style={tw`flex-1 px-5`}>
        <View style={tw`flex-row items-start mt-4 mb-7`}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={tw`w-[38px] h-[38px] rounded-xl bg-white/7 items-center justify-center mr-4`}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color="rgba(255,255,255,0.75)" />
          </TouchableOpacity>
          <View>
            <Text style={tw`text-white text-[20px] font-bold tracking-tight`}>Transaction history</Text>
            <Text style={tw`text-white/35 text-[12px] mt-0.5`}>{transactions.length} transactions</Text>
          </View>
        </View>

        <RefreshableScrollView onRefresh={onRefresh} refreshing={refreshing} showsVerticalScrollIndicator={false} contentContainerStyle={tw`pb-10`}>
          {loading ? (
            <View style={tw`items-center py-10`}>
              <ActivityIndicator color="rgba(255,255,255,0.3)" />
            </View>
          ) : transactions.length === 0 ? (
            <View style={tw`bg-white/4 border border-white/7 rounded-2xl p-10 items-center mt-6`}>
              <Ionicons name="receipt-outline" size={48} color="rgba(255,255,255,0.15)" />
              <Text style={tw`text-white/30 text-[14px] mt-4`}>No transactions found</Text>
            </View>
          ) : (
            transactions.map((txn) => (
              <View key={txn.id} style={tw`bg-white/4 border border-white/7 rounded-2xl mb-2.5 overflow-hidden`}>
                <TransactionItem txn={txn} />
              </View>
            ))
          )}
        </RefreshableScrollView>
      </View>
    </SafeAreaView>
  );
}
