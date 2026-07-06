import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useRef } from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';
import tw from 'twrnc';
import FormattedDate from './FormattedDate';
import type { Transaction } from '@/lib/types';

interface TransactionItemProps {
  txn: Transaction;
  onPress?: () => void;
}

const STATUS_COLORS: Record<string, string> = {
  COMPLETED: '#10b981',
  PENDING: '#f59e0b',
  PROCESSING: '#3b82f6',
  FAILED: '#ef4444',
  REVERSED: '#8b5cf6',
};

const TYPE_ICONS: Record<string, { icon: string; color: string; bg: string }> = {
  SENT: { icon: 'arrow-up-circle', color: '#ef4444', bg: '#FEE2E2' },
  RECEIVED: { icon: 'arrow-down-circle', color: '#10b981', bg: '#D1FAE5' },
  BILLS: { icon: 'receipt-outline', color: '#f59e0b', bg: '#FEF3C7' },
  FUNDING: { icon: 'add-circle', color: '#10b981', bg: '#D1FAE5' },
  WITHDRAWAL: { icon: 'remove-circle', color: '#ef4444', bg: '#FEE2E2' },
};

function getLabel(txn: Transaction): string {
  if (txn.billProvider) return txn.billProvider;
  if (txn.recipientName) return txn.recipientName;
  if (txn.description) return txn.description;
  if (txn.type === 'FUNDING') return 'Wallet Funding';
  if (txn.type === 'WITHDRAWAL') return 'Withdrawal';
  if (txn.type === 'SENT') return 'Transfer Sent';
  if (txn.type === 'RECEIVED') return 'Transfer Received';
  return txn.type;
}

function getSubtitle(txn: Transaction): string {
  if (txn.recipientAccount) return `••${txn.recipientAccount.slice(-4)}`;
  if (txn.billRecipient) return txn.billRecipient;
  return '';
}

export default function TransactionItem({ txn, onPress }: TransactionItemProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const icon = TYPE_ICONS[txn.type] || { icon: 'ellipse', color: '#64748b', bg: '#F3F4F6' };
  const statusColor = STATUS_COLORS[txn.status] || '#64748b';

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, { toValue: 0.98, useNativeDriver: true, damping: 20, stiffness: 300 }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, damping: 15, stiffness: 200 }).start();
  }, [scaleAnim]);

  const isPositive = txn.type === 'RECEIVED' || txn.type === 'FUNDING';

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[tw`flex-row items-center py-3.5 px-5`, { transform: [{ scale: scaleAnim }] }]}>
        <View style={[tw`w-10 h-10 rounded-xl items-center justify-center mr-3`, { backgroundColor: icon.bg }]}>
          <Ionicons name={icon.icon as any} size={20} color={icon.color} />
        </View>
        <View style={tw`flex-1`}>
          <Text style={tw`text-gray-800 text-[13px] font-semibold`} numberOfLines={1}>{getLabel(txn)}</Text>
          <View style={tw`flex-row items-center mt-0.5 gap-1.5`}>
            <FormattedDate date={txn.createdAt} style={tw`text-gray-400 text-[11px]`} />
            {getSubtitle(txn) ? (
              <>
                <Text style={tw`text-gray-300 text-[11px]`}>·</Text>
                <Text style={tw`text-gray-400 text-[11px]`} numberOfLines={1}>{getSubtitle(txn)}</Text>
              </>
            ) : null}
          </View>
        </View>
        <View style={tw`items-end ml-3`}>
          <Text style={[tw`text-[14px] font-bold`, { color: isPositive ? '#10b981' : '#374151' }]}>
            {isPositive ? '+' : '-'}₦{(Number(txn.amount) / 100).toLocaleString()}
          </Text>
          <View style={tw`flex-row items-center mt-0.5 gap-1`}>
            <View style={[tw`w-1.5 h-1.5 rounded-full`, { backgroundColor: statusColor }]} />
            <Text style={[tw`text-[10px] capitalize font-medium`, { color: statusColor }]}>{txn.status.toLowerCase()}</Text>
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}
