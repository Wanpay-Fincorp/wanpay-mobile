import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import React, { useEffect, useState, useCallback } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import tw from 'twrnc';
import { LIGHT_GRAY } from '@/constants/customConstants';
import { api } from '@/lib/api';
import RefreshableScrollView from '@/components/RefreshableScrollView';

const BIOMETRIC_KEY = 'wanpay_biometric_enabled';

export default function SecuritySettingsScreen() {
  const router = useRouter();
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [showCurrentPin, setShowCurrentPin] = useState(false);
  const [showNewPin, setShowNewPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);

  const [pinData, setPinData] = useState({ currentPin: '', newPin: '', confirmPin: '' });
  const [changingPin, setChangingPin] = useState(false);
  const [isFrozen, setIsFrozen] = useState(false);
  const [freezeLoading, setFreezeLoading] = useState(true);
  const [freezeToggling, setFreezeToggling] = useState(false);

  useEffect(() => {
    (async () => {
      const saved = await SecureStore.getItemAsync(BIOMETRIC_KEY);
      if (saved === 'true') setBiometricEnabled(true);
    })();
  }, []);

  useFocusEffect(
    useCallback(() => {
      checkFreezeStatus();
    }, [])
  );

  const checkFreezeStatus = async () => {
    setFreezeLoading(true);
    try {
      const res = await api.get<{ isFrozen: boolean }>('/restrictions/freeze');
      setIsFrozen(res?.isFrozen ?? false);
    } catch { setIsFrozen(false); }
    finally { setFreezeLoading(false); }
  };

  const handleFreezeToggle = async (value: boolean) => {
    if (value) {
      Alert.alert(
        'Freeze Account',
        'Freezing your account will temporarily disable all transactions including transfers, bill payments, and withdrawals. You can unfreeze at any time.\n\nAre you sure?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Freeze', style: 'destructive', onPress: async () => {
              setFreezeToggling(true);
              try {
                await api.post('/restrictions/freeze');
                setIsFrozen(true);
                Alert.alert('Account Frozen', 'Your account has been frozen. Unfreeze anytime from this screen.');
              } catch (err: any) {
                Alert.alert('Error', err.message || 'Failed to freeze account.');
              } finally { setFreezeToggling(false); }
            },
          },
        ]
      );
    } else {
      Alert.alert(
        'Unfreeze Account',
        'Unfreeze your account to restore full access to all transactions.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Unfreeze', onPress: async () => {
              setFreezeToggling(true);
              try {
                await api.post('/restrictions/unfreeze');
                setIsFrozen(false);
                Alert.alert('Account Unfrozen', 'Your account is now fully active.');
              } catch (err: any) {
                Alert.alert('Error', err.message || 'Failed to unfreeze account.');
              } finally { setFreezeToggling(false); }
            },
          },
        ]
      );
    }
  };

  const handleBiometricToggle = async (value: boolean) => {
    if (value) {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      if (!compatible) {
        Alert.alert('Not available', 'Biometric authentication is not available on this device.');
        return;
      }
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (!enrolled) {
        Alert.alert('No biometrics', 'Please enroll a fingerprint or face ID in your device settings first.');
        return;
      }
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Verify your identity to enable biometric login',
        fallbackLabel: 'Use PIN',
      });
      if (result.success) {
        await SecureStore.setItemAsync(BIOMETRIC_KEY, 'true');
        setBiometricEnabled(true);
      }
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
    <SafeAreaView style={tw`flex-1 pb-8 bg-[${LIGHT_GRAY}]`}>
      <View style={tw`px-3 pt-12 pb-4`}>
        <View style={tw`flex-row items-center`}>
          <TouchableOpacity onPress={() => router.back()} style={tw`rounded-full bg-white border border-gray-200 w-10 h-10 items-center justify-center mr-4`} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={22} color="#374151" />
          </TouchableOpacity>
          <View>
            <Text style={tw`text-xl font-bold text-gray-900`}>Security Settings</Text>
            <Text style={tw`text-xs text-gray-500`}>Manage your account security</Text>
          </View>
        </View>
      </View>

      <RefreshableScrollView style={tw`flex-1 px-3 pt-6`} showsVerticalScrollIndicator={false} contentContainerStyle={tw`pb-28`}>
        <View style={tw`bg-white border border-gray-200 rounded-2xl p-5 mb-6`}>
          <View style={tw`flex-row items-center mb-2`}>
            <Ionicons name="shield-checkmark" size={24} color="#10b981" />
            <Text style={tw`text-gray-900 font-bold text-lg ml-3`}>Account Secure</Text>
          </View>
          <Text style={tw`text-gray-500 text-sm`}>Your account is protected with multiple security layers.</Text>
        </View>

        <View style={tw`mb-6`}>
          <Text style={tw`text-gray-500 text-xs font-semibold uppercase tracking-wider mb-3`}>PIN Settings</Text>
          <View style={tw`bg-white border border-gray-200 rounded-2xl`}>
            <View style={tw`px-5 py-4 border-b border-gray-200`}>
              <Text style={tw`text-base font-semibold text-gray-900 mb-1`}>Change PIN</Text>
              <Text style={tw`text-sm text-gray-500`}>Update your transaction PIN</Text>
            </View>
            <View style={tw`px-5 py-4`}>
              <View style={tw`mb-4`}>
                <Text style={tw`text-gray-600 text-[12px] font-semibold tracking-wide mb-2`}>Current PIN</Text>
                <View style={tw`bg-[${LIGHT_GRAY}] border border-gray-200 rounded-2xl px-4 h-[52px] flex-row items-center`}>
                  <TextInput style={tw`flex-1 text-[14px] text-gray-900`} value={pinData.currentPin} onChangeText={(text) => setPinData({ ...pinData, currentPin: text.replace(/[^0-9]/g, '').slice(0, 4) })} placeholder="Enter current PIN" placeholderTextColor="#E5E7EB" keyboardType="number-pad" secureTextEntry={!showCurrentPin} maxLength={4} />
                  <TouchableOpacity onPress={() => setShowCurrentPin(!showCurrentPin)}>
                    <Ionicons name={showCurrentPin ? 'eye-outline' : 'eye-off-outline'} size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={tw`mb-4`}>
                <Text style={tw`text-gray-600 text-[12px] font-semibold tracking-wide mb-2`}>New PIN</Text>
                <View style={tw`bg-[${LIGHT_GRAY}] border border-gray-200 rounded-2xl px-4 h-[52px] flex-row items-center`}>
                  <TextInput style={tw`flex-1 text-[14px] text-gray-900`} value={pinData.newPin} onChangeText={(text) => setPinData({ ...pinData, newPin: text.replace(/[^0-9]/g, '').slice(0, 4) })} placeholder="Enter new PIN" placeholderTextColor="#E5E7EB" keyboardType="number-pad" secureTextEntry={!showNewPin} maxLength={4} />
                  <TouchableOpacity onPress={() => setShowNewPin(!showNewPin)}>
                    <Ionicons name={showNewPin ? 'eye-outline' : 'eye-off-outline'} size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={tw`mb-4`}>
                <Text style={tw`text-gray-600 text-[12px] font-semibold tracking-wide mb-2`}>Confirm New PIN</Text>
                <View style={tw`bg-[${LIGHT_GRAY}] border border-gray-200 rounded-2xl px-4 h-[52px] flex-row items-center`}>
                  <TextInput style={tw`flex-1 text-[14px] text-gray-900`} value={pinData.confirmPin} onChangeText={(text) => setPinData({ ...pinData, confirmPin: text.replace(/[^0-9]/g, '').slice(0, 4) })} placeholder="Confirm new PIN" placeholderTextColor="#E5E7EB" keyboardType="number-pad" secureTextEntry={!showConfirmPin} maxLength={4} />
                  <TouchableOpacity onPress={() => setShowConfirmPin(!showConfirmPin)}>
                    <Ionicons name={showConfirmPin ? 'eye-outline' : 'eye-off-outline'} size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>
              </View>
              <TouchableOpacity style={tw`bg-blue-600 py-3 rounded-2xl ${changingPin ? 'opacity-60' : ''}`} onPress={handleChangePin} disabled={changingPin} activeOpacity={0.8}>
                <Text style={tw`text-white text-center font-bold`}>{changingPin ? 'Updating...' : 'Update PIN'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={tw`mb-6`}>
          <Text style={tw`text-gray-500 text-xs font-semibold uppercase tracking-wider mb-3`}>Security Features</Text>
          <View style={tw`bg-white border border-gray-200 rounded-2xl`}>
            {securityFeatures.map((feature, index) => (
              <TouchableOpacity
                key={feature.id}
                style={tw`flex-row justify-between items-center px-5 py-4 ${index !== securityFeatures.length - 1 ? 'border-b border-gray-200' : ''}`}
                activeOpacity={0.75}
                disabled={feature.toggle !== undefined && !feature.comingSoon}
                onPress={feature.comingSoon ? handleTwoFactorToggle : undefined}
              >
                <View style={tw`flex-row items-center flex-1`}>
                  <View style={tw`bg-blue-500/15 w-10 h-10 rounded-full items-center justify-center mr-3`}>
                    <Ionicons name={feature.icon as any} size={20} color={feature.color} />
                  </View>
                  <View style={tw`flex-1`}>
                    <Text style={tw`text-gray-900 font-semibold`}>{feature.title}</Text>
                    {feature.subtitle && <Text style={tw`text-gray-500 text-xs mt-1`}>{feature.subtitle}</Text>}
                  </View>
                </View>
                {feature.toggle !== undefined ? (
                  <Switch value={feature.toggle} onValueChange={feature.onToggle} trackColor={{ false: '#D1D5DB', true: '#93C5FD' }} thumbColor="#fff" />
                ) : (
                  <View style={tw`flex-row items-center gap-1`}>
                    <Text style={tw`text-gray-400 text-[11px]`}>Coming soon</Text>
                    <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={tw`mb-6`}>
          <Text style={tw`text-gray-500 text-xs font-semibold uppercase tracking-wider mb-3`}>Account Status</Text>
          <View style={tw`bg-white border border-gray-200 rounded-2xl`}>
            <View style={tw`px-5 py-4 flex-row justify-between items-center`}>
              <View style={tw`flex-row items-center flex-1`}>
                <View style={tw`w-10 h-10 rounded-full bg-red-50 items-center justify-center mr-3`}>
                  <Ionicons name={isFrozen ? 'snow-outline' : 'snow-outline'} size={20} color={isFrozen ? '#EF4444' : '#6B7280'} />
                </View>
                <View style={tw`flex-1`}>
                  <Text style={tw`text-gray-900 font-semibold`}>{isFrozen ? 'Account Frozen' : 'Freeze Account'}</Text>
                  <Text style={tw`text-gray-500 text-xs mt-1`}>
                    {isFrozen ? 'All transactions are disabled' : 'Temporarily disable all transactions'}
                  </Text>
                </View>
              </View>
              {freezeLoading ? (
                <ActivityIndicator size="small" color="#9CA3AF" />
              ) : (
                <Switch
                  value={isFrozen}
                  onValueChange={handleFreezeToggle}
                  trackColor={{ false: '#D1D5DB', true: '#FCA5A5' }}
                  thumbColor={isFrozen ? '#EF4444' : '#fff'}
                  disabled={freezeToggling}
                />
              )}
            </View>
          </View>
        </View>

        <View style={tw`bg-white border border-gray-200 p-4 rounded-xl`}>
          <View style={tw`flex-row items-center mb-2`}>
            <Ionicons name="information-circle" size={20} color="#2563EB" />
            <Text style={tw`text-gray-900 font-semibold ml-2`}>Security Tips</Text>
          </View>
          <Text style={tw`text-xs text-gray-500 mb-1`}>• Never share your PIN with anyone</Text>
          <Text style={tw`text-xs text-gray-500 mb-1`}>• Use a strong, unique PIN</Text>
          <Text style={tw`text-xs text-gray-500`}>• Enable biometric authentication for faster access</Text>
        </View>
      </RefreshableScrollView>
    </SafeAreaView>
  );
}
