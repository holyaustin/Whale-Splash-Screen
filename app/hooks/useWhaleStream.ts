'use client';

import { useEffect, useState } from 'react';
import { WhaleTransaction } from '@/app/lib/types';
import { getHistoricalWhales, startMockWhaleStream } from '@/app/lib/mockWhaleService';

export function useWhaleStream(threshold?: number) {  // Add threshold parameter
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
      
      // Clear current whale after animation
      setTimeout(() => setCurrentWhale(null), 5000);
    });
    
    return cleanup;
  }, [threshold]); // Add threshold to dependencies

  return { currentWhale, recentWhales, isConnected };
}