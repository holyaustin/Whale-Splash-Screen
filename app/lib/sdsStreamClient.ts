'use client';

import { createPublicClient, http } from 'viem';
import { somniaTestnet } from './chain';
import { WhaleTransaction } from './types';

const SDK = require('@somnia-chain/streams').SDK;

let schemaId: string | null = null;

async function loadSchemaId() {
  if (schemaId) return schemaId;
  const res = await fetch('/api/schemas');
  const data = await res.json();
  schemaId = data.schemaId;
  return schemaId;
}

export async function subscribeToWhales(
  threshold: number,
  onWhale: (whale: WhaleTransaction) => void
) {
  const sid = await loadSchemaId();
  
  const publicClient = createPublicClient({
    chain: somniaTestnet,
    transport: http(),
  });

  const sdk = new SDK({ public: publicClient });

  // Try WebSocket subscription first
  try {
    const sub = await sdk.streams.createSubscription({
      schemaId: sid,
      onEvent: (ev: any) => {
        try {
          const whale = parseWhaleEvent(ev);
          if (whale && whale.usdValue >= threshold) {
            onWhale(whale);
          }
        } catch (e) {
          console.warn('Failed to parse whale event', e);
        }
      },
    });

    return () => sub.unsubscribe();
  } catch (e) {
    console.warn('WebSocket failed, falling back to polling', e);
    return startPollingWhales(threshold, onWhale);
  }
}

function parseWhaleEvent(ev: any): WhaleTransaction | null {
  // Handle different SDK event formats
  const data = ev?.data ?? ev?.decoded ?? ev;
  
  if (Array.isArray(data)) {
    const fields: any = {};
    for (const f of data) {
      if (f?.name) {
        fields[f.name] = f?.value?.value ?? f?.value;
      }
    }
    
    return {
      hash: fields.txHash,
      from: fields.from,
      to: fields.to,
      value: fields.value?.toString() ?? '0',
      token: fields.token,
      timestamp: Number(fields.timestamp),
      usdValue: Number(fields.usdValue),
    } as WhaleTransaction;
  }
  
  return null;
}

function startPollingWhales(
  threshold: number,
  onWhale: (whale: WhaleTransaction) => void
) {
  let stopped = false;
  const seen = new Set<string>();

  async function poll() {
    if (stopped) return;
    
    try {
      const res = await fetch('/api/whales/recent');
      const whales = await res.json();
      
      for (const whale of whales) {
        if (!seen.has(whale.hash) && whale.usdValue >= threshold) {
          seen.add(whale.hash);
          onWhale(whale);
        }
      }
    } catch (e) {
      console.warn('Polling error', e);
    }
    
    if (!stopped) setTimeout(poll, 5000);
  }

  poll();
  return () => { stopped = true; };
}