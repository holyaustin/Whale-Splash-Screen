'use client';

import { useEffect, useState } from 'react';
import { WhaleTransaction } from '@/app/lib/types';

interface Props {
  whale: WhaleTransaction;
  intensity: 'low' | 'medium' | 'high';
  onComplete?: () => void;
}

export default function SplashAnimation({ whale, intensity, onComplete }: Props) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!visible) return null;

  const splashSize = {
    low: 'scale-110',
    medium: 'scale-150',
    high: 'scale-200',
  }[intensity];

  // Determine splash intensity based on value
  const getSplashClass = () => {
    if (whale.usdValue > 1000000) return 'animate-[splash_0.5s_ease-out] bg-purple-600';
    if (whale.usdValue > 500000) return 'animate-[splash_0.4s_ease-out] bg-red-600';
    if (whale.usdValue > 200000) return 'animate-[splash_0.3s_ease-out] bg-orange-600';
    return 'animate-[splash_0.2s_ease-out] bg-yellow-600';
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
      {/* Main splash */}
      <div className={`
        absolute inset-0 ${getSplashClass()} opacity-75
        transition-all duration-1000
      `} />
      
      {/* Ripple effects */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="
          w-96 h-96 rounded-full bg-white opacity-20
          animate-[ping_1s_ease-out_infinite]
        " />
      </div>
      
      {/* Whale info */}
      <div className={`
        relative z-10 text-center text-white
        transform transition-all duration-300 ${splashSize}
      `}>
        <h1 className="text-6xl font-bold mb-4 animate-pulse">
          🐋 WHALE SPLASH!
        </h1>
        <div className="text-2xl bg-black/50 backdrop-blur p-8 rounded-2xl">
          <p className="text-4xl font-bold text-yellow-400">
            ${whale.usdValue.toLocaleString()}
          </p>
          <p className="mt-2">{whale.token}</p>
          <p className="text-sm mt-4 opacity-75 font-mono">
            {whale.from.slice(0, 6)}...{whale.from.slice(-4)} → {whale.to.slice(0, 6)}...{whale.to.slice(-4)}
          </p>
        </div>
      </div>
    </div>
  );
}