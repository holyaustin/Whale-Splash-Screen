'use client';

import { useState } from 'react';
import { useWhaleStream } from '@/app/hooks/useWhaleStream';
import { useLocalStorage } from '@/app/hooks/useLocalStorage';
import SplashAnimation from './SplashAnimation';
import WhaleHistory from './WhaleHistory';
import WhaleStats from './WhaleStats';
import ThresholdSettings from './ThresholdSettings';

export default function WhaleSplash() {
  const [threshold, setThreshold] = useLocalStorage('whale-threshold', 50000);
  const [intensity, setIntensity] = useLocalStorage<'low' | 'medium' | 'high'>('animation-intensity', 'high');
  
  // Use the hook - currentWhale is managed by the hook
  const { currentWhale, recentWhales, isConnected } = useWhaleStream(threshold);

  // We don't need setCurrentWhale here because the hook handles clearing it
  // after 5 seconds automatically. The onComplete is optional.

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 to-black text-white">
      {/* Current splash animation */}
      {currentWhale && (
        <SplashAnimation
          whale={currentWhale}
          intensity={intensity}
          // onComplete is optional - the hook already clears after 5 seconds
        />
      )}
      
      {/* Header */}
      <header className="border-b border-blue-800/30 bg-black/20 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-4xl">🐋</span>
              <h1 className="text-2xl font-bold">Whale Watch</h1>
              <div className={`
                w-2 h-2 rounded-full ml-2
                ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}
              `} />
            </div>
            
            <ThresholdSettings
              threshold={threshold}
              onThresholdChange={setThreshold}
            />
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stats sidebar */}
          <div className="lg:col-span-1">
            <WhaleStats whales={recentWhales} />
          </div>
          
          {/* History feed */}
          <div className="lg:col-span-2">
            <WhaleHistory whales={recentWhales} />
          </div>
        </div>
      </main>
    </div>
  );
}