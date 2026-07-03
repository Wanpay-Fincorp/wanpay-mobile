import { useRouter, useRootNavigationState, Redirect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import tw from 'twrnc';
import { useAuth } from '@/contexts/AuthContext';

const slides = [
  {
    image: require('../assets/images/welcome_hero.png'),
    title: 'Send Money Instantly',
    subtitle: 'Transfer funds to anyone, anytime — fast, secure, and with zero stress.',
  },
  {
    image: require('../assets/images/welcome_finance.png'),
    title: 'Track Your Finances',
    subtitle: 'Monitor your spending, view transaction history, and stay in control of your money.',
  },
  {
    image: require('../assets/images/welcome_transactions.png'),
    title: 'Pay Bills with Ease',
    subtitle: 'Airtime, data, electricity, TV — settle all your bills in one place seamlessly.',
  },
  {
    image: require('../assets/images/welcome_more.png'),
    title: '...and many more!',
    subtitle: 'Grants, virtual cards, savings, and everything you need to grow your finances.',
  },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const navState = useRootNavigationState();
  const [currentIndex, setCurrentIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [transitioning, setTransitioning] = useState(false);

  const fadeTo = useCallback((toIndex: number) => {
    if (transitioning || toIndex === currentIndex) return;
    setTransitioning(true);
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setCurrentIndex(toIndex);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }).start(() => setTransitioning(false));
    });
  }, [currentIndex, transitioning, fadeAnim]);

  const handleNext = useCallback(() => {
    if (currentIndex < slides.length - 1) fadeTo(currentIndex + 1);
  }, [currentIndex, fadeTo]);

  const handleSkip = useCallback(() => {
    fadeTo(slides.length - 1);
  }, [fadeTo]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  if (!navState?.key) return null;
  if (isLoading) return null;
  if (user) return <Redirect href="/(tabs)" />;

  const isLastSlide = currentIndex === slides.length - 1;
  const slide = slides[currentIndex];

  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      <StatusBar style="dark" />

      {/* Skip */}
      {!isLastSlide && (
        <TouchableOpacity
          onPress={handleSkip}
          style={tw`absolute top-12 right-6 z-10 px-4 py-2 rounded-full bg-gray-100 border border-gray-200`}
          activeOpacity={0.7}
        >
          <Text style={tw`text-gray-500 text-[12px] font-semibold`}>Skip</Text>
        </TouchableOpacity>
      )}

      {/* Slide content with fade */}
      <View style={tw`flex-1 items-center justify-center px-8`}>
        <Animated.View style={[tw`items-center justify-center w-full`, { opacity: fadeAnim }]}>
          <View style={tw`w-full aspect-square max-h-[400px] items-center justify-center mb-6`}>
            <Image
              source={slide.image}
              style={tw`w-full h-full`}
              resizeMode="contain"
            />
          </View>
          <Text style={tw`text-gray-900 text-[28px] font-bold text-center tracking-tight mb-3`}>
            {slide.title}
          </Text>
          <Text style={tw`text-gray-500 text-[14px] text-center leading-6 max-w-[320px]`}>
            {slide.subtitle}
          </Text>
        </Animated.View>
      </View>

      {/* Page dots */}
      <View style={tw`flex-row justify-center gap-2 mb-8`}>
        {slides.map((_, idx) => (
          <TouchableOpacity
            key={idx}
            onPress={() => fadeTo(idx)}
            activeOpacity={0.7}
          >
            <View
              style={tw`h-[6px] rounded-full ${idx === currentIndex ? 'w-7 bg-blue-500' : 'w-[6px] bg-gray-300'}`}
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* Bottom section */}
      <View style={tw`px-7 pb-8 gap-3`}>
        <TouchableOpacity
          activeOpacity={0.85}
          style={tw`bg-blue-500 w-full py-4 rounded-2xl`}
          onPress={isLastSlide ? () => router.push('/signup') : handleNext}
        >
          <Text style={tw`text-white text-center font-semibold text-[15px] tracking-tight`}>
            {isLastSlide ? 'Create an account' : 'Continue'}
          </Text>
        </TouchableOpacity>

        {isLastSlide && (
          <>
            <TouchableOpacity
              activeOpacity={0.85}
              style={tw`bg-gray-50 border border-gray-200 w-full py-4 rounded-2xl`}
              onPress={() => router.push('/login')}
            >
              <Text style={tw`text-gray-700 text-center font-medium text-[15px] tracking-tight`}>
                Log in
              </Text>
            </TouchableOpacity>
            <Text style={tw`text-gray-400 text-[11px] text-center font-light mt-1`}>
              By continuing you agree to our Terms & Privacy Policy
            </Text>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}
