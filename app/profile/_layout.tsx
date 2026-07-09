import React from 'react';
import { Stack } from 'expo-router';

export default function ProfileLayout() {
  return (
    <Stack screenOptions={{headerShown:false}}>
      <Stack.Screen name="personal-information" options={{ headerShown: false }} />
      <Stack.Screen name="security-settings" options={{ headerShown: false }} />
      <Stack.Screen name="transaction-limits" options={{ headerShown: false }} />
      <Stack.Screen name="notifications" options={{ headerShown: false }} />
      <Stack.Screen name="help-support" options={{ headerShown: false }} />
      <Stack.Screen name="increase-limits" options={{ headerShown: false }} />
      <Stack.Screen name="statements" options={{ headerShown: false }} />
      <Stack.Screen name="manage-cards" options={{ headerShown: false }} />
    </Stack>
  );
}

