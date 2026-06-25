import { DARK_BG } from '@/constants/customConstants';
import { useRouter, useRootNavigationState, Redirect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import tw from 'twrnc';
import { useAuth } from '@/contexts/AuthContext';

export default function WelcomeScreen() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const navState = useRootNavigationState();

  if (!navState?.key) return null;
  if (isLoading) return null;
  if (user) return <Redirect href="/(tabs)" />;

  const handleLogin = useCallback(() => router.push('/login'), [router]);
  const handleSignup = useCallback(() => router.push('/signup'), [router]);

  return (
    <SafeAreaView style={tw`flex-1 bg-[${DARK_BG}]`}>
      <StatusBar style="light" />

      {/* Background glows */}
      <View
        style={[
          tw`absolute w-96 h-96 rounded-full`,
          {
            top: -100,
            left: -80,
            backgroundColor: 'transparent',
            shadowColor: '#3b82f6',
            shadowOpacity: 0.35,
            shadowRadius: 120,
            elevation: 0,
          },
        ]}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={tw`flex-1`}
      >
        <View style={tw`flex-1 px-7 pt-14 pb-11`}>

          {/* Top — hero content */}
          <View style={tw`flex-1 justify-end pb-10`}>

            {/* Logo */}
            <View
              style={tw`w-[72px] h-[72px] rounded-[22px] bg-blue-500/15 border border-blue-400/30 items-center justify-center mb-7`}
            >
              <Image
                source={require('../assets/images/wanpay_logo.png')}
                style={tw`w-[52px] h-[52px] rounded-2xl`}
                resizeMode="cover"
                accessibilityLabel="WanPay logo"
              />
            </View>

            {/* Eyebrow */}
            <Text style={tw`text-blue-400 text-[11px] font-medium tracking-[3px] uppercase mb-2.5`}>
              Welcome to
            </Text>

            {/* Title */}
            <Text style={tw`text-white text-[40px] font-bold tracking-tight leading-tight mb-4`}>
              Wan<Text style={tw`text-blue-400`}>Pay</Text>
            </Text>

            {/* Tagline */}
            <Text style={tw`text-white/45 text-sm font-light leading-7 max-w-[220px]`}>
              Fast, secure & effortless payments for every moment.
            </Text>

            {/* Feature pills */}
            <View style={tw`flex-row gap-2 mt-7`}>
              <View style={tw`flex-row items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1.5`}>
                <View style={tw`w-1.5 h-1.5 rounded-full bg-blue-400`} />
                <Text style={tw`text-white/50 text-[11px]`}>Instant transfers</Text>
              </View>
              <View style={tw`flex-row items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1.5`}>
                <View style={tw`w-1.5 h-1.5 rounded-full bg-blue-400`} />
                <Text style={tw`text-white/50 text-[11px]`}>256-bit secure</Text>
              </View>
            </View>
          </View>

          {/* Bottom — CTAs */}
          <View style={tw`gap-3`}>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Login to your WanPay account"
              activeOpacity={0.85}
              style={tw`bg-blue-500 w-full py-4 rounded-2xl`}
              onPress={handleLogin}
            >
              <Text style={tw`text-white text-center font-semibold text-[15px] tracking-tight`}>
                Log in
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Create a new WanPay account"
              activeOpacity={0.85}
              style={tw`bg-white/5 border border-white/10 w-full py-4 rounded-2xl`}
              onPress={handleSignup}
            >
              <Text style={tw`text-white/75 text-center font-medium text-[15px] tracking-tight`}>
                Create an account
              </Text>
            </TouchableOpacity>

            <Text style={tw`text-white/20 text-[11px] text-center font-light mt-1`}>
              By continuing you agree to our Terms & Privacy Policy
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}