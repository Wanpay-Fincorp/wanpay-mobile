import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import { DatePicker } from '@techtas/rn-calendar';
import tw from 'twrnc';

interface DatePickerModalProps {
  visible: boolean;
  value: string;
  onChange: (date: string) => void;
  onClose: () => void;
  minDate?: Date;
  maxDate?: Date;
  title?: string;
  accentColor?: string;
}

export default function DatePickerModal({ visible, value, onChange, onClose, minDate, maxDate, title, accentColor }: DatePickerModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity
        style={tw`flex-1 bg-black/40 justify-center px-5`}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity activeOpacity={1} onPress={() => {}} style={tw`bg-white rounded-2xl overflow-hidden`}>
          {title && (
            <View style={tw`px-4 pt-4 pb-2`}>
              <Text style={tw`text-gray-900 text-lg font-bold text-center`}>{title}</Text>
            </View>
          )}
          <DatePicker
            value={value || new Date().toISOString().split('T')[0]}
            onChange={(d) => { onChange(d); onClose(); }}
            minDate={minDate}
            maxDate={maxDate}
            accentColor={accentColor || '#2563EB'}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
