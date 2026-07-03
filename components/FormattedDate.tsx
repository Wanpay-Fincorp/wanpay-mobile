import React from 'react';
import { Text } from 'react-native';
import tw from 'twrnc';

interface FormattedDateProps {
  date: string | Date;
  style?: any;
  showTime?: boolean;
  relative?: boolean;
  format?: 'short' | 'long' | 'relative';
}

function getRelativeTime(date: Date): string {
  const now = Date.now();
  const diff = now - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export default function FormattedDate({ date, style, showTime = false, relative = true, format }: FormattedDateProps) {
  if (!date) return <Text style={style}>-</Text>;

  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return <Text style={style}>-</Text>;

  const mode = format || (relative ? 'relative' : 'short');

  let display: string;
  if (mode === 'relative') {
    display = getRelativeTime(d);
  } else if (mode === 'long') {
    display = d.toLocaleDateString('en-GB', {
      day: 'numeric', month: 'long', year: 'numeric',
      ...(showTime ? { hour: '2-digit', minute: '2-digit' } : {}),
    });
  } else {
    display = d.toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short',
      ...(showTime ? { hour: '2-digit', minute: '2-digit' } : {}),
    });
  }

  return <Text style={style}>{display}</Text>;
}
