'use client';

import { WhaleTransaction } from '@/app/lib/types';
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
    totalVolume: 0,
  });

  useEffect(() => {
    const now = Date.now() / 1000;
    const last24h = whales.filter(w => now - w.timestamp < 86400);
    
    const total = last24h.reduce((sum, w) => sum + w.usdValue, 0);
    const avg = last24h.length ? total / last24h.length : 0;
    const biggest = last24h.reduce((max, w) => 
      w.usdValue > (max?.usdValue || 0) ? w : max, null as WhaleTransaction | null
    );
    const totalVolume = whales.reduce((sum, w) => sum + w.usdValue, 0);

    setStats({
      total24h: total,
      averageValue: avg,
      biggest,
      count24h: last24h.length,
      totalVolume,
    });
  }, [whales]);

  return (
    <div className="space-y-4">
      {/* Main stats card */}
      <div className="rounded-xl border border-blue-800/30 bg-gray-900/50 p-4 sm:p-6 backdrop-blur-sm">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          📊 Live Stats
        </h2>
        
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div className="rounded-lg bg-gradient-to-br from-blue-900/30 to-blue-900/10 p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-gray-400">24h Volume</p>
            <p className="text-lg sm:text-2xl font-bold text-green-400">
              ${stats.total24h.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {stats.count24h} transactions
            </p>
          </div>
          
          <div className="rounded-lg bg-gradient-to-br from-purple-900/30 to-purple-900/10 p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-gray-400">Avg Splash</p>
            <p className="text-lg sm:text-2xl font-bold text-yellow-400">
              ${Math.round(stats.averageValue).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-blue-800/30 bg-gray-900/30 p-3 backdrop-blur-sm">
          <p className="text-xs text-gray-400">Total Volume</p>
          <p className="text-base sm:text-lg font-bold text-blue-400">
            ${stats.totalVolume.toLocaleString()}
          </p>
        </div>
        
        <div className="rounded-lg border border-blue-800/30 bg-gray-900/30 p-3 backdrop-blur-sm">
          <p className="text-xs text-gray-400">Whale Count</p>
          <p className="text-base sm:text-lg font-bold text-purple-400">
            {whales.length}
          </p>
        </div>
      </div>

      {/* Biggest today */}
      {stats.biggest && (
        <div className="rounded-lg border border-purple-800/30 bg-gradient-to-r from-purple-900/30 to-pink-900/30 p-4 backdrop-blur-sm">
          <p className="text-xs text-gray-400 mb-2">🏆 Biggest Today</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg sm:text-xl font-bold text-pink-400">
                ${stats.biggest.usdValue.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {stats.biggest.token}
              </p>
            </div>
            <span className="text-4xl">🐋</span>
          </div>
          <div className="mt-2 text-xs text-gray-500 truncate font-mono">
            {stats.biggest.from.slice(0, 8)}...{stats.biggest.from.slice(-6)}
          </div>
        </div>
      )}

      {/* Connection status */}
      <div className="rounded-lg border border-blue-800/30 bg-gray-900/30 p-3 text-center backdrop-blur-sm">
        <p className="text-xs text-gray-400">
          Live updates every 5-10 seconds
        </p>
      </div>
    </div>
  );
}