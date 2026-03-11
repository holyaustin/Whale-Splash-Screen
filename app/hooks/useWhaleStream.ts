'use client';

import { useEffect, useState } from 'react';
import { WhaleTransaction } from '@/app/lib/types';
import { getHistoricalWhales, startMockWhaleStream } from '@/app/lib/mockWhaleService';

export function useWhaleStream(threshold?: number) {
  const [currentWhale, setCurrentWhale] = useState<WhaleTransaction | null>(null);
  const [recentWhales, setRecentWhales] = useState<WhaleTransaction[]>([]);
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    // Load historical data
    const historical = getHistoricalWhales(20);
    console.log('📜 Historical whales loaded:', historical.length);
    setRecentWhales(historical);
    
    // Start real-time stream
    const cleanup = startMockWhaleStream((whale) => {
      // Filter by threshold if provided
      if (threshold && whale.usdValue < threshold) {
        return; // Skip whales below threshold
      }
      
      console.log('💦 New whale splash!', whale.usdValue);
      setCurrentWhale(whale);
      setRecentWhales(prev => [whale, ...prev].slice(0, 50));
      
      // Auto-clear after 5 seconds (this will be overridden by manual close)
      setTimeout(() => setCurrentWhale(null), 5000);
    });
    
    return cleanup;
  }, [threshold]);

  // Return setCurrentWhale so components can clear it manually
  return { currentWhale, setCurrentWhale, recentWhales, isConnected };
}