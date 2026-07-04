import React, { useState, useRef, useEffect } from 'react';
import { Animated, TouchableOpacity, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, Text, View, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useRootNavigationState, Redirect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import tw from 'twrnc';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function SignupScreen() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const navState = useRootNavigationState();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ firstName: '', lastName: '', phone: '', email: '' });
  const [otpChannel, setOtpChannel] = useState<'SMS' | 'EMAIL'>('SMS');

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
      await api.post('/auth/signup', {
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

          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <View style={tw`w-14 h-14 rounded-2xl bg-blue-100 items-center justify-center mb-5`}>
              <Ionicons name="person-add-outline" size={26} color="#2563EB" />
            </View>
            <Text style={tw`text-gray-900 text-[26px] font-bold tracking-tight mb-1.5`}>Create account</Text>
            <Text style={tw`text-gray-500 text-[13px] leading-5 mb-9`}>Sign up to get started with WanPay</Text>

            <View style={tw`flex-row gap-3 mb-5`}>
              <View style={tw`flex-1`}>
                <Input
                  label="First name"
                  value={firstName}
                  onChangeText={t => { setFirstName(t); if (errors.firstName) setErrors({ ...errors, firstName: '' }); }}
                  placeholder="John"
                  autoCapitalize="words"
                  error={errors.firstName}
                />
              </View>
              <View style={tw`flex-1`}>
                <Input
                  label="Last name"
                  value={lastName}
                  onChangeText={t => { setLastName(t); if (errors.lastName) setErrors({ ...errors, lastName: '' }); }}
                  placeholder="Doe"
                  autoCapitalize="words"
                  error={errors.lastName}
                />
              </View>
            </View>

            <View style={tw`mb-5`}>
              <Input
                label="Phone number"
                value={phone}
                onChangeText={t => { const n = t.replace(/[^0-9]/g, ''); if (n.length <= 10) { setPhone(n); if (errors.phone) setErrors({ ...errors, phone: '' }); } }}
                placeholder="8012345678"
                keyboardType="phone-pad"
                maxLength={10}
                prefix="+234"
                error={errors.phone}
              />
            </View>

            <View style={tw`mb-7`}>
              <Input
                label="Email"
                value={email}
                onChangeText={t => { setEmail(t); if (errors.email) setErrors({ ...errors, email: '' }); }}
                placeholder="john@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors.email}
              />
            </View>

            <View style={tw`mb-7`}>
              <Text style={tw`text-gray-600 text-[12px] font-semibold tracking-wide mb-3`}>Receive OTP via</Text>
              <View style={tw`flex-row gap-3`}>
                <TouchableOpacity
                  style={tw`flex-1 h-[48px] rounded-2xl items-center justify-center flex-row gap-2 ${otpChannel === 'SMS' ? 'bg-blue-500' : 'bg-gray-50 border border-gray-200'}`}
                  onPress={() => setOtpChannel('SMS')}
                  activeOpacity={0.7}
                >
                  <Ionicons name="chatbubble-outline" size={16} color={otpChannel === 'SMS' ? '#fff' : '#6B7280'} />
                  <Text style={tw`${otpChannel === 'SMS' ? 'text-white' : 'text-gray-600'} text-[13px] font-semibold`}>SMS</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={tw`flex-1 h-[48px] rounded-2xl items-center justify-center flex-row gap-2 ${otpChannel === 'EMAIL' ? 'bg-blue-500' : 'bg-gray-50 border border-gray-200'}`}
                  onPress={() => setOtpChannel('EMAIL')}
                  activeOpacity={0.7}
                >
                  <Ionicons name="mail-outline" size={16} color={otpChannel === 'EMAIL' ? '#fff' : '#6B7280'} />
                  <Text style={tw`${otpChannel === 'EMAIL' ? 'text-white' : 'text-gray-600'} text-[13px] font-semibold`}>Email</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Button
              label="Continue"
              onPress={handleContinue}
              loading={loading}
              disabled={loading}
              variant="primary"
              size="lg"
            />

            <View style={tw`flex-row justify-center items-center gap-1 mt-5`}>
              <Text style={tw`text-gray-500 text-[12px]`}>Already have an account?</Text>
              <TouchableOpacity onPress={() => router.push('/login')} activeOpacity={0.7}>
                <Text style={tw`text-blue-500 text-[12px] font-semibold`}>Log in</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
