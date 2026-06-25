/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useRootNavigationState, Redirect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import tw from 'twrnc';
import { DARK_BG } from '@/constants/customConstants';
import { api, getDeviceId } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export default function SignupScreen() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const navState = useRootNavigationState();

  if (!navState?.key) return null;
  if (isLoading) return null;
  if (user) return <Redirect href="/(tabs)" />;
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ fullName: '', phone: '', email: '' });

  const validateForm = () => {
    const newErrors = { fullName: '', phone: '', email: '' };
    let isValid = true;
    if (!fullName.trim()) { newErrors.fullName = 'Full name is required'; isValid = false; }
    else if (fullName.trim().length < 3) { newErrors.fullName = 'At least 3 characters'; isValid = false; }
    if (!phone.trim()) { newErrors.phone = 'Phone number is required'; isValid = false; }
    else if (phone.trim().length !== 10) { newErrors.phone = 'Must be 10 digits'; isValid = false; }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { newErrors.email = 'Invalid email address'; isValid = false; }
    setErrors(newErrors);
    return isValid;
  };

  const handleContinue = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const reg = await api.post('/auth/signup', {
        fullName: fullName.trim(),
        phone: `+234${phone}`,
        email: email.trim() || undefined,
      }, false);

      router.push({ pathname: '/otp', params: { phone: `+234${phone}` } });
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Something went wrong. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-[${DARK_BG}]`}>
      <StatusBar style="light" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={tw`flex-1`}>
        <ScrollView style={tw`flex-1 px-7`} contentContainerStyle={tw`pb-8`} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <TouchableOpacity onPress={() => router.back()} style={tw`mt-14 mb-8 w-[38px] h-[38px] rounded-xl bg-white/7 items-center justify-center`} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={20} color="rgba(255,255,255,0.75)" />
          </TouchableOpacity>
          <Text style={tw`text-white text-[26px] font-bold tracking-tight mb-1.5`}>Create account</Text>
          <Text style={tw`text-white/40 text-[13px] leading-5 mb-9`}>Sign up to get started with WanPay</Text>
          <View style={tw`mb-5`}>
            <Text style={tw`text-white/55 text-[12px] font-semibold tracking-wide mb-2`}>Full name</Text>
            <View style={tw`bg-white/5 border ${errors.fullName ? 'border-red-500/70' : 'border-white/10'} rounded-2xl px-4 h-[52px] justify-center`}>
              <TextInput
                style={tw`text-[14px] text-white`}
                placeholder="John Doe"
                placeholderTextColor="rgba(255,255,255,0.2)"
                value={fullName}
                onChangeText={t => { setFullName(t); if (errors.fullName) setErrors({ ...errors, fullName: '' }); }}
                autoCapitalize="words"
              />
            </View>
            {errors.fullName ? <Text style={tw`text-red-400 text-[11px] mt-1.5 ml-1`}>{errors.fullName}</Text> : null}
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
                value={phone}
                onChangeText={t => { const n = t.replace(/[^0-9]/g, ''); if (n.length <= 10) { setPhone(n); if (errors.phone) setErrors({ ...errors, phone: '' }); } }}
                maxLength={10}
              />
            </View>
            {errors.phone ? <Text style={tw`text-red-400 text-[11px] mt-1.5 ml-1`}>{errors.phone}</Text> : null}
          </View>
          <View style={tw`mb-9`}>
            <View style={tw`flex-row items-center mb-2`}>
              <Text style={tw`text-white/55 text-[12px] font-semibold tracking-wide`}>Email</Text>
              <Text style={tw`text-white/25 text-[11px] ml-1.5`}>(optional)</Text>
            </View>
            <View style={tw`bg-white/5 border ${errors.email ? 'border-red-500/70' : 'border-white/10'} rounded-2xl px-4 h-[52px] justify-center`}>
              <TextInput
                style={tw`text-[14px] text-white`}
                placeholder="john@example.com"
                placeholderTextColor="rgba(255,255,255,0.2)"
                keyboardType="email-address"
                value={email}
                onChangeText={t => { setEmail(t); if (errors.email) setErrors({ ...errors, email: '' }); }}
                autoCapitalize="none"
              />
            </View>
            {errors.email ? <Text style={tw`text-red-400 text-[11px] mt-1.5 ml-1`}>{errors.email}</Text> : null}
          </View>
          <TouchableOpacity
            style={tw`bg-blue-500 h-[52px] rounded-2xl items-center justify-center mb-5 ${loading ? 'opacity-60' : ''}`}
            onPress={handleContinue}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={tw`text-white font-semibold text-[15px] tracking-tight`}>Continue</Text>}
          </TouchableOpacity>
          <View style={tw`flex-row justify-center items-center gap-1`}>
            <Text style={tw`text-white/35 text-[12px]`}>Already have an account?</Text>
            <TouchableOpacity onPress={() => router.push('/login')} activeOpacity={0.7}>
              <Text style={tw`text-blue-400 text-[12px] font-semibold`}>Log in</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
