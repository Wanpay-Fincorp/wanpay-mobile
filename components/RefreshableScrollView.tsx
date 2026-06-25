import React, { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, ScrollViewProps } from 'react-native';

interface RefreshableScrollViewProps extends ScrollViewProps {
  onRefresh?: () => Promise<void> | void;
  refreshing?: boolean;
  children: React.ReactNode;
}

export default function RefreshableScrollView({ onRefresh, refreshing: externalRefreshing, children, ...props }: RefreshableScrollViewProps) {
  const [internalRefreshing, setInternalRefreshing] = useState(false);
  const isRefreshing = externalRefreshing !== undefined ? externalRefreshing : internalRefreshing;

  const handleRefresh = useCallback(async () => {
    if (!onRefresh) return;
    setInternalRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setInternalRefreshing(false);
    }
  }, [onRefresh]);

  return (
    <ScrollView
      {...props}
      {...(onRefresh ? {
        refreshControl:
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="rgba(255,255,255,0.4)"
            colors={['#3b82f6']}
            progressBackgroundColor="#1e293b"
          />
      } : {})}
    >
      {children}
    </ScrollView>
  );
}
