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

interface InternetProvider { id: string; name: string; color: string; }
interface InternetPlan { id: string; name: string; speed: string; price: number; validity: string; }

export default function InternetScreen() {
  const router = useRouter();
  const [selectedProvider, setSelectedProvider] = useState<InternetProvider | null>(null);
  const [accountNumber, setAccountNumber] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<InternetPlan | null>(null);
  const [showPlans, setShowPlans] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({ provider: '', account: '', plan: '', pin: '' });

  const internetProviders: InternetProvider[] = [
    { id: 'smile', name: 'Smile', color: '#FDB913' },
    { id: 'spectranet', name: 'Spectranet', color: '#E31E24' },
    { id: 'swift', name: 'Swift', color: '#00A651' },
    { id: 'ipnx', name: 'IPNX', color: '#0066CC' },
  ];

  const internetPlans: Record<string, InternetPlan[]> = {
    smile: [
      { id: '1', name: 'SmileVoice & Unlimited Lite', speed: '1.5Mbps', price: 4000, validity: '30 Days' },
      { id: '2', name: 'UnlimitedEssential', speed: '2.5Mbps', price: 8000, validity: '30 Days' },
      { id: '3', name: 'UnlimitedBasic', speed: '5Mbps', price: 12000, validity: '30 Days' },
      { id: '4', name: 'UnlimitedPremium', speed: '10Mbps', price: 16000, validity: '30 Days' },
    ],
    spectranet: [
      { id: '1', name: 'Spectra Lite', speed: '2Mbps', price: 5000, validity: '30 Days' },
      { id: '2', name: 'Spectra Value', speed: '5Mbps', price: 10000, validity: '30 Days' },
      { id: '3', name: 'Spectra Plus', speed: '10Mbps', price: 15000, validity: '30 Days' },
      { id: '4', name: 'Spectra Premium', speed: '20Mbps', price: 20000, validity: '30 Days' },
    ],
    swift: [
      { id: '1', name: 'Swift Lite', speed: '2Mbps', price: 4500, validity: '30 Days' },
      { id: '2', name: 'Swift Value', speed: '5Mbps', price: 9500, validity: '30 Days' },
      { id: '3', name: 'Swift Plus', speed: '10Mbps', price: 14000, validity: '30 Days' },
    ],
    ipnx: [
      { id: '1', name: 'IPNX Basic', speed: '2Mbps', price: 5000, validity: '30 Days' },
      { id: '2', name: 'IPNX Standard', speed: '5Mbps', price: 10000, validity: '30 Days' },
      { id: '3', name: 'IPNX Premium', speed: '10Mbps', price: 15000, validity: '30 Days' },
    ],
  };

  const handleAccountChange = (text: string) => {
    const numeric = text.replace(/[^0-9]/g, '');
    if (numeric.length <= 15) {
      setAccountNumber(numeric);
      setCustomerName('');
      if (errors.account) setErrors((prev) => ({ ...prev, account: '' }));
    }
  };

  const handleValidateAccount = async () => {
    if (accountNumber.length >= 8 && selectedProvider) {
      setIsValidating(true);
      try {
        const result = await api.post<any>('/bills/validate', {
          category: 'internet',
          providerCode: selectedProvider.id,
          recipient: accountNumber,
        });
        setCustomerName(result.customerName || 'John Doe');
      } catch {
        Alert.alert('Error', 'Invalid account number. Please check and try again.');
      } finally { setIsValidating(false); }
    }
  };

  const validateForm = () => {
    const newErrors = { provider: '', account: '', plan: '', pin: '' };
    let isValid = true;
    if (!selectedProvider) { newErrors.provider = 'Please select a provider'; isValid = false; }
    if (accountNumber.length < 8) { newErrors.account = 'Account number must be at least 8 digits'; isValid = false; }
    if (!selectedPlan) { newErrors.plan = 'Please select a plan'; isValid = false; }
    if (pin.length !== 4) { newErrors.pin = 'PIN must be 4 digits'; isValid = false; }
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      await api.post('/bills/pay', {
        category: 'internet',
        providerCode: selectedProvider!.id,
        recipient: accountNumber,
        amount: selectedPlan!.price,
        planId: selectedPlan!.id,
        pin,
      });
      Alert.alert('Success', `${selectedPlan?.name} internet plan has been activated`, [
        { text: 'Done', onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Unable to process request. Please try again.');
    } finally { setIsSubmitting(false); }
  };

  const isDisabled = isSubmitting || !selectedProvider || accountNumber.length < 8 || !selectedPlan || pin.length !== 4;
  const providerPlans = selectedProvider ? internetPlans[selectedProvider.id] : [];

  return (
    <SafeAreaView style={[tw`flex-1 pt-5 pb-8`, { backgroundColor: DARK_BG }]}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={tw`flex-1`}>
        <View style={tw`px-5 pt-12 pb-5 border-b border-gray-200`}>
          <View style={tw`flex-row items-center`}>
            <TouchableOpacity onPress={() => router.back()} style={tw`w-[38px] h-[38px] rounded-xl bg-gray-100 items-center justify-center mr-4`} activeOpacity={0.7}>
              <Ionicons name="arrow-back" size={20} color="#374151" />
            </TouchableOpacity>
            <View>
              <Text style={tw`text-gray-900 text-[20px] font-bold tracking-tight`}>Internet/Broadband</Text>
              <Text style={tw`text-gray-400 text-[12px] mt-0.5`}>Subscribe to internet plans</Text>
            </View>
          </View>
        </View>

        <RefreshableScrollView style={tw`flex-1 px-5 pt-6`} showsVerticalScrollIndicator={false} contentContainerStyle={tw`pb-10`}>
          <View style={tw`mb-6`}>
            <Text style={tw`text-gray-600 text-[12px] font-semibold tracking-wide mb-3`}>Select Provider</Text>
            <View style={tw`flex-row gap-3 flex-wrap`}>
              {internetProviders.map((provider) => {
                const isSelected = selectedProvider?.id === provider.id;
                return (
                  <TouchableOpacity
                    key={provider.id}
                    style={[
                      tw`w-[48%] py-4 rounded-2xl items-center border`,
                      isSelected
                        ? { borderColor: provider.color, backgroundColor: `${provider.color}18` }
                        : tw`border-gray-200 bg-gray-50`,
                    ]}
                    onPress={() => { setSelectedProvider(provider); setSelectedPlan(null); if (errors.provider) setErrors((prev) => ({ ...prev, provider: '' })); }}
                    activeOpacity={0.75}
                  >
                    <View style={[tw`w-10 h-10 rounded-xl items-center justify-center mb-2`, { backgroundColor: `${provider.color}20` }]}>
                      <Ionicons name="globe" size={20} color={provider.color} />
                    </View>
                    <Text style={[tw`text-[12px] font-semibold`, { color: isSelected ? provider.color : '#6B7280' }]}>{provider.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {errors.provider ? <Text style={tw`text-red-400 text-[11px] mt-1.5 ml-1`}>{errors.provider}</Text> : null}
          </View>

          <View style={tw`mb-2`}>
            <Text style={tw`text-gray-600 text-[12px] font-semibold tracking-wide mb-2`}>Account Number</Text>
            <View style={tw`bg-gray-50 border ${errors.account ? 'border-red-500/70' : 'border-gray-200'} rounded-2xl px-4 h-[52px] flex-row items-center`}>
              <TextInput
                style={tw`flex-1 text-[14px] text-gray-900`}
                placeholder="Enter account number"
                placeholderTextColor="#E5E7EB"
                keyboardType="number-pad"
                value={accountNumber}
                onChangeText={handleAccountChange}
                onBlur={handleValidateAccount}
                maxLength={15}
              />
              {isValidating && <ActivityIndicator size="small" color="#22d3ee" />}
            </View>
            {errors.account ? <Text style={tw`text-red-400 text-[11px] mt-1.5 ml-1`}>{errors.account}</Text> : null}
          </View>

          {customerName ? (
            <View style={tw`bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-2xl mb-5 flex-row items-center gap-2`}>
              <Ionicons name="checkmark-circle" size={17} color="#10b981" />
              <Text style={tw`text-emerald-400 font-semibold text-[13px]`}>{customerName}</Text>
            </View>
          ) : <View style={tw`mb-5`} />}

          <View style={tw`mb-4`}>
            <Text style={tw`text-gray-600 text-[12px] font-semibold tracking-wide mb-2`}>Transaction PIN</Text>
            <View style={tw`bg-gray-50 border ${errors.pin ? 'border-red-500/70' : 'border-gray-200'} rounded-2xl px-4 h-[52px] flex-row items-center`}>
              <TextInput
                style={tw`flex-1 text-[14px] text-gray-900`}
                placeholder="Enter your PIN"
                placeholderTextColor="#E5E7EB"
                keyboardType="number-pad"
                secureTextEntry={!showPin}
                maxLength={4}
                value={pin}
                onChangeText={(text) => { setPin(text.replace(/[^0-9]/g, '').slice(0, 4)); if (errors.pin) setErrors((prev) => ({ ...prev, pin: '' })); }}
              />
              <TouchableOpacity onPress={() => setShowPin(!showPin)}>
                <Ionicons name={showPin ? 'eye-outline' : 'eye-off-outline'} size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
            {errors.pin ? <Text style={tw`text-red-400 text-[11px] mt-1.5 ml-1`}>{errors.pin}</Text> : null}
          </View>

          {selectedProvider && providerPlans && providerPlans.length > 0 && (
            <>
              <View style={tw`mb-6`}>
                <Text style={tw`text-gray-600 text-[12px] font-semibold tracking-wide mb-3`}>Select Plan</Text>
                <TouchableOpacity
                  style={tw`bg-gray-50 border ${errors.plan ? 'border-red-500/70' : 'border-gray-200'} rounded-2xl px-4 h-[56px] flex-row justify-between items-center`}
                  onPress={() => setShowPlans(true)}
                  activeOpacity={0.75}
                >
                  {selectedPlan ? (
                    <View>
                      <Text style={tw`text-gray-900 text-[14px] font-semibold`}>{selectedPlan.name}</Text>
                      <Text style={tw`text-gray-400 text-[11px]`}>{selectedPlan.speed} · {selectedPlan.validity}</Text>
                    </View>
                  ) : (
                    <Text style={tw`text-gray-300 text-[14px]`}>Choose a plan</Text>
                  )}
                  <Ionicons name="chevron-down" size={18} color="#D1D5DB" />
                </TouchableOpacity>
                {errors.plan ? <Text style={tw`text-red-400 text-[11px] mt-1.5 ml-1`}>{errors.plan}</Text> : null}

                <View style={tw`gap-3 mt-4`}>
                  <Text style={tw`text-gray-600 text-[12px] font-semibold tracking-wide`}>Popular plans</Text>
                  {providerPlans.slice(0, 3).map((plan) => (
                    <TouchableOpacity
                      key={plan.id}
                      style={tw`bg-cyan-500/10 border border-cyan-500/20 p-4 rounded-2xl flex-row justify-between items-center`}
                      onPress={() => { setSelectedPlan(plan); if (errors.plan) setErrors((prev) => ({ ...prev, plan: '' })); }}
                      activeOpacity={0.75}
                    >
                      <View>
                        <Text style={tw`text-gray-900 font-bold text-[13px]`}>{plan.name}</Text>
                        <Text style={tw`text-gray-400 text-[11px] mt-0.5`}>{plan.speed} · {plan.validity}</Text>
                      </View>
                      <Text style={tw`text-cyan-400 font-bold text-[14px]`}>₦{plan.price.toLocaleString()}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </>
          )}

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

      <Modal visible={showPlans} animationType="slide" transparent>
        <View style={tw`flex-1 justify-end bg-black/20`}>
          <View style={[tw`rounded-t-3xl pt-6 pb-10 max-h-[80%]`, { backgroundColor: '#ffffff' }]}>
            <View style={tw`px-5 pb-4 border-b border-gray-200 flex-row justify-between items-center`}>
              <Text style={tw`text-gray-900 text-[17px] font-bold tracking-tight`}>Select Plan</Text>
              <TouchableOpacity onPress={() => setShowPlans(false)} style={tw`w-[34px] h-[34px] rounded-xl bg-gray-100 items-center justify-center`} activeOpacity={0.7}>
                <Ionicons name="close" size={18} color="#374151" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={providerPlans}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={tw`px-5 py-4 border-b border-gray-200 flex-row justify-between items-center`}
                  onPress={() => { setSelectedPlan(item); setShowPlans(false); if (errors.plan) setErrors((prev) => ({ ...prev, plan: '' })); }}
                  activeOpacity={0.75}
                >
                  <View style={tw`flex-1`}>
                    <Text style={tw`text-gray-900 font-bold text-[14px]`}>{item.name}</Text>
                    <Text style={tw`text-gray-400 text-[12px] mt-0.5`}>Speed: {item.speed} · {item.validity}</Text>
                  </View>
                  <Text style={tw`text-cyan-400 font-bold text-[15px]`}>₦{item.price.toLocaleString()}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
