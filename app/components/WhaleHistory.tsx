'use client';

import { WhaleTransaction } from '@/app/lib/types';
import { formatDistanceToNow } from 'date-fns';

interface Props {
  whales: WhaleTransaction[];
}

export default function WhaleHistory({ whales }: Props) {
  const getValueColor = (value: number) => {
    if (value > 1000000) return 'text-purple-400';
    if (value > 500000) return 'text-red-400';
    if (value > 200000) return 'text-orange-400';
    return 'text-yellow-400';
  };

  return (
    <div className="bg-black/30 rounded-xl border border-blue-900/30 p-6">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <span>📊 Recent Splashes</span>
        <span className="text-sm text-gray-500">(last 20)</span>
      </h2>
      
      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
        {whales.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No whales spotted yet. Waiting for big transactions...
          </p>
        ) : (
          whales.map((whale, i) => (
            <div
              key={`${whale.hash}-${i}`}
              className="
                bg-gradient-to-r from-blue-900/20 to-purple-900/20
                border border-blue-800/30 rounded-lg p-4
                hover:border-blue-600/50 transition-all
                transform hover:scale-[1.02] cursor-pointer
              "
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">🐋</span>
                    <span className={`
                      font-bold text-xl ${getValueColor(whale.usdValue)}
                    `}>
                      ${whale.usdValue.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-400 space-y-1">
                    <p className="font-mono">
                      From: {whale.from.slice(0, 8)}...{whale.from.slice(-6)}
                    </p>
                    <p className="font-mono">
                      To: {whale.to.slice(0, 8)}...{whale.to.slice(-6)}
                    </p>
                    <p>Token: {whale.token}</p>
                  </div>
                </div>
                
                <div className="text-right text-sm text-gray-500">
                  {formatDistanceToNow(whale.timestamp * 1000, { addSuffix: true })}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
