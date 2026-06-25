import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, SafeAreaView, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import tw from 'twrnc';
import { DARK_BG } from '@/constants/customConstants';
import { api } from '@/lib/api';
import RefreshableScrollView from '@/components/RefreshableScrollView';

const BIOMETRIC_KEY = 'wanpay_biometric_enabled';
const TWO_FACTOR_KEY = 'wanpay_2fa_enabled';

export default function SecuritySettingsScreen() {
  const router = useRouter();
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [showCurrentPin, setShowCurrentPin] = useState(false);
  const [showNewPin, setShowNewPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);

  const [pinData, setPinData] = useState({ currentPin: '', newPin: '', confirmPin: '' });
  const [changingPin, setChangingPin] = useState(false);

  useEffect(() => {
    (async () => {
      const saved = await SecureStore.getItemAsync(BIOMETRIC_KEY);
      if (saved === 'true') setBiometricEnabled(true);
    })();
  }, []);

  const handleBiometricToggle = async (value: boolean) => {
    if (value) {
      Alert.alert(
        'Biometric Authentication',
        'Enable biometric authentication to skip PIN entry when logging in.\n\nYou can configure this in your device settings.',
        [
          { text: 'Cancel', style: 'cancel', onPress: () => {} },
          {
            text: 'Enable',
            onPress: async () => {
              await SecureStore.setItemAsync(BIOMETRIC_KEY, 'true');
              setBiometricEnabled(true);
            },
          },
        ]
      );
    } else {
      await SecureStore.setItemAsync(BIOMETRIC_KEY, 'false');
      setBiometricEnabled(false);
    }
  };

  const handleTwoFactorToggle = () => {
    Alert.alert(
      'Coming Soon',
      'Two-factor authentication is not yet available. We are working on adding this feature to keep your account even more secure.'
    );
  };

  const handleChangePin = async () => {
    if (pinData.currentPin.length !== 4) { Alert.alert('Error', 'Current PIN must be 4 digits'); return; }
    if (pinData.newPin.length !== 4) { Alert.alert('Error', 'New PIN must be 4 digits'); return; }
    if (pinData.newPin !== pinData.confirmPin) { Alert.alert('Error', 'PINs do not match'); return; }

    setChangingPin(true);
    try {
      await api.put('/auth/pin', { currentPin: pinData.currentPin, newPin: pinData.newPin });
      Alert.alert('Success', 'Your PIN has been changed successfully.');
      setPinData({ currentPin: '', newPin: '', confirmPin: '' });
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to change PIN.');
    } finally {
      setChangingPin(false);
    }
  };

  const securityFeatures = [
    {
      id: 'biometric', title: 'Biometric Authentication', icon: 'finger-print-outline', color: '#7c3aed',
      toggle: biometricEnabled, onToggle: handleBiometricToggle, subtitle: 'Use fingerprint or face ID to login',
    },
    {
      id: 'two-factor', title: 'Two-Factor Authentication', icon: 'shield-checkmark-outline', color: '#10b981',
      subtitle: 'Add an extra layer of security', comingSoon: true,
    },
  ];

  return (
    <SafeAreaView style={tw`flex-1 bg-[${DARK_BG}]`}>
      <View style={tw`px-3 py-4 border-b border-white/7`}>
        <View style={tw`flex-row items-center`}>
          <TouchableOpacity onPress={() => router.back()} style={tw`mr-4`} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color="rgba(255,255,255,0.75)" />
          </TouchableOpacity>
          <View>
            <Text style={tw`text-xl font-bold text-white`}>Security Settings</Text>
            <Text style={tw`text-xs text-white/40`}>Manage your account security</Text>
          </View>
        </View>
      </View>

      <RefreshableScrollView style={tw`flex-1 px-3 pt-6`} showsVerticalScrollIndicator={false} contentContainerStyle={tw`pb-8`}>
        <View style={tw`bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 mb-6`}>
          <View style={tw`flex-row items-center mb-2`}>
            <Ionicons name="shield-checkmark" size={24} color="#10b981" />
            <Text style={tw`text-emerald-300 font-bold text-lg ml-3`}>Account Secure</Text>
          </View>
          <Text style={tw`text-emerald-400/70 text-sm`}>Your account is protected with multiple security layers.</Text>
        </View>

        <View style={tw`mb-6`}>
          <Text style={tw`text-white/45 text-xs font-semibold uppercase mb-3`}>PIN Settings</Text>
          <View style={tw`bg-white/4 border border-white/7 rounded-2xl`}>
            <View style={tw`px-5 py-4 border-b border-white/7`}>
              <Text style={tw`text-base font-semibold text-white mb-1`}>Change PIN</Text>
              <Text style={tw`text-sm text-white/40`}>Update your transaction PIN</Text>
            </View>
            <View style={tw`px-5 py-4`}>
              <View style={tw`mb-4`}>
                <Text style={tw`text-white/55 text-[12px] font-semibold tracking-wide mb-2`}>Current PIN</Text>
                <View style={tw`bg-white/5 border border-white/10 rounded-2xl px-4 h-[52px] flex-row items-center`}>
                  <TextInput style={tw`flex-1 text-[14px] text-white`} value={pinData.currentPin} onChangeText={(text) => setPinData({ ...pinData, currentPin: text.replace(/[^0-9]/g, '').slice(0, 4) })} placeholder="Enter current PIN" placeholderTextColor="rgba(255,255,255,0.2)" keyboardType="number-pad" secureTextEntry={!showCurrentPin} maxLength={4} />
                  <TouchableOpacity onPress={() => setShowCurrentPin(!showCurrentPin)}>
                    <Ionicons name={showCurrentPin ? 'eye-outline' : 'eye-off-outline'} size={20} color="rgba(255,255,255,0.35)" />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={tw`mb-4`}>
                <Text style={tw`text-white/55 text-[12px] font-semibold tracking-wide mb-2`}>New PIN</Text>
                <View style={tw`bg-white/5 border border-white/10 rounded-2xl px-4 h-[52px] flex-row items-center`}>
                  <TextInput style={tw`flex-1 text-[14px] text-white`} value={pinData.newPin} onChangeText={(text) => setPinData({ ...pinData, newPin: text.replace(/[^0-9]/g, '').slice(0, 4) })} placeholder="Enter new PIN" placeholderTextColor="rgba(255,255,255,0.2)" keyboardType="number-pad" secureTextEntry={!showNewPin} maxLength={4} />
                  <TouchableOpacity onPress={() => setShowNewPin(!showNewPin)}>
                    <Ionicons name={showNewPin ? 'eye-outline' : 'eye-off-outline'} size={20} color="rgba(255,255,255,0.35)" />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={tw`mb-4`}>
                <Text style={tw`text-white/55 text-[12px] font-semibold tracking-wide mb-2`}>Confirm New PIN</Text>
                <View style={tw`bg-white/5 border border-white/10 rounded-2xl px-4 h-[52px] flex-row items-center`}>
                  <TextInput style={tw`flex-1 text-[14px] text-white`} value={pinData.confirmPin} onChangeText={(text) => setPinData({ ...pinData, confirmPin: text.replace(/[^0-9]/g, '').slice(0, 4) })} placeholder="Confirm new PIN" placeholderTextColor="rgba(255,255,255,0.2)" keyboardType="number-pad" secureTextEntry={!showConfirmPin} maxLength={4} />
                  <TouchableOpacity onPress={() => setShowConfirmPin(!showConfirmPin)}>
                    <Ionicons name={showConfirmPin ? 'eye-outline' : 'eye-off-outline'} size={20} color="rgba(255,255,255,0.35)" />
                  </TouchableOpacity>
                </View>
              </View>
              <TouchableOpacity style={tw`bg-blue-600 py-3 rounded-xl ${changingPin ? 'opacity-60' : ''}`} onPress={handleChangePin} disabled={changingPin} activeOpacity={0.8}>
                <Text style={tw`text-white text-center font-bold`}>{changingPin ? 'Updating...' : 'Update PIN'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={tw`mb-6`}>
          <Text style={tw`text-white/45 text-xs font-semibold uppercase mb-3`}>Security Features</Text>
          <View style={tw`bg-white/4 border border-white/7 rounded-2xl`}>
            {securityFeatures.map((feature, index) => (
              <TouchableOpacity
                key={feature.id}
                style={tw`flex-row justify-between items-center px-5 py-4 ${index !== securityFeatures.length - 1 ? 'border-b border-white/7' : ''}`}
                activeOpacity={0.75}
                disabled={feature.toggle !== undefined && !feature.comingSoon}
                onPress={feature.comingSoon ? handleTwoFactorToggle : undefined}
              >
                <View style={tw`flex-row items-center flex-1`}>
                  <View style={tw`bg-blue-500/15 w-10 h-10 rounded-full items-center justify-center mr-3`}>
                    <Ionicons name={feature.icon as any} size={20} color={feature.color} />
                  </View>
                  <View style={tw`flex-1`}>
                    <Text style={tw`text-white font-semibold`}>{feature.title}</Text>
                    {feature.subtitle && <Text style={tw`text-white/40 text-xs mt-1`}>{feature.subtitle}</Text>}
                  </View>
                </View>
                {feature.toggle !== undefined ? (
                  <Switch value={feature.toggle} onValueChange={feature.onToggle} trackColor={{ false: '#374151', true: '#3b82f6' }} thumbColor="#fff" />
                ) : (
                  <View style={tw`flex-row items-center gap-1`}>
                    <Text style={tw`text-white/25 text-[11px]`}>Coming soon</Text>
                    <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.2)" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={tw`bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl`}>
          <View style={tw`flex-row items-center mb-2`}>
            <Ionicons name="information-circle" size={20} color="#60a5fa" />
            <Text style={tw`text-blue-300 font-semibold ml-2`}>Security Tips</Text>
          </View>
          <Text style={tw`text-xs text-white/40 mb-1`}>• Never share your PIN with anyone</Text>
          <Text style={tw`text-xs text-white/40 mb-1`}>• Use a strong, unique PIN</Text>
          <Text style={tw`text-xs text-white/40`}>• Enable biometric authentication for faster access</Text>
        </View>
      </RefreshableScrollView>
    </SafeAreaView>
  );
}
