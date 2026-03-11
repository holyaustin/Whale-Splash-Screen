'use client';

import { WhaleTransaction } from '@/lib/types';
import { useEffect, useState } from 'react';

interface Props {
  whales: WhaleTransaction[];
}

export default function WhaleStats({ whales }: Props) {
  const [stats, setStats] = useState({
    total24h: 0,
    averageValue: 0,
    biggest: null as WhaleTransaction | null,
    count24h: 0,
  });

  useEffect(() => {
    const now = Date.now() / 1000;
    const last24h = whales.filter(w => now - w.timestamp < 86400);
    
    const total = last24h.reduce((sum, w) => sum + w.usdValue, 0);
    const avg = last24h.length ? total / last24h.length : 0;
    const biggest = last24h.reduce((max, w) => 
      w.usdValue > (max?.usdValue || 0) ? w : max, null as WhaleTransaction | null
    );

    setStats({
      total24h: total,
      averageValue: avg,
      biggest,
      count24h: last24h.length,
    });
  }, [whales]);

  return (
    <div className="bg-black/30 rounded-xl border border-blue-900/30 p-6">
      <h2 className="text-xl font-bold mb-4">📈 Stats</h2>
      
      <div className="space-y-4">
        <div className="bg-blue-900/20 rounded-lg p-4">
          <p className="text-sm text-gray-400">24h Volume</p>
          <p className="text-2xl font-bold text-green-400">
            ${stats.total24h.toLocaleString()}
          </p>
        </div>
        
        <div className="bg-blue-900/20 rounded-lg p-4">
          <p className="text-sm text-gray-400">Average Splash</p>
          <p className="text-2xl font-bold text-yellow-400">
            ${Math.round(stats.averageValue).toLocaleString()}
          </p>
        </div>
        
        <div className="bg-blue-900/20 rounded-lg p-4">
          <p className="text-sm text-gray-400">Total Whales (24h)</p>
          <p className="text-2xl font-bold text-purple-400">
            {stats.count24h}
          </p>
        </div>
        
        {stats.biggest && (
          <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-lg p-4">
            <p className="text-sm text-gray-400">Biggest Today</p>
            <p className="text-xl font-bold text-pink-400">
              ${stats.biggest.usdValue.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1 font-mono">
              {stats.biggest.token}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}