import React from 'react';
import { Stack } from 'expo-router';

export default function BillsLayout() {
  return (
    <Stack>
      <Stack.Screen name="airtime" options={{ headerShown: false }} />
      <Stack.Screen name="data" options={{ headerShown: false }} />
      <Stack.Screen name="electricity" options={{ headerShown: false }} />
      <Stack.Screen name="tv" options={{ headerShown: false }} />
      <Stack.Screen name="internet" options={{ headerShown: false }} />
      <Stack.Screen name="education" options={{ headerShown: false }} />
    </Stack>
  );
}

