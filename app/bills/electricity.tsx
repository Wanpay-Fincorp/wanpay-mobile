import { CHARCOAL, LIGHT_GRAY, PRIMARY_COLOR, SUCCESS_GREEN } from '@/constants/customConstants';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState, useCallback } from 'react';
import {
  ActivityIndicator, Alert, FlatList, KeyboardAvoidingView, Modal,
  Platform, SafeAreaView, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import tw from 'twrnc';
import { api } from '@/lib/api';
import RefreshableScrollView from '@/components/RefreshableScrollView';
import Button from '@/components/ui/Button';
import type { BillProvider } from '@/lib/types';

export default function ElectricityScreen() {
  const router = useRouter();
  const [selectedDisco, setSelectedDisco] = useState<BillProvider | null>(null);
  const [discoProviders, setDiscoProviders] = useState<BillProvider[]>([]);
  const [loadingProviders, setLoadingProviders] = useState(true);
  const [meterNumber, setMeterNumber] = useState('');
  const [meterType, setMeterType] = useState<'prepaid' | 'postpaid'>('prepaid');
  const [amount, setAmount] = useState('');
  const [showDiscos, setShowDiscos] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({ disco: '', meter: '', amount: '', pin: '' });

  const fetchProviders = useCallback(async () => {
    setLoadingProviders(true);
    try {
      const data = await api.get<BillProvider[]>('/bills/providers?category=electricity');
      if (Array.isArray(data)) setDiscoProviders(data);
    } catch {
      setDiscoProviders([]);
    } finally {
      setLoadingProviders(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchProviders();
    }, [fetchProviders])
  );

  const quickAmounts = [1000, 2000, 5000, 10000, 20000];

  const handleMeterChange = (text: string) => {
    const numeric = text.replace(/[^0-9]/g, '');
    if (numeric.length <= 20) {
      setMeterNumber(numeric);
      setCustomerName('');
      if (errors.meter) setErrors(p => ({ ...p, meter: '' }));
    }
  };

  const handleValidateMeter = async () => {
    if (meterNumber.length >= 11 && selectedDisco) {
      setIsValidating(true);
      try {
        const result = await api.post<any>('/bills/validate', {
          category: 'electricity',
          providerCode: selectedDisco.id,
          recipient: meterNumber,
        });
        setCustomerName(result.customerName || 'John Doe');
      } catch {
        Alert.alert('Error', 'Invalid meter number. Please check and try again.');
      } finally { setIsValidating(false); }
    }
  };

  const handleAmountChange = (text: string) => {
    const numeric = text.replace(/[^0-9]/g, '');
    setAmount(numeric);
    if (errors.amount) setErrors(p => ({ ...p, amount: '' }));
  };

  const validateForm = () => {
    const newErrors = { disco: '', meter: '', amount: '', pin: '' };
    let isValid = true;
    if (!selectedDisco) { newErrors.disco = 'Please select a disco'; isValid = false; }
    if (meterNumber.length < 11) { newErrors.meter = 'Meter number must be at least 11 digits'; isValid = false; }
    if (!parseFloat(amount) || parseFloat(amount) <= 0) { newErrors.amount = 'Enter a valid amount'; isValid = false; }
    if (pin.length !== 4) { newErrors.pin = 'PIN must be 4 digits'; isValid = false; }
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      await api.post('/bills/pay', {
        category: 'electricity',
        providerCode: selectedDisco!.id,
        recipient: meterNumber,
        amount: parseFloat(amount),
        pin,
      });
      Alert.alert('Success', `₦${amount} electricity token will be sent to your phone`, [
        { text: 'Done', onPress: () => router.back() },
      ]);
    } catch (err: any) { Alert.alert('Error', err.message || 'Unable to process request. Please try again.'); }
    finally { setIsSubmitting(false); }
  };

  const isDisabled = isSubmitting || !selectedDisco || meterNumber.length < 11 || !amount || pin.length !== 4;

  return (
    <SafeAreaView style={[tw`flex-1 pt-14 pb-8`, { backgroundColor: LIGHT_GRAY }]}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={tw`flex-1`}>
        <View style={tw`px-5 pb-5 border-b border-gray-200`}>
          <View style={tw`flex-row items-center`}>
            <TouchableOpacity onPress={() => router.back()} style={tw`w-10 h-10 rounded-full bg-white border border-gray-200 items-center justify-center mr-4`} activeOpacity={0.7}>
              <Ionicons name="arrow-back" size={20} color={CHARCOAL} />
            </TouchableOpacity>
            <View>
              <Text style={[tw`text-[22px] font-bold tracking-tight`, { color: CHARCOAL }]}>Electricity bill</Text>
              <Text style={tw`text-gray-400 text-[12px] mt-0.5`}>Pay your electricity bills</Text>
            </View>
          </View>
        </View>

        <RefreshableScrollView style={tw`flex-1 px-5 pt-6`} showsVerticalScrollIndicator={false} contentContainerStyle={tw`pb-28`}>
          <View style={tw`mb-5`}>
            <Text style={tw`text-gray-500 text-[12px] font-semibold tracking-wider uppercase mb-3`}>Select disco</Text>
            <View style={tw`bg-white rounded-2xl p-4`}>
                <TouchableOpacity
                  onPress={() => setShowDiscos(true)}
                  activeOpacity={0.75}
                >
                  <View style={tw`flex-row items-center justify-between`}>
                    {loadingProviders ? (
                      <View style={tw`flex-row items-center gap-2`}>
                        <ActivityIndicator size="small" color="#9CA3AF" />
                        <Text style={tw`text-gray-400 text-[14px]`}>Loading providers...</Text>
                      </View>
                    ) : selectedDisco ? (
                      <View>
                        <Text style={tw`text-gray-900 text-[14px] font-semibold`}>{selectedDisco.code || selectedDisco.name}</Text>
                        <Text style={tw`text-gray-400 text-[11px]`}>{selectedDisco.name}</Text>
                      </View>
                    ) : (
                      <Text style={tw`text-gray-400 text-[14px]`}>Choose your electricity provider</Text>
                    )}
                    <Ionicons name="chevron-down" size={18} color="#D1D5DB" />
                  </View>
                </TouchableOpacity>
            </View>
            {errors.disco ? <Text style={tw`text-red-500 text-[12px] mt-1.5 ml-1`}>{errors.disco}</Text> : null}
          </View>

          <View style={tw`mb-5`}>
            <Text style={tw`text-gray-500 text-[12px] font-semibold tracking-wider uppercase mb-3`}>Meter type</Text>
            <View style={tw`bg-white rounded-2xl p-4`}>
              <View style={tw`flex-row gap-2`}>
                {(['prepaid', 'postpaid'] as const).map(type => {
                  const isActive = meterType === type;
                  return (
                    <TouchableOpacity
                      key={type}
                      style={[tw`flex-1 h-[46px] rounded-xl items-center justify-center`, isActive ? tw`bg-amber-500/15 border border-amber-500/40` : { backgroundColor: LIGHT_GRAY, borderWidth: 1, borderColor: '#E5E7EB' }]}
                      onPress={() => setMeterType(type)}
                      activeOpacity={0.75}
                    >
                      <Text style={tw`text-[13px] font-semibold capitalize ${isActive ? 'text-amber-500' : 'text-gray-400'}`}>{type}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>

          <View style={tw`mb-2`}>
            <Text style={tw`text-gray-500 text-[12px] font-semibold tracking-wider uppercase mb-3`}>Meter number</Text>
            <View style={tw`bg-white rounded-2xl p-4`}>
              <View style={[tw`rounded-xl px-4 h-[52px] flex-row items-center`, { backgroundColor: LIGHT_GRAY }]}>
                <TextInput
                  style={tw`flex-1 text-[14px] text-gray-900`}
                  placeholder="Enter meter number"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="number-pad"
                  value={meterNumber}
                  onChangeText={handleMeterChange}
                  onBlur={handleValidateMeter}
                  maxLength={20}
                />
                {isValidating && <ActivityIndicator size="small" color={PRIMARY_COLOR} />}
              </View>
              {customerName ? (
                <View style={[tw`p-3 rounded-2xl mt-3 flex-row items-center gap-2`, { backgroundColor: SUCCESS_GREEN + '1A', borderColor: SUCCESS_GREEN + '33', borderWidth: 1 }]}>
                  <Ionicons name="checkmark-circle" size={17} color={SUCCESS_GREEN} />
                  <Text style={[tw`font-semibold text-[13px]`, { color: SUCCESS_GREEN }]}>{customerName}</Text>
                </View>
              ) : null}
            </View>
            {errors.meter ? <Text style={tw`text-red-500 text-[12px] mt-1.5 ml-1`}>{errors.meter}</Text> : null}
          </View>

          <View style={tw`mb-4`}>
            <Text style={tw`text-gray-500 text-[12px] font-semibold tracking-wider uppercase mb-3`}>Amount</Text>
            <View style={tw`bg-white rounded-2xl p-4`}>
              <View style={[tw`rounded-xl px-4 h-[60px] flex-row items-center`, { backgroundColor: LIGHT_GRAY }]}>
                <Text style={tw`text-gray-400 text-[20px] mr-2`}>₦</Text>
                <TextInput
                  style={tw`flex-1 text-[24px] font-bold text-gray-900`}
                  placeholder="0"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="decimal-pad"
                  value={amount}
                  onChangeText={handleAmountChange}
                />
              </View>
            </View>
            {errors.amount ? <Text style={tw`text-red-500 text-[12px] mt-1.5 ml-1`}>{errors.amount}</Text> : null}
          </View>

          <View style={tw`flex-row flex-wrap gap-2 mb-6`}>
            {quickAmounts.map(amt => (
              <TouchableOpacity
                key={amt}
                style={tw`bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-full`}
                onPress={() => { setAmount(amt.toString()); if (errors.amount) setErrors(p => ({ ...p, amount: '' })); }}
                activeOpacity={0.7}
              >
                <Text style={tw`text-amber-500 text-[13px] font-semibold`}>₦{amt.toLocaleString()}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={tw`mb-6`}>
            <Text style={tw`text-gray-500 text-[12px] font-semibold tracking-wider uppercase mb-3`}>Transaction PIN</Text>
            <View style={tw`bg-white rounded-2xl p-4`}>
              <View style={[tw`rounded-xl px-4 h-[52px] flex-row items-center`, { backgroundColor: LIGHT_GRAY }]}>
                <TextInput
                  style={tw`flex-1 text-[14px] text-gray-900`}
                  placeholder="Enter your PIN"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="number-pad"
                  secureTextEntry={!showPin}
                  maxLength={4}
                  value={pin}
                  onChangeText={(text) => { setPin(text.replace(/[^0-9]/g, '').slice(0, 4)); if (errors.pin) setErrors(p => ({ ...p, pin: '' })); }}
                />
                <TouchableOpacity onPress={() => setShowPin(!showPin)}>
                  <Ionicons name={showPin ? 'eye-outline' : 'eye-off-outline'} size={20} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
            </View>
            {errors.pin ? <Text style={tw`text-red-500 text-[12px] mt-1.5 ml-1`}>{errors.pin}</Text> : null}
          </View>

          <Button
            label="Continue"
            icon="arrow-forward"
            iconPosition="right"
            onPress={handleSubmit}
            disabled={isDisabled}
            loading={isSubmitting}
            size="lg"
          />
        </RefreshableScrollView>
      </KeyboardAvoidingView>

      <Modal visible={showDiscos} animationType="slide" transparent>
        <View style={tw`flex-1 justify-end bg-black/20`}>
          <View style={tw`bg-white rounded-t-3xl pt-6 pb-10 max-h-[70%]`}>
            <View style={tw`px-5 pb-4 border-b border-gray-200 flex-row justify-between items-center`}>
              <Text style={[tw`text-[17px] font-bold tracking-tight`, { color: CHARCOAL }]}>Select disco</Text>
              <TouchableOpacity onPress={() => setShowDiscos(false)} style={tw`w-[34px] h-[34px] rounded-full bg-white border border-gray-200 items-center justify-center`} activeOpacity={0.7}>
                <Ionicons name="close" size={18} color={CHARCOAL} />
              </TouchableOpacity>
            </View>
            {loadingProviders && discoProviders.length === 0 ? (
              <View style={tw`items-center py-16`}>
                <ActivityIndicator size="large" color={PRIMARY_COLOR} />
                <Text style={tw`text-gray-400 text-[13px] mt-3`}>Loading providers...</Text>
              </View>
            ) : (
              <FlatList
                data={discoProviders}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={tw`px-5 py-4 border-b border-gray-200`}
                    onPress={() => { setSelectedDisco(item); setShowDiscos(false); if (errors.disco) setErrors(p => ({ ...p, disco: '' })); }}
                    activeOpacity={0.75}
                  >
                    <Text style={tw`text-gray-900 font-bold text-[14px]`}>{item.code || item.name}</Text>
                    <Text style={tw`text-gray-400 text-[12px] mt-0.5`}>{item.name}</Text>
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
