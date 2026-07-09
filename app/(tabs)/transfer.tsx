import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import {
  ActivityIndicator, Alert, Animated, KeyboardAvoidingView, Modal, Platform,
  SafeAreaView, Text, TextInput, TouchableOpacity, View, ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import tw from 'twrnc';
import { api } from '@/lib/api';
import RefreshableScrollView from '@/components/RefreshableScrollView';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import type { Bank, AccountValidation } from '@/lib/types';
import { PRIMARY_COLOR, CHARCOAL, LIGHT_GRAY, SUCCESS_GREEN } from '@/constants/customConstants';

interface Beneficiary {
  id: string;
  bankId: string;
  accountNumber: string;
  accountName: string;
  bank?: { name: string; code: string };
  nickname?: string;
}

type TransferErrors = { bank: string; accountNumber: string; amount: string; pin: string };

const QUICK_AMOUNTS = [500, 1000, 2000, 5000, 10000, 20000, 50000];

export default function TransferScreen() {
  const router = useRouter();
  const [isIntra, setIsIntra] = useState(false);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [accountNumber, setAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [isSelectingBank, setIsSelectingBank] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [accountName, setAccountName] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [errors, setErrors] = useState<TransferErrors>({ bank: '', accountNumber: '', amount: '', pin: '' });
  const [refreshing, setRefreshing] = useState(false);
  const [bankSearch, setBankSearch] = useState('');
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, [fadeAnim]);

  const validateTimer = useRef<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadBanks();
      loadBeneficiaries();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBanks();
    await loadBeneficiaries();
    setRefreshing(false);
  };

  const loadBanks = async () => {
    try {
      const data = await api.get<Bank[]>('/banks');
      if (Array.isArray(data)) setBanks(data);
    } catch {}
  };

  const loadBeneficiaries = async () => {
    try {
      const data = await api.get<Beneficiary[]>('/beneficiaries');
      if (Array.isArray(data)) setBeneficiaries(data);
    } catch {}
  };

  const formattedAmount = useMemo(() => {
    if (!amount) return '';
    const parts = amount.split('.');
    const int = (parts[0] ?? '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    const dec = parts[1]?.slice(0, 2) ?? '';
    return dec ? `${int}.${dec}` : int;
  }, [amount]);

  const handleAmountChange = (value: string) => {
    const numeric = value.replace(/[^0-9.]/g, '');
    const segments = numeric.split('.');
    if (segments.length > 2) return;
    if (segments[1] && segments[1].length > 2) return;
    setAmount(numeric);
    if (errors.amount) setErrors(p => ({ ...p, amount: '' }));
  };

  const doValidateAccount = async (accNum: string, bank: Bank | null) => {
    if (accNum.length !== 10 || !bank || accountName) return;
    setIsValidating(true);
    try {
      const result = await api.post<AccountValidation>('/transfers/validate', {
        bankCode: bank.code,
        accountNumber: accNum,
      });
      setAccountName(result.accountName);
    } catch {
      Alert.alert('Validation Failed', 'Could not validate account number. Please check and try again.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleAccountNumberChange = (value: string) => {
    const numeric = value.replace(/[^0-9]/g, '');
    if (numeric.length <= 10) {
      setAccountNumber(numeric);
      if (numeric.length < 10) {
        setAccountName('');
        setErrors(p => ({ ...p, accountNumber: '' }));
        if (validateTimer.current) clearTimeout(validateTimer.current);
      } else if (numeric.length === 10 && selectedBank && !isIntra) {
        if (validateTimer.current) clearTimeout(validateTimer.current);
        validateTimer.current = setTimeout(() => doValidateAccount(numeric, selectedBank), 500);
      }
    }
  };

  const validateForm = () => {
    const newErrors: TransferErrors = { bank: '', accountNumber: '', amount: '', pin: '' };
    let isValid = true;
    if (!isIntra && !selectedBank) { newErrors.bank = 'Please select a bank'; isValid = false; }
    if (accountNumber.length !== 10) { newErrors.accountNumber = 'Account number must be 10 digits'; isValid = false; }
    if (!parseFloat(amount) || parseFloat(amount) <= 0) { newErrors.amount = 'Enter a valid amount'; isValid = false; }
    if (pin.length !== 4) { newErrors.pin = 'PIN must be 4 digits'; isValid = false; }
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      if (isIntra) {
        await api.post('/transfers/intra', {
          accountNumber,
          amount: parseFloat(amount),
          description: description || undefined,
          pin,
        });
      } else {
        await api.post('/transfers', {
          bankCode: selectedBank!.code,
          accountNumber,
          amount: parseFloat(amount),
          description: description || undefined,
          pin,
        });
      }

      const recipientName = accountName || selectedBank?.name || 'recipient';
      const isExistingBeneficiary = beneficiaries.some(
        b => b.accountNumber === accountNumber && (!selectedBank || b.bankId === selectedBank.id)
      );
      if (!isExistingBeneficiary && !isIntra && selectedBank) {
        Alert.alert(
          'Transfer initiated',
          `₦${formattedAmount || amount} sent to ${recipientName}.`,
          [
            { text: 'Done', onPress: () => router.push('/(tabs)/history') },
            {
              text: 'Save beneficiary',
              onPress: async () => {
                try {
                  await api.post('/beneficiaries', {
                    bankId: selectedBank.id,
                    accountNumber,
                    accountName: accountName || recipientName,
                  });
                  loadBeneficiaries();
                } catch {}
              },
            },
          ]
        );
      } else {
        Alert.alert('Transfer initiated', `₦${formattedAmount || amount} sent to ${recipientName}.`, [
          { text: 'Done', onPress: () => router.push('/(tabs)/history') },
        ]);
      }
    } catch (err: any) {
      Alert.alert('Transfer failed', err?.message || 'Unable to complete transfer. Please try again.');
    } finally { setIsSubmitting(false); }
  };

  const filteredBanks = useMemo(() => {
    if (!bankSearch) return banks;
    const q = bankSearch.toLowerCase();
    return banks.filter(b => b.name.toLowerCase().includes(q) || b.code.toLowerCase().includes(q));
  }, [banks, bankSearch]);

  const handleQuickAmount = (val: number) => {
    setAmount(val.toString());
    if (errors.amount) setErrors(p => ({ ...p, amount: '' }));
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-[${LIGHT_GRAY}]`}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={tw`flex-1`}>
        <Animated.View style={[{ opacity: fadeAnim }, tw`flex-1`]}>
          <RefreshableScrollView
            onRefresh={onRefresh}
            refreshing={refreshing}
            style={tw`flex-1 px-5`}
            contentContainerStyle={tw`pb-28`}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={tw`flex-row items-center mt-14 mb-8`}>
              <TouchableOpacity
                onPress={() => router.back()}
                style={tw`w-10 h-10 rounded-full bg-white border border-gray-200 items-center justify-center mr-4`}
                activeOpacity={0.7}
              >
                <Ionicons name="arrow-back" size={20} color={CHARCOAL} />
              </TouchableOpacity>
              <View>
                <Text style={tw`text-[${CHARCOAL}] text-[22px] font-bold tracking-tight`}>Send money</Text>
                <Text style={tw`text-gray-400 text-[12px] mt-0.5`}>{isIntra ? 'Instant transfer to WanPay users' : 'Instant transfer to Nigerian banks'}</Text>
              </View>
            </View>

            <View style={tw`flex-row bg-white rounded-2xl p-1 mb-6 border border-gray-200`}>
              <TouchableOpacity
                style={tw`flex-1 py-2.5 rounded-xl ${isIntra ? '' : 'bg-blue-600 shadow-sm'}`}
                activeOpacity={0.7}
                onPress={() => { setIsIntra(false); setSelectedBank(null); setAccountName(''); setErrors({ bank: '', accountNumber: '', amount: '', pin: '' }); }}
              >
                <Text style={tw`text-center text-[12px] font-semibold ${isIntra ? 'text-gray-500' : 'text-white'}`}>Bank transfer</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={tw`flex-1 py-2.5 rounded-xl ${isIntra ? 'bg-blue-600 shadow-sm' : ''}`}
                activeOpacity={0.7}
                onPress={() => { setIsIntra(true); setSelectedBank(null); setAccountName(''); setErrors({ bank: '', accountNumber: '', amount: '', pin: '' }); }}
              >
                <Text style={tw`text-center text-[12px] font-semibold ${isIntra ? 'text-white' : 'text-gray-500'}`}>WanPay transfer</Text>
              </TouchableOpacity>
            </View>

            <View style={tw`mb-6`}>
              <Text style={tw`text-gray-500 text-[12px] font-semibold tracking-wider uppercase mb-3`}>Recipient</Text>
              <View style={tw`bg-white rounded-2xl p-4`}>
                {!isIntra && (
                  <>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={tw`flex-row items-center gap-3 mb-4`}
                      onPress={() => setIsSelectingBank(true)}
                    >
                      <View style={tw`w-11 h-11 rounded-xl bg-[${PRIMARY_COLOR}]/10 items-center justify-center`}>
                        <Ionicons name="business-outline" size={20} color={PRIMARY_COLOR} />
                      </View>
                      <View style={tw`flex-1`}>
                        <Text style={tw`text-gray-400 text-[11px] font-medium mb-0.5`}>Select bank</Text>
                        <Text style={tw`${selectedBank ? `text-[${CHARCOAL}]` : 'text-gray-300'} text-[14px] font-medium`}>
                          {selectedBank ? selectedBank.name : 'Choose a bank...'}
                        </Text>
                      </View>
                      <Ionicons name="chevron-down" size={18} color="#9CA3AF" />
                    </TouchableOpacity>
                    {errors.bank ? <Text style={tw`text-red-500 text-[12px] mb-3 ml-[52px]`}>{errors.bank}</Text> : null}
                    <View style={tw`h-px bg-[${LIGHT_GRAY}] mb-4`} />
                  </>
                )}

                <Input
                  label="Account number"
                  value={accountNumber}
                  onChangeText={handleAccountNumberChange}
                  placeholder={isIntra ? "Enter WanPay account number" : "Enter 10-digit account number"}
                  keyboardType="number-pad"
                  maxLength={10}
                  error={errors.accountNumber}
                />
                {isValidating && (
                  <View style={tw`flex-row items-center gap-2 mt-2 ml-1`}>
                    <ActivityIndicator size="small" color={PRIMARY_COLOR} />
                    <Text style={tw`text-gray-400 text-[12px]`}>Verifying account...</Text>
                  </View>
                )}

                {accountName ? (
                  <View style={tw`bg-[${SUCCESS_GREEN}]/10 rounded-xl p-3 mt-3 flex-row items-center gap-2.5`}>
                    <View style={tw`w-7 h-7 rounded-full bg-[${SUCCESS_GREEN}]/20 items-center justify-center`}>
                      <Ionicons name="checkmark-circle" size={16} color={SUCCESS_GREEN} />
                    </View>
                    <View>
                      <Text style={tw`text-[${SUCCESS_GREEN}] font-bold text-[13px]`}>{accountName}</Text>
                      <Text style={tw`text-[${SUCCESS_GREEN}]/60 text-[10px]`}>Account verified</Text>
                    </View>
                  </View>
                ) : null}
              </View>
            </View>

            <View style={tw`mb-6`}>
              <Text style={tw`text-gray-500 text-[12px] font-semibold tracking-wider uppercase mb-3`}>Amount</Text>
              <View style={tw`bg-white rounded-2xl p-4`}>
                <View style={tw`flex-row items-center`}>
                  <Text style={tw`text-[${CHARCOAL}] text-[28px] font-bold mr-2`}>₦</Text>
                  <TextInput
                    style={tw`flex-1 text-[28px] font-bold text-[${CHARCOAL}]`}
                    placeholder="0.00"
                    placeholderTextColor="#D1D5DB"
                    keyboardType="decimal-pad"
                    value={formattedAmount}
                    onChangeText={handleAmountChange}
                  />
                </View>
                {errors.amount ? <Text style={tw`text-red-500 text-[12px] mt-1.5 ml-1`}>{errors.amount}</Text> : null}

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={tw`mt-4`}
                  contentContainerStyle={tw`gap-2`}
                >
                  {QUICK_AMOUNTS.map(val => {
                    const isActive = parseFloat(amount) === val;
                    return (
                      <TouchableOpacity
                        key={val}
                        onPress={() => handleQuickAmount(val)}
                        activeOpacity={0.7}
                        style={tw`px-4 py-2 rounded-xl border ${isActive ? `bg-[${PRIMARY_COLOR}] border-[${PRIMARY_COLOR}]` : `bg-[${LIGHT_GRAY}] border-gray-200`}`}
                      >
                        <Text style={tw`${isActive ? 'text-white' : `text-[${CHARCOAL}]`} text-[13px] font-semibold`}>
                          ₦{val.toLocaleString()}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            </View>

            <View style={tw`mb-6`}>
              <Text style={tw`text-gray-500 text-[12px] font-semibold tracking-wider uppercase mb-3`}>Note (optional)</Text>
              <View style={tw`bg-white rounded-2xl p-4`}>
                <TextInput
                  style={tw`text-[14px] text-[${CHARCOAL}] h-20`}
                  placeholder="What is this for?"
                  placeholderTextColor="#9CA3AF"
                  multiline
                  value={description}
                  onChangeText={setDescription}
                  maxLength={120}
                />
                <Text style={tw`text-gray-300 text-[11px] mt-1 self-end`}>{description.length}/120</Text>
              </View>
            </View>

            <View style={tw`mb-6`}>
              <Text style={tw`text-gray-500 text-[12px] font-semibold tracking-wider uppercase mb-3`}>Confirm</Text>
              <View style={tw`bg-white rounded-2xl p-4`}>
                <Text style={tw`text-gray-400 text-[11px] font-medium mb-2`}>Transaction PIN</Text>
                <View style={tw`bg-[${LIGHT_GRAY}] rounded-xl px-4 h-[50px] flex-row items-center ${errors.pin ? 'border border-red-500' : ''}`}>
                  <TextInput
                    style={tw`flex-1 text-[14px] text-[${CHARCOAL}]`}
                    placeholder="Enter your PIN"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="number-pad"
                    secureTextEntry={!showPin}
                    maxLength={4}
                    value={pin}
                    onChangeText={(text) => { setPin(text.replace(/[^0-9]/g, '').slice(0, 4)); if (errors.pin) setErrors(p => ({ ...p, pin: '' })); }}
                  />
                  <TouchableOpacity onPress={() => setShowPin(!showPin)} style={tw`p-1`}>
                    <Ionicons name={showPin ? 'eye-outline' : 'eye-off-outline'} size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>
                {errors.pin ? <Text style={tw`text-red-500 text-[12px] mt-1.5 ml-1`}>{errors.pin}</Text> : null}

                <View style={tw`mt-5`}>
                  <Button
                    label="Send money"
                    icon="paper-plane-outline"
                    onPress={handleSubmit}
                    disabled={isSubmitting}
                    loading={isSubmitting}
                  />
                </View>
              </View>
            </View>

            <View style={tw`bg-[${PRIMARY_COLOR}]/5 rounded-2xl p-4 flex-row items-start gap-3`}>
              <View style={tw`w-8 h-8 rounded-full bg-[${PRIMARY_COLOR}]/10 items-center justify-center mt-0.5`}>
                <Ionicons name="information" size={16} color={PRIMARY_COLOR} />
              </View>
              <View style={tw`flex-1`}>
                <Text style={tw`text-[${CHARCOAL}] text-[12px] font-semibold mb-1`}>Important</Text>
                <Text style={tw`text-gray-400 text-[12px] leading-5`}>
                  Double-check recipient details before confirming. Transfers cannot be reversed.
                </Text>
              </View>
            </View>
          </RefreshableScrollView>
        </Animated.View>
      </KeyboardAvoidingView>

      <Modal
        visible={isSelectingBank}
        transparent
        animationType="slide"
        onRequestClose={() => setIsSelectingBank(false)}
      >
        <TouchableOpacity
          style={tw`flex-1 bg-black/40 justify-end`}
          activeOpacity={1}
          onPress={() => { setIsSelectingBank(false); setBankSearch(''); }}
        >
          <TouchableOpacity activeOpacity={1} onPress={() => {}} style={tw`bg-white rounded-t-3xl min-h-[60%] max-h-[80%]`}>
            <View style={tw`flex-row items-center justify-between px-5 pt-5 pb-3 border-b border-[${LIGHT_GRAY}]`}>
              <Text style={tw`text-[${CHARCOAL}] text-[18px] font-bold`}>Select bank</Text>
              <TouchableOpacity onPress={() => { setIsSelectingBank(false); setBankSearch(''); }} activeOpacity={0.7}>
                <Ionicons name="close" size={22} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={tw`px-4 pt-3 pb-2`}>
              <View style={tw`bg-[${LIGHT_GRAY}] rounded-xl px-4 h-[44px] flex-row items-center gap-2.5`}>
                <Ionicons name="search" size={18} color="#9CA3AF" />
                <TextInput
                  style={tw`flex-1 text-[14px] text-[${CHARCOAL}]`}
                  placeholder="Search banks..."
                  placeholderTextColor="#9CA3AF"
                  value={bankSearch}
                  onChangeText={setBankSearch}
                  autoFocus
                />
                {bankSearch ? (
                  <TouchableOpacity onPress={() => setBankSearch('')}>
                    <Ionicons name="close-circle" size={18} color="#9CA3AF" />
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>

            <ScrollView style={tw`flex-1 px-4 pt-1 pb-6`} showsVerticalScrollIndicator={false}>
              {beneficiaries.length > 0 && !bankSearch && (
                <>
                  <Text style={tw`text-gray-400 text-[11px] font-semibold uppercase tracking-wider px-1 pb-2 pt-1`}>Saved beneficiaries</Text>
                  {beneficiaries.map((b, i) => {
                    const match = banks.find(bk => bk.id === b.bankId);
                    return (
                      <TouchableOpacity
                        key={b.id}
                        style={tw`flex-row items-center gap-3 px-3 py-3.5 ${i !== beneficiaries.length - 1 ? `border-b border-[${LIGHT_GRAY}]` : ''} mb-1`}
                        activeOpacity={0.7}
                        onPress={() => {
                          setSelectedBank(match || null);
                          setAccountNumber(b.accountNumber);
                          setAccountName(b.accountName);
                          setBankSearch('');
                          setIsSelectingBank(false);
                          if (errors.bank) setErrors(p => ({ ...p, bank: '' }));
                          if (match && b.accountNumber.length === 10) doValidateAccount(b.accountNumber, match);
                        }}
                      >
                        <View style={tw`w-10 h-10 rounded-xl bg-emerald-100 items-center justify-center`}>
                          <Ionicons name="people-outline" size={18} color="#059669" />
                        </View>
                        <View style={tw`flex-1`}>
                          <Text style={tw`text-[${CHARCOAL}] text-[14px] font-medium`}>{b.accountName}</Text>
                          <Text style={tw`text-gray-400 text-[11px]`}>{match?.name || 'Unknown'} · {b.accountNumber}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
                      </TouchableOpacity>
                    );
                  })}
                  <View style={tw`h-px bg-[${LIGHT_GRAY}] my-2`} />
                </>
              )}
              {filteredBanks.length === 0 ? (
                <View style={tw`items-center py-14`}>
                  <Ionicons name="business-outline" size={40} color="#D1D5DB" />
                  <Text style={tw`text-gray-400 text-[14px] mt-3 font-medium`}>No banks found</Text>
                </View>
              ) : (
                filteredBanks.map((bank, i) => {
                  const isSelected = selectedBank?.id === bank.id;
                  return (
                    <TouchableOpacity
                      key={bank.id}
                      style={tw`flex-row items-center gap-3 px-3 py-4 ${i !== filteredBanks.length - 1 ? `border-b border-[${LIGHT_GRAY}]` : ''}`}
                      activeOpacity={0.7}
                      onPress={() => {
                        setSelectedBank(bank);
                        setAccountName('');
                        setBankSearch('');
                        setIsSelectingBank(false);
                        if (errors.bank) setErrors(p => ({ ...p, bank: '' }));
                        if (accountNumber.length === 10) doValidateAccount(accountNumber, bank);
                      }}
                    >
                      <View style={tw`w-10 h-10 rounded-xl bg-[${PRIMARY_COLOR}]/10 items-center justify-center`}>
                        <Text style={tw`text-[${PRIMARY_COLOR}] text-[15px] font-bold`}>{bank.name.charAt(0)}</Text>
                      </View>
                      <View style={tw`flex-1`}>
                        <Text style={tw`text-[${CHARCOAL}] text-[14px] font-medium`}>{bank.name}</Text>
                        <Text style={tw`text-gray-400 text-[11px]`}>{bank.code}</Text>
                      </View>
                      {isSelected && (
                        <View style={tw`w-6 h-6 rounded-full bg-[${PRIMARY_COLOR}] items-center justify-center`}>
                          <Ionicons name="checkmark" size={14} color="#fff" />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}
