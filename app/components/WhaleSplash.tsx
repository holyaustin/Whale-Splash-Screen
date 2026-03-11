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
  const [currentWhale, setCurrentWhale] = useState(null);
  
  const { recentWhales, isConnected } = useWhaleStream(threshold);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 to-black text-white">
      {/* Current splash animation */}
      {currentWhale && (
        <SplashAnimation
          whale={currentWhale}
          intensity={intensity}
          onComplete={() => setCurrentWhale(null)}
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
      
      {/* Add custom animations to global CSS */}
      <style jsx global>{`
        @keyframes splash {
          0% { transform: scale(0); opacity: 1; }
          100% { transform: scale(4); opacity: 0; }
        }
        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
      `}</style>
    </div>
  );
}