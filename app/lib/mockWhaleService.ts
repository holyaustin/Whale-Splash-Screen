import { WhaleTransaction } from './types';

// Mock data - no complex blockchain scanning needed!
const WHALE_WALLETS = [
  '0x1234567890123456789012345678901234567890',
  '0x2345678901234567890123456789012345678901',
  '0x3456789012345678901234567890123456789012',
  '0x4567890123456789012345678901234567890123',
  '0x5678901234567890123456789012345678901234',
];

const TOKENS = ['STT', 'SOMI', 'USDC', 'WETH', 'WBTC'];

// Generate a random whale transaction
export function generateRandomWhale(): WhaleTransaction {
  const hash = '0x' + Array.from({ length: 64 }, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
  
  const fromIndex = Math.floor(Math.random() * WHALE_WALLETS.length);
  const toIndex = Math.floor(Math.random() * WHALE_WALLETS.length);
  const tokenIndex = Math.floor(Math.random() * TOKENS.length);
  
  // Random value between $10k and $500k
  const usdValue = Math.floor(Math.random() * 490000) + 10000;
  
  return {
    id: hash,
    hash,
    from: WHALE_WALLETS[fromIndex],
    to: WHALE_WALLETS[toIndex],
    value: (usdValue * 1e18).toString(),
    token: TOKENS[tokenIndex],
    timestamp: Math.floor(Date.now() / 1000),
    usdValue,
  };
}

// Get historical whales for initial display - FIXED function name
export function getHistoricalWhales(count: number = 20): WhaleTransaction[] {
  const whales: WhaleTransaction[] = [];
  const now = Math.floor(Date.now() / 1000);
  
  for (let i = 0; i < count; i++) {
    const whale = generateRandomWhale();
    // Spread timestamps over last 24 hours
    whale.timestamp = now - (i * 3600); // Each 1 hour apart
    whales.push(whale);
  }
  
  // Sort by newest first
  return whales.sort((a, b) => b.timestamp - a.timestamp);
}

// Alias for backward compatibility
export const generateHistoricalWhales = getHistoricalWhales;

// Start real-time stream (simple interval)
export function startMockWhaleStream(
  callback: (whale: WhaleTransaction) => void
): () => void {
  console.log('🐋 Starting mock whale stream...');
  
  // Send first whale after 2 seconds
  const timeout1 = setTimeout(() => {
    const whale = generateRandomWhale();
    console.log('📡 First whale:', whale);
    callback(whale);
  }, 2000);
  
  // Then every 5-10 seconds
  const interval = setInterval(() => {
    const whale = generateRandomWhale();
    console.log('📡 New whale:', whale.usdValue);
    callback(whale);
  }, 7000);
  
  // Return cleanup function
  return () => {
    console.log('🛑 Stopping mock whale stream');
    clearTimeout(timeout1);
    clearInterval(interval);
  };
}