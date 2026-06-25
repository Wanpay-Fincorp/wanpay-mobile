import { DARK_BG } from '@/constants/customConstants';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import RefreshableScrollView from '@/components/RefreshableScrollView';
import React, { useState } from 'react';
import {
  ActivityIndicator,
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
    <SafeAreaView style={[tw`flex-1 py-5`, { backgroundColor: DARK_BG }]}>
      <StatusBar style="light" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={tw`flex-1`}>
        <View style={tw`px-5 pt-4 pb-5 border-b border-white/7`}>
          <View style={tw`flex-row items-center`}>
            <TouchableOpacity onPress={() => router.back()} style={tw`w-[38px] h-[38px] rounded-xl bg-white/7 items-center justify-center mr-4`} activeOpacity={0.7}>
              <Ionicons name="arrow-back" size={20} color="rgba(255,255,255,0.75)" />
            </TouchableOpacity>
            <View>
              <Text style={tw`text-white text-[20px] font-bold tracking-tight`}>Buy airtime</Text>
              <Text style={tw`text-white/35 text-[12px] mt-0.5`}>Instant airtime top-up</Text>
            </View>
          </View>
        </View>

        <RefreshableScrollView style={tw`flex-1 px-5 pt-6`} showsVerticalScrollIndicator={false} contentContainerStyle={tw`pb-10`}>
          <View style={tw`mb-6`}>
            <Text style={tw`text-white/55 text-[12px] font-semibold tracking-wide mb-3`}>Select network</Text>
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
                        : tw`border-white/10 bg-white/4`,
                    ]}
                    onPress={() => { setSelectedNetwork(network); if (errors.network) setErrors(p => ({ ...p, network: '' })); }}
                    activeOpacity={0.75}
                  >
                    <View style={[tw`w-9 h-9 rounded-xl items-center justify-center mb-2`, { backgroundColor: `${network.color}20` }]}>
                      <Ionicons name="phone-portrait-outline" size={18} color={network.color} />
                    </View>
                    <Text style={[tw`text-[11px] font-semibold`, { color: isSelected ? network.color : 'rgba(255,255,255,0.5)' }]}>{network.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {errors.network ? <Text style={tw`text-red-400 text-[11px] mt-1.5 ml-1`}>{errors.network}</Text> : null}
          </View>

          <View style={tw`mb-5`}>
            <Text style={tw`text-white/55 text-[12px] font-semibold tracking-wide mb-2`}>Phone number</Text>
            <View style={tw`flex-row items-center bg-white/5 border ${errors.phone ? 'border-red-500/70' : 'border-white/10'} rounded-2xl px-4 h-[52px]`}>
              <Text style={tw`text-white/65 text-[13px] font-semibold`}>+234</Text>
              <View style={tw`w-px h-[18px] bg-white/15 mx-2.5`} />
              <TextInput
                style={tw`flex-1 text-[14px] text-white`}
                placeholder="8012345678"
                placeholderTextColor="rgba(255,255,255,0.2)"
                keyboardType="phone-pad"
                maxLength={10}
                value={phoneNumber}
                onChangeText={handlePhoneChange}
              />
            </View>
            {errors.phone ? <Text style={tw`text-red-400 text-[11px] mt-1.5 ml-1`}>{errors.phone}</Text> : null}
          </View>

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

          <View style={tw`flex-row flex-wrap gap-2 mb-7`}>
            {quickAmounts.map(amt => (
              <TouchableOpacity
                key={amt}
                style={tw`bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-full`}
                onPress={() => { setAmount(amt.toString()); if (errors.amount) setErrors(p => ({ ...p, amount: '' })); }}
                activeOpacity={0.7}
              >
                <Text style={tw`text-blue-400 text-[13px] font-semibold`}>₦{amt.toLocaleString()}</Text>
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
    </SafeAreaView>
  );
}
