import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ActivityIndicator, Modal, Animated } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import tw from 'twrnc';
import { PRIMARY_COLOR, CHARCOAL, LIGHT_GRAY, SUCCESS_GREEN } from '@/constants/customConstants';
import { api } from '@/lib/api';
import RefreshableScrollView from '@/components/RefreshableScrollView';
import TransactionItem from '@/components/TransactionItem';
import type { Transaction } from '@/lib/types';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: { label: 'Pending', color: '#F59E0B', bg: '#FEF3C7' },
  PROCESSING: { label: 'Processing', color: '#3B82F6', bg: '#DBEAFE' },
  COMPLETED: { label: 'Completed', color: '#10B981', bg: '#D1FAE5' },
  FAILED: { label: 'Failed', color: '#EF4444', bg: '#FEE2E2' },
  REVERSED: { label: 'Reversed', color: '#8B5CF6', bg: '#EDE9FE' },
};

const TYPE_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
  SENT: { label: 'Transfer Sent', icon: 'arrow-up-circle', color: '#EF4444' },
  RECEIVED: { label: 'Transfer Received', icon: 'arrow-down-circle', color: '#10B981' },
  BILLS: { label: 'Bill Payment', icon: 'receipt-outline', color: '#F59E0B' },
  FUNDING: { label: 'Wallet Funding', icon: 'add-circle', color: '#10B981' },
  WITHDRAWAL: { label: 'Withdrawal', icon: 'remove-circle', color: '#EF4444' },
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function DetailRow({ label, value, isMono }: { label: string; value: string; isMono?: boolean }) {
  if (!value) return null;
  return (
    <View style={tw`flex-row justify-between items-center py-3`}>
      <Text style={tw`text-gray-400 text-[13px]`}>{label}</Text>
      <Text style={[tw`text-[${CHARCOAL}] text-[13px] font-semibold text-right max-w-[55%]`, isMono && tw`font-mono`]} numberOfLines={2}>{value}</Text>
    </View>
  );
}

export default function HistoryScreen() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (selectedTxn) {
      slideAnim.setValue(0);
      Animated.spring(slideAnim, { toValue: 1, damping: 20, stiffness: 200, useNativeDriver: true }).start();
    }
  }, [selectedTxn, slideAnim]);

  useFocusEffect(
    useCallback(() => {
      loadTransactions();
    }, [])
  );

  const loadTransactions = async () => {
    try {
      const data = await api.get<Transaction[]>('/transactions?limit=50');
      if (Array.isArray(data)) setTransactions(data);
    } catch {}
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTransactions();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-[${LIGHT_GRAY}]`}>
      <StatusBar style="dark" />
      <View style={tw`flex-1 px-5`}>
        <View style={tw`flex-row items-center mt-14 mb-6`}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={tw`w-10 h-10 rounded-full bg-white border border-gray-200 items-center justify-center mr-4`}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color={CHARCOAL} />
          </TouchableOpacity>
          <View>
            <Text style={tw`text-[${CHARCOAL}] text-[22px] font-bold tracking-tight`}>History</Text>
            <Text style={tw`text-gray-400 text-[12px] mt-0.5`}>{transactions.length} transactions</Text>
          </View>
        </View>

        <RefreshableScrollView onRefresh={onRefresh} refreshing={refreshing} showsVerticalScrollIndicator={false} contentContainerStyle={tw`pb-28`}>
          {loading ? (
            <View style={tw`items-center py-16`}>
              <ActivityIndicator size="large" color={PRIMARY_COLOR} />
            </View>
          ) : transactions.length === 0 ? (
            <View style={tw`bg-white rounded-2xl p-12 items-center mt-4`}>
              <View style={tw`w-16 h-16 rounded-2xl bg-[${LIGHT_GRAY}] items-center justify-center mb-4`}>
                <Ionicons name="receipt-outline" size={28} color="#D1D5DB" />
              </View>
              <Text style={tw`text-[${CHARCOAL}] text-[15px] font-semibold`}>No transactions</Text>
              <Text style={tw`text-gray-400 text-[13px] mt-1.5 text-center`}>Your transaction history will appear here</Text>
            </View>
          ) : (
            <View style={tw`bg-white rounded-2xl overflow-hidden`}>
              {transactions.map((txn, i) => (
                <View key={txn.id}>
                  <TransactionItem txn={txn} onPress={() => setSelectedTxn(txn)} />
                  {i < transactions.length - 1 && <View style={tw`h-px bg-[${LIGHT_GRAY}] mx-5`} />}
                </View>
              ))}
            </View>
          )}
        </RefreshableScrollView>
      </View>

      <Modal visible={!!selectedTxn} transparent animationType="fade" onRequestClose={() => setSelectedTxn(null)}>
        <TouchableOpacity style={tw`flex-1 bg-black/50 justify-center px-5`} activeOpacity={1} onPress={() => setSelectedTxn(null)}>
          <TouchableOpacity activeOpacity={1} onPress={() => {}}>
            <Animated.View style={[tw`bg-white rounded-3xl overflow-hidden`, { transform: [{ translateY: slideAnim.interpolate({ inputRange: [0, 1], outputRange: [50, 0] }) }], opacity: slideAnim }]}>
              {selectedTxn && (() => {
                const txn = selectedTxn;
                const tc = TYPE_CONFIG[txn.type] || { label: txn.type, icon: 'ellipse', color: '#6B7280' };
                const sc = STATUS_CONFIG[txn.status] || { label: txn.status, color: '#6B7280', bg: '#F3F4F6' };
                const isPositive = txn.type === 'RECEIVED' || txn.type === 'FUNDING';

                return (
                  <>
                    <View style={tw`items-center pt-8 pb-6 px-6 bg-[${LIGHT_GRAY}]`}>
                      <View style={[tw`w-16 h-16 rounded-2xl items-center justify-center mb-4`, { backgroundColor: `${tc.color}18` }]}>
                        <Ionicons name={tc.icon as any} size={32} color={tc.color} />
                      </View>
                      <Text style={tw`text-[${CHARCOAL}] text-[18px] font-bold text-center`}>{tc.label}</Text>
                      <Text style={[tw`text-[32px] font-bold mt-2`, { color: isPositive ? SUCCESS_GREEN : CHARCOAL }]}>
                        {isPositive ? '+' : '-'}₦{(Number(txn.amount) / 100).toLocaleString()}
                      </Text>
                      <View style={[tw`rounded-full px-3 py-1 mt-3`, { backgroundColor: sc.bg }]}>
                        <Text style={[tw`text-[12px] font-semibold`, { color: sc.color }]}>{sc.label}</Text>
                      </View>
                    </View>

                    <View style={tw`px-6 pt-5 pb-8`}>
                      <Text style={tw`text-[${CHARCOAL}] text-[14px] font-bold mb-2`}>Transaction details</Text>
                      <View style={tw`border-t border-[${LIGHT_GRAY}]`}>
                        <DetailRow label="Reference" value={txn.reference} isMono />
                        <DetailRow label="Description" value={txn.description || '—'} />
                        <DetailRow label="Date & time" value={formatDate(txn.createdAt)} />
                        <DetailRow label="Fee" value={txn.fee > 0 ? `₦${txn.fee.toLocaleString()}` : 'Free'} />
                        {txn.recipientName && <DetailRow label="Recipient" value={txn.recipientName} />}
                        {txn.recipientAccount && <DetailRow label="Account" value={txn.recipientAccount} isMono />}
                        {txn.recipientBank && <DetailRow label="Bank" value={txn.recipientBank} />}
                        {txn.billProvider && <DetailRow label="Provider" value={txn.billProvider} />}
                        {txn.billCategory && <DetailRow label="Category" value={txn.billCategory} />}
                        {txn.billRecipient && <DetailRow label="Recipient" value={txn.billRecipient} />}
                      </View>
                    </View>

                    <View style={tw`px-6 pb-8`}>
                      <TouchableOpacity
                        style={tw`bg-[${LIGHT_GRAY}] rounded-2xl h-[50px] items-center justify-center`}
                        activeOpacity={0.85}
                        onPress={() => setSelectedTxn(null)}
                      >
                        <Text style={tw`text-[${CHARCOAL}] font-semibold text-[15px]`}>Close</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                );
              })()}
            </Animated.View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}
