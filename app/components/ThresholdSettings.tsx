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
    { label: 'Small Fish', value: 10000, icon: '🐟' },
    { label: 'Dolphin', value: 50000, icon: '🐬' },
    { label: 'Shark', value: 200000, icon: '🦈' },
    { label: 'Whale', value: 500000, icon: '🐋' },
    { label: 'Mega Whale', value: 1000000, icon: '🌊' },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="
          flex items-center gap-2 px-4 py-2
          bg-blue-600 hover:bg-blue-700
          rounded-lg transition-colors
        "
      >
        <span>⚙️</span>
        <span>Threshold: ${threshold.toLocaleString()}</span>
      </button>
      
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Modal */}
          <div className="
            absolute right-0 mt-2 w-80 z-50
            bg-gray-900 border border-blue-800
            rounded-xl shadow-2xl p-4
          ">
            <h3 className="font-bold mb-3">Splash Sensitivity</h3>
            
            <div className="space-y-2">
              {thresholds.map((t) => (
                <button
                  key={t.value}
                  onClick={() => {
                    setTempThreshold(t.value);
                    onThresholdChange(t.value);
                    setIsOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 p-3 rounded-lg
                    transition-all text-left
                    ${threshold === t.value
                      ? 'bg-blue-600 border-2 border-blue-400'
                      : 'bg-blue-900/30 hover:bg-blue-800/50'
                    }
                  `}
                >
                  <span className="text-2xl">{t.icon}</span>
                  <div>
                    <div className="font-medium">{t.label}</div>
                    <div className="text-sm text-gray-400">
                      ${t.value.toLocaleString()}+
                    </div>
                  </div>
                </button>
              ))}
            </div>
            
            {/* Custom input */}
            <div className="mt-4 pt-4 border-t border-blue-800">
              <label className="text-sm text-gray-400 block mb-2">
                Custom Threshold
              </label>
              <input
                type="number"
                value={tempThreshold}
                onChange={(e) => setTempThreshold(Number(e.target.value))}
                className="
                  w-full px-3 py-2 bg-black border border-blue-800
                  rounded-lg text-white
                "
                min="1000"
                step="1000"
              />
              <button
                onClick={() => {
                  onThresholdChange(tempThreshold);
                  setIsOpen(false);
                }}
                className="
                  w-full mt-2 px-3 py-2 bg-blue-600
                  hover:bg-blue-700 rounded-lg transition-colors
                "
              >
                Apply Custom
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}