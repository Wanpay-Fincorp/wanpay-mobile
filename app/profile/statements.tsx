import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState, useRef, useEffect } from 'react';
import {
  ActivityIndicator, Alert, Modal, SafeAreaView, Share, Text,
  TouchableOpacity, View, Animated,
} from 'react-native';
import tw from 'twrnc';
import { LIGHT_GRAY, PRIMARY_COLOR } from '@/constants/customConstants';
import { api } from '@/lib/api';
import RefreshableScrollView from '@/components/RefreshableScrollView';
import TransactionItem from '@/components/TransactionItem';
import type { Transaction } from '@/lib/types';
import DatePickerModal from '@/components/DatePickerModal';

export default function StatementsScreen() {
  const router = useRouter();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [format, setFormat] = useState<'json' | 'csv'>('json');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [showFormatPicker, setShowFormatPicker] = useState(false);
  const [showCalendar, setShowCalendar] = useState<'start' | 'end' | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, [fadeAnim]);

  const today = new Date().toISOString().split('T')[0];

  const handleSearch = async () => {
    if (!startDate) { Alert.alert('Error', 'Please select a start date'); return; }
    if (!endDate) { Alert.alert('Error', 'Please select an end date'); return; }
    if (startDate > endDate) { Alert.alert('Error', 'Start date must be before end date'); return; }
    setLoading(true);
    setHasSearched(true);
    try {
      const data = await api.get<Transaction[]>(`/statements?startDate=${startDate}&endDate=${endDate}`);
      if (Array.isArray(data)) setTransactions(data);
      else setTransactions([]);
    } catch {
      setTransactions([]);
      Alert.alert('Error', 'Failed to load statements. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (transactions.length === 0) return;
    try {
      let content: string;
      if (format === 'csv') {
        const csvData = await api.get<any>(`/statements?startDate=${startDate}&endDate=${endDate}&format=csv`);
        content = typeof csvData === 'string' ? csvData : JSON.stringify(csvData);
      } else {
        const header = `Statement from ${startDate} to ${endDate}\n\n`;
        const rows = transactions.map(t =>
          `${t.createdAt} | ${t.type} | ${t.status} | ₦${Number(t.amount).toLocaleString()} | ${t.description || ''}`
        ).join('\n');
        content = header + rows;
      }
      await Share.share({ message: content, title: `WanPay Statement ${startDate} - ${endDate}` });
    } catch {}
  };

  const totalInflow = transactions
    .filter(t => t.type === 'RECEIVED' || t.type === 'FUNDING')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const totalOutflow = transactions
    .filter(t => t.type === 'SENT' || t.type === 'BILLS' || t.type === 'WITHDRAWAL')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  return (
    <SafeAreaView style={tw`flex-1 pb-8 bg-[${LIGHT_GRAY}]`}>
      <StatusBar style="dark" />
      <Animated.View style={[{ opacity: fadeAnim }, tw`flex-1`]}>
        <View style={tw`px-3 pt-12 pb-4`}>
          <View style={tw`flex-row items-center`}>
            <TouchableOpacity onPress={() => router.back()} style={tw`rounded-full bg-white border border-gray-200 w-10 h-10 items-center justify-center mr-4`} activeOpacity={0.7}>
              <Ionicons name="arrow-back" size={22} color="#374151" />
            </TouchableOpacity>
            <View>
              <Text style={tw`text-xl font-bold text-gray-900`}>Statements</Text>
              <Text style={tw`text-xs text-gray-500`}>Download account statements</Text>
            </View>
          </View>
        </View>

        <RefreshableScrollView style={tw`flex-1 px-3`} showsVerticalScrollIndicator={false} contentContainerStyle={tw`pb-28`} keyboardShouldPersistTaps="handled">
          <View style={tw`mb-5`}>
            <Text style={tw`text-gray-500 text-[12px] font-semibold uppercase tracking-wider mb-3`}>Date range</Text>
            <View style={tw`bg-white rounded-2xl border border-gray-200 p-4`}>
              <View style={tw`mb-3`}>
                <Text style={tw`text-gray-400 text-[11px] mb-1.5`}>From</Text>
                <View style={tw`bg-[${LIGHT_GRAY}] rounded-xl px-4 h-[48px] flex-row items-center`}>
                  <Ionicons name="calendar-outline" size={16} color="#9CA3AF" style={tw`mr-2`} />
                  <TouchableOpacity
                    style={tw`flex-1 h-full justify-center`}
                    onPress={() => setShowCalendar('start')}
                  >
                    <Text style={tw`text-[14px] ${startDate ? 'text-gray-900' : 'text-gray-300'}`}>
                      {startDate || 'YYYY-MM-DD'}
                    </Text>
                  </TouchableOpacity>
                  {!startDate && (
                    <TouchableOpacity onPress={() => {
                      const d = new Date(); d.setMonth(d.getMonth() - 1);
                      setStartDate(d.toISOString().split('T')[0]);
                    }}>
                      <Text style={tw`text-blue-500 text-[11px] font-semibold`}>1M ago</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
              <View>
                <Text style={tw`text-gray-400 text-[11px] mb-1.5`}>To</Text>
                <View style={tw`bg-[${LIGHT_GRAY}] rounded-xl px-4 h-[48px] flex-row items-center`}>
                  <Ionicons name="calendar-outline" size={16} color="#9CA3AF" style={tw`mr-2`} />
                  <TouchableOpacity
                    style={tw`flex-1 h-full justify-center`}
                    onPress={() => setShowCalendar('end')}
                  >
                    <Text style={tw`text-[14px] ${endDate ? 'text-gray-900' : 'text-gray-300'}`}>
                      {endDate || 'YYYY-MM-DD'}
                    </Text>
                  </TouchableOpacity>
                  {!endDate && (
                    <TouchableOpacity onPress={() => setEndDate(today)}>
                      <Text style={tw`text-blue-500 text-[11px] font-semibold`}>Today</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
              <DatePickerModal
                visible={showCalendar === 'start'}
                value={startDate}
                onChange={setStartDate}
                onClose={() => setShowCalendar(null)}
                maxDate={new Date()}
              />
              <DatePickerModal
                visible={showCalendar === 'end'}
                value={endDate}
                onChange={setEndDate}
                onClose={() => setShowCalendar(null)}
                maxDate={new Date()}
              />
            </View>
          </View>

          <TouchableOpacity
            style={tw`bg-blue-600 rounded-2xl h-[52px] items-center justify-center flex-row gap-2 mb-5 ${loading ? 'opacity-60' : ''}`}
            activeOpacity={0.85}
            onPress={handleSearch}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Ionicons name="search-outline" size={18} color="white" />
            )}
            <Text style={tw`text-white font-semibold text-[15px]`}>{loading ? 'Loading...' : 'View Statement'}</Text>
          </TouchableOpacity>

          {hasSearched && !loading && (
            <>
              {transactions.length === 0 ? (
                <View style={tw`bg-white rounded-2xl border border-gray-200 p-10 items-center mb-5`}>
                  <Ionicons name="document-text-outline" size={48} color="#D1D5DB" />
                  <Text style={tw`text-gray-400 text-[14px] mt-3`}>No transactions in this period</Text>
                </View>
              ) : (
                <>
                  <View style={tw`bg-white rounded-2xl border border-gray-200 p-4 mb-5`}>
                    <View style={tw`flex-row justify-between mb-4`}>
                      <View style={tw`items-center flex-1`}>
                        <Text style={tw`text-gray-400 text-[11px] uppercase mb-1`}>Inflow</Text>
                        <Text style={tw`text-emerald-600 text-[16px] font-bold`}>₦{totalInflow.toLocaleString()}</Text>
                      </View>
                      <View style={tw`w-px bg-gray-200`} />
                      <View style={tw`items-center flex-1`}>
                        <Text style={tw`text-gray-400 text-[11px] uppercase mb-1`}>Outflow</Text>
                        <Text style={tw`text-red-500 text-[16px] font-bold`}>₦{totalOutflow.toLocaleString()}</Text>
                      </View>
                      <View style={tw`w-px bg-gray-200`} />
                      <View style={tw`items-center flex-1`}>
                        <Text style={tw`text-gray-400 text-[11px] uppercase mb-1`}>Net</Text>
                        <Text style={[tw`text-[16px] font-bold`, { color: totalInflow - totalOutflow >= 0 ? '#059669' : '#DC2626' }]}>
                          ₦{(totalInflow - totalOutflow).toLocaleString()}
                        </Text>
                      </View>
                    </View>
                    <Text style={tw`text-gray-400 text-[11px] text-center`}>{transactions.length} transactions · {startDate} to {endDate}</Text>
                  </View>

                  <View style={tw`flex-row gap-2 mb-5`}>
                    <TouchableOpacity
                      style={tw`flex-1 bg-white border border-gray-200 rounded-2xl h-[48px] items-center justify-center flex-row gap-2`}
                      activeOpacity={0.75}
                      onPress={() => setShowFormatPicker(true)}
                    >
                      <Ionicons name="document-outline" size={16} color={PRIMARY_COLOR} />
                      <Text style={tw`text-gray-700 text-[13px] font-semibold`}>.{format.toUpperCase()}</Text>
                      <Ionicons name="chevron-down" size={14} color="#9CA3AF" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={tw`flex-1 bg-blue-600 rounded-2xl h-[48px] items-center justify-center flex-row gap-2 ${transactions.length === 0 ? 'opacity-50' : ''}`}
                      activeOpacity={0.85}
                      disabled={transactions.length === 0}
                      onPress={handleShare}
                    >
                      <Ionicons name="share-outline" size={16} color="white" />
                      <Text style={tw`text-white font-semibold text-[13px]`}>Share</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={tw`bg-white rounded-2xl border border-gray-200 overflow-hidden`}>
                    <View style={tw`px-4 py-3 border-b border-gray-200`}>
                      <Text style={tw`text-gray-800 text-[13px] font-semibold`}>Transactions</Text>
                    </View>
                    {transactions.map((txn, i) => (
                      <View key={txn.id}>
                        <TransactionItem txn={txn} />
                        {i < transactions.length - 1 && <View style={tw`h-px bg-[${LIGHT_GRAY}] mx-5`} />}
                      </View>
                    ))}
                  </View>
                </>
              )}
            </>
          )}
        </RefreshableScrollView>
      </Animated.View>

      <Modal visible={showFormatPicker} transparent animationType="fade" onRequestClose={() => setShowFormatPicker(false)}>
        <TouchableOpacity style={tw`flex-1 bg-black/40 justify-center items-center`} activeOpacity={1} onPress={() => setShowFormatPicker(false)}>
          <TouchableOpacity activeOpacity={1} onPress={() => {}} style={tw`bg-white rounded-3xl w-[80%] overflow-hidden`}>
            <View style={tw`px-5 py-4 border-b border-gray-200`}>
              <Text style={tw`text-gray-900 text-[16px] font-bold text-center`}>Export Format</Text>
            </View>
            {(['json', 'csv'] as const).map(f => (
              <TouchableOpacity
                key={f}
                style={tw`px-5 py-4 flex-row items-center justify-between ${f !== 'csv' ? 'border-b border-gray-200' : ''}`}
                activeOpacity={0.75}
                onPress={() => { setFormat(f); setShowFormatPicker(false); }}
              >
                <View style={tw`flex-row items-center gap-3`}>
                  <Ionicons name={f === 'json' ? 'code-outline' : 'grid-outline'} size={20} color="#6B7280" />
                  <Text style={tw`text-gray-900 text-[14px] font-semibold`}>{f.toUpperCase()}</Text>
                </View>
                {format === f && <Ionicons name="checkmark-circle" size={20} color={PRIMARY_COLOR} />}
              </TouchableOpacity>
            ))}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}
