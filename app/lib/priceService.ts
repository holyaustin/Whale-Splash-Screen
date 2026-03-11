// Simulated price feed - Replace with real API
export interface TokenPrice {
  symbol: string;
  address: string;
  usdPrice: number;
}

// Common tokens on Somnia
const TOKEN_ADDRESSES: Record<string, string> = {
  'STT': '0x0000000000000000000000000000000000000000', // Native token
  'SOMI': '0x...', // Add actual token addresses
  'USDC': '0x...',
  'USDT': '0x...',
  'WETH': '0x...',
};

// Cache prices to avoid too many API calls
let priceCache: Record<string, { price: number; timestamp: number }> = {};
const CACHE_DURATION = 60000; // 1 minute

export async function getTokenPrice(tokenSymbol: string): Promise<number> {
  // Check cache
  const cached = priceCache[tokenSymbol];
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.price;
  }

  try {
    // Option 1: Use CoinGecko API (if tokens are listed)
    // const response = await fetch(
    //   `https://api.coingecko.com/api/v3/simple/price?ids=${tokenId}&vs_currencies=usd`
    // );
    // const data = await response.json();
    // const price = data[tokenId]?.usd || 0;

    // Option 2: Use on-chain DEX price (more accurate for Somnia)
    // const price = await getDEXPrice(tokenSymbol);

    // Option 3: Simulated prices for hackathon
    const simulatedPrices: Record<string, number> = {
      'STT': 0.85,
      'SOMI': 1.20,
      'USDC': 1.00,
      'USDT': 1.00,
      'WETH': 3200.00,
      'WBTC': 65000.00,
    };

    const price = simulatedPrices[tokenSymbol] || 1.00;
    
    // Update cache
    priceCache[tokenSymbol] = { price, timestamp: Date.now() };
    
    return price;
  } catch (error) {
    console.error(`Failed to fetch price for ${tokenSymbol}:`, error);
    return 1.00; // Fallback price
  }
}

export async function calculateUSDValue(
  tokenSymbol: string,
  tokenAmount: string,
  decimals: number = 18
): Promise<number> {
  const price = await getTokenPrice(tokenSymbol);
  const amount = Number(tokenAmount) / 10 ** decimals;
  return amount * price;
}