import { PRIMARY_COLOR, CHARCOAL, LIGHT_GRAY, SUCCESS_GREEN } from '@/constants/customConstants';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import RefreshableScrollView from '@/components/RefreshableScrollView';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import tw from 'twrnc';
import { api } from '@/lib/api';
import Button from '@/components/ui/Button';

interface Network { id: string; name: string; color: string; }

export default function AirtimeScreen() {
  const router = useRouter();
  const [selectedNetwork, setSelectedNetwork] = useState<Network | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({ network: '', phone: '', amount: '', pin: '' });

  const networks: Network[] = [
    { id: 'mtn',     name: 'MTN',     color: '#FFCC00' },
    { id: 'glo',     name: 'Glo',     color: '#00A95C' },
    { id: 'airtel',  name: 'Airtel',  color: '#ED1C24' },
    { id: '9mobile', name: '9mobile', color: '#00853E' },
  ];

  const quickAmounts = [100, 200, 500, 1000, 2000, 5000];

  const handlePhoneChange = (text: string) => {
    const numeric = text.replace(/[^0-9]/g, '');
    if (numeric.length <= 10) {
      setPhoneNumber(numeric);
      if (errors.phone) setErrors(p => ({ ...p, phone: '' }));
    }
  };

  const handleAmountChange = (text: string) => {
    const numeric = text.replace(/[^0-9]/g, '');
    setAmount(numeric);
    if (errors.amount) setErrors(p => ({ ...p, amount: '' }));
  };

  const validateForm = () => {
    const newErrors = { network: '', phone: '', amount: '', pin: '' };
    let isValid = true;
    if (!selectedNetwork) { newErrors.network = 'Please select a network'; isValid = false; }
    if (phoneNumber.length !== 10) { newErrors.phone = 'Phone number must be 10 digits'; isValid = false; }
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
        category: 'airtime',
        providerCode: selectedNetwork!.id,
        recipient: `+234${phoneNumber}`,
        amount: parseFloat(amount),
        pin,
      });
      Alert.alert('Success', `₦${amount} airtime sent to ${phoneNumber}`, [
        { text: 'Done', onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Unable to process request. Please try again.');
    } finally { setIsSubmitting(false); }
  };

  const isDisabled = isSubmitting || !selectedNetwork || phoneNumber.length !== 10 || !amount || pin.length !== 4;

  return (
    <SafeAreaView style={[tw`flex-1 pb-8`, { backgroundColor: LIGHT_GRAY }]}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={tw`flex-1`}>
        <View style={tw`px-5 pt-14 pb-5`}>
          <View style={tw`flex-row items-center`}>
            <TouchableOpacity onPress={() => router.back()} style={tw`w-10 h-10 rounded-full bg-white border border-gray-200 items-center justify-center mr-4`} activeOpacity={0.7}>
              <Ionicons name="arrow-back" size={20} color={CHARCOAL} />
            </TouchableOpacity>
            <View>
              <Text style={[tw`text-[22px] font-bold tracking-tight`, { color: CHARCOAL }]}>Buy airtime</Text>
              <Text style={tw`text-gray-400 text-[12px] mt-0.5`}>Instant airtime top-up</Text>
            </View>
          </View>
        </View>

        <RefreshableScrollView style={tw`flex-1 px-5`} showsVerticalScrollIndicator={false} contentContainerStyle={tw`pb-28`}>
          <View style={tw`mb-6`}>
            <Text style={tw`text-gray-500 text-[12px] font-semibold tracking-wider uppercase mb-3`}>Select network</Text>
            <View style={tw`flex-row justify-between gap-2`}>
              {networks.map(network => {
                const isSelected = selectedNetwork?.id === network.id;
                return (
                  <TouchableOpacity
                    key={network.id}
                    style={[
                      tw`flex-1 py-3.5 rounded-2xl items-center border`,
                      isSelected
                        ? { borderColor: `${network.color}60`, backgroundColor: `${network.color}18` }
                        : tw`bg-[${LIGHT_GRAY}] border-gray-200`,
                    ]}
                    onPress={() => { setSelectedNetwork(network); if (errors.network) setErrors(p => ({ ...p, network: '' })); }}
                    activeOpacity={0.75}
                  >
                    <View style={[tw`w-9 h-9 rounded-xl items-center justify-center mb-2`, { backgroundColor: `${network.color}20` }]}>
                      <Ionicons name="phone-portrait-outline" size={18} color={isSelected ? network.color : '#9CA3AF'} />
                    </View>
                    <Text style={[tw`text-[11px] font-semibold`, { color: isSelected ? network.color : '#6B7280' }]}>{network.name}</Text>
                    {isSelected ? (
                      <View style={[tw`absolute top-1 right-1 w-3.5 h-3.5 rounded-full items-center justify-center`, { backgroundColor: SUCCESS_GREEN }]}>
                        <Ionicons name="checkmark" size={10} color="#fff" />
                      </View>
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </View>
            {errors.network ? <Text style={tw`text-red-500 text-[12px] mt-1.5 ml-1`}>{errors.network}</Text> : null}
          </View>

          <Text style={tw`text-gray-500 text-[12px] font-semibold tracking-wider uppercase mb-3`}>Phone number</Text>
          <View style={tw`bg-white rounded-2xl p-4 mb-5`}>
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

          <Text style={tw`text-gray-500 text-[12px] font-semibold tracking-wider uppercase mb-3`}>Amount</Text>
          <View style={tw`bg-white rounded-2xl p-4 mb-5`}>
            <View style={tw`bg-[${LIGHT_GRAY}] border ${errors.amount ? 'border-red-500/70' : 'border-gray-200'} rounded-2xl px-4 h-[60px] flex-row items-center`}>
              <Text style={tw`text-gray-400 text-[20px] mr-2`}>₦</Text>
              <TextInput
                style={tw`flex-1 text-[24px] font-bold text-gray-900`}
                placeholder="0"
                placeholderTextColor="#E5E7EB"
                keyboardType="decimal-pad"
                value={amount}
                onChangeText={handleAmountChange}
              />
            </View>
            {errors.amount ? <Text style={tw`text-red-500 text-[12px] mt-1.5 ml-1`}>{errors.amount}</Text> : null}
          </View>

          <View style={tw`flex-row flex-wrap gap-2 mb-6`}>
            {quickAmounts.map(amt => (
              <TouchableOpacity
                key={amt}
                style={[tw`px-4 py-2 rounded-full border`, { backgroundColor: `${PRIMARY_COLOR}10`, borderColor: `${PRIMARY_COLOR}20` }]}
                onPress={() => { setAmount(amt.toString()); if (errors.amount) setErrors(p => ({ ...p, amount: '' })); }}
                activeOpacity={0.7}
              >
                <Text style={[tw`text-[13px] font-semibold`, { color: PRIMARY_COLOR }]}>₦{amt.toLocaleString()}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={tw`text-gray-500 text-[12px] font-semibold tracking-wider uppercase mb-3`}>Transaction PIN</Text>
          <View style={tw`bg-white rounded-2xl p-4 mb-6`}>
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

          <View style={tw`mb-4`}>
            <Button
              label="Buy airtime"
              icon="arrow-forward"
              iconPosition="right"
              onPress={handleSubmit}
              loading={isSubmitting}
              disabled={isDisabled}
            />
          </View>
        </RefreshableScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
