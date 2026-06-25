import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter, useRootNavigationState, Redirect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import tw from 'twrnc';
import { DARK_BG } from '@/constants/customConstants';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import type { AuthTokens } from '@/lib/types';

export default function LoginScreen() {
  const router = useRouter();
  const { user, isLoading, signIn } = useAuth();
  const navState = useRootNavigationState();
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ phone: '', pin: '' });

  if (!navState?.key) return null;
  if (isLoading) return null;
  if (user) return <Redirect href="/(tabs)" />;

  const validateForm = () => {
    const newErrors = { phone: '', pin: '' };
    let isValid = true;
    if (!phone.trim()) { newErrors.phone = 'Phone number is required'; isValid = false; }
    else if (phone.trim().length !== 10) { newErrors.phone = 'Must be 10 digits'; isValid = false; }
    if (!pin.trim()) { newErrors.pin = 'PIN is required'; isValid = false; }
    else if (pin.length !== 4) { newErrors.pin = 'PIN must be 4 digits'; isValid = false; }
    setErrors(newErrors);
    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const tokens = await api.post<AuthTokens>('/auth/login', {
        phone: `+234${phone}`,
        pin,
      });
      if (tokens.user) await signIn(tokens.token, tokens.refreshToken, tokens.user);
      router.replace('/(tabs)');
    } catch (err: any) {
      Alert.alert('Login Failed', err.message || 'Please check your phone and PIN.');
    } finally { setLoading(false); }
  };

  const handlePhoneChange = (text: string) => {
    const n = text.replace(/[^0-9]/g, '');
    if (n.length <= 10) { setPhone(n); if (errors.phone) setErrors({ ...errors, phone: '' }); }
  };

  const handlePinChange = (text: string) => {
    const n = text.replace(/[^0-9]/g, '');
    if (n.length <= 4) { setPin(n); if (errors.pin) setErrors({ ...errors, pin: '' }); }
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-[${DARK_BG}]`}>
      <StatusBar style="light" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={tw`flex-1`}>
        <ScrollView style={tw`flex-1 px-7`} contentContainerStyle={tw`pb-8`} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <TouchableOpacity onPress={() => router.back()} style={tw`mt-14 mb-8 w-[38px] h-[38px] rounded-xl bg-white/7 items-center justify-center`} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={20} color="rgba(255,255,255,0.75)" />
          </TouchableOpacity>
          <Text style={tw`text-white text-[26px] font-bold tracking-tight mb-1.5`}>Welcome back</Text>
          <Text style={tw`text-white/40 text-[13px] leading-5 mb-9`}>Log in to continue to your account</Text>
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
                value={phone}
                onChangeText={handlePhoneChange}
                maxLength={10}
              />
            </View>
            {errors.phone ? <Text style={tw`text-red-400 text-[11px] mt-1.5 ml-1`}>{errors.phone}</Text> : null}
          </View>
          <View style={tw`mb-3`}>
            <Text style={tw`text-white/55 text-[12px] font-semibold tracking-wide mb-2`}>PIN</Text>
            <View style={tw`flex-row items-center bg-white/5 border ${errors.pin ? 'border-red-500/70' : 'border-white/10'} rounded-2xl px-4 h-[52px]`}>
              <TextInput
                style={tw`flex-1 text-[14px] text-white tracking-[6px]`}
                placeholder="• • • •"
                placeholderTextColor="rgba(255,255,255,0.2)"
                secureTextEntry={!showPin}
                keyboardType="number-pad"
                maxLength={4}
                value={pin}
                onChangeText={handlePinChange}
              />
              <TouchableOpacity onPress={() => setShowPin(!showPin)} activeOpacity={0.7} style={tw`p-1`}>
                <Ionicons name={showPin ? 'eye-outline' : 'eye-off-outline'} size={20} color="rgba(255,255,255,0.35)" />
              </TouchableOpacity>
            </View>
            {errors.pin ? <Text style={tw`text-red-400 text-[11px] mt-1.5 ml-1`}>{errors.pin}</Text> : null}
          </View>
          <TouchableOpacity style={tw`mb-9 self-end`} activeOpacity={0.7} onPress={() => Alert.alert('Forgot PIN', 'Enter your phone number and we will send you an OTP to reset your PIN.')}>
            <Text style={tw`text-blue-400 text-[12px] font-semibold`}>Forgot PIN?</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={tw`bg-blue-500 h-[52px] rounded-2xl items-center justify-center mb-5 ${loading ? 'opacity-60' : ''}`}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={tw`text-white font-semibold text-[15px] tracking-tight`}>Log in</Text>}
          </TouchableOpacity>
          <View style={tw`flex-row justify-center items-center gap-1`}>
            <Text style={tw`text-white/35 text-[12px]`}>Don't have an account?</Text>
            <TouchableOpacity onPress={() => router.push('/signup')} activeOpacity={0.7}>
              <Text style={tw`text-blue-400 text-[12px] font-semibold`}>Sign up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
