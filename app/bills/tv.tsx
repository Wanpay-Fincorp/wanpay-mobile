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

interface TVProvider { id: string; name: string; color: string; }
interface Package { id: string; name: string; price: number; validity: string; }

export default function TVSubscriptionScreen() {
  const router = useRouter();
  const [selectedProvider, setSelectedProvider] = useState<TVProvider | null>(null);
  const [smartCardNumber, setSmartCardNumber] = useState('');
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [showPackages, setShowPackages] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({ provider: '', card: '', package: '', pin: '' });

  const tvProviders: TVProvider[] = [
    { id: 'dstv',     name: 'DSTV',     color: '#0033A0' },
    { id: 'gotv',     name: 'GOtv',     color: '#E2231A' },
    { id: 'startimes',name: 'Startimes',color: '#FF6B00' },
    { id: 'showmax',  name: 'Showmax',  color: '#E50914' },
  ];

  const packages: Record<string, Package[]> = {
    dstv:      [{ id:'1',name:'DSTV Padi',price:2500,validity:'1 Month'},{ id:'2',name:'DSTV Yanga',price:3500,validity:'1 Month'},{ id:'3',name:'DSTV Confam',price:6200,validity:'1 Month'},{ id:'4',name:'DSTV Compact',price:10500,validity:'1 Month'},{ id:'5',name:'DSTV Compact Plus',price:16600,validity:'1 Month'},{ id:'6',name:'DSTV Premium',price:24500,validity:'1 Month'}],
    gotv:      [{ id:'1',name:'GOtv Smallie',price:1300,validity:'1 Month'},{ id:'2',name:'GOtv Jinja',price:2250,validity:'1 Month'},{ id:'3',name:'GOtv Jolli',price:3300,validity:'1 Month'},{ id:'4',name:'GOtv Max',price:4850,validity:'1 Month'},{ id:'5',name:'GOtv Supa',price:6400,validity:'1 Month'}],
    startimes: [{ id:'1',name:'Nova',price:1200,validity:'1 Month'},{ id:'2',name:'Basic',price:2100,validity:'1 Month'},{ id:'3',name:'Smart',price:2800,validity:'1 Month'},{ id:'4',name:'Classic',price:3500,validity:'1 Month'},{ id:'5',name:'Super',price:5500,validity:'1 Month'}],
    showmax:   [{ id:'1',name:'Showmax Pro',price:4200,validity:'1 Month'},{ id:'2',name:'Showmax Mobile',price:1200,validity:'1 Month'}],
  };

  const handleCardChange = (text: string) => {
    const numeric = text.replace(/[^0-9]/g, '');
    if (numeric.length <= 15) {
      setSmartCardNumber(numeric);
      setCustomerName('');
      if (errors.card) setErrors(p => ({ ...p, card: '' }));
    }
  };

  const handleValidateCard = async () => {
    if (smartCardNumber.length >= 10 && selectedProvider) {
      setIsValidating(true);
      try {
        const result = await api.post<any>('/bills/validate', {
          category: 'tv',
          providerCode: selectedProvider.id,
          recipient: smartCardNumber,
        });
        setCustomerName(result.customerName || 'John Doe');
      } catch {
        Alert.alert('Error', 'Invalid smart card number. Please check and try again.');
      } finally { setIsValidating(false); }
    }
  };

  const validateForm = () => {
    const newErrors = { provider: '', card: '', package: '', pin: '' };
    let isValid = true;
    if (!selectedProvider) { newErrors.provider = 'Please select a provider'; isValid = false; }
    if (smartCardNumber.length < 10) { newErrors.card = 'Smart card number must be at least 10 digits'; isValid = false; }
    if (!selectedPackage) { newErrors.package = 'Please select a package'; isValid = false; }
    if (pin.length !== 4) { newErrors.pin = 'PIN must be 4 digits'; isValid = false; }
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      await api.post('/bills/pay', {
        category: 'tv',
        providerCode: selectedProvider!.id,
        recipient: smartCardNumber,
        amount: selectedPackage!.price,
        planId: selectedPackage!.id,
        pin,
      });
      Alert.alert('Success', `${selectedPackage?.name} subscription has been activated`, [
        { text: 'Done', onPress: () => router.back() },
      ]);
    } catch (err: any) { Alert.alert('Error', err.message || 'Unable to process request. Please try again.'); }
    finally { setIsSubmitting(false); }
  };

  const isDisabled = isSubmitting || !selectedProvider || smartCardNumber.length < 10 || !selectedPackage || pin.length !== 4;
  const providerPlans = selectedProvider ? packages[selectedProvider.id] : [];

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
              <Text style={tw`text-white text-[20px] font-bold tracking-tight`}>TV subscription</Text>
              <Text style={tw`text-white/35 text-[12px] mt-0.5`}>Renew your TV subscription</Text>
            </View>
          </View>
        </View>

        <RefreshableScrollView style={tw`flex-1 px-5 pt-6`} showsVerticalScrollIndicator={false} contentContainerStyle={tw`pb-10`}>
          <View style={tw`mb-5`}>
            <Text style={tw`text-white/55 text-[12px] font-semibold tracking-wide mb-3`}>Select provider</Text>
            <View style={tw`flex-row flex-wrap gap-2`}>
              {tvProviders.map(provider => {
                const isSelected = selectedProvider?.id === provider.id;
                return (
                  <TouchableOpacity
                    key={provider.id}
                    style={[
                      tw`w-[48%] py-4 rounded-2xl items-center border`,
                      isSelected
                        ? { borderColor: `${provider.color}60`, backgroundColor: `${provider.color}18` }
                        : tw`border-white/10 bg-white/4`,
                    ]}
                    onPress={() => { setSelectedProvider(provider); setSelectedPackage(null); if (errors.provider) setErrors(p => ({ ...p, provider: '' })); }}
                    activeOpacity={0.75}
                  >
                    <View style={[tw`w-10 h-10 rounded-xl items-center justify-center mb-2`, { backgroundColor: `${provider.color}20` }]}>
                      <Ionicons name="tv-outline" size={20} color={provider.color} />
                    </View>
                    <Text style={[tw`text-[12px] font-semibold`, { color: isSelected ? provider.color : 'rgba(255,255,255,0.5)' }]}>{provider.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {errors.provider ? <Text style={tw`text-red-400 text-[11px] mt-1.5 ml-1`}>{errors.provider}</Text> : null}
          </View>

          <View style={tw`mb-2`}>
            <Text style={tw`text-white/55 text-[12px] font-semibold tracking-wide mb-2`}>Smart card number</Text>
            <View style={tw`bg-white/5 border ${errors.card ? 'border-red-500/70' : 'border-white/10'} rounded-2xl px-4 h-[52px] flex-row items-center`}>
              <TextInput
                style={tw`flex-1 text-[14px] text-white`}
                placeholder="Enter smart card number"
                placeholderTextColor="rgba(255,255,255,0.2)"
                keyboardType="number-pad"
                value={smartCardNumber}
                onChangeText={handleCardChange}
                onBlur={handleValidateCard}
                maxLength={15}
              />
              {isValidating && <ActivityIndicator size="small" color="#f87171" />}
            </View>
            {errors.card ? <Text style={tw`text-red-400 text-[11px] mt-1.5 ml-1`}>{errors.card}</Text> : null}
          </View>

          {customerName ? (
            <View style={tw`bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-2xl mb-5 flex-row items-center gap-2`}>
              <Ionicons name="checkmark-circle" size={17} color="#10b981" />
              <Text style={tw`text-emerald-400 font-semibold text-[13px]`}>{customerName}</Text>
            </View>
          ) : <View style={tw`mb-5`} />}

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

          {selectedProvider && providerPlans.length > 0 && (
            <>
              <View style={tw`mb-5`}>
                <Text style={tw`text-white/55 text-[12px] font-semibold tracking-wide mb-2`}>Select package</Text>
                <TouchableOpacity
                  style={tw`bg-white/5 border ${errors.package ? 'border-red-500/70' : 'border-white/10'} rounded-2xl px-4 h-[56px] flex-row justify-between items-center`}
                  onPress={() => setShowPackages(true)}
                  activeOpacity={0.75}
                >
                  {selectedPackage ? (
                    <View>
                      <Text style={tw`text-white text-[14px] font-semibold`}>{selectedPackage.name}</Text>
                      <Text style={tw`text-white/35 text-[11px]`}>{selectedPackage.validity} · ₦{selectedPackage.price.toLocaleString()}</Text>
                    </View>
                  ) : (
                    <Text style={tw`text-white/25 text-[14px]`}>Choose a subscription package</Text>
                  )}
                  <Ionicons name="chevron-down" size={18} color="rgba(255,255,255,0.3)" />
                </TouchableOpacity>
                {errors.package ? <Text style={tw`text-red-400 text-[11px] mt-1.5 ml-1`}>{errors.package}</Text> : null}
              </View>

              <View style={tw`mb-6`}>
                <Text style={tw`text-white/55 text-[12px] font-semibold tracking-wide mb-3`}>Popular packages</Text>
                <View style={tw`gap-2.5`}>
                  {providerPlans.slice(0, 3).map(pkg => (
                    <TouchableOpacity
                      key={pkg.id}
                      style={tw`bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex-row justify-between items-center`}
                      onPress={() => { setSelectedPackage(pkg); if (errors.package) setErrors(p => ({ ...p, package: '' })); }}
                      activeOpacity={0.75}
                    >
                      <View>
                        <Text style={tw`text-white text-[13px] font-bold`}>{pkg.name}</Text>
                        <Text style={tw`text-white/35 text-[11px] mt-0.5`}>{pkg.validity}</Text>
                      </View>
                      <Text style={tw`text-red-400 font-bold text-[14px]`}>₦{pkg.price.toLocaleString()}</Text>
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

      <Modal visible={showPackages} animationType="slide" transparent>
        <View style={tw`flex-1 justify-end bg-black/60`}>
          <View style={[tw`rounded-t-3xl pt-6 pb-10 max-h-[80%]`, { backgroundColor: '#0f0f1e' }]}>
            <View style={tw`px-5 pb-4 border-b border-white/7 flex-row justify-between items-center`}>
              <Text style={tw`text-white text-[17px] font-bold tracking-tight`}>Select package</Text>
              <TouchableOpacity onPress={() => setShowPackages(false)} style={tw`w-[34px] h-[34px] rounded-xl bg-white/7 items-center justify-center`} activeOpacity={0.7}>
                <Ionicons name="close" size={18} color="rgba(255,255,255,0.7)" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={providerPlans}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={tw`px-5 py-4 border-b border-white/7 flex-row justify-between items-center`}
                  onPress={() => { setSelectedPackage(item); setShowPackages(false); if (errors.package) setErrors(p => ({ ...p, package: '' })); }}
                  activeOpacity={0.75}
                >
                  <View>
                    <Text style={tw`text-white font-bold text-[14px]`}>{item.name}</Text>
                    <Text style={tw`text-white/35 text-[12px] mt-0.5`}>{item.validity}</Text>
                  </View>
                  <Text style={tw`text-red-400 font-bold text-[15px]`}>₦{item.price.toLocaleString()}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
