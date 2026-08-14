import React, { useState } from 'react';
import { ActivityIndicator, Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';
import tw from 'twrnc';

interface PinModalProps {
  visible: boolean;
  title?: string;
  subtitle?: string;
  loading?: boolean;
  onConfirm: (pin: string) => void;
  onClose: () => void;
}

export default function PinModal({
  visible,
  title = 'Confirm your PIN',
  subtitle = 'Enter your 4-digit PIN to continue',
  loading = false,
  onConfirm,
  onClose,
}: PinModalProps) {
  const [pin, setPin] = useState('');

  const handleConfirm = () => {
    if (pin.length >= 4 && !loading) {
      onConfirm(pin);
      setPin('');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={tw`flex-1 bg-black/50 items-center justify-center px-6`}>
        <View style={tw`bg-white rounded-3xl w-full p-6`}>
          <Text style={tw`text-lg font-bold text-gray-900 mb-1`}>{title}</Text>
          <Text style={tw`text-sm text-gray-500 mb-5`}>{subtitle}</Text>

          <View style={tw`border border-gray-300 rounded-2xl px-4 h-14 flex-row items-center mb-5`}>
            <TextInput
              style={tw`flex-1 text-center text-2xl tracking-[8px] text-gray-900`}
              value={pin}
              onChangeText={(text) => setPin(text.replace(/[^0-9]/g, '').slice(0, 4))}
              secureTextEntry
              keyboardType="number-pad"
              maxLength={4}
              autoFocus
              placeholder="• • • •"
              placeholderTextColor="#D1D5DB"
            />
          </View>

          <TouchableOpacity
            style={tw`bg-blue-600 h-12 rounded-2xl items-center justify-center mb-3 ${loading || pin.length < 4 ? 'opacity-50' : ''}`}
            onPress={handleConfirm}
            disabled={loading || pin.length < 4}
            activeOpacity={0.8}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={tw`text-white font-bold text-base`}>Confirm</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose} disabled={loading} activeOpacity={0.7}>
            <Text style={tw`text-center text-gray-500 font-semibold`}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}