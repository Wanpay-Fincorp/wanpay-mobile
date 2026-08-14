import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator, Alert, KeyboardAvoidingView, Modal, Platform, SafeAreaView,
  Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import tw from 'twrnc';
import { api, getReauthToken } from '@/lib/api';
import RefreshableScrollView from '@/components/RefreshableScrollView';
import PinModal from '@/components/PinModal';
import FormattedDate from '@/components/FormattedDate';
import type { SavingsAccount, SavingsMovement, SavingsSchedule, SavingsFrequency } from '@/lib/types';
import {
  PRIMARY_COLOR, DEEP_PURPLE, SUCCESS_GREEN, WARNING_AMBER, CHARCOAL, LIGHT_GRAY,
} from '@/constants/customConstants';

const fmt = (naira: number) => `₦${naira.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const STATUS_META: Record<SavingsAccount['status'], { bg: string; text: string; label: string }> = {
  ACTIVE: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Active' },
  LOCKED: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Locked' },
  MATURED: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Matured' },
  CLOSED: { bg: 'bg-gray-100', text: 'text-gray-500', label: 'Closed' },
};

const MOVEMENT_META: Record<SavingsMovement['type'], { icon: any; bg: string; color: string; label: string }> = {
  DEPOSIT: { icon: 'arrow-down-outline', bg: 'bg-emerald-100', color: '#059669', label: 'Deposit' },
  WITHDRAWAL: { icon: 'arrow-up-outline', bg: 'bg-blue-100', color: PRIMARY_COLOR, label: 'Withdrawal' },
  INTEREST: { icon: 'trending-up-outline', bg: 'bg-violet-100', color: DEEP_PURPLE, label: 'Interest' },
  PENALTY: { icon: 'alert-outline', bg: 'bg-red-100', color: '#DC2626', label: 'Penalty' },
};

const FREQ_LABEL: Record<SavingsFrequency, string> = {
  ONCE: 'Once',
  DAILY: 'Daily',
  WEEKLY: 'Weekly',
  MONTHLY: 'Monthly',
};

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function scheduleSummary(s: SavingsSchedule) {
  if (s.frequency === 'DAILY') return 'Every day';
  if (s.frequency === 'WEEKLY') return `Every ${WEEKDAYS[s.dayOfWeek ?? 0]}`;
  if (s.frequency === 'MONTHLY') return `Every month on day ${s.dayOfMonth ?? 1}`;
  return 'A one-off save';
}

export default function SavingsDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [account, setAccount] = useState<SavingsAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [showDeposit, setShowDeposit] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositing, setDepositing] = useState(false);

  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [pinAction, setPinAction] = useState<'withdraw' | 'close' | null>(null);
  const [withdrawing, setWithdrawing] = useState(false);
  const [closing, setClosing] = useState(false);

  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduleAmount, setScheduleAmount] = useState('');
  const [scheduleFreq, setScheduleFreq] = useState<SavingsFrequency>('MONTHLY');
  const [scheduleDay, setScheduleDay] = useState<string>('');
  const [creatingSchedule, setCreatingSchedule] = useState(false);

  const loadData = useCallback(async () => {
    if (!id) return;
    try {
      const data = await api.get<SavingsAccount>(`/savings/${id}`);
      setAccount(data);
    } catch {}
    setLoading(false);
  }, [id]);

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

  const handleAmountChange = (setter: (v: string) => void) => (value: string) => {
    const numeric = value.replace(/[^0-9.]/g, '');
    const segments = numeric.split('.');
    if (segments.length > 2) return;
    if (segments[1] && segments[1].length > 2) return;
    setter(numeric);
  };

  const doDeposit = async () => {
    const amount = parseFloat(depositAmount);
    if (!amount || amount <= 0) {
      Alert.alert('Invalid amount', 'Enter a valid amount to deposit.');
      return;
    }
    setDepositing(true);
    try {
      await api.post(`/savings/${id}/deposit`, { amount });
      setShowDeposit(false);
      setDepositAmount('');
      await loadData();
      Alert.alert('Deposit made', `${fmt(amount)} added to ${account?.name || 'your pot'}.`);
    } catch (err: any) {
      Alert.alert('Deposit failed', err?.message || 'Please try again.');
    } finally {
      setDepositing(false);
    }
  };

  const doWithdraw = async (pin: string) => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) return;
    setWithdrawing(true);
    try {
      const reauthToken = await getReauthToken(pin);
      await api.post(`/savings/${id}/withdraw`, { amount }, true, { 'x-reauth-token': reauthToken });
      setShowWithdraw(false);
      setPinAction(null);
      setWithdrawAmount('');
      await loadData();
      Alert.alert('Withdrawal made', `${fmt(amount)} moved to your wallet.`);
    } catch (err: any) {
      Alert.alert('Withdrawal failed', err?.message || 'Please try again.');
    } finally {
      setWithdrawing(false);
    }
  };

  const doClose = async (pin: string) => {
    if (!id) return;
    setClosing(true);
    try {
      const reauthToken = await getReauthToken(pin);
      await api.post(`/savings/${id}/close`, {}, true, { 'x-reauth-token': reauthToken });
      setPinAction(null);
      Alert.alert('Pot closed', 'Any balance has been moved back to your wallet.', [
        { text: 'Done', onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert('Could not close pot', err?.message || 'Please try again.');
    } finally {
      setClosing(false);
    }
  };

  const confirmClose = () => {
    setPinAction('close');
  };

  const cancelSchedule = async (scheduleId: string) => {
    try {
      await api.delete(`/savings/schedules/${scheduleId}`);
      await loadData();
    } catch {}
  };

  const doCreateSchedule = async () => {
    const amount = parseFloat(scheduleAmount);
    if (!amount || amount <= 0) {
      Alert.alert('Invalid amount', 'Enter how much to auto-save.');
      return;
    }
    setCreatingSchedule(true);
    try {
      const body: Record<string, any> = { amount, frequency: scheduleFreq };
      if (scheduleFreq === 'MONTHLY' && scheduleDay) {
        const day = parseInt(scheduleDay, 10);
        if (!isNaN(day) && day >= 1 && day <= 31) body.dayOfMonth = day;
      }
      await api.post(`/savings/${id}/schedules`, body);
      setShowSchedule(false);
      setScheduleAmount('');
      setScheduleDay('');
      await loadData();
      Alert.alert('Auto-save on', `We'll save ${fmt(amount)} ${scheduleFreq === 'ONCE' ? 'once' : scheduleFreq.toLowerCase()}.`);
    } catch (err: any) {
      Alert.alert('Could not set up auto-save', err?.message || 'Please try again.');
    } finally {
      setCreatingSchedule(false);
    }
  };

  const isLocked = account?.status === 'LOCKED';

  if (loading) {
    return (
      <SafeAreaView style={tw`flex-1 bg-gray-50 items-center justify-center`}>
        <StatusBar style="dark" />
        <ActivityIndicator color="#9CA3AF" />
      </SafeAreaView>
    );
  }

  if (!account) {
    return (
      <SafeAreaView style={tw`flex-1 bg-gray-50 items-center justify-center px-8`}>
        <StatusBar style="dark" />
        <Ionicons name="alert-circle-outline" size={40} color="#9CA3AF" />
        <Text style={tw`text-gray-500 text-[14px] mt-4 text-center`}>This savings pot could not be found.</Text>
        <TouchableOpacity style={tw`mt-6`} onPress={() => router.back()} activeOpacity={0.7}>
          <Text style={tw`text-blue-600 text-[14px] font-semibold`}>Go back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const status = STATUS_META[account.status] || STATUS_META.ACTIVE;
  const isFixed = account.type === 'FIXED';
  const targetNaira = account.targetAmount ? account.targetAmount / 100 : null;
  const progress = targetNaira ? Math.min(1, (account.balanceNaira || 0) / targetNaira) : null;
  const isClosed = account.status === 'CLOSED';

  return (
    <SafeAreaView style={tw`flex-1 pb-8 bg-gray-50`}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={tw`flex-1`}>
        <RefreshableScrollView onRefresh={onRefresh} refreshing={refreshing} showsVerticalScrollIndicator={false} contentContainerStyle={tw`pb-28`}>
          <View style={tw`flex-row items-center pt-12 px-5 mb-5`}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={tw`w-10 h-10 rounded-full bg-white border border-gray-200 items-center justify-center mr-4`}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={20} color={CHARCOAL} />
            </TouchableOpacity>
            <View style={tw`flex-1`}>
              <Text style={tw`text-[${CHARCOAL}] text-[22px] font-bold tracking-tight`} numberOfLines={1}>{account.name}</Text>
              <Text style={tw`text-gray-400 text-[12px] mt-0.5`}>Smart savings pot</Text>
            </View>
          </View>

          <View style={tw`mx-5 bg-blue-600 rounded-[24px] p-5 mb-6 overflow-hidden`}>
            <View style={tw`flex-row justify-between items-center mb-4`}>
              <View style={tw`flex-row items-center gap-2`}>
                <View style={tw`${status.bg} px-2.5 py-1 rounded-full`}>
                  <Text style={tw`${status.text} text-[11px] font-semibold`}>{status.label}</Text>
                </View>
                <View style={tw`bg-white/15 px-2.5 py-1 rounded-full`}>
                  <Text style={tw`text-white text-[11px] font-semibold`}>{isFixed ? 'Fixed' : 'Flexible'}</Text>
                </View>
              </View>
              {account.interestRate ? (
                <View style={tw`items-end`}>
                  <Text style={tw`text-emerald-300 text-[12px] font-bold`}>{account.interestRate}% p.a.</Text>
                  <Text style={tw`text-white/45 text-[10px]`}>interest rate</Text>
                </View>
              ) : null}
            </View>

            <Text style={tw`text-white/60 text-[12px]`}>Balance</Text>
            <Text style={tw`text-white text-[30px] font-bold tracking-tight mt-0.5 mb-4`}>{fmt(account.balanceNaira || 0)}</Text>

            {isFixed && account.lockedUntil ? (
              <View style={tw`bg-white/12 border border-white/15 rounded-2xl p-3 flex-row items-center gap-2.5`}>
                <Ionicons name={isLocked ? 'lock-closed-outline' : 'checkmark-circle-outline'} size={18} color={isLocked ? '#FBBF24' : '#6EE7B7'} />
                <Text style={tw`text-white/80 text-[12px] flex-1`}>
                  {isLocked
                    ? `Locked until ${new Date(account.lockedUntil).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
                    : `Matured on ${new Date(account.lockedUntil).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                </Text>
              </View>
            ) : null}
          </View>

          {targetNaira ? (
            <View style={tw`mx-5 mb-6`}>
              <View style={tw`flex-row justify-between items-center mb-2`}>
                <Text style={tw`text-gray-500 text-[12px] font-semibold`}>Goal progress</Text>
                <Text style={tw`text-gray-400 text-[12px]`}>
                  {fmt(account.balanceNaira || 0)} of {fmt(targetNaira)}
                </Text>
              </View>
              <View style={tw`h-3 bg-gray-200 rounded-full overflow-hidden`}>
                <View
                  style={[tw`h-full rounded-full`, {
                    width: `${Math.max(4, progress! * 100)}%`,
                    backgroundColor: isFixed ? DEEP_PURPLE : SUCCESS_GREEN,
                  }]}
                />
              </View>
              <Text style={tw`text-gray-400 text-[11px] mt-1.5`}>{Math.round((progress || 0) * 100)}% of your goal reached</Text>
            </View>
          ) : null}

          {!isClosed && (
            <View style={tw`mx-5 mb-6`}>
              <View style={tw`flex-row gap-2`}>
                <TouchableOpacity
                  style={tw`flex-1 bg-white border border-gray-200 rounded-2xl py-3.5 items-center gap-1`}
                  activeOpacity={0.75}
                  onPress={() => setShowDeposit(true)}
                >
                  <Ionicons name="add" size={20} color={SUCCESS_GREEN} />
                  <Text style={tw`text-gray-700 text-[12px] font-semibold`}>Deposit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={tw`flex-1 bg-white border border-gray-200 rounded-2xl py-3.5 items-center gap-1 ${isLocked ? 'opacity-50' : ''}`}
                  activeOpacity={0.75}
                  disabled={isLocked}
                  onPress={() => setShowWithdraw(true)}
                >
                  <Ionicons name="arrow-up" size={20} color={PRIMARY_COLOR} />
                  <Text style={tw`text-gray-700 text-[12px] font-semibold`}>{isLocked ? 'Locked' : 'Withdraw'}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={tw`flex-1 bg-white border border-gray-200 rounded-2xl py-3.5 items-center gap-1`}
                  activeOpacity={0.75}
                  onPress={() => setShowSchedule(true)}
                >
                  <Ionicons name="calendar-outline" size={20} color={WARNING_AMBER} />
                  <Text style={tw`text-gray-700 text-[12px] font-semibold`}>Auto-save</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={tw`px-5`}>
            <Text style={tw`text-[${CHARCOAL}] text-[14px] font-semibold tracking-tight mb-4`}>Recent activity</Text>
            {!account.movements || account.movements.length === 0 ? (
              <View style={tw`bg-white border border-gray-200 rounded-2xl p-6 items-center mb-6`}>
                <Ionicons name="time-outline" size={28} color="#D1D5DB" />
                <Text style={tw`text-gray-400 text-[12px] mt-2`}>No activity yet</Text>
              </View>
            ) : (
              account.movements.map((m) => {
                const meta = MOVEMENT_META[m.type];
                return (
                  <View key={m.id} style={tw`bg-white border border-gray-200 rounded-2xl p-4 mb-2.5 flex-row items-center gap-3`}>
                    <View style={tw`w-10 h-10 rounded-xl ${meta.bg} items-center justify-center`}>
                      <Ionicons name={meta.icon} size={18} color={meta.color} />
                    </View>
                    <View style={tw`flex-1`}>
                      <Text style={tw`text-gray-800 text-[13px] font-semibold`}>{meta.label}</Text>
                      <View style={tw`flex-row items-center gap-1.5 mt-0.5`}>
                        <FormattedDate date={m.createdAt} style={tw`text-gray-400 text-[11px]`} />
                        <Text style={tw`text-gray-300 text-[11px]`}>·</Text>
                        <Text style={tw`text-gray-400 text-[11px]`} numberOfLines={1}>{m.reference}</Text>
                      </View>
                    </View>
                    <Text style={tw`text-[${CHARCOAL}] text-[14px] font-bold`}>
                      {m.type === 'DEPOSIT' || m.type === 'INTEREST' ? '+' : '−'}{fmt(m.amount / 100)}
                    </Text>
                  </View>
                );
              })
            )}

            {account.schedules && account.schedules.length > 0 && !isClosed && (
              <>
                <Text style={tw`text-[${CHARCOAL}] text-[14px] font-semibold tracking-tight mb-4 mt-2`}>Auto-save plans</Text>
                {account.schedules.map((s) => (
                  <View key={s.id} style={tw`bg-white border border-gray-200 rounded-2xl p-4 mb-2.5 flex-row items-center gap-3`}>
                    <View style={tw`w-10 h-10 rounded-xl bg-amber-100 items-center justify-center`}>
                      <Ionicons name="repeat-outline" size={18} color={WARNING_AMBER} />
                    </View>
                    <View style={tw`flex-1`}>
                      <Text style={tw`text-gray-800 text-[13px] font-semibold`}>{fmt(s.amount / 100)} · {FREQ_LABEL[s.frequency]}</Text>
                      <Text style={tw`text-gray-400 text-[11px] mt-0.5`}>
                        {scheduleSummary(s)}
                        {s.nextRunAt ? ' · next' : null}
                        {s.nextRunAt ? <FormattedDate date={s.nextRunAt} style={tw`text-gray-400 text-[11px]`} /> : null}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={tw`w-8 h-8 rounded-xl bg-gray-100 items-center justify-center`}
                      activeOpacity={0.7}
                      onPress={() => {
                        Alert.alert('Cancel auto-save?', `${fmt(s.amount / 100)} ${scheduleSummary(s).toLowerCase()} will stop.`, [
                          { text: 'Keep', style: 'cancel' },
                          { text: 'Cancel plan', style: 'destructive', onPress: () => cancelSchedule(s.id) },
                        ]);
                      }}
                    >
                      <Ionicons name="close" size={16} color="#6B7280" />
                    </TouchableOpacity>
                  </View>
                ))}
              </>
            )}

            {!isClosed && (
              <TouchableOpacity
                style={tw`flex-row items-center justify-center gap-2 py-4 mt-4 mb-6`}
                activeOpacity={0.7}
                onPress={confirmClose}
              >
                <Ionicons name="trash-outline" size={16} color="#DC2626" />
                <Text style={tw`text-red-600 text-[13px] font-semibold`}>Close this pot</Text>
              </TouchableOpacity>
            )}
          </View>
        </RefreshableScrollView>

        <Modal visible={showDeposit} transparent animationType="slide" onRequestClose={() => setShowDeposit(false)}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={tw`flex-1 justify-end`}>
            <TouchableOpacity style={tw`flex-1`} activeOpacity={1} onPress={() => setShowDeposit(false)} />
            <View style={tw`bg-white rounded-t-3xl p-6 pb-10 shadow-xl`}>
              <View style={tw`items-center mb-4`}>
                <View style={tw`w-10 h-1 bg-gray-300 rounded-full mb-4`} />
                <Text style={tw`text-gray-800 text-lg font-bold`}>Deposit to {account.name}</Text>
                <Text style={tw`text-gray-500 text-[13px] mt-1`}>Moved from your wallet</Text>
              </View>
              <View style={tw`bg-[${LIGHT_GRAY}] border border-gray-200 rounded-2xl px-5 py-3 mb-5 flex-row items-center`}>
                <Text style={tw`text-gray-800 text-2xl font-bold mr-1`}>₦</Text>
                <TextInput
                  style={tw`flex-1 text-gray-800 text-2xl font-bold`}
                  placeholder="0.00"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="decimal-pad"
                  value={depositAmount}
                  onChangeText={handleAmountChange(setDepositAmount)}
                  autoFocus
                />
              </View>
              <TouchableOpacity
                style={tw`bg-emerald-600 rounded-xl py-4 items-center ${depositing ? 'opacity-50' : ''}`}
                activeOpacity={0.85}
                onPress={doDeposit}
                disabled={depositing}
              >
                {depositing ? <ActivityIndicator color="white" /> : <Text style={tw`text-white font-semibold text-base`}>Deposit</Text>}
              </TouchableOpacity>
              <TouchableOpacity style={tw`mt-3 py-3 items-center`} activeOpacity={0.7} onPress={() => setShowDeposit(false)}>
                <Text style={tw`text-gray-500 text-[14px]`}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        <Modal visible={showWithdraw} transparent animationType="slide" onRequestClose={() => setShowWithdraw(false)}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={tw`flex-1 justify-end`}>
            <TouchableOpacity style={tw`flex-1`} activeOpacity={1} onPress={() => setShowWithdraw(false)} />
            <View style={tw`bg-white rounded-t-3xl p-6 pb-10 shadow-xl`}>
              <View style={tw`items-center mb-4`}>
                <View style={tw`w-10 h-1 bg-gray-300 rounded-full mb-4`} />
                <Text style={tw`text-gray-800 text-lg font-bold`}>Withdraw from {account.name}</Text>
                <Text style={tw`text-gray-500 text-[13px] mt-1`}>Moves straight to your wallet</Text>
              </View>
              <View style={tw`bg-[${LIGHT_GRAY}] border border-gray-200 rounded-2xl px-5 py-3 mb-5 flex-row items-center`}>
                <Text style={tw`text-gray-800 text-2xl font-bold mr-1`}>₦</Text>
                <TextInput
                  style={tw`flex-1 text-gray-800 text-2xl font-bold`}
                  placeholder="0.00"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="decimal-pad"
                  value={withdrawAmount}
                  onChangeText={handleAmountChange(setWithdrawAmount)}
                  autoFocus
                />
              </View>
              <TouchableOpacity
                style={tw`bg-blue-600 rounded-xl py-4 items-center`}
                activeOpacity={0.85}
                onPress={() => {
                  if (!(parseFloat(withdrawAmount) > 0)) {
                    Alert.alert('Invalid amount', 'Enter a valid amount to withdraw.');
                    return;
                  }
                  setShowWithdraw(false);
                  setPinAction('withdraw');
                }}
              >
                <Text style={tw`text-white font-semibold text-base`}>Continue</Text>
              </TouchableOpacity>
              <TouchableOpacity style={tw`mt-3 py-3 items-center`} activeOpacity={0.7} onPress={() => setShowWithdraw(false)}>
                <Text style={tw`text-gray-500 text-[14px]`}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        <PinModal
          visible={pinAction !== null && !showWithdraw}
          title="Confirm your PIN"
          subtitle={pinAction === 'close'
            ? 'Confirm to close this pot and move the balance to your wallet'
            : account.name ? `Confirm to withdraw from ${account.name}` : 'Confirm to continue'}
          loading={withdrawing || closing}
          onConfirm={pinAction === 'close' ? doClose : doWithdraw}
          onClose={() => setPinAction(null)}
        />

        <Modal visible={showSchedule} transparent animationType="slide" onRequestClose={() => setShowSchedule(false)}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={tw`flex-1 justify-end`}>
            <TouchableOpacity style={tw`flex-1`} activeOpacity={1} onPress={() => setShowSchedule(false)} />
            <View style={tw`bg-white rounded-t-3xl p-6 pb-10 shadow-xl`}>
              <View style={tw`items-center mb-4`}>
                <View style={tw`w-10 h-1 bg-gray-300 rounded-full mb-4`} />
                <Text style={tw`text-gray-800 text-lg font-bold`}>Auto-save</Text>
                <Text style={tw`text-gray-500 text-[13px] mt-1`}>Set up automatic deposits into this pot</Text>
              </View>

              <View style={tw`bg-[${LIGHT_GRAY}] border border-gray-200 rounded-2xl px-5 py-3 mb-5 flex-row items-center`}>
                <Text style={tw`text-gray-800 text-2xl font-bold mr-1`}>₦</Text>
                <TextInput
                  style={tw`flex-1 text-gray-800 text-2xl font-bold`}
                  placeholder="0.00"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="decimal-pad"
                  value={scheduleAmount}
                  onChangeText={handleAmountChange(setScheduleAmount)}
                />
              </View>

              <Text style={tw`text-gray-600 text-[12px] font-semibold tracking-wide mb-2`}>Frequency</Text>
              <View style={tw`flex-row flex-wrap gap-2 mb-4`}>
                {(Object.keys(FREQ_LABEL) as SavingsFrequency[]).map((f) => (
                  <TouchableOpacity
                    key={f}
                    style={tw`px-4 py-2 rounded-xl border ${scheduleFreq === f ? 'bg-violet-600 border-violet-600' : 'bg-white border-gray-200'}`}
                    activeOpacity={0.75}
                    onPress={() => setScheduleFreq(f)}
                  >
                    <Text style={tw`text-[12px] font-semibold ${scheduleFreq === f ? 'text-white' : 'text-gray-500'}`}>{FREQ_LABEL[f]}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {scheduleFreq === 'MONTHLY' && (
                <>
                  <Text style={tw`text-gray-600 text-[12px] font-semibold tracking-wide mb-2`}>Day of month (1–31, optional)</Text>
                  <View style={tw`bg-[${LIGHT_GRAY}] border border-gray-200 rounded-2xl px-4 h-[50px] flex-row items-center mb-4`}>
                    <TextInput
                      style={tw`flex-1 text-gray-800 text-[15px] font-semibold`}
                      placeholder="e.g. 15"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="number-pad"
                      maxLength={2}
                      value={scheduleDay}
                      onChangeText={(t) => setScheduleDay(t.replace(/[^0-9]/g, ''))}
                    />
                  </View>
                </>
              )}

              <TouchableOpacity
                style={tw`bg-violet-600 rounded-xl py-4 items-center ${creatingSchedule ? 'opacity-50' : ''}`}
                activeOpacity={0.85}
                onPress={doCreateSchedule}
                disabled={creatingSchedule}
              >
                {creatingSchedule ? <ActivityIndicator color="white" /> : <Text style={tw`text-white font-semibold text-base`}>Save automatically</Text>}
              </TouchableOpacity>
              <TouchableOpacity style={tw`mt-3 py-3 items-center`} activeOpacity={0.7} onPress={() => setShowSchedule(false)}>
                <Text style={tw`text-gray-500 text-[14px]`}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}