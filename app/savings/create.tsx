import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import tw from 'twrnc';
import { api } from '@/lib/api';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import type { SavingsAccount, SavingsType } from '@/lib/types';
import { PRIMARY_COLOR, DEEP_PURPLE, CHARCOAL } from '@/constants/customConstants';

const LOCK_OPTIONS = [30, 60, 90, 180, 365];

export default function SavingsCreateScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [type, setType] = useState<SavingsType>('FLEXIBLE');
  const [targetAmount, setTargetAmount] = useState('');
  const [interestRate, setInterestRate] = useState('5');
  const [lockPeriodDays, setLockPeriodDays] = useState(90);
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; amount?: string }>({});

  const handleAmountChange = (setter: (v: string) => void) => (value: string) => {
    const numeric = value.replace(/[^0-9.]/g, '');
    const segments = numeric.split('.');
    if (segments.length > 2) return;
    if (segments[1] && segments[1].length > 2) return;
    setter(numeric);
  };

  const handleSubmit = async () => {
    const errs: { name?: string; amount?: string } = {};
    if (name.trim().length < 2) errs.name = 'Give your pot a name (min 2 characters)';
    if (amount && !(parseFloat(amount) > 0)) errs.amount = 'Enter a valid deposit amount';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSubmitting(true);
    try {
      const body: Record<string, any> = { name: name.trim(), type };
      if (targetAmount) body.targetAmount = parseFloat(targetAmount);
      if (type === 'FIXED') {
        if (interestRate) body.interestRate = parseFloat(interestRate);
        body.lockPeriodDays = lockPeriodDays;
      }
      if (amount) body.amount = parseFloat(amount);

      const account = await api.post<SavingsAccount>('/savings', body);
      Alert.alert(
        'Pot created',
        `${account.name || 'Your pot'} is ready.${amount ? ` ₦${parseFloat(amount).toLocaleString()} was moved into it.` : ''}`,
        [{ text: 'View pot', onPress: () => router.replace(`/savings/${account.id}`) }]
      );
    } catch (err: any) {
      Alert.alert('Could not create pot', err?.message || 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={tw`flex-1 pb-8 bg-gray-50`}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={tw`flex-1`}>
        <ScrollView style={tw`flex-1`} showsVerticalScrollIndicator={false} contentContainerStyle={tw`pb-10`} keyboardShouldPersistTaps="handled">
          <View style={tw`flex-row items-center pt-12 px-5 mb-6`}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={tw`w-10 h-10 rounded-full bg-white border border-gray-200 items-center justify-center mr-4`}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={20} color={CHARCOAL} />
            </TouchableOpacity>
            <View>
              <Text style={tw`text-[${CHARCOAL}] text-[22px] font-bold tracking-tight`}>Create a pot</Text>
              <Text style={tw`text-gray-400 text-[12px] mt-0.5`}>Start saving towards a goal</Text>
            </View>
          </View>

          <View style={tw`px-5 gap-5`}>
            <Input
              label="Pot name"
              value={name}
              onChangeText={(t) => { setName(t); if (errors.name) setErrors((e) => ({ ...e, name: undefined })); }}
              placeholder="e.g. School fees, Business capital"
              autoCapitalize="words"
              maxLength={100}
              leftIcon="pricetag-outline"
              error={errors.name}
            />

            <View>
              <Text style={tw`text-gray-600 text-[12px] font-semibold tracking-wide mb-2`}>Pot type</Text>
              <View style={tw`flex-row gap-2`}>
                <TouchableOpacity
                  style={tw`flex-1 rounded-2xl p-4 border ${type === 'FLEXIBLE' ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-200'}`}
                  activeOpacity={0.75}
                  onPress={() => setType('FLEXIBLE')}
                >
                  <View style={tw`flex-row items-center gap-2 mb-1.5`}>
                    <Ionicons name="flame-outline" size={18} color={type === 'FLEXIBLE' ? PRIMARY_COLOR : '#9CA3AF'} />
                    <Text style={tw`text-[${CHARCOAL}] text-[13px] font-semibold`}>Flexible</Text>
                  </View>
                  <Text style={tw`text-gray-400 text-[11px] leading-4`}>Withdraw anytime. No lock period.</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={tw`flex-1 rounded-2xl p-4 border ${type === 'FIXED' ? 'bg-violet-50 border-violet-300' : 'bg-white border-gray-200'}`}
                  activeOpacity={0.75}
                  onPress={() => setType('FIXED')}
                >
                  <View style={tw`flex-row items-center gap-2 mb-1.5`}>
                    <Ionicons name="lock-closed-outline" size={18} color={type === 'FIXED' ? DEEP_PURPLE : '#9CA3AF'} />
                    <Text style={tw`text-[${CHARCOAL}] text-[13px] font-semibold`}>Fixed</Text>
                  </View>
                  <Text style={tw`text-gray-400 text-[11px] leading-4`}>Locked for a fixed term, then it matures.</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Input
              label="Goal amount (optional)"
              value={targetAmount}
              onChangeText={handleAmountChange(setTargetAmount)}
              placeholder="0.00"
              keyboardType="decimal-pad"
              prefix="₦"
              leftIcon="trophy-outline"
              hint="Sets a savings target so we can track your progress."
            />

            {type === 'FIXED' && (
              <>
                <Input
                  label="Interest rate (% p.a.)"
                  value={interestRate}
                  onChangeText={(t) => setInterestRate(t.replace(/[^0-9.]/g, '').slice(0, 5))}
                  keyboardType="decimal-pad"
                  placeholder="5"
                  leftIcon="trending-up-outline"
                  hint="Your pot earns simple interest at this annual rate."
                />
                <View>
                  <Text style={tw`text-gray-600 text-[12px] font-semibold tracking-wide mb-2`}>Lock period</Text>
                  <View style={tw`flex-row flex-wrap gap-2`}>
                    {LOCK_OPTIONS.map((days) => {
                      const isActive = lockPeriodDays === days;
                      return (
                        <TouchableOpacity
                          key={days}
                          style={tw`px-4 py-2.5 rounded-xl border ${isActive ? 'bg-violet-600 border-violet-600' : 'bg-white border-gray-200'}`}
                          activeOpacity={0.75}
                          onPress={() => setLockPeriodDays(days)}
                        >
                          <Text style={tw`text-[12px] font-semibold ${isActive ? 'text-white' : 'text-gray-500'}`}>
                            {days} days
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              </>
            )}

            <Input
              label="Start with a deposit (optional)"
              value={amount}
              onChangeText={handleAmountChange(setAmount)}
              placeholder="0.00"
              keyboardType="decimal-pad"
              prefix="₦"
              leftIcon="wallet-outline"
              error={errors.amount}
              hint="Moved from your wallet balance when the pot is created."
            />

            <View style={tw`pt-2`}>
              <Button
                label="Create pot"
                icon="add-circle-outline"
                onPress={handleSubmit}
                disabled={submitting}
                loading={submitting}
                size="lg"
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}