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
import Button from '@/components/ui/Button';
import { PRIMARY_COLOR, CHARCOAL, LIGHT_GRAY, SUCCESS_GREEN } from '@/constants/customConstants';

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
    <SafeAreaView style={tw`flex-1 bg-[${LIGHT_GRAY}]`}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={tw`flex-1`}>
        <RefreshableScrollView showsVerticalScrollIndicator={false} contentContainerStyle={tw`px-5 pb-28`}>
          <View style={tw`flex-row items-center mt-14 mb-8`}>
            <TouchableOpacity onPress={() => router.back()} style={tw`w-10 h-10 rounded-full bg-white border border-gray-200 items-center justify-center mr-4`} activeOpacity={0.7}>
              <Ionicons name="arrow-back" size={20} color={CHARCOAL} />
            </TouchableOpacity>
            <View>
              <Text style={tw`text-[${CHARCOAL}] text-[22px] font-bold tracking-tight`}>TV subscription</Text>
              <Text style={tw`text-gray-400 text-[12px] mt-0.5`}>Renew your TV subscription</Text>
            </View>
          </View>

          <View style={tw`mb-6`}>
            <Text style={tw`text-gray-500 text-[12px] font-semibold tracking-wider uppercase mb-3`}>Provider</Text>
            <View style={tw`bg-white rounded-2xl p-4`}>
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
                          : tw`border-gray-200 bg-[${LIGHT_GRAY}]`,
                      ]}
                      onPress={() => { setSelectedProvider(provider); setSelectedPackage(null); if (errors.provider) setErrors(p => ({ ...p, provider: '' })); }}
                      activeOpacity={0.75}
                    >
                      <View style={[tw`w-10 h-10 rounded-xl items-center justify-center mb-2`, { backgroundColor: `${provider.color}20` }]}>
                        <Ionicons name="tv-outline" size={20} color={provider.color} />
                      </View>
                      <Text style={[tw`text-[12px] font-semibold`, { color: isSelected ? provider.color : '#6B7280' }]}>{provider.name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              {errors.provider ? <Text style={tw`text-red-500 text-[12px] mt-2 ml-1`}>{errors.provider}</Text> : null}
            </View>
          </View>

          <View style={tw`mb-6`}>
            <Text style={tw`text-gray-500 text-[12px] font-semibold tracking-wider uppercase mb-3`}>Smart card</Text>
            <View style={tw`bg-white rounded-2xl p-4`}>
              <View style={tw`bg-[${LIGHT_GRAY}] rounded-xl px-4 h-[50px] flex-row items-center ${errors.card ? 'border border-red-500' : ''}`}>
                <TextInput
                  style={tw`flex-1 text-[14px] text-[${CHARCOAL}]`}
                  placeholder="Enter smart card number"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="number-pad"
                  value={smartCardNumber}
                  onChangeText={handleCardChange}
                  onBlur={handleValidateCard}
                  maxLength={15}
                />
                {isValidating && <ActivityIndicator size="small" color={PRIMARY_COLOR} />}
              </View>
              {errors.card ? <Text style={tw`text-red-500 text-[12px] mt-1.5 ml-1`}>{errors.card}</Text> : null}

              {customerName ? (
                <View style={tw`bg-[${SUCCESS_GREEN}]/10 rounded-xl p-3 mt-3 flex-row items-center gap-2.5`}>
                  <View style={tw`w-7 h-7 rounded-full bg-[${SUCCESS_GREEN}]/20 items-center justify-center`}>
                    <Ionicons name="checkmark-circle" size={16} color={SUCCESS_GREEN} />
                  </View>
                  <Text style={tw`text-[${SUCCESS_GREEN}] font-bold text-[13px]`}>{customerName}</Text>
                </View>
              ) : null}
            </View>
          </View>

          {selectedProvider && providerPlans.length > 0 && (
            <View style={tw`mb-6`}>
              <Text style={tw`text-gray-500 text-[12px] font-semibold tracking-wider uppercase mb-3`}>Package</Text>
              <View style={tw`bg-white rounded-2xl p-4`}>
                <TouchableOpacity
                  style={tw`bg-[${LIGHT_GRAY}] rounded-xl px-4 h-[56px] flex-row justify-between items-center ${errors.package ? 'border border-red-500' : ''}`}
                  onPress={() => setShowPackages(true)}
                  activeOpacity={0.75}
                >
                  {selectedPackage ? (
                    <View>
                      <Text style={tw`text-[${CHARCOAL}] text-[14px] font-semibold`}>{selectedPackage.name}</Text>
                      <Text style={tw`text-gray-400 text-[11px]`}>{selectedPackage.validity} · ₦{selectedPackage.price.toLocaleString()}</Text>
                    </View>
                  ) : (
                    <Text style={tw`text-gray-400 text-[14px]`}>Choose a package</Text>
                  )}
                  <Ionicons name="chevron-down" size={18} color="#9CA3AF" />
                </TouchableOpacity>
                {errors.package ? <Text style={tw`text-red-500 text-[12px] mt-1.5 ml-1`}>{errors.package}</Text> : null}
              </View>
            </View>
          )}

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

      <Modal visible={showPackages} animationType="slide" transparent onRequestClose={() => setShowPackages(false)}>
        <TouchableOpacity style={tw`flex-1 bg-black/40 justify-end`} activeOpacity={1} onPress={() => setShowPackages(false)}>
          <TouchableOpacity activeOpacity={1} onPress={() => {}} style={tw`bg-white rounded-t-3xl min-h-[60%] max-h-[80%]`}>
            <View style={tw`flex-row items-center justify-between px-5 pt-5 pb-3 border-b border-[${LIGHT_GRAY}]`}>
              <Text style={tw`text-[${CHARCOAL}] text-[18px] font-bold`}>Select package</Text>
              <TouchableOpacity onPress={() => setShowPackages(false)} activeOpacity={0.7}>
                <Ionicons name="close" size={22} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={providerPlans}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={tw`px-5 py-4 border-b border-[${LIGHT_GRAY}] flex-row justify-between items-center`}
                  onPress={() => { setSelectedPackage(item); setShowPackages(false); if (errors.package) setErrors(p => ({ ...p, package: '' })); }}
                  activeOpacity={0.75}
                >
                  <View>
                    <Text style={tw`text-[${CHARCOAL}] font-bold text-[14px]`}>{item.name}</Text>
                    <Text style={tw`text-gray-400 text-[12px] mt-0.5`}>{item.validity}</Text>
                  </View>
                  <Text style={tw`text-[${PRIMARY_COLOR}] font-bold text-[15px]`}>₦{item.price.toLocaleString()}</Text>
                </TouchableOpacity>
              )}
            />
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}
