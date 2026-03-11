// lib/sdsService.ts
import { SDK, SchemaEncoder, zeroBytes32 } from "@somnia-chain/streams";
import {
  createPublicClient,
  createWalletClient,
  http,
  Hex,
  defineChain,
  toHex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { waitForTransactionReceipt } from "viem/actions";
import "dotenv/config";
import { WhaleTransaction } from "./types";

/* ----------------------------------------------------
   Chain - From your repo
---------------------------------------------------- */
export const dreamChain = defineChain({
  id: 50312,
  name: "Somnia Dream",
  network: "somnia-dream",
  nativeCurrency: { name: "STT", symbol: "STT", decimals: 18 },
  rpcUrls: { default: { http: ["https://dream-rpc.somnia.network"] } },
});

/* ----------------------------------------------------
   Env - From your repo pattern
---------------------------------------------------- */
const PRIVATE_KEY = process.env.PRIVATE_KEY as `0x${string}`;
const SCHEMA_VERSION = process.env.SDS_SCHEMA_VERSION || "v1";
const account = privateKeyToAccount(PRIVATE_KEY);

export const PUBLISHER_ADDRESS =
  (process.env.PUBLISHER_ADDRESS as `0x${string}`) || account.address;

/* ----------------------------------------------------
   Schema Definition - Following your pattern
---------------------------------------------------- */
export const WHALE_SCHEMA =
  `string txHash, address from, address to, uint256 value, string token, uint256 timestamp, uint256 usdValue, string version`;

// Cache for schema IDs - Like your repo
let _cachedWhaleSchemaId: `0x${string}` | undefined;

/* ----------------------------------------------------
   Helper Functions - From your repo
---------------------------------------------------- */
function safeValue(v: any) {
  if (v == null) return "";
  if (typeof v === "object" && "value" in v) {
    const inner = v.value;
    if (typeof inner === "bigint") return Number(inner);
    return inner;
  }
  return v;
}

function extractFieldsFromSdkItem(item: any): Record<string, any> {
  const out: Record<string, any> = {};

  if (Array.isArray(item)) {
    for (const field of item) {
      const raw = field?.value?.value;

      if (typeof raw === "bigint") out[field.name] = Number(raw);
      else out[field.name] = raw ?? "";
    }
  }

  console.log("🔍 DECODED SDK ITEM:", out);
  return out;
}

/* ----------------------------------------------------
   Clients - From your repo
---------------------------------------------------- */
function initClients() {
  const publicClient = createPublicClient({
    chain: dreamChain,
    transport: http(),
  });

  const walletClient = createWalletClient({
    account,
    chain: dreamChain,
    transport: http(),
  });

  const sdk = new SDK({ public: publicClient, wallet: walletClient });

  return { sdk, publicClient };
}

/* ----------------------------------------------------
   Register Schema - Following your repo pattern exactly
---------------------------------------------------- */
export async function ensureSchemaRegistered() {
  const { sdk, publicClient } = initClients();

  const whaleSchemaId = (await sdk.streams.computeSchemaId(WHALE_SCHEMA)) as `0x${string}`;

  console.log("🧩 COMPUTED SCHEMA ID:", {
    whaleSchemaId,
    SCHEMA_VERSION,
  });

  const whaleExists = await sdk.streams.isDataSchemaRegistered(whaleSchemaId);

  console.log("📘 SCHEMA REGISTRATION STATUS:", {
    whaleExists,
  });

  if (!whaleExists) {
    const registrations = [];

    if (!whaleExists) {
      registrations.push({
        schemaName: "WhaleTransaction", // Adding schemaName as required
        schema: WHALE_SCHEMA,
        parentSchemaId: zeroBytes32 as `0x${string}`,
      });
    }

    console.log("📝 REGISTERING SCHEMAS:", registrations);

    try {
      const tx = await sdk.streams.registerDataSchemas(registrations, true);

      console.log("📨 REGISTER SCHEMA TX:", tx);

      if (typeof tx === "string" && tx.startsWith("0x")) {
        await waitForTransactionReceipt(publicClient, { hash: tx as Hex });
      }
    } catch (err) {
      console.error("❌ ERROR REGISTERING SCHEMAS:", err);
    }
  }

  _cachedWhaleSchemaId = whaleSchemaId;

  return { whaleSchemaId };
}

/* ----------------------------------------------------
   Publish Whale - Following your repo pattern
---------------------------------------------------- */
export async function publishWhaleTransaction(whale: WhaleTransaction) {
  console.log("🚀 PUBLISH WHALE INPUT:", whale);

  const { sdk } = initClients();
  const { whaleSchemaId } = await ensureSchemaRegistered();

  const encoder = new SchemaEncoder(WHALE_SCHEMA);

  const data = encoder.encodeData([
    { name: "txHash", type: "string", value: whale.hash },
    { name: "from", type: "address", value: whale.from },
    { name: "to", type: "address", value: whale.to },
    { name: "value", type: "uint256", value: BigInt(whale.value) },
    { name: "token", type: "string", value: whale.token },
    { name: "timestamp", type: "uint256", value: BigInt(whale.timestamp) },
    { name: "usdValue", type: "uint256", value: BigInt(whale.usdValue) },
    { name: "version", type: "string", value: SCHEMA_VERSION },
  ]);

  console.log("🧱 ENCODED WHALE DATA:", data);

  const recordId = toHex(`whale-${whale.id}-${whale.timestamp}`, { size: 32 }) as Hex;

  console.log("🆔 WHALE RECORD ID:", recordId);

  const tx = await sdk.streams.set([
    { id: recordId, schemaId: whaleSchemaId, data },
  ]);

  console.log("📨 STREAM SET TX:", tx);

  return String(tx);
}

/* ----------------------------------------------------
   Read Recent Whales - Following your repo pattern
---------------------------------------------------- */
export async function readRecentWhales(limit: number = 50) {
  const { sdk } = initClients();
  const { whaleSchemaId } = await ensureSchemaRegistered();

  console.log("📡 READING WHALES FOR SCHEMA:", whaleSchemaId);

  let raw: any = null;

  try {
    raw = await sdk.streams.getAllPublisherDataForSchema(
      whaleSchemaId,
      PUBLISHER_ADDRESS
    );
  } catch (err) {
    console.error("❌ ERROR READING WHALES:", err);
    return [];
  }

  if (!raw) return [];

  // Handle different return types - like your repo
  if (raw instanceof Error) {
    console.error("Error reading whales:", raw);
    return [];
  }

  if (!Array.isArray(raw)) {
    return [];
  }

  const whales: WhaleTransaction[] = raw.map((item: any) => {
    const obj = extractFieldsFromSdkItem(item);
    return {
      id: obj.txHash, // Using txHash as id
      hash: obj.txHash ?? "",
      from: obj.from ?? "",
      to: obj.to ?? "",
      value: obj.value?.toString() ?? "0",
      token: obj.token ?? "STT",
      timestamp: Number(obj.timestamp ?? 0),
      usdValue: Number(obj.usdValue ?? 0),
    };
  });

  // Sort by timestamp descending and limit
  return whales
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit);
}