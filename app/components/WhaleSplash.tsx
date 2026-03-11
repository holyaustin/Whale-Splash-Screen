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
  const [intensity] = useLocalStorage<'low' | 'medium' | 'high'>('animation-intensity', 'high');
  
  // Now this includes setCurrentWhale!
  const { currentWhale, setCurrentWhale, recentWhales, isConnected } = useWhaleStream(threshold);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-blue-950 to-gray-950">
      {/* Current splash animation */}
      {currentWhale && (
        <SplashAnimation
          whale={currentWhale}
          intensity={intensity}
          onComplete={() => setCurrentWhale(null)} // Now this works!
        />
      )}
      
      {/* Header - Fixed at top with glass morphism effect */}
      <header className="sticky top-0 z-40 border-b border-blue-800/30 bg-gray-950/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Logo and title */}
            <div className="flex items-center gap-3">
              <span className="text-4xl animate-float">🐋</span>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Whale Watch
                </h1>
                <p className="text-xs text-gray-400">Real-time Somnia whale tracker</p>
              </div>
              <div className={`
                h-2 w-2 rounded-full ml-2
                ${isConnected 
                  ? 'bg-green-500 animate-pulse shadow-lg shadow-green-500/50' 
                  : 'bg-red-500'
                }
              `} />
            </div>
            
            {/* Settings - Responsive */}
            <div className="w-full sm:w-auto">
              <ThresholdSettings
                threshold={threshold}
                onThresholdChange={setThreshold}
              />
            </div>
          </div>
        </div>
      </header>
      
      {/* Main content - Responsive grid */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Stats sidebar - Shows first on mobile */}
          <div className="order-1 lg:col-span-1">
            <div className="lg:sticky lg:top-24 space-y-6">
              <WhaleStats whales={recentWhales} />
              
              {/* Quick stats card - responsive */}
              <div className="rounded-xl border border-blue-800/30 bg-gray-900/50 p-4 backdrop-blur-sm">
                <h3 className="text-sm font-medium text-gray-400">Quick Info</h3>
                <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded-lg bg-blue-900/20 p-2">
                    <p className="text-gray-400">Total Whales</p>
                    <p className="text-xl font-bold text-blue-400">{recentWhales.length}</p>
                  </div>
                  <div className="rounded-lg bg-purple-900/20 p-2">
                    <p className="text-gray-400">Biggest</p>
                    <p className="text-xl font-bold text-purple-400">
                      ${Math.max(...recentWhales.map(w => w.usdValue), 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* History feed - Takes full width on mobile */}
          <div className="order-2 lg:col-span-2">
            <WhaleHistory whales={recentWhales} />
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="border-t border-blue-800/30 bg-gray-950/50 py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            Built with Somnia Data Streams • Real-time whale tracking
          </p>
        </div>
      </footer>
    </div>
  );
}