'use client';

import { WhaleTransaction } from '@/app/lib/types';
import { formatDistanceToNow } from 'date-fns';

interface Props {
  whales: WhaleTransaction[];
}

export default function WhaleHistory({ whales }: Props) {
  const getValueColor = (value: number) => {
    if (value > 1000000) return 'from-purple-600 to-pink-600';
    if (value > 500000) return 'from-red-600 to-orange-600';
    if (value > 200000) return 'from-orange-600 to-yellow-600';
    return 'from-yellow-600 to-green-600';
  };

  const getSplashSize = (value: number) => {
    if (value > 1000000) return 'text-4xl';
    if (value > 500000) return 'text-3xl';
    if (value > 200000) return 'text-2xl';
    return 'text-xl';
  };

  return (
    <div className="rounded-xl border border-blue-800/30 bg-gray-900/50 p-4 sm:p-6 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Recent Splashes
        </h2>
        <span className="text-sm text-gray-400">
          {whales.length} transactions
        </span>
      </div>
      
      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
        {whales.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <span className="text-6xl mb-4 animate-float">🐋</span>
            <p className="text-gray-500">
              No whales spotted yet.<br />
              <span className="text-sm">Waiting for big transactions...</span>
            </p>
          </div>
        ) : (
          whales.map((whale, i) => (
            <div
              key={`${whale.id}-${i}`}
              className="group relative overflow-hidden rounded-xl border border-blue-800/30 bg-gradient-to-r from-gray-900 to-gray-800/50 p-4 transition-all duration-300 hover:scale-[1.02] hover:border-blue-600/50 hover:shadow-xl hover:shadow-blue-600/20"
            >
              {/* Gradient background on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-blue-600/0 to-purple-600/0 opacity-0 transition-opacity duration-300 group-hover:opacity-10" />
              
              <div className="relative flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                {/* Left section - Whale info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`${getSplashSize(whale.usdValue)} filter drop-shadow-lg`}>
                      {whale.usdValue > 1000000 ? '🐋🌊' : '🐋'}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`
                          bg-gradient-to-r ${getValueColor(whale.usdValue)} 
                          bg-clip-text text-transparent font-bold text-xl sm:text-2xl
                        `}>
                          ${whale.usdValue.toLocaleString()}
                        </span>
                        <span className="rounded-full bg-blue-900/50 px-2 py-0.5 text-xs text-blue-300">
                          {whale.token}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Addresses - responsive */}
                  <div className="space-y-1 text-xs sm:text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 w-12">From:</span>
                      <span className="font-mono text-gray-300 break-all">
                        {whale.from.slice(0, 8)}...{whale.from.slice(-6)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 w-12">To:</span>
                      <span className="font-mono text-gray-300 break-all">
                        {whale.to.slice(0, 8)}...{whale.to.slice(-6)}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Right section - Time */}
                <div className="sm:text-right flex sm:block items-center justify-between">
                  <span className="text-sm text-gray-500 sm:hidden">Time:</span>
                  <time className="text-xs sm:text-sm text-gray-400" dateTime={new Date(whale.timestamp * 1000).toISOString()}>
                    {formatDistanceToNow(whale.timestamp * 1000, { addSuffix: true })}
                  </time>
                </div>
              </div>
              
              {/* Value indicator bar */}
              <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-500"
                   style={{ width: `${Math.min(100, (whale.usdValue / 1000000) * 100)}%` }}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}