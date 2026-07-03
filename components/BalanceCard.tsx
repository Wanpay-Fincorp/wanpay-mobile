import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import tw from 'twrnc';

type Props = {
  showBalance: boolean;
  balance: number;
  onToggle: () => void;
  onAddMoney?: () => void;
};

const BalanceCard = ({ showBalance, balance, onToggle, onAddMoney }: Props) => {
  return (
    <View style={[tw`bg-white/10 p-5 rounded-2xl`, styles.card]}> 
      <View style={tw`flex-row justify-between items-center mb-2`}>
        <Text style={tw`text-white/80 text-sm`}>Wallet Balance</Text>
        <TouchableOpacity onPress={onToggle} activeOpacity={0.8}>
          <Ionicons name={showBalance ? 'eye-outline' : 'eye-off-outline'} size={20} color="#fff" />
        </TouchableOpacity>
      </View>
      <Text style={tw`text-white text-3xl font-bold`}>
        {showBalance ? `₦${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '₦****'}
      </Text>
      <TouchableOpacity style={tw`bg-white py-2 px-4 rounded-full mt-4 self-start`} activeOpacity={0.85} onPress={onAddMoney}>
        <Text style={{ color: Colors.light.primary, fontWeight: '600' }}>+ Add Money</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
});

export default BalanceCard;