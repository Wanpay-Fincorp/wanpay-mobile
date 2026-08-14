import * as Updates from 'expo-updates';
import { useEffect, useState, useCallback } from 'react';

const CHECK_DELAY_MS = 1500;

export function useExpoUpdates() {
  const [available, setAvailable] = useState(false);
  const [checking, setChecking] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkForUpdate = useCallback(async () => {
    if (checking || updating) return;
    setChecking(true);
    try {
      const check = await Updates.checkForUpdateAsync();
      if (check.isAvailable) {
        setAvailable(true);
      }
    } catch {
      // Ignore update-check failures — never block app startup
    } finally {
      setChecking(false);
    }
  }, [checking, updating]);

  const applyUpdate = useCallback(async () => {
    setUpdating(true);
    setError(null);
    try {
      await Updates.fetchUpdateAsync();
      await Updates.reloadAsync();
    } catch {
      setError('Something went wrong while updating. Please try again.');
      setUpdating(false);
    }
  }, []);

  const dismiss = useCallback(() => setAvailable(false), []);

  useEffect(() => {
    const timer = setTimeout(() => {
      checkForUpdate();
    }, CHECK_DELAY_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { checking, available, updating, error, checkForUpdate, applyUpdate, dismiss };
}