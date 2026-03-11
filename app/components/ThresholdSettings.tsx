'use client';

import { useState } from 'react';

interface Props {
  threshold: number;
  onThresholdChange: (value: number) => void;
}

export default function ThresholdSettings({ threshold, onThresholdChange }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempThreshold, setTempThreshold] = useState(threshold);

  const thresholds = [
    { label: 'Small Fish', value: 10000, icon: '🐟', color: 'from-green-600 to-green-400' },
    { label: 'Dolphin', value: 50000, icon: '🐬', color: 'from-blue-600 to-blue-400' },
    { label: 'Shark', value: 200000, icon: '🦈', color: 'from-orange-600 to-orange-400' },
    { label: 'Whale', value: 500000, icon: '🐋', color: 'from-purple-600 to-purple-400' },
    { label: 'Mega Whale', value: 1000000, icon: '🌊', color: 'from-pink-600 to-pink-400' },
  ];

  const currentThreshold = thresholds.find(t => t.value === threshold) || {
    label: 'Custom',
    value: threshold,
    icon: '⚙️',
    color: 'from-gray-600 to-gray-400'
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2 text-sm font-medium text-white transition-all duration-300 hover:from-blue-700 hover:to-blue-800 hover:shadow-lg hover:shadow-blue-600/50"
      >
        <span className="text-lg transition-transform duration-300 group-hover:rotate-12">
          {currentThreshold.icon}
        </span>
        <span className="hidden sm:inline">Threshold:</span>
        <span className="font-bold">${threshold.toLocaleString()}+</span>
      </button>
      
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Modal - Responsive */}
          <div className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 sm:w-full">
            <div className="rounded-xl border border-blue-800 bg-gray-900 shadow-2xl">
              {/* Header */}
              <div className="border-b border-blue-800/30 p-4">
                <h3 className="text-lg font-semibold text-white">Splash Sensitivity</h3>
                <p className="text-sm text-gray-400 mt-1">Set the minimum transaction value to trigger a splash</p>
              </div>
              
              {/* Body */}
              <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
                {thresholds.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => {
                      setTempThreshold(t.value);
                      onThresholdChange(t.value);
                      setIsOpen(false);
                    }}
                    className={`
                      relative w-full overflow-hidden rounded-lg p-4 text-left transition-all duration-300
                      ${threshold === t.value
                        ? `bg-gradient-to-r ${t.color} text-white shadow-lg`
                        : 'bg-gray-800/50 text-gray-300 hover:bg-gray-800 hover:scale-[1.02]'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{t.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{t.label}</span>
                          <span className="text-sm opacity-75">${t.value.toLocaleString()}+</span>
                        </div>
                        {threshold === t.value && (
                          <span className="text-xs text-white/75">Currently active</span>
                        )}
                      </div>
                    </div>
                    
                    {/* Animated background effect */}
                    {threshold === t.value && (
                      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-white/20 to-transparent animate-pulse" />
                    )}
                  </button>
                ))}
                
                {/* Custom input */}
                <div className="mt-4 pt-4 border-t border-blue-800/30">
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Custom Threshold
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={tempThreshold}
                      onChange={(e) => setTempThreshold(Number(e.target.value))}
                      className="flex-1 rounded-lg border border-blue-800/30 bg-gray-800 px-3 py-2 text-white focus:border-blue-600 focus:outline-none"
                      min="1000"
                      step="1000"
                    />
                    <button
                      onClick={() => {
                        onThresholdChange(tempThreshold);
                        setIsOpen(false);
                      }}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Footer */}
              <div className="border-t border-blue-800/30 p-4">
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}