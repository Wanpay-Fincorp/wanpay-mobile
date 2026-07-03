import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import tw from 'twrnc';

type Props = {
  icon: string;
  label: string;
  onPress: () => void;
};

const QuickAction = ({ icon, label, onPress }: Props) => {
  return (
    <TouchableOpacity style={tw`items-center`} onPress={onPress} activeOpacity={0.85}>
      <View
        style={[
          tw`w-16 h-16 rounded-2xl items-center justify-center mb-2`,
          styles.shadow,
          { backgroundColor: 'rgba(37,99,235,0.12)' },
        ]}
      >
        <Ionicons name={icon as any} size={28} color={Colors.light.primary} />
      </View>
      <Text style={tw`text-xs text-gray-700`}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 2,
  },
});

export default QuickAction;