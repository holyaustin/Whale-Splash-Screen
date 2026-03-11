import { SDK, SchemaEncoder, zeroBytes32 } from "@somnia-chain/streams";
import { createPublicClient, createWalletClient, http, Hex, toHex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { somniaTestnet } from "./chain";
import { WhaleTransaction } from "./types";

const PRIVATE_KEY = process.env.PRIVATE_KEY as `0x${string}`;
const account = privateKeyToAccount(PRIVATE_KEY);
const WHALE_THRESHOLD = Number(process.env.WHALE_THRESHOLD) || 50000;

// Schema for whale transactions
export const WHALE_SCHEMA = 
  `string txHash, address from, address to, uint256 value, string token, uint256 timestamp, uint256 usdValue`;

let _cachedSchemaId: `0x${string}` | undefined;

function initClients() {
  const publicClient = createPublicClient({
    chain: somniaTestnet,
    transport: http(),
  });

  const walletClient = createWalletClient({
    account,
    chain: somniaTestnet,
    transport: http(),
  });

  const sdk = new SDK({ public: publicClient, wallet: walletClient });
  return { sdk, publicClient };
}

export async function ensureSchemaRegistered() {
  const { sdk, publicClient } = initClients();
  
  const schemaId = await sdk.streams.computeSchemaId(WHALE_SCHEMA) as `0x${string}`;
  const exists = await sdk.streams.isDataSchemaRegistered(schemaId);

  if (!exists) {
    await sdk.streams.registerDataSchemas([{
      id: schemaId,
      schema: WHALE_SCHEMA,
      parentSchemaId: zeroBytes32 as `0x${string}`,
    }], true);
  }

  _cachedSchemaId = schemaId;
  return schemaId;
}

export async function publishWhaleTransaction(tx: WhaleTransaction) {
  const { sdk } = initClients();
  const schemaId = await ensureSchemaRegistered();

  const encoder = new SchemaEncoder(WHALE_SCHEMA);
  const data = encoder.encodeData([
    { name: "txHash", type: "string", value: tx.hash },
    { name: "from", type: "address", value: tx.from },
    { name: "to", type: "address", value: tx.to },
    { name: "value", type: "uint256", value: BigInt(tx.value) },
    { name: "token", type: "string", value: tx.token },
    { name: "timestamp", type: "uint256", value: BigInt(tx.timestamp) },
    { name: "usdValue", type: "uint256", value: BigInt(tx.usdValue) },
  ]);

  const recordId = toHex(`whale-${tx.hash}-${tx.timestamp}`, { size: 32 }) as Hex;
  await sdk.streams.set([{ id: recordId, schemaId, data }]);
  
  return recordId;
}

export async function readRecentWhales(limit: number = 50) {
  const { sdk } = initClients();
  const schemaId = await ensureSchemaRegistered();
  
  const raw = await sdk.streams.getAllPublisherDataForSchema(
    schemaId,
    process.env.PUBLISHER_ADDRESS as `0x${string}`
  );

  if (!raw) return [];

  return raw
    .map((item: any) => {
      const fields = extractFields(item);
      return {
        hash: fields.txHash,
        from: fields.from,
        to: fields.to,
        value: fields.value,
        token: fields.token,
        timestamp: Number(fields.timestamp),
        usdValue: Number(fields.usdValue),
      } as WhaleTransaction;
    })
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit);
}

function extractFields(item: any) {
  const out: any = {};
  if (Array.isArray(item)) {
    for (const field of item) {
      const raw = field?.value?.value;
      out[field.name] = typeof raw === 'bigint' ? Number(raw) : raw;
    }
  }
  return out;
}