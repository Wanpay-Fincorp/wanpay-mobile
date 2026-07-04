import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Animated, Dimensions, Modal, SafeAreaView, StatusBar, Text, TouchableOpacity, View, ActivityIndicator, ScrollView } from 'react-native';
import tw from 'twrnc';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import RefreshableScrollView from '@/components/RefreshableScrollView';
import TransactionItem from '@/components/TransactionItem';
import type { Wallet, Transaction } from '@/lib/types';
import { PRIMARY_COLOR, CHARCOAL, LIGHT_GRAY, SUCCESS_GREEN, VIBRANT_ORANGE, DEEP_PURPLE } from '@/constants/customConstants';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface QuickAction {
  id: string;
  name: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  screen: string;
  color: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  { id: 'transfer', name: 'Transfer', icon: 'arrow-forward', screen: 'transfer', color: PRIMARY_COLOR },
  { id: 'bills',    name: 'Bills',    icon: 'document-text', screen: 'bills',    color: VIBRANT_ORANGE },
  { id: 'growth',   name: 'Growth',   icon: 'trending-up',   screen: 'grants',   color: DEEP_PURPLE },
  { id: 'receive',  name: 'Receive',  icon: 'arrow-down',    screen: 'receive',  color: SUCCESS_GREEN },
];

interface Promo {
  id: string;
  icon: string;
  title: string;
  desc: string;
  bg: string;
  accent: string;
}

const PROMOS: Promo[] = [
  { id: 'save',  icon: 'wallet',    title: 'Save for Goals',    desc: 'Set targets & earn interest',   bg: '#EEF2FF', accent: PRIMARY_COLOR },
  { id: 'loan',  icon: 'cash',      title: 'Quick Loan',        desc: 'Get up to ₦500,000 instantly',  bg: '#F0FDF4', accent: SUCCESS_GREEN },
  { id: 'refer', icon: 'people',    title: 'Refer & Earn',      desc: 'Earn ₦200 per referral',        bg: '#FFF7ED', accent: VIBRANT_ORANGE },
];

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [showBalance, setShowBalance] = useState(true);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [copied, setCopied] = useState(false);
  const greeting = getGreeting();

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, [fadeAnim]);

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
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getName = () => {
    const name = user?.fullName || user?.phone || 'User';
    return name.replace(/\b\w/g, c => c.toUpperCase());
  };

  const getInitials = () => {
    const name = getName();
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-[${LIGHT_GRAY}]`}>
      <StatusBar barStyle="light-content" />
      <RefreshableScrollView onRefresh={onRefresh} refreshing={refreshing} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={tw`bg-[${PRIMARY_COLOR}] px-6 py-6 rounded-b-lg`}>
            <View style={tw`flex-row justify-between items-center mb-6`}>
              <View style={tw`flex-row items-center gap-3.5`}>
                <View style={tw`w-12 h-12 rounded-full bg-white/20 items-center justify-center border-2 border-white/30`}>
                  <Text style={tw`text-white font-bold text-[16px]`}>{getInitials()}</Text>
                </View>
                <View>
                  <Text style={tw`text-white/60 text-[12px] mb-0.5 font-medium`}>{greeting}</Text>
                  <Text style={tw`text-white text-[20px] font-bold tracking-tight`} numberOfLines={1}>{getName()}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={tw`w-10 h-10 rounded-full bg-white/15 items-center justify-center`}
                activeOpacity={0.75}
                onPress={() => router.push('/notifications')}
              >
                <Ionicons name="notifications-outline" size={20} color="#fff" />
                <View style={tw`absolute top-0 right-0.5 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-[${PRIMARY_COLOR}]`} />
              </TouchableOpacity>
            </View>

            <View style={tw`bg-white border border-gray-100/20 rounded-2xl px-5 py-2`}>
              <View style={tw`flex-row items-center justify-between mb-3`}>
                <View style={tw`flex-row items-center gap-2.5`}>
                  <View style={tw`w-8 h-8 rounded-lg bg-[${PRIMARY_COLOR}] items-center justify-center`}>
                    <Ionicons name="wallet-outline" size={16} color="#fff" />
                  </View>
                  <Text style={tw`text-gray-500 text-[12px] font-semibold`}>Wallet Balance</Text>
                </View>
                <TouchableOpacity onPress={() => setShowBalance(!showBalance)} activeOpacity={0.7} style={tw`w-8 h-8 rounded-full bg-gray-100 items-center justify-center`}>
                  <Ionicons name={showBalance ? 'eye-outline' : 'eye-off-outline'} size={16} color="#6B7280" />
                </TouchableOpacity>
              </View>
              {loading ? (
                <View style={tw`h-[38px] justify-center mb-4`}>
                  <ActivityIndicator color={PRIMARY_COLOR} />
                </View>
              ) : (
                <Text style={tw`text-[${CHARCOAL}] text-[34px] font-bold tracking-tight mb-5`}>
                  {showBalance
                    ? `₦${(wallet?.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                    : '₦ ••••••'}
                </Text>
              )}
              <View style={tw`bg-[${LIGHT_GRAY}] rounded-xl px-4 py-3 flex-row items-center justify-between`}>
                <TouchableOpacity
                  style={tw`bg-[${PRIMARY_COLOR}] rounded-full py-2 px-5 flex-row items-center gap-1.5`}
                  activeOpacity={0.85}
                  onPress={() => setShowAddMoney(true)}
                >
                  <Ionicons name="add" size={16} color="#fff" />
                  <Text style={tw`text-white text-[13px] font-bold`}>Fund wallet</Text>
                </TouchableOpacity>
                <View style={tw`flex-row items-center gap-2`}>
                  <Text style={tw`text-gray-400 text-[12px] font-mono tracking-wider`}>{wallet?.accountNumber || ''}</Text>
                  <TouchableOpacity
                    onPress={() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                    activeOpacity={0.7}
                  >
                    <Ionicons name={copied ? 'checkmark-circle' : 'copy-outline'} size={16} color={copied ? SUCCESS_GREEN : '#9CA3AF'} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          <View style={tw`px-5 mt-6`}>
            <View style={tw`flex-row justify-between items-center mb-4`}>
              <Text style={tw`text-[${CHARCOAL}] text-[17px] font-bold`}>Quick actions</Text>
            </View>
            <View style={tw`flex-row gap-3`}>
              {QUICK_ACTIONS.map(action => (
                <TouchableOpacity
                  key={action.id}
                  style={tw`flex-1 bg-white rounded-2xl py-5 items-center gap-3`}
                  activeOpacity={0.8}
                  onPress={() =>
                    action.id === 'receive'
                      ? setShowAddMoney(true)
                      : router.push(`/(tabs)/${action.screen}` as any)
                  }
                >
                  <View style={[tw`w-12 h-12 rounded-2xl items-center justify-center`, { backgroundColor: `${action.color}15` }]}>
                    <Ionicons name={action.icon as any} size={22} color={action.color} />
                  </View>
                  <Text style={tw`text-[${CHARCOAL}] text-[13px] font-semibold`}>{action.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={tw`px-5 mt-7`}>
            <Text style={tw`text-[${CHARCOAL}] text-[17px] font-bold mb-4`}>Offers for you</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={tw`gap-3`} snapToInterval={SCREEN_WIDTH - 50} decelerationRate="fast">
              {PROMOS.map(promo => (
                <View
                  key={promo.id}
                  style={[{ backgroundColor: promo.bg, width: SCREEN_WIDTH - 70 }, tw`rounded-2xl p-5`]}
                >
                  <View style={tw`flex-row items-start gap-4`}>
                    <View style={[tw`w-11 h-11 rounded-xl items-center justify-center`, { backgroundColor: promo.accent }]}>
                      <Ionicons name={promo.icon as any} size={20} color="#fff" />
                    </View>
                    <View style={tw`flex-1`}>
                      <Text style={tw`text-[${CHARCOAL}] text-[14px] font-bold mb-1`}>{promo.title}</Text>
                      <Text style={tw`text-gray-500 text-[12px] leading-5`}>{promo.desc}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>

          <View style={tw`px-5 mt-7 pb-28`}>
            <View style={tw`flex-row justify-between items-center mb-4`}>
              <Text style={tw`text-[${CHARCOAL}] text-[17px] font-bold`}>Recent transactions</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/history')} activeOpacity={0.7}>
                <Text style={tw`text-[${PRIMARY_COLOR}] text-[13px] font-semibold`}>See all</Text>
              </TouchableOpacity>
            </View>

            {loading ? (
              <View style={tw`gap-3`}>
                {[1, 2, 3].map(i => (
                  <View key={i} style={tw`bg-white rounded-2xl p-4 flex-row items-center`}>
                    <View style={tw`w-10 h-10 rounded-xl bg-[${LIGHT_GRAY}] mr-3`} />
                    <View style={tw`flex-1 gap-2`}>
                      <View style={tw`h-3 bg-[${LIGHT_GRAY}] rounded-full w-3/5`} />
                      <View style={tw`h-2.5 bg-[${LIGHT_GRAY}] rounded-full w-2/5`} />
                    </View>
                    <View style={tw`items-end gap-1.5`}>
                      <View style={tw`h-3 bg-[${LIGHT_GRAY}] rounded-full w-16`} />
                      <View style={tw`h-2 bg-[${LIGHT_GRAY}] rounded-full w-10`} />
                    </View>
                  </View>
                ))}
              </View>
            ) : recentTransactions.length === 0 ? (
              <View style={tw`bg-white rounded-2xl p-10 items-center`}>
                <View style={tw`w-16 h-16 rounded-2xl bg-[${LIGHT_GRAY}] items-center justify-center mb-4`}>
                  <Ionicons name="receipt-outline" size={28} color="#D1D5DB" />
                </View>
                <Text style={tw`text-[${CHARCOAL}] text-[15px] font-semibold`}>No transactions yet</Text>
                <Text style={tw`text-gray-400 text-[13px] mt-1.5`}>Make a transfer to get started</Text>
              </View>
            ) : (
              <View style={tw`bg-white rounded-2xl overflow-hidden`}>
                {recentTransactions.map((txn, index) => (
                  <View key={txn.id}>
                    <TransactionItem txn={txn} />
                    {index < recentTransactions.length - 1 && (
                      <View style={tw`h-px bg-[${LIGHT_GRAY}] mx-5`} />
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>
        </Animated.View>
      </RefreshableScrollView>

      <Modal visible={showAddMoney} animationType="slide" transparent onRequestClose={() => setShowAddMoney(false)}>
        <TouchableOpacity style={tw`flex-1 bg-black/40 justify-end`} activeOpacity={1} onPress={() => setShowAddMoney(false)}>
          <TouchableOpacity activeOpacity={1} onPress={() => {}} style={tw`bg-white rounded-t-3xl pt-2 pb-10`}>
            <View style={tw`items-center mb-4`}>
              <View style={tw`w-10 h-1 rounded-full bg-gray-300 mb-6`} />
            </View>

            <View style={tw`flex-row items-center gap-3 px-6 mb-6`}>
              <View style={tw`w-12 h-12 rounded-2xl bg-[${PRIMARY_COLOR}]/10 items-center justify-center`}>
                <Ionicons name="wallet-outline" size={24} color={PRIMARY_COLOR} />
              </View>
              <View>
                <Text style={tw`text-[${CHARCOAL}] text-[20px] font-bold`}>Fund wallet</Text>
                <Text style={tw`text-gray-400 text-[13px] mt-0.5`}>Choose how to add money</Text>
              </View>
            </View>

            <View style={tw`px-6 gap-3 mb-6`}>
              <View style={tw`bg-[${LIGHT_GRAY}] rounded-2xl p-5`}>
                <View style={tw`flex-row items-center gap-3 mb-5`}>
                  <View style={tw`w-12 h-12 rounded-2xl bg-[${PRIMARY_COLOR}] items-center justify-center`}>
                    <Ionicons name="business-outline" size={22} color="#fff" />
                  </View>
                  <View style={tw`flex-1`}>
                    <Text style={tw`text-[${CHARCOAL}] text-[15px] font-bold`}>Bank Transfer</Text>
                    <Text style={tw`text-gray-400 text-[12px] mt-0.5`}>Transfer from any Nigerian bank</Text>
                  </View>
                </View>

                {wallet?.accountNumber ? (
                  <View style={tw`bg-white rounded-xl p-4 border border-gray-200`}>
                    <View style={tw`flex-row items-center justify-between`}>
                      <View>
                        <Text style={tw`text-gray-400 text-[10px] font-medium mb-1`}>Account number</Text>
                        <Text style={tw`text-[${CHARCOAL}] text-[20px] font-bold tracking-[4px]`}>{wallet.accountNumber}</Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                        activeOpacity={0.7}
                        style={tw`bg-[${PRIMARY_COLOR}]/10 rounded-xl px-4 py-3 flex-row items-center gap-1.5`}
                      >
                        <Ionicons name={copied ? 'checkmark' : 'copy'} size={16} color={copied ? SUCCESS_GREEN : PRIMARY_COLOR} />
                        <Text style={tw`text-[${PRIMARY_COLOR}] text-[12px] font-semibold`}>{copied ? 'Copied' : 'Copy'}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : null}

                <Text style={tw`text-gray-400 text-[12px] mt-4 leading-5`}>
                  Use the account number above to transfer from your bank. Funds will be credited instantly.
                </Text>
              </View>

              <View style={tw`bg-[${LIGHT_GRAY}] rounded-2xl p-5 flex-row items-center gap-3 opacity-50`}>
                <View style={tw`w-12 h-12 rounded-2xl bg-gray-200 items-center justify-center`}>
                  <Ionicons name="card-outline" size={22} color="#9CA3AF" />
                </View>
                <View>
                  <Text style={tw`text-gray-500 text-[15px] font-semibold`}>Debit Card</Text>
                  <Text style={tw`text-gray-400 text-[12px] mt-0.5`}>Coming soon</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={tw`mx-6 bg-[${LIGHT_GRAY}] rounded-2xl h-[50px] items-center justify-center`}
              activeOpacity={0.85}
              onPress={() => setShowAddMoney(false)}
            >
              <Text style={tw`text-gray-600 font-semibold text-[15px]`}>Close</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}
