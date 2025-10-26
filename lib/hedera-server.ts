import "server-only";
import {
  AccountId,
  Client,
  PrivateKey,
  TopicCreateTransaction,
  TopicMessageSubmitTransaction,
} from "@hashgraph/sdk";

let cachedClient: Client | null = null;

export function getHederaClient(): Client {
  if (cachedClient) return cachedClient;

  const network = process.env.HEDERA_NETWORK || "testnet";
  const operatorId = process.env.HEDERA_OPERATOR_ID;
  const operatorKey = process.env.HEDERA_OPERATOR_KEY;

  if (!operatorId || !operatorKey) {
    throw new Error("HEDERA_OPERATOR_ID and HEDERA_OPERATOR_KEY must be set");
  }

  const client =
    network === "mainnet" ? Client.forMainnet() :
    network === "previewnet" ? Client.forPreviewnet() :
    Client.forTestnet();


    const keyStr = process.env.HEDERA_OPERATOR_KEY!;
const priv =
  keyStr.trim().startsWith("0x")
    ? PrivateKey.fromStringECDSA(keyStr)  // handles ECDSA hex like your portal shows
    : PrivateKey.fromString(keyStr);      // handles ED25519 DER like "302e0201..."

client.setOperator(AccountId.fromString(operatorId), priv);

  cachedClient = client;
  return client;
}

export async function ensureTopic(topicIdFromEnv?: string): Promise<string> {
  if (topicIdFromEnv) return topicIdFromEnv;

  const client = getHederaClient();
  const tx = await new TopicCreateTransaction()
    .setTopicMemo("TeamFirst-Donations")
    .execute(client);

  const receipt = await tx.getReceipt(client);
  const createdId = receipt.topicId?.toString();
  if (!createdId) throw new Error("Failed to create HCS topic");
  return createdId;
}

export async function submitDonationReceipt(topicId: string, message: any) {
  const client = getHederaClient();

  const tx = await new TopicMessageSubmitTransaction()
    .setTopicId(topicId)
    .setMessage(Buffer.from(JSON.stringify(message)))
    .execute(client);

  const receipt = await tx.getReceipt(client);

  return {
    txId: tx.transactionId.toString(),
    topicId,
    sequenceNumber: receipt.topicSequenceNumber?.toString() || null,
    runningHash: receipt.topicRunningHash?.toString("hex") || null,
  };
}
