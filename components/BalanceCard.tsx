import React, { useEffect, useRef, useState } from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import tw from 'twrnc';

type Props = {
  showBalance: boolean;
  balance: number;
  onToggle: () => void;
  onAddMoney?: () => void;
};

export default function BalanceCard({ showBalance, balance, onToggle, onAddMoney }: Props) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [displayBalance, setDisplayBalance] = useState(0);

  useEffect(() => {
    const listener = animatedValue.addListener(({ value }) => {
      setDisplayBalance(Math.round(value));
    });
    return () => animatedValue.removeListener(listener);
  }, [animatedValue]);

  useEffect(() => {
    fadeAnim.setValue(0);
    animatedValue.setValue(0);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: balance,
        duration: 1000,
        useNativeDriver: false,
      }),
    ]).start();
  }, [balance, animatedValue, fadeAnim]);

  return (
    <Animated.View style={[tw`bg-white/12 border border-white/20 rounded-[20px] p-5`, { opacity: fadeAnim }]}>
      <View style={tw`flex-row justify-between items-center mb-1.5`}>
        <Text style={tw`text-white/70 text-[12px] font-medium tracking-wide`}>Wallet balance</Text>
        <TouchableOpacity onPress={onToggle} activeOpacity={0.7}>
          <Ionicons name={showBalance ? 'eye-outline' : 'eye-off-outline'} size={17} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>
      </View>
      {showBalance ? (
        <Text style={tw`text-white text-[30px] font-bold tracking-tight mb-4`}>
          ₦{displayBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Text>
      ) : (
        <Text style={tw`text-white text-[30px] font-bold tracking-tight mb-4`}>₦ ••••••</Text>
      )}
      <View style={tw`flex-row justify-between items-center`}>
        <TouchableOpacity
          style={tw`bg-white rounded-full py-1.5 px-4 flex-row items-center gap-1 shadow-sm`}
          activeOpacity={0.85}
          onPress={onAddMoney}
        >
          <Ionicons name="add" size={14} color="#1d4ed8" />
          <Text style={tw`text-blue-700 text-[12px] font-semibold`}>Add money</Text>
        </TouchableOpacity>
        <Text style={tw`text-white/60 text-[11px] font-mono tracking-wider`}>{balance > 0 ? '••••' : 'N/A'}</Text>
      </View>
    </Animated.View>
  );
}
