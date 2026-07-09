import React, { useRef, useEffect, useState } from 'react';
import { Animated, View, Text, TouchableOpacity, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter, useRootNavigationState, Redirect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import tw from 'twrnc';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function ForgotPinScreen() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const navState = useRootNavigationState();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ phone: '' });

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, damping: 18, stiffness: 150, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  if (!navState?.key) return null;
  if (isLoading) return null;
  if (user) return <Redirect href="/(tabs)" />;

  const validateForm = () => {
    if (!phone.trim()) { setErrors({ phone: 'Phone number is required' }); return false; }
    if (phone.trim().length !== 10) { setErrors({ phone: 'Must be 10 digits' }); return false; }
    setErrors({ phone: '' });
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const cleanPhone = phone.replace(/^0+/, '');
      await api.post('/auth/forgot-pin', { phone: `+234${cleanPhone}` }, false);
      router.push({ pathname: '/otp', params: { phone: `+234${cleanPhone}`, purpose: 'forgot_pin' } });
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Unable to process request. Please try again.');
    } finally { setLoading(false); }
  };

  const handlePhoneChange = (text: string) => {
    const n = text.replace(/[^0-9]/g, '');
    if (n.length <= 10) { setPhone(n); if (errors.phone) setErrors({ phone: '' }); }
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={tw`flex-1`}>
        <ScrollView style={tw`flex-1 px-7`} contentContainerStyle={tw`pb-8`} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <TouchableOpacity onPress={() => router.back()} style={tw`mt-14 mb-8 w-[38px] h-[38px] rounded-xl bg-gray-100 items-center justify-center`} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={20} color="#374151" />
          </TouchableOpacity>

          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <View style={tw`w-14 h-14 rounded-2xl bg-red-100 items-center justify-center mb-5`}>
              <Ionicons name="lock-closed-outline" size={26} color="#DC2626" />
            </View>
            <Text style={tw`text-gray-900 text-[26px] font-bold tracking-tight mb-1.5`}>Reset PIN</Text>
            <Text style={tw`text-gray-500 text-[13px] leading-5 mb-9`}>
              Enter your phone number and we&apos;ll send you an OTP to reset your transaction PIN.
            </Text>

            <View style={tw`mb-5`}>
              <Input
                label="Phone number"
                value={phone}
                onChangeText={handlePhoneChange}
                placeholder="8012345678"
                keyboardType="phone-pad"
                maxLength={10}
                prefix="+234"
                error={errors.phone}
              />
            </View>

            <Button
              label="Send OTP"
              onPress={handleSubmit}
              loading={loading}
              disabled={loading}
              variant="primary"
              size="lg"
            />

            <View style={tw`flex-row justify-center items-center gap-1 mt-5`}>
              <Text style={tw`text-gray-500 text-[12px]`}>Remember your PIN?</Text>
              <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
                <Text style={tw`text-blue-500 text-[12px] font-semibold`}>Log in</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
