import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
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

const TYPE_ICONS: Record<string, { icon: string; color: string }> = {
  SENT: { icon: 'arrow-up-circle', color: '#ef4444' },
  RECEIVED: { icon: 'arrow-down-circle', color: '#10b981' },
  BILLS: { icon: 'receipt-outline', color: '#f59e0b' },
  FUNDING: { icon: 'add-circle', color: '#10b981' },
  WITHDRAWAL: { icon: 'remove-circle', color: '#ef4444' },
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
  const icon = TYPE_ICONS[txn.type] || { icon: 'ellipse', color: '#64748b' };
  const statusColor = STATUS_COLORS[txn.status] || '#64748b';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={tw`flex-row items-center py-3 px-5`}
    >
      <View style={[tw`w-9 h-9 rounded-xl items-center justify-center mr-3`, { backgroundColor: `${icon.color}20` }]}>
        <Ionicons name={icon.icon as any} size={18} color={icon.color} />
      </View>
      <View style={tw`flex-1`}>
        <Text style={tw`text-white text-sm font-semibold`} numberOfLines={1}>{getLabel(txn)}</Text>
        <View style={tw`flex-row items-center mt-0.5 gap-1.5`}>
          <FormattedDate date={txn.createdAt} style={tw`text-white/35 text-[11px]`} />
          {getSubtitle(txn) ? (
            <>
              <Text style={tw`text-white/20 text-[11px]`}>·</Text>
              <Text style={tw`text-white/35 text-[11px]`} numberOfLines={1}>{getSubtitle(txn)}</Text>
            </>
          ) : null}
        </View>
      </View>
      <View style={tw`items-end ml-3`}>
        <Text style={[tw`text-sm font-semibold`, { color: txn.type === 'RECEIVED' || txn.type === 'FUNDING' ? '#10b981' : '#f1f5f9' }]}>
          {txn.type === 'RECEIVED' || txn.type === 'FUNDING' ? '+' : '-'}₦{Number(txn.amount).toLocaleString()}
        </Text>
        <View style={tw`flex-row items-center mt-0.5 gap-1`}>
          <View style={[tw`w-1.5 h-1.5 rounded-full`, { backgroundColor: statusColor }]} />
          <Text style={[tw`text-[10px] capitalize`, { color: statusColor }]}>{txn.status.toLowerCase()}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
