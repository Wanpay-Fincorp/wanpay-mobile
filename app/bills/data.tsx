import { PRIMARY_COLOR, CHARCOAL, LIGHT_GRAY } from '@/constants/customConstants';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState, useCallback } from 'react';
import {
  ActivityIndicator, Alert, FlatList, KeyboardAvoidingView, Modal,
  Platform, SafeAreaView, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import tw from 'twrnc';
import { api } from '@/lib/api';
import Button from '@/components/ui/Button';
import RefreshableScrollView from '@/components/RefreshableScrollView';
import type { BillPlan } from '@/lib/types';

interface Network { id: string; name: string; color: string; }

export default function DataScreen() {
  const router = useRouter();
  const [selectedNetwork, setSelectedNetwork] = useState<Network | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<BillPlan | null>(null);
  const [showPlans, setShowPlans] = useState(false);
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({ network: '', phone: '', plan: '', pin: '' });
  const [dataPlans, setDataPlans] = useState<BillPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);

  const networks: Network[] = [
    { id: 'mtn',     name: 'MTN',     color: '#FFCC00' },
    { id: 'glo',     name: 'Glo',     color: '#00A95C' },
    { id: 'airtel',  name: 'Airtel',  color: '#ED1C24' },
    { id: '9mobile', name: '9mobile', color: '#00853E' },
  ];

  const fetchPlans = useCallback(async (providerCode: string) => {
    setLoadingPlans(true);
    try {
      const plans = await api.get<BillPlan[]>(`/bills/plans?providerCode=${providerCode}`);
      if (Array.isArray(plans)) setDataPlans(plans);
    } catch {
      setDataPlans([]);
    } finally {
      setLoadingPlans(false);
    }
  }, []);

  const handlePhoneChange = (text: string) => {
    const numeric = text.replace(/[^0-9]/g, '');
    if (numeric.length <= 10) {
      setPhoneNumber(numeric);
      if (errors.phone) setErrors(p => ({ ...p, phone: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = { network: '', phone: '', plan: '', pin: '' };
    let isValid = true;
    if (!selectedNetwork) { newErrors.network = 'Please select a network'; isValid = false; }
    if (phoneNumber.length !== 10) { newErrors.phone = 'Phone number must be 10 digits'; isValid = false; }
    if (!selectedPlan) { newErrors.plan = 'Please select a data plan'; isValid = false; }
    if (pin.length !== 4) { newErrors.pin = 'PIN must be 4 digits'; isValid = false; }
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      await api.post('/bills/pay', {
        category: 'data',
        providerCode: selectedNetwork!.id,
        recipient: `+234${phoneNumber}`,
        amount: Number(selectedPlan!.price),
        planId: selectedPlan!.id,
        pin,
      });
      Alert.alert('Success', `${selectedPlan?.name} data plan activated for ${phoneNumber}`, [
        { text: 'Done', onPress: () => router.back() },
      ]);
    } catch (err: any) { Alert.alert('Error', err.message || 'Unable to process request. Please try again.'); }
    finally { setIsSubmitting(false); }
  };

  const isDisabled = isSubmitting || !selectedNetwork || phoneNumber.length !== 10 || !selectedPlan || pin.length !== 4;

  return (
    <SafeAreaView style={[tw`flex-1 pt-5 pb-8`, { backgroundColor: LIGHT_GRAY }]}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={tw`flex-1`}>
        <View style={tw`px-5 pt-14 pb-5 border-b border-gray-200`}>
          <View style={tw`flex-row items-center`}>
            <TouchableOpacity onPress={() => router.back()} style={tw`w-10 h-10 rounded-full bg-white border border-gray-200 items-center justify-center mr-4`} activeOpacity={0.7}>
              <Ionicons name="arrow-back" size={20} color="#374151" />
            </TouchableOpacity>
            <View>
              <Text style={tw`text-[${CHARCOAL}] text-[22px] font-bold tracking-tight`}>Buy data</Text>
              <Text style={tw`text-gray-500 text-[12px] mt-0.5`}>Subscribe to data bundles</Text>
            </View>
          </View>
        </View>

        <RefreshableScrollView style={tw`flex-1 px-5 pt-6`} showsVerticalScrollIndicator={false} contentContainerStyle={tw`pb-28`}>
          <View style={tw`mb-6`}>
            <Text style={tw`text-gray-500 text-[12px] font-semibold tracking-wider uppercase mb-3`}>Select network</Text>
            <View style={tw`flex-row gap-2`}>
              {networks.map(network => {
                const isSelected = selectedNetwork?.id === network.id;
                return (
                  <TouchableOpacity
                    key={network.id}
                    style={[
                      tw`flex-1 py-3.5 rounded-2xl items-center border`,
                      isSelected
                        ? { borderColor: `${network.color}60`, backgroundColor: `${network.color}18` }
                        : tw`border-gray-200 bg-[${LIGHT_GRAY}]`,
                    ]}
                    onPress={() => { setSelectedNetwork(network); setSelectedPlan(null); setDataPlans([]); fetchPlans(network.id); if (errors.network) setErrors(p => ({ ...p, network: '' })); }}
                    activeOpacity={0.75}
                  >
                    <View style={[tw`w-9 h-9 rounded-xl items-center justify-center mb-2`, { backgroundColor: `${network.color}20` }]}>
                      <Ionicons name="phone-portrait-outline" size={18} color={network.color} />
                    </View>
                    <Text style={[tw`text-[11px] font-semibold`, { color: isSelected ? network.color : '#6B7280' }]}>{network.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {errors.network ? <Text style={tw`text-red-500 text-[12px] mt-1.5 ml-1`}>{errors.network}</Text> : null}
          </View>

          <View style={tw`bg-white rounded-2xl p-4 mb-6`}>
            <View style={tw`mb-5`}>
              <Text style={tw`text-gray-500 text-[12px] font-semibold tracking-wider uppercase mb-3`}>Phone number</Text>
              <View style={tw`flex-row items-center bg-[${LIGHT_GRAY}] border ${errors.phone ? 'border-red-500/70' : 'border-gray-200'} rounded-2xl px-4 h-[52px]`}>
                <Text style={tw`text-gray-700 text-[13px] font-semibold`}>+234</Text>
                <View style={tw`w-px h-[18px] bg-gray-300 mx-2.5`} />
                <TextInput
                  style={tw`flex-1 text-[14px] text-gray-900`}
                  placeholder="8012345678"
                  placeholderTextColor="#E5E7EB"
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={phoneNumber}
                  onChangeText={handlePhoneChange}
                />
              </View>
              {errors.phone ? <Text style={tw`text-red-500 text-[12px] mt-1.5 ml-1`}>{errors.phone}</Text> : null}
            </View>

            <View style={tw`mb-5`}>
              <Text style={tw`text-gray-500 text-[12px] font-semibold tracking-wider uppercase mb-3`}>Data plan</Text>
              <TouchableOpacity
                style={tw`bg-[${LIGHT_GRAY}] border ${errors.plan ? 'border-red-500/70' : 'border-gray-200'} rounded-2xl px-4 h-[56px] flex-row justify-between items-center`}
                onPress={() => { if (selectedNetwork && dataPlans.length > 0) setShowPlans(true); }}
                activeOpacity={0.75}
              >
                {loadingPlans ? (
                  <View style={tw`flex-row items-center gap-2`}>
                    <ActivityIndicator size="small" color="#9CA3AF" />
                    <Text style={tw`text-gray-400 text-[14px]`}>Loading plans...</Text>
                  </View>
                ) : selectedPlan ? (
                  <View>
                    <Text style={tw`text-gray-900 text-[14px] font-semibold`}>{selectedPlan.name}</Text>
                    <Text style={tw`text-gray-500 text-[11px]`}>{selectedPlan.validity ? `${selectedPlan.validity} · ` : ''}₦{Number(selectedPlan.price).toLocaleString()}</Text>
                  </View>
                ) : !selectedNetwork ? (
                  <Text style={tw`text-gray-400 text-[14px]`}>Select a network first</Text>
                ) : (
                  <Text style={tw`text-gray-400 text-[14px]`}>Choose a data plan</Text>
                )}
                <Ionicons name="chevron-down" size={18} color="#9CA3AF" />
              </TouchableOpacity>
              {errors.plan ? <Text style={tw`text-red-500 text-[12px] mt-1.5 ml-1`}>{errors.plan}</Text> : null}
            </View>

            <View>
              <Text style={tw`text-gray-500 text-[12px] font-semibold tracking-wider uppercase mb-3`}>Transaction PIN</Text>
              <View style={tw`bg-[${LIGHT_GRAY}] border ${errors.pin ? 'border-red-500/70' : 'border-gray-200'} rounded-2xl px-4 h-[52px] flex-row items-center`}>
                <TextInput
                  style={tw`flex-1 text-[14px] text-gray-900`}
                  placeholder="Enter your PIN"
                  placeholderTextColor="#E5E7EB"
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
              {errors.pin ? <Text style={tw`text-red-500 text-[12px] mt-1.5 ml-1`}>{errors.pin}</Text> : null}
            </View>
          </View>

          <View style={tw`mb-6`}>
            <Text style={tw`text-gray-500 text-[12px] font-semibold tracking-wider uppercase mb-3`}>Popular plans</Text>
            <View style={tw`flex-row gap-2`}>
              {dataPlans.slice(0, 3).map(plan => (
                <TouchableOpacity
                  key={plan.id}
                  style={tw`flex-1 bg-[${PRIMARY_COLOR}]/10 border border-[${PRIMARY_COLOR}]/20 p-3 rounded-2xl`}
                  onPress={() => { setSelectedPlan(plan); if (errors.plan) setErrors(p => ({ ...p, plan: '' })); }}
                  activeOpacity={0.75}
                >
                  <Text style={tw`text-[${PRIMARY_COLOR}] font-bold text-[13px]`}>{plan.name}</Text>
                  <Text style={tw`text-gray-500 text-[11px] mt-1`}>₦{plan.price.toLocaleString()}</Text>
                  <Text style={tw`text-gray-400 text-[10px] mt-0.5`}>{plan.validity}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <Button
            label="Continue"
            onPress={handleSubmit}
            icon="arrow-forward"
            iconPosition="right"
            loading={isSubmitting}
            disabled={isDisabled}
            size="lg"
          />
        </RefreshableScrollView>
      </KeyboardAvoidingView>

      <Modal visible={showPlans} animationType="slide" transparent>
        <View style={tw`flex-1 justify-end bg-black/20`}>
          <View style={[tw`rounded-t-3xl pt-6 pb-10 max-h-[80%]`, { backgroundColor: '#ffffff' }]}>
            <View style={tw`px-5 pb-4 border-b border-gray-200 flex-row justify-between items-center`}>
              <Text style={tw`text-gray-900 text-[17px] font-bold tracking-tight`}>Select data plan</Text>
              <TouchableOpacity onPress={() => setShowPlans(false)} style={tw`w-[34px] h-[34px] rounded-xl bg-[${LIGHT_GRAY}] items-center justify-center`} activeOpacity={0.7}>
                <Ionicons name="close" size={18} color="#374151" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={dataPlans}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={tw`px-5 py-4 border-b border-gray-200 flex-row justify-between items-center`}
                  onPress={() => { setSelectedPlan(item); setShowPlans(false); if (errors.plan) setErrors(p => ({ ...p, plan: '' })); }}
                  activeOpacity={0.75}
                >
                  <View>
                    <Text style={tw`text-gray-900 font-bold text-[14px]`}>{item.name}</Text>
                    <Text style={tw`text-gray-500 text-[12px] mt-0.5`}>Valid for {item.validity}</Text>
                  </View>
                  <Text style={tw`text-[${PRIMARY_COLOR}] font-bold text-[15px]`}>₦{item.price.toLocaleString()}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
