import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, SafeAreaView, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import tw from 'twrnc';
import { api } from '@/lib/api';
import RefreshableScrollView from '@/components/RefreshableScrollView';
import type { SavingsAccount } from '@/lib/types';
import { PRIMARY_COLOR, DEEP_PURPLE, SUCCESS_GREEN, WARNING_AMBER, CHARCOAL } from '@/constants/customConstants';

const fmt = (naira: number) => `₦${naira.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const STATUS_META: Record<SavingsAccount['status'], { bg: string; text: string; label: string }> = {
  ACTIVE: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Active' },
  LOCKED: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Locked' },
  MATURED: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Matured' },
  CLOSED: { bg: 'bg-gray-100', text: 'text-gray-500', label: 'Closed' },
};

export default function SavingsIndexScreen() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<SavingsAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const data = await api.get<SavingsAccount[]>('/savings');
      if (Array.isArray(data)) setAccounts(data);
    } catch {}
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const totalSaved = accounts.reduce((sum, a) => sum + (a.balanceNaira || 0), 0);

  return (
    <SafeAreaView style={tw`flex-1 pb-8 bg-gray-50`}>
      <StatusBar barStyle="dark-content" />
      <RefreshableScrollView onRefresh={onRefresh} refreshing={refreshing} showsVerticalScrollIndicator={false}>
        <View style={tw`flex-row items-center pt-12 px-5 mb-5`}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={tw`w-10 h-10 rounded-full bg-white border border-gray-200 items-center justify-center mr-4`}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color={CHARCOAL} />
          </TouchableOpacity>
          <View>
            <Text style={tw`text-[${CHARCOAL}] text-[22px] font-bold tracking-tight`}>Smart Savings</Text>
            <Text style={tw`text-gray-400 text-[12px] mt-0.5`}>Grow your money towards your goals</Text>
          </View>
        </View>

        <View style={tw`mx-5 bg-blue-600 rounded-[24px] p-5 mb-6 overflow-hidden`}>
          <View style={tw`flex-row items-start gap-3`}>
            <View style={tw`w-11 h-11 rounded-2xl bg-white/15 items-center justify-center`}>
              <Ionicons name="wallet-outline" size={22} color="#fff" />
            </View>
            <View style={tw`flex-1`}>
              <Text style={tw`text-white/60 text-[12px]`}>Total saved</Text>
              <Text style={tw`text-white text-[26px] font-bold tracking-tight mt-0.5`}>
                {fmt(totalSaved)}
              </Text>
              <Text style={tw`text-white/45 text-[11px] mt-1`}>
                {accounts.length} {accounts.length === 1 ? 'pot' : 'pots'} · earn interest up to 5% p.a.
              </Text>
            </View>
          </View>
        </View>

        <View style={tw`px-5 mb-5`}>
          <TouchableOpacity
            style={tw`bg-blue-600 rounded-2xl h-[52px] items-center justify-center flex-row gap-2`}
            activeOpacity={0.85}
            onPress={() => router.push('/savings/create')}
          >
            <Ionicons name="add" size={18} color="#fff" />
            <Text style={tw`text-white font-semibold text-[15px]`}>Create savings pot</Text>
          </TouchableOpacity>
        </View>

        <View style={tw`px-5`}>
          <Text style={tw`text-[${CHARCOAL}] text-[14px] font-semibold tracking-tight mb-4`}>Your pots</Text>

          {loading ? (
            <View style={tw`items-center py-12`}>
              <ActivityIndicator color="#9CA3AF" />
            </View>
          ) : accounts.length === 0 ? (
            <View style={tw`bg-white border border-gray-200 rounded-3xl p-8 items-center`}>
              <View style={tw`w-16 h-16 rounded-2xl bg-blue-100 items-center justify-center mb-4`}>
                <Ionicons name="flame-outline" size={30} color={PRIMARY_COLOR} />
              </View>
              <Text style={tw`text-[${CHARCOAL}] text-[15px] font-semibold mb-1`}>No savings pots yet</Text>
              <Text style={tw`text-gray-400 text-[12px] text-center leading-5 mb-5`}>
                Create a pot for a goal like travel, school fees or business capital.
              </Text>
              <TouchableOpacity
                style={tw`bg-blue-50 border border-blue-200 rounded-xl px-5 py-2.5`}
                activeOpacity={0.8}
                onPress={() => router.push('/savings/create')}
              >
                <Text style={tw`text-blue-600 text-[13px] font-semibold`}>Start saving</Text>
              </TouchableOpacity>
            </View>
          ) : (
            accounts.map((account) => {
              const status = STATUS_META[account.status] || STATUS_META.ACTIVE;
              const targetNaira = account.targetAmount ? account.targetAmount / 100 : null;
              const progress = targetNaira ? Math.min(1, (account.balanceNaira || 0) / targetNaira) : null;
              const isFixed = account.type === 'FIXED';
              return (
                <TouchableOpacity
                  key={account.id}
                  style={tw`bg-white border border-gray-200 rounded-3xl p-5 mb-3`}
                  activeOpacity={0.75}
                  onPress={() => router.push(`/savings/${account.id}`)}
                >
                  <View style={tw`flex-row justify-between items-start mb-4`}>
                    <View style={tw`flex-row items-center gap-3 flex-1`}>
                      <View style={tw`w-11 h-11 rounded-2xl ${isFixed ? 'bg-violet-100' : 'bg-blue-100'} items-center justify-center`}>
                        <Ionicons name={isFixed ? 'lock-closed-outline' : 'flame-outline'} size={20} color={isFixed ? DEEP_PURPLE : PRIMARY_COLOR} />
                      </View>
                      <View style={tw`flex-1`}>
                        <Text style={tw`text-[${CHARCOAL}] text-[15px] font-semibold tracking-tight`}>{account.name}</Text>
                        <View style={tw`flex-row items-center gap-1.5 mt-1`}>
                          <View style={tw`${status.bg} px-2 py-0.5 rounded-full`}>
                            <Text style={tw`${status.text} text-[10px] font-semibold`}>{status.label}</Text>
                          </View>
                          <View style={tw`${isFixed ? 'bg-violet-100' : 'bg-blue-100'} px-2 py-0.5 rounded-full`}>
                            <Text style={tw`${isFixed ? 'text-violet-700' : 'text-blue-700'} text-[10px] font-semibold`}>
                              {isFixed ? 'Fixed' : 'Flexible'}
                            </Text>
                          </View>
                          {account.interestRate ? (
                            <Text style={tw`text-emerald-600 text-[10px] font-semibold`}>{account.interestRate}% p.a.</Text>
                          ) : null}
                        </View>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
                  </View>

                  <Text style={tw`text-[${CHARCOAL}] text-[24px] font-bold tracking-tight mb-0.5`}>{fmt(account.balanceNaira || 0)}</Text>

                  {targetNaira ? (
                    <>
                      <View style={tw`h-2 bg-gray-100 rounded-full mt-3 overflow-hidden`}>
                        <View
                          style={[tw`h-full rounded-full`, {
                            width: `${Math.max(4, progress! * 100)}%`,
                            backgroundColor: isFixed ? DEEP_PURPLE : SUCCESS_GREEN,
                          }]}
                        />
                      </View>
                      <Text style={tw`text-gray-400 text-[11px] mt-1.5`}>
                        {Math.round((progress || 0) * 100)}% of {fmt(targetNaira)} goal
                      </Text>
                    </>
                  ) : (
                    <View style={tw`flex-row items-center gap-1.5 mt-3`}>
                      <Ionicons name="trophy-outline" size={13} color={WARNING_AMBER} />
                      <Text style={tw`text-gray-400 text-[11px]`}>Set a goal to track progress</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </RefreshableScrollView>
    </SafeAreaView>
  );
}