// lib/sdsStreamClient.ts
'use client';

import { createPublicClient, http } from 'viem';
import { defineChain } from 'viem';
import { WhaleTransaction } from './types';

// Dynamic import for SDK
let SDK: any;
if (typeof window !== 'undefined') {
  import('@somnia-chain/streams').then(module => {
    SDK = module.SDK;
  }).catch(err => {
    console.warn('Failed to load SDS SDK:', err);
  });
}

// Chain definition - From your repo
const dreamChain = defineChain({
  id: 50312,
  name: 'Somnia Dream',
  network: 'somnia-dream',
  nativeCurrency: { name: 'STT', symbol: 'STT', decimals: 18 },
  rpcUrls: { default: { http: ['https://dream-rpc.somnia.network'] } },
});

// Cache for schema ID
let schemaId: string | null = null;
let publisherAddress: string | null = null;

/* ----------------------------------------------------
   Load Schemas - Following your repo pattern
---------------------------------------------------- */
async function loadSchemas() {
  if (schemaId) return { schemaId, publisher: publisherAddress };

  try {
    const res = await fetch('/api/schemas', { cache: 'no-store' });
    if (!res.ok) throw new Error('failed to load schemas');
    const json = await res.json();

    schemaId = json.whaleSchemaId;
    publisherAddress = json.publisher ?? json.PUBLISHER_ADDRESS ?? null;

    return { schemaId, publisher: publisherAddress };
  } catch (err) {
    console.warn('sdsStreamClient: could not load /api/schemas', err);
    throw err;
  }
}

/* ----------------------------------------------------
   Helper: Decode field values - From your repo
---------------------------------------------------- */
function decodeFieldValue(field: any) {
  if (field == null) return undefined;
  if (typeof field !== 'object') return field;

  if ('value' in field) {
    const v = field.value;
    if (v && typeof v === 'object' && 'value' in v) return v.value;
    return v;
  }

  if ('decoded' in field) return field.decoded;

  return undefined;
}

/* ----------------------------------------------------
   Helper: Normalize event data - From your repo
---------------------------------------------------- */
function normalizeEventData(ev: any) {
  const candidateArrays = ev?.data ?? ev?.decoded ?? (Array.isArray(ev) ? ev : null);

  if (Array.isArray(candidateArrays)) {
    const out: Record<string, any> = {};
    for (const f of candidateArrays) {
      const name = f?.name;
      if (!name) continue;
      out[name] = decodeFieldValue(f);
    }
    return out;
  }

  if (ev && typeof ev === 'object') {
    const possible = Object.keys(ev).reduce((acc: any, k) => {
      try {
        const v = ev[k];
        if (k === 'metadata' || k === 'publisher' || k === 'schemaId' || k === 'timestamp') return acc;
        const decoded = decodeFieldValue(v);
        if (typeof decoded !== 'undefined') acc[k] = decoded;
      } catch {}
      return acc;
    }, {});
    if (Object.keys(possible).length > 0) return possible;
  }

  return {};
}

/* ----------------------------------------------------
   Helper: Parse whale from event - Following your patterns
---------------------------------------------------- */
function parseWhaleEvent(ev: any): WhaleTransaction | null {
  try {
    const data = normalizeEventData(ev);
    
    // Validate required fields
    if (!data.txHash && !data.hash) return null;
    
    const txHash = data.txHash ?? data.hash ?? '';
    const from = data.from ?? data.sender ?? '';
    const to = data.to ?? data.recipient ?? '';
    const value = data.value?.toString() ?? '0';
    const token = data.token ?? 'STT';
    const timestamp = Number(data.timestamp ?? Math.floor(Date.now() / 1000));
    const usdValue = Number(data.usdValue ?? 0);
    
    // Skip if below threshold? No - let frontend filter
    
    return {
      id: txHash,
      hash: txHash,
      from,
      to,
      value,
      token,
      timestamp,
      usdValue,
    };
  } catch (err) {
    console.warn('parseWhaleEvent error:', err, ev);
    return null;
  }
}

/* ----------------------------------------------------
   Subscribe to Whales - Following your repo pattern
---------------------------------------------------- */
export async function subscribeToWhales(
  onEvent: (whale: WhaleTransaction) => void
): Promise<() => void> {
  let schemas;
  try {
    schemas = await loadSchemas();
  } catch (e) {
    console.warn('subscribeToWhales: falling back to polling', e);
    return startPollingWhales(onEvent);
  }

  const { schemaId, publisher } = schemas;
  
  // If SDK not loaded in browser, fallback to polling
  if (typeof window === 'undefined' || !SDK) {
    return startPollingWhales(onEvent);
  }

  try {
    const publicClient = createPublicClient({ chain: dreamChain, transport: http() });
    const sdk = new SDK({ public: publicClient });

    // Try to create subscription - exactly like your repo
    const sub = await tryCreateSubscription(sdk, {
      schemaId,
      publisher: publisher || undefined,
      onEvent: (ev: any) => {
        try {
          const whale = parseWhaleEvent(ev);
          if (whale) {
            onEvent(whale);
          }
        } catch (err) {
          console.warn('subscribeToWhales: event parse error', err, ev);
        }
      },
    });

    if (sub && typeof sub.unsubscribe === 'function') {
      return () => {
        try {
          sub.unsubscribe();
        } catch (e) {
          try { sub.close && sub.close(); } catch {}
        }
      };
    }
  } catch (e) {
    console.warn('WebSocket failed, falling back to polling', e);
  }

  // Fallback to polling
  return startPollingWhales(onEvent);
}

/* ----------------------------------------------------
   Helper: Try create subscription - From your repo
---------------------------------------------------- */
async function tryCreateSubscription(sdk: any, opts: any) {
  if (!sdk || !sdk.streams) return null;

  if (typeof sdk.streams.createSubscription === 'function') {
    try {
      return await sdk.streams.createSubscription(opts);
    } catch (e) {
      console.warn('createSubscription failed', e);
      return null;
    }
  }

  return null;
}

/* ----------------------------------------------------
   Polling fallback - From your repo
---------------------------------------------------- */
function startPollingWhales(
  onEvent: (whale: WhaleTransaction) => void
): () => void {
  let stopped = false;
  const seen = new Set<string>();

  async function poll() {
    if (stopped) return;
    
    try {
      const res = await fetch('/api/whales/recent', { cache: 'no-store' });
      if (!res.ok) throw new Error('failed whales read');
      
      const items = await res.json();
      
      if (Array.isArray(items)) {
        for (const whale of items) {
          const id = whale?.id ?? whale?.hash ?? '';
          if (!id) continue;
          
          if (!seen.has(id)) {
            seen.add(id);
            onEvent(whale);
          }
        }
      }
    } catch (e) {
      console.warn('poll whales error', e);
    } finally {
      if (!stopped) setTimeout(poll, 3000);
    }
  }

  poll();

  return () => { stopped = true; };
}