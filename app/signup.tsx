/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useRootNavigationState, Redirect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import tw from 'twrnc';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export default function SignupScreen() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const navState = useRootNavigationState();

  if (!navState?.key) return null;
  if (isLoading) return null;
  if (user) return <Redirect href="/(tabs)" />;
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ firstName: '', lastName: '', phone: '', email: '' });
  const [otpChannel, setOtpChannel] = useState<'SMS' | 'EMAIL'>('SMS');

  const validateForm = () => {
    const newErrors = { firstName: '', lastName: '', phone: '', email: '' };
    let isValid = true;
    if (!firstName.trim()) { newErrors.firstName = 'First name is required'; isValid = false; }
    else if (firstName.trim().length < 2) { newErrors.firstName = 'At least 2 characters'; isValid = false; }
    if (!lastName.trim()) { newErrors.lastName = 'Last name is required'; isValid = false; }
    else if (lastName.trim().length < 2) { newErrors.lastName = 'At least 2 characters'; isValid = false; }
    if (!phone.trim()) { newErrors.phone = 'Phone number is required'; isValid = false; }
    else if (phone.trim().length !== 10) { newErrors.phone = 'Must be 10 digits'; isValid = false; }
    if (!email.trim()) { newErrors.email = 'Email is required'; isValid = false; }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { newErrors.email = 'Invalid email address'; isValid = false; }
    setErrors(newErrors);
    return isValid;
  };

  const handleContinue = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const cleanPhone = phone.replace(/^0+/, '')
      const reg = await api.post('/auth/signup', {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        fullName: `${firstName.trim()} ${lastName.trim()}`,
        phone: `+234${cleanPhone}`,
        email: email.trim(),
        channel: otpChannel,
      }, false);

      if (otpChannel === 'EMAIL') {
        router.push({ pathname: '/otp', params: { email: email.trim(), channel: 'EMAIL' } });
      } else {
        router.push({ pathname: '/otp', params: { phone: `+234${cleanPhone}`, channel: 'SMS' } });
      }
    } catch (err: any) {
      console.log(err)
      Alert.alert('Error', err.message || 'Something went wrong. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={tw`flex-1`}>
        <ScrollView style={tw`flex-1 px-7`} contentContainerStyle={tw`pb-8`} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <TouchableOpacity onPress={() => router.back()} style={tw`mt-14 mb-8 w-[38px] h-[38px] rounded-xl bg-gray-100 items-center justify-center`} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={20} color="#374151" />
          </TouchableOpacity>
          <Text style={tw`text-gray-900 text-[26px] font-bold tracking-tight mb-1.5`}>Create account</Text>
          <Text style={tw`text-gray-500 text-[13px] leading-5 mb-9`}>Sign up to get started with WanPay</Text>

          {/* First & Last Name row */}
          <View style={tw`flex-row gap-3 mb-5`}>
            <View style={tw`flex-1`}>
              <Text style={tw`text-gray-600 text-[12px] font-semibold tracking-wide mb-2`}>First name</Text>
              <View style={tw`bg-gray-50 border ${errors.firstName ? 'border-red-500' : 'border-gray-200'} rounded-2xl px-4 h-[52px] justify-center`}>
                <TextInput
                  style={tw`text-[14px] text-gray-900`}
                  placeholder="John"
                  placeholderTextColor="#9CA3AF"
                  value={firstName}
                  onChangeText={t => { setFirstName(t); if (errors.firstName) setErrors({ ...errors, firstName: '' }); }}
                  autoCapitalize="words"
                />
              </View>
              {errors.firstName ? <Text style={tw`text-red-500 text-[11px] mt-1.5 ml-1`}>{errors.firstName}</Text> : null}
            </View>
            <View style={tw`flex-1`}>
              <Text style={tw`text-gray-600 text-[12px] font-semibold tracking-wide mb-2`}>Last name</Text>
              <View style={tw`bg-gray-50 border ${errors.lastName ? 'border-red-500' : 'border-gray-200'} rounded-2xl px-4 h-[52px] justify-center`}>
                <TextInput
                  style={tw`text-[14px] text-gray-900`}
                  placeholder="Doe"
                  placeholderTextColor="#9CA3AF"
                  value={lastName}
                  onChangeText={t => { setLastName(t); if (errors.lastName) setErrors({ ...errors, lastName: '' }); }}
                  autoCapitalize="words"
                />
              </View>
              {errors.lastName ? <Text style={tw`text-red-500 text-[11px] mt-1.5 ml-1`}>{errors.lastName}</Text> : null}
            </View>
          </View>

          <View style={tw`mb-5`}>
            <Text style={tw`text-gray-600 text-[12px] font-semibold tracking-wide mb-2`}>Phone number</Text>
            <View style={tw`flex-row items-center bg-gray-50 border ${errors.phone ? 'border-red-500' : 'border-gray-200'} rounded-2xl px-4 h-[52px]`}>
              <Text style={tw`text-gray-500 text-[13px] font-semibold`}>+234</Text>
              <View style={tw`w-px h-[18px] bg-gray-300 mx-2.5`} />
              <TextInput
                style={tw`flex-1 text-[14px] text-gray-900`}
                placeholder="8012345678"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={t => { const n = t.replace(/[^0-9]/g, ''); if (n.length <= 10) { setPhone(n); if (errors.phone) setErrors({ ...errors, phone: '' }); } }}
                maxLength={10}
              />
            </View>
            {errors.phone ? <Text style={tw`text-red-500 text-[11px] mt-1.5 ml-1`}>{errors.phone}</Text> : null}
          </View>

          <View style={tw`mb-7`}>
            <Text style={tw`text-gray-600 text-[12px] font-semibold tracking-wide mb-2`}>Email</Text>
            <View style={tw`bg-gray-50 border ${errors.email ? 'border-red-500' : 'border-gray-200'} rounded-2xl px-4 h-[52px] justify-center`}>
              <TextInput
                style={tw`text-[14px] text-gray-900`}
                placeholder="john@example.com"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                value={email}
                onChangeText={t => { setEmail(t); if (errors.email) setErrors({ ...errors, email: '' }); }}
                autoCapitalize="none"
              />
            </View>
            {errors.email ? <Text style={tw`text-red-500 text-[11px] mt-1.5 ml-1`}>{errors.email}</Text> : null}
          </View>

          {/* OTP channel selector */}
          <View style={tw`mb-7`}>
            <Text style={tw`text-gray-600 text-[12px] font-semibold tracking-wide mb-3`}>Receive OTP via</Text>
            <View style={tw`flex-row gap-3`}>
              <TouchableOpacity
                style={tw`flex-1 h-[44px] rounded-xl items-center justify-center flex-row gap-2 ${otpChannel === 'SMS' ? 'bg-blue-500 border-0' : 'bg-gray-50 border border-gray-200'}`}
                onPress={() => setOtpChannel('SMS')}
                activeOpacity={0.7}
              >
                <Ionicons name="chatbubble-outline" size={16} color={otpChannel === 'SMS' ? '#fff' : '#6B7280'} />
                <Text style={tw`${otpChannel === 'SMS' ? 'text-white' : 'text-gray-600'} text-[12px] font-semibold`}>SMS</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={tw`flex-1 h-[44px] rounded-xl items-center justify-center flex-row gap-2 ${otpChannel === 'EMAIL' ? 'bg-blue-500 border-0' : 'bg-gray-50 border border-gray-200'}`}
                onPress={() => setOtpChannel('EMAIL')}
                activeOpacity={0.7}
              >
                <Ionicons name="mail-outline" size={16} color={otpChannel === 'EMAIL' ? '#fff' : '#6B7280'} />
                <Text style={tw`${otpChannel === 'EMAIL' ? 'text-white' : 'text-gray-600'} text-[12px] font-semibold`}>Email</Text>
              </TouchableOpacity>
            </View>
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
            <Text style={tw`text-gray-500 text-[12px]`}>Already have an account?</Text>
            <TouchableOpacity onPress={() => router.push('/login')} activeOpacity={0.7}>
              <Text style={tw`text-blue-500 text-[12px] font-semibold`}>Log in</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
