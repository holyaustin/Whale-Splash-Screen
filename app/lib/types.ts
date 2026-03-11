export interface WhaleTransaction {
  id: string;
  hash: string;
  from: string;
  to: string;
  value: string;      // In dollars
  token: string;
  timestamp: number;
  usdValue: number;
}

export interface WhaleAlert {
  transaction: WhaleTransaction;
  splashIntensity: 'small' | 'medium' | 'big' | 'mega';
}

export interface ThresholdSettings {
  minValue: number;        // Minimum USD to trigger
  soundEnabled: boolean;
  animationIntensity: 'low' | 'medium' | 'high';
  selectedTokens: string[]; // Empty = all tokens
}