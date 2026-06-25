import { DARK_BG } from '@/constants/customConstants';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  ActivityIndicator, Alert, FlatList, KeyboardAvoidingView, Modal,
  Platform, SafeAreaView, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import tw from 'twrnc';
import { api } from '@/lib/api';
import RefreshableScrollView from '@/components/RefreshableScrollView';

interface DiscoProvider { id: string; name: string; shortName: string; }

export default function ElectricityScreen() {
  const router = useRouter();
  const [selectedDisco, setSelectedDisco] = useState<DiscoProvider | null>(null);
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

  const discoProviders: DiscoProvider[] = [
    { id: 'ekedc', name: 'Eko Electricity Distribution Company',    shortName: 'EKEDC' },
    { id: 'ikedc', name: 'Ikeja Electric',                         shortName: 'IKEDC' },
    { id: 'aedc',  name: 'Abuja Electricity Distribution Company', shortName: 'AEDC'  },
    { id: 'phed',  name: 'Port Harcourt Electricity Distribution', shortName: 'PHED'  },
    { id: 'ibedc', name: 'Ibadan Electricity Distribution Company',shortName: 'IBEDC' },
    { id: 'kedco', name: 'Kano Electricity Distribution Company',  shortName: 'KEDCO' },
  ];

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
    <SafeAreaView style={[tw`flex-1 py-5`, { backgroundColor: DARK_BG }]}>
      <StatusBar style="light" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={tw`flex-1`}>
        <View style={tw`px-5 pt-4 pb-5 border-b border-white/7`}>
          <View style={tw`flex-row items-center`}>
            <TouchableOpacity onPress={() => router.back()} style={tw`w-[38px] h-[38px] rounded-xl bg-white/7 items-center justify-center mr-4`} activeOpacity={0.7}>
              <Ionicons name="arrow-back" size={20} color="rgba(255,255,255,0.75)" />
            </TouchableOpacity>
            <View>
              <Text style={tw`text-white text-[20px] font-bold tracking-tight`}>Electricity bill</Text>
              <Text style={tw`text-white/35 text-[12px] mt-0.5`}>Pay your electricity bills</Text>
            </View>
          </View>
        </View>

        <RefreshableScrollView style={tw`flex-1 px-5 pt-6`} showsVerticalScrollIndicator={false} contentContainerStyle={tw`pb-10`}>
          <View style={tw`mb-5`}>
            <Text style={tw`text-white/55 text-[12px] font-semibold tracking-wide mb-2`}>Select disco</Text>
            <TouchableOpacity
              style={tw`bg-white/5 border ${errors.disco ? 'border-red-500/70' : 'border-white/10'} rounded-2xl px-4 h-[56px] flex-row justify-between items-center`}
              onPress={() => setShowDiscos(true)}
              activeOpacity={0.75}
            >
              {selectedDisco ? (
                <View>
                  <Text style={tw`text-white text-[14px] font-semibold`}>{selectedDisco.shortName}</Text>
                  <Text style={tw`text-white/35 text-[11px]`}>{selectedDisco.name}</Text>
                </View>
              ) : (
                <Text style={tw`text-white/25 text-[14px]`}>Choose your electricity provider</Text>
              )}
              <Ionicons name="chevron-down" size={18} color="rgba(255,255,255,0.3)" />
            </TouchableOpacity>
            {errors.disco ? <Text style={tw`text-red-400 text-[11px] mt-1.5 ml-1`}>{errors.disco}</Text> : null}
          </View>

          <View style={tw`mb-5`}>
            <Text style={tw`text-white/55 text-[12px] font-semibold tracking-wide mb-2`}>Meter type</Text>
            <View style={tw`flex-row gap-2`}>
              {(['prepaid', 'postpaid'] as const).map(type => (
                <TouchableOpacity
                  key={type}
                  style={tw`flex-1 h-[46px] rounded-2xl border items-center justify-center ${meterType === type ? 'bg-amber-500/15 border-amber-500/40' : 'bg-white/4 border-white/10'}`}
                  onPress={() => setMeterType(type)}
                  activeOpacity={0.75}
                >
                  <Text style={tw`text-[13px] font-semibold capitalize ${meterType === type ? 'text-amber-400' : 'text-white/40'}`}>{type}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={tw`mb-2`}>
            <Text style={tw`text-white/55 text-[12px] font-semibold tracking-wide mb-2`}>Meter number</Text>
            <View style={tw`bg-white/5 border ${errors.meter ? 'border-red-500/70' : 'border-white/10'} rounded-2xl px-4 h-[52px] flex-row items-center`}>
              <TextInput
                style={tw`flex-1 text-[14px] text-white`}
                placeholder="Enter meter number"
                placeholderTextColor="rgba(255,255,255,0.2)"
                keyboardType="number-pad"
                value={meterNumber}
                onChangeText={handleMeterChange}
                onBlur={handleValidateMeter}
                maxLength={20}
              />
              {isValidating && <ActivityIndicator size="small" color="#fbbf24" />}
            </View>
            {errors.meter ? <Text style={tw`text-red-400 text-[11px] mt-1.5 ml-1`}>{errors.meter}</Text> : null}
          </View>

          {customerName ? (
            <View style={tw`bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-2xl mb-5 flex-row items-center gap-2`}>
              <Ionicons name="checkmark-circle" size={17} color="#10b981" />
              <Text style={tw`text-emerald-400 font-semibold text-[13px]`}>{customerName}</Text>
            </View>
          ) : <View style={tw`mb-5`} />}

          <View style={tw`mb-4`}>
            <Text style={tw`text-white/55 text-[12px] font-semibold tracking-wide mb-2`}>Amount</Text>
            <View style={tw`bg-white/5 border ${errors.amount ? 'border-red-500/70' : 'border-white/10'} rounded-2xl px-4 h-[60px] flex-row items-center`}>
              <Text style={tw`text-white/40 text-[20px] mr-2`}>₦</Text>
              <TextInput
                style={tw`flex-1 text-[24px] font-bold text-white`}
                placeholder="0"
                placeholderTextColor="rgba(255,255,255,0.15)"
                keyboardType="decimal-pad"
                value={amount}
                onChangeText={handleAmountChange}
              />
            </View>
            {errors.amount ? <Text style={tw`text-red-400 text-[11px] mt-1.5 ml-1`}>{errors.amount}</Text> : null}
          </View>

          <View style={tw`mb-4`}>
            <Text style={tw`text-white/55 text-[12px] font-semibold tracking-wide mb-2`}>Transaction PIN</Text>
            <View style={tw`bg-white/5 border ${errors.pin ? 'border-red-500/70' : 'border-white/10'} rounded-2xl px-4 h-[52px] flex-row items-center`}>
              <TextInput
                style={tw`flex-1 text-[14px] text-white`}
                placeholder="Enter your PIN"
                placeholderTextColor="rgba(255,255,255,0.2)"
                keyboardType="number-pad"
                secureTextEntry={!showPin}
                maxLength={4}
                value={pin}
                onChangeText={(text) => { setPin(text.replace(/[^0-9]/g, '').slice(0, 4)); if (errors.pin) setErrors(p => ({ ...p, pin: '' })); }}
              />
              <TouchableOpacity onPress={() => setShowPin(!showPin)}>
                <Ionicons name={showPin ? 'eye-outline' : 'eye-off-outline'} size={20} color="rgba(255,255,255,0.35)" />
              </TouchableOpacity>
            </View>
            {errors.pin ? <Text style={tw`text-red-400 text-[11px] mt-1.5 ml-1`}>{errors.pin}</Text> : null}
          </View>

          <View style={tw`flex-row flex-wrap gap-2 mb-6`}>
            {quickAmounts.map(amt => (
              <TouchableOpacity
                key={amt}
                style={tw`bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-full`}
                onPress={() => { setAmount(amt.toString()); if (errors.amount) setErrors(p => ({ ...p, amount: '' })); }}
                activeOpacity={0.7}
              >
                <Text style={tw`text-amber-400 text-[13px] font-semibold`}>₦{amt.toLocaleString()}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={tw`bg-blue-500 h-[52px] rounded-2xl items-center justify-center ${isDisabled ? 'opacity-50' : ''}`}
            disabled={isDisabled}
            onPress={handleSubmit}
            activeOpacity={0.85}
          >
            {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={tw`text-white font-semibold text-[15px] tracking-tight`}>Continue</Text>}
          </TouchableOpacity>
        </RefreshableScrollView>
      </KeyboardAvoidingView>

      <Modal visible={showDiscos} animationType="slide" transparent>
        <View style={tw`flex-1 justify-end bg-black/60`}>
          <View style={[tw`rounded-t-3xl pt-6 pb-10 max-h-[70%]`, { backgroundColor: '#0f0f1e' }]}>
            <View style={tw`px-5 pb-4 border-b border-white/7 flex-row justify-between items-center`}>
              <Text style={tw`text-white text-[17px] font-bold tracking-tight`}>Select disco</Text>
              <TouchableOpacity onPress={() => setShowDiscos(false)} style={tw`w-[34px] h-[34px] rounded-xl bg-white/7 items-center justify-center`} activeOpacity={0.7}>
                <Ionicons name="close" size={18} color="rgba(255,255,255,0.7)" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={discoProviders}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={tw`px-5 py-4 border-b border-white/7`}
                  onPress={() => { setSelectedDisco(item); setShowDiscos(false); if (errors.disco) setErrors(p => ({ ...p, disco: '' })); }}
                  activeOpacity={0.75}
                >
                  <Text style={tw`text-white font-bold text-[14px]`}>{item.shortName}</Text>
                  <Text style={tw`text-white/35 text-[12px] mt-0.5`}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
