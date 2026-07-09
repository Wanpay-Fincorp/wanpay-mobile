import React, { useState, useRef, useEffect } from 'react';
import { Animated, View, Text, TouchableOpacity, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter, useRootNavigationState, Redirect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import tw from 'twrnc';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
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
      const cleanPhone = phone.replace(/^0+/, '')
      const tokens = await api.post<AuthTokens>('/auth/login', {
        phone: `+234${cleanPhone}`,
        pin,
      }, false);
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
    <SafeAreaView style={tw`flex-1 bg-white`}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={tw`flex-1`}>
        <ScrollView style={tw`flex-1 px-7`} contentContainerStyle={tw`pb-8`} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <TouchableOpacity onPress={() => router.back()} style={tw`mt-14 mb-8 w-[38px] h-[38px] rounded-xl bg-gray-100 items-center justify-center`} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={20} color="#374151" />
          </TouchableOpacity>

          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <View style={tw`w-14 h-14 rounded-2xl bg-blue-100 items-center justify-center mb-5`}>
              <Ionicons name="log-in-outline" size={26} color="#2563EB" />
            </View>
            <Text style={tw`text-gray-900 text-[26px] font-bold tracking-tight mb-1.5`}>Welcome back</Text>
            <Text style={tw`text-gray-500 text-[13px] leading-5 mb-9`}>Log in to continue to your account</Text>

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

            <View style={tw`mb-3`}>
              <Input
                label="PIN"
                value={pin}
                onChangeText={handlePinChange}
                placeholder="••••"
                keyboardType="number-pad"
                maxLength={4}
                secureTextEntry={!showPin}
                rightIcon={showPin ? 'eye-outline' : 'eye-off-outline'}
                onRightIconPress={() => setShowPin(!showPin)}
                error={errors.pin}
              />
            </View>

            <TouchableOpacity style={tw`mb-9 self-end`} activeOpacity={0.7} onPress={() => router.push('/forgot-pin')}>
              <Text style={tw`text-blue-500 text-[12px] font-semibold`}>Forgot PIN?</Text>
            </TouchableOpacity>

            <Button
              label="Log in"
              onPress={handleLogin}
              loading={loading}
              disabled={loading}
              variant="primary"
              size="lg"
            />

            <View style={tw`flex-row justify-center items-center gap-1 mt-5`}>
              <Text style={tw`text-gray-500 text-[12px]`}>Don&apos;t have an account?</Text>
              <TouchableOpacity onPress={() => router.push('/signup')} activeOpacity={0.7}>
                <Text style={tw`text-blue-500 text-[12px] font-semibold`}>Sign up</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
