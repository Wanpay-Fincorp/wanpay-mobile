import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import tw from 'twrnc';
import { api } from '@/lib/api';
import Button from '@/components/ui/Button';

export default function OTPScreen() {
  const router = useRouter();
  const { phone, email, purpose: rawPurpose, channel: rawChannel } = useLocalSearchParams<{ phone?: string; email?: string; purpose?: string; channel?: string }>();
  const purpose = rawPurpose || 'signup';
  const otpChannel = rawChannel || (email ? 'EMAIL' : 'SMS');
  const contact = otpChannel === 'EMAIL' ? email : phone;
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const bounceAnims = useRef(otp.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (resendTimer > 0 && !canResend) {
      const timer = setTimeout(() => setResendTimer((t) => t - 1), 1000);
      return () => clearTimeout(timer);
    } else if (resendTimer === 0) {
      setCanResend(true);
    }
  }, [resendTimer, canResend]);

  const triggerBounce = useCallback((index: number) => {
    Animated.spring(bounceAnims[index], {
      toValue: 1,
      damping: 8,
      stiffness: 200,
      useNativeDriver: true,
    }).start(() => {
      bounceAnims[index].setValue(0);
    });
  }, [bounceAnims]);

  const handleOtpChange = (value: string, index: number) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    if (numericValue.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = numericValue;
    setOtp(newOtp);
    if (numericValue) triggerBounce(index);
    if (numericValue && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    if (index === 5 && numericValue) {
      const complete = [...newOtp];
      complete[index] = numericValue;
      if (complete.every((d) => d !== '')) {
        handleVerify(complete.join(''));
      }
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (otpCode?: string) => {
    const code = otpCode || otp.join('');
    if (code.length !== 6) {
      Alert.alert('Invalid Code', 'Please enter the complete 6-digit code');
      return;
    }
    setLoading(true);
    try {
      if (!contact) {
        Alert.alert('Error', 'Contact not found. Please sign up again.');
        router.push('/signup');
        return;
      }
      const body: Record<string, string> = { otp: code, purpose };
      if (otpChannel === 'EMAIL') {
        body.email = contact;
      } else {
        body.phone = contact;
      }
      const result = await api.post<any>('/auth/verify-otp', body, false);
      if (purpose === 'forgot_pin') {
        router.push({ pathname: '/createPin', params: { userId: result.userId, purpose: 'forgot_pin' } });
      } else {
        router.push({ pathname: '/createPin', params: { userId: result.userId } });
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Invalid verification code. Please try again.');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setResendTimer(60);
    setCanResend(false);
    setOtp(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
    try {
      if (contact) {
        const body: Record<string, string> = { purpose };
        if (otpChannel === 'EMAIL') {
          body.email = contact;
        } else {
          body.phone = contact;
        }
        await api.post('/auth/send-otp', body, false);
      }
    } catch {
    }
  };

  const isOtpComplete = otp.every((d) => d !== '');

  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={tw`flex-1`}>
        <View style={tw`flex-1 px-6`}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={tw`mt-4 mb-6 w-10 h-10 rounded-xl bg-gray-100 items-center justify-center`}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color="#374151" />
          </TouchableOpacity>

          <View style={tw`mb-8`}>
            <View style={tw`flex-row items-center gap-3 mb-3`}>
              <View style={tw`w-11 h-11 rounded-xl bg-blue-100 items-center justify-center`}>
                <Ionicons name={otpChannel === 'EMAIL' ? 'mail-outline' : 'chatbubble-ellipses'} size={22} color="#2563EB" />
              </View>
              <Text style={tw`text-gray-900 text-[26px] font-bold tracking-tight`}>
                {otpChannel === 'EMAIL' ? 'Verify Email' : 'Verify Phone'}
              </Text>
            </View>
            <Text style={tw`text-gray-500 text-[14px] leading-6`}>
              Enter the 6-digit code sent to{'\n'}
              <Text style={tw`font-bold text-gray-900`}>{contact || (otpChannel === 'EMAIL' ? 'user@example.com' : '+234 801 234 5678')}</Text>
            </Text>
          </View>

          <View style={tw`flex-row justify-between mb-4`}>
            {otp.map((digit, idx) => {
              const filled = digit !== '';
              const bounce = bounceAnims[idx].interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [1, 1.15, 1],
              });
              return (
                <Animated.View
                  key={idx}
                  style={[
                    tw`w-[50px] h-[58px] rounded-2xl items-center justify-center border-2`,
                    filled
                      ? tw`border-blue-500 bg-blue-50`
                      : tw`border-gray-200 bg-gray-50`,
                    { transform: [{ scale: bounce }] },
                  ]}
                >
                  <TextInput
                    ref={(ref) => { inputRefs.current[idx] = ref; }}
                    style={tw`w-full h-full text-center text-[22px] font-bold text-gray-900`}
                    keyboardType="number-pad"
                    maxLength={1}
                    value={digit}
                    onChangeText={(val) => handleOtpChange(val, idx)}
                    onKeyPress={(e) => handleKeyPress(e, idx)}
                    selectTextOnFocus
                  />
                </Animated.View>
              );
            })}
          </View>

          <Text style={tw`text-gray-400 text-[12px] mb-8 ml-1`}>
            {otpChannel === 'EMAIL'
              ? 'Check your email inbox (and spam folder) — the code expires in 10 minutes.'
              : 'Check your SMS inbox — the code expires in 10 minutes.'}
          </Text>

          <View style={tw`flex-row items-center justify-center mb-8`}>
            <Text style={tw`text-gray-500 text-[14px]`}>Didn&apos;t receive it? </Text>
            <TouchableOpacity onPress={handleResend} disabled={!canResend} activeOpacity={0.7}>
              <Text style={tw`text-[14px] font-bold ${canResend ? 'text-blue-500' : 'text-gray-300'}`}>
                {canResend ? 'Resend Code' : `Resend in ${resendTimer}s`}
              </Text>
            </TouchableOpacity>
          </View>

          <Button
            label="Verify"
            onPress={() => handleVerify()}
            disabled={loading || !isOtpComplete}
            loading={loading}
            variant="primary"
            size="lg"
          />

          <View style={tw`mt-5 flex-row items-center justify-center gap-2`}>
            <Ionicons name="shield-checkmark" size={14} color="#10B981" />
            <Text style={tw`text-gray-400 text-[12px]`}>We&apos;ll never share your code with anyone</Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
