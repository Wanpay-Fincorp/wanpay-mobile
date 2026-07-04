import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  Alert, FlatList, KeyboardAvoidingView, Modal,
  Platform, SafeAreaView, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import tw from 'twrnc';
import { api } from '@/lib/api';
import RefreshableScrollView from '@/components/RefreshableScrollView';
import Button from '@/components/ui/Button';
import { CHARCOAL, LIGHT_GRAY } from '@/constants/customConstants';

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
    <SafeAreaView style={tw`flex-1 bg-[${LIGHT_GRAY}]`}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={tw`flex-1`}>
        <RefreshableScrollView showsVerticalScrollIndicator={false} contentContainerStyle={tw`px-5 pb-28`}>
          <View style={tw`flex-row items-center mt-14 mb-8`}>
            <TouchableOpacity onPress={() => router.back()} style={tw`w-10 h-10 rounded-full bg-white border border-gray-200 items-center justify-center mr-4`} activeOpacity={0.7}>
              <Ionicons name="arrow-back" size={20} color={CHARCOAL} />
            </TouchableOpacity>
            <View>
              <Text style={tw`text-[${CHARCOAL}] text-[22px] font-bold tracking-tight`}>Education</Text>
              <Text style={tw`text-gray-400 text-[12px] mt-0.5`}>Pay school fees and exam bills</Text>
            </View>
          </View>

          <View style={tw`mb-6`}>
            <Text style={tw`text-gray-500 text-[12px] font-semibold tracking-wider uppercase mb-3`}>Provider</Text>
            <View style={tw`bg-white rounded-2xl p-4`}>
              <TouchableOpacity
                style={tw`bg-[${LIGHT_GRAY}] rounded-xl px-4 h-[56px] flex-row justify-between items-center ${errors.provider ? 'border border-red-500' : ''}`}
                onPress={() => setShowProviders(true)}
                activeOpacity={0.75}
              >
                {selectedProvider ? (
                  <Text style={tw`text-[${CHARCOAL}] text-[14px] font-semibold`}>{selectedProvider.name}</Text>
                ) : (
                  <Text style={tw`text-gray-400 text-[14px]`}>Choose provider</Text>
                )}
                <Ionicons name="chevron-down" size={18} color="#9CA3AF" />
              </TouchableOpacity>
              {errors.provider ? <Text style={tw`text-red-500 text-[12px] mt-1.5 ml-1`}>{errors.provider}</Text> : null}
            </View>
          </View>

          <View style={tw`mb-6`}>
            <Text style={tw`text-gray-500 text-[12px] font-semibold tracking-wider uppercase mb-3`}>Student ID</Text>
            <View style={tw`bg-white rounded-2xl p-4`}>
              <View style={tw`bg-[${LIGHT_GRAY}] rounded-xl px-4 h-[50px] justify-center ${errors.studentId ? 'border border-red-500' : ''}`}>
                <TextInput
                  style={tw`text-[14px] text-[${CHARCOAL}]`}
                  placeholder="Enter student ID or matric number"
                  placeholderTextColor="#9CA3AF"
                  value={studentId}
                  onChangeText={t => { setStudentId(t); if (errors.studentId) setErrors(p => ({ ...p, studentId: '' })); }}
                />
              </View>
              {errors.studentId ? <Text style={tw`text-red-500 text-[12px] mt-1.5 ml-1`}>{errors.studentId}</Text> : null}
            </View>
          </View>

          <View style={tw`mb-6`}>
            <Text style={tw`text-gray-500 text-[12px] font-semibold tracking-wider uppercase mb-3`}>Amount</Text>
            <View style={tw`bg-white rounded-2xl p-4`}>
              <View style={tw`bg-[${LIGHT_GRAY}] rounded-xl px-4 h-[56px] flex-row items-center ${errors.amount ? 'border border-red-500' : ''}`}>
                <Text style={tw`text-gray-400 text-[20px] mr-2 font-bold`}>₦</Text>
                <TextInput
                  style={tw`flex-1 text-[24px] font-bold text-[${CHARCOAL}]`}
                  placeholder="0"
                  placeholderTextColor="#D1D5DB"
                  keyboardType="decimal-pad"
                  value={amount}
                  onChangeText={handleAmountChange}
                />
              </View>
              {errors.amount ? <Text style={tw`text-red-500 text-[12px] mt-1.5 ml-1`}>{errors.amount}</Text> : null}
            </View>
          </View>

          <View style={tw`mb-6`}>
            <Text style={tw`text-gray-500 text-[12px] font-semibold tracking-wider uppercase mb-3`}>Confirm</Text>
            <View style={tw`bg-white rounded-2xl p-4`}>
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
            </View>
          </View>

          <Button
            label="Continue"
            icon="arrow-forward"
            iconPosition="right"
            onPress={handleSubmit}
            disabled={isDisabled}
            loading={isSubmitting}
          />
        </RefreshableScrollView>
      </KeyboardAvoidingView>

      <Modal visible={showProviders} animationType="slide" transparent onRequestClose={() => setShowProviders(false)}>
        <TouchableOpacity style={tw`flex-1 bg-black/40 justify-end`} activeOpacity={1} onPress={() => setShowProviders(false)}>
          <TouchableOpacity activeOpacity={1} onPress={() => {}} style={tw`bg-white rounded-t-3xl min-h-[50%] max-h-[70%]`}>
            <View style={tw`flex-row items-center justify-between px-5 pt-5 pb-3 border-b border-[${LIGHT_GRAY}]`}>
              <Text style={tw`text-[${CHARCOAL}] text-[18px] font-bold`}>Select provider</Text>
              <TouchableOpacity onPress={() => setShowProviders(false)} activeOpacity={0.7}>
                <Ionicons name="close" size={22} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={educationProviders}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={tw`px-5 py-4 border-b border-[${LIGHT_GRAY}]`}
                  onPress={() => { setSelectedProvider(item); setShowProviders(false); if (errors.provider) setErrors(p => ({ ...p, provider: '' })); }}
                  activeOpacity={0.75}
                >
                  <Text style={tw`text-[${CHARCOAL}] font-bold text-[14px]`}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}
