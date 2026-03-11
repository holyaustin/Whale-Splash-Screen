'use client';

import { useEffect, useState, useCallback } from 'react';
import { subscribeToWhales } from '@/app/lib/sdsStreamClient';
import { WhaleTransaction } from '@/app/lib/types';

export function useWhaleStream(threshold: number) {
  const [currentWhale, setCurrentWhale] = useState<WhaleTransaction | null>(null);
  const [recentWhales, setRecentWhales] = useState<WhaleTransaction[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const connect = async () => {
      setIsConnected(true);
      
      unsubscribe = await subscribeToWhales(threshold, (whale) => {
        setCurrentWhale(whale);
        setRecentWhales(prev => [whale, ...prev].slice(0, 20));
        
        // Auto-clear current whale after 5 seconds
        setTimeout(() => {
          setCurrentWhale(null);
        }, 5000);
      });
    };

    connect();

    return () => {
      setIsConnected(false);
      if (unsubscribe) unsubscribe();
    };
  }, [threshold]);

  return { currentWhale, recentWhales, isConnected };
}