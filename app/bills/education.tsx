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

export default function EducationScreen() {
  const router = useRouter();
  const [selectedProvider, setSelectedProvider] = useState<{ id: string; name: string } | null>(null);
  const [studentId, setStudentId] = useState('');
  const [amount, setAmount] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [showProviders, setShowProviders] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({ provider: '', studentId: '', amount: '', pin: '' });

  const educationProviders = [
    { id: 'waec', name: 'WAEC' },
    { id: 'jamb', name: 'JAMB' },
    { id: 'neco', name: 'NECO' },
    { id: 'nabteb', name: 'NABTEB' },
    { id: 'schoolfees', name: 'School Fees' },
  ];

  const handleAmountChange = (text: string) => {
    const numeric = text.replace(/[^0-9]/g, '');
    setAmount(numeric);
    if (errors.amount) setErrors(p => ({ ...p, amount: '' }));
  };

  const validateForm = () => {
    const newErrors = { provider: '', studentId: '', amount: '', pin: '' };
    let isValid = true;
    if (!selectedProvider) { newErrors.provider = 'Please select a provider'; isValid = false; }
    if (!studentId.trim()) { newErrors.studentId = 'Student ID is required'; isValid = false; }
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
        category: 'education',
        providerCode: selectedProvider!.id,
        recipient: studentId.trim(),
        amount: parseFloat(amount),
        pin,
      });
      Alert.alert('Success', 'Education payment has been processed', [
        { text: 'Done', onPress: () => router.back() },
      ]);
    } catch (err: any) { Alert.alert('Error', err.message || 'Unable to process request. Please try again.'); }
    finally { setIsSubmitting(false); }
  };

  const isDisabled = isSubmitting || !selectedProvider || !studentId || !amount || pin.length !== 4;

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
              <Text style={tw`text-white text-[20px] font-bold tracking-tight`}>Education payment</Text>
              <Text style={tw`text-white/35 text-[12px] mt-0.5`}>Pay school fees and education bills</Text>
            </View>
          </View>
        </View>

        <RefreshableScrollView style={tw`flex-1 px-5 pt-6`} showsVerticalScrollIndicator={false} contentContainerStyle={tw`pb-10`}>
          <View style={tw`mb-5`}>
            <Text style={tw`text-white/55 text-[12px] font-semibold tracking-wide mb-2`}>Provider / Exam body</Text>
            <TouchableOpacity
              style={tw`bg-white/5 border ${errors.provider ? 'border-red-500/70' : 'border-white/10'} rounded-2xl px-4 h-[56px] flex-row justify-between items-center`}
              onPress={() => setShowProviders(true)}
              activeOpacity={0.75}
            >
              {selectedProvider ? (
                <Text style={tw`text-white text-[14px] font-semibold`}>{selectedProvider.name}</Text>
              ) : (
                <Text style={tw`text-white/25 text-[14px]`}>Choose provider</Text>
              )}
              <Ionicons name="chevron-down" size={18} color="rgba(255,255,255,0.3)" />
            </TouchableOpacity>
            {errors.provider ? <Text style={tw`text-red-400 text-[11px] mt-1.5 ml-1`}>{errors.provider}</Text> : null}
          </View>

          <View style={tw`mb-5`}>
            <Text style={tw`text-white/55 text-[12px] font-semibold tracking-wide mb-2`}>Student ID / matric number</Text>
            <View style={tw`bg-white/5 border ${errors.studentId ? 'border-red-500/70' : 'border-white/10'} rounded-2xl px-4 h-[52px] justify-center`}>
              <TextInput
                style={tw`text-[14px] text-white`}
                placeholder="Enter student ID"
                placeholderTextColor="rgba(255,255,255,0.2)"
                value={studentId}
                onChangeText={t => { setStudentId(t); if (errors.studentId) setErrors(p => ({ ...p, studentId: '' })); }}
              />
            </View>
            {errors.studentId ? <Text style={tw`text-red-400 text-[11px] mt-1.5 ml-1`}>{errors.studentId}</Text> : null}
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

          <View style={tw`mb-7`}>
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
      <Modal visible={showProviders} animationType="slide" transparent>
        <View style={tw`flex-1 justify-end bg-black/60`}>
          <View style={[tw`rounded-t-3xl pt-6 pb-10 max-h-[70%]`, { backgroundColor: '#0f0f1e' }]}>
            <View style={tw`px-5 pb-4 border-b border-white/7 flex-row justify-between items-center`}>
              <Text style={tw`text-white text-[17px] font-bold tracking-tight`}>Select provider</Text>
              <TouchableOpacity onPress={() => setShowProviders(false)} style={tw`w-[34px] h-[34px] rounded-xl bg-white/7 items-center justify-center`} activeOpacity={0.7}>
                <Ionicons name="close" size={18} color="rgba(255,255,255,0.7)" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={educationProviders}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={tw`px-5 py-4 border-b border-white/7`}
                  onPress={() => { setSelectedProvider(item); setShowProviders(false); if (errors.provider) setErrors(p => ({ ...p, provider: '' })); }}
                  activeOpacity={0.75}
                >
                  <Text style={tw`text-white font-bold text-[14px]`}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
