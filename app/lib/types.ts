export interface WhaleTransaction {
  id: string;           // Same as hash for uniqueness
  hash: string;         // Transaction hash
  from: string;         // Sender address
  to: string;           // Receiver address
  value: string;        // Raw value in wei
  token: string;        // Token symbol
  timestamp: number;    // Unix timestamp
  usdValue: number;     // USD value
}

export interface WhaleAlert {
  transaction: WhaleTransaction;
  splashIntensity: 'small' | 'medium' | 'big' | 'mega';
}

export interface ThresholdSettings {
  minValue: number;
  soundEnabled: boolean;
  animationIntensity: 'low' | 'medium' | 'high';
  selectedTokens: string[];
}