import { NextRequest } from "next/server";
import { ensureTopic, submitDonationReceipt } from "@/lib/hedera-server";
import { dbConnect } from "@/lib/mongo";
import Donation from "@/models/Donation";
import User from "@/models/User";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ReceiptBody = {
  clubId: string;
  clubName: string;
  donor: string;             // EVM address
  amountHBAR: number;
  txHash: string;
  network?: string;
  // NEW: tell the server where the donation went so DB leaderboards work
  destEvm?: string;
  destAccountId?: string;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ReceiptBody;
    const topicId = await ensureTopic(process.env.HEDERA_HCS_TOPIC_ID);

    const payload = {
      type: "donation_receipt",
      version: 1,
      network: process.env.HEDERA_NETWORK || "testnet",
      timestamp: new Date().toISOString(),
      club: { id: body.clubId, name: body.clubName },
      donor: body.donor,
      amountHBAR: body.amountHBAR,
      txHash: body.txHash,
      destEvm: body.destEvm?.toLowerCase(),
      destAccountId: body.destAccountId,
    };

    const hcs = await submitDonationReceipt(topicId, payload);

    // ---- persist to Mongo ----
    await dbConnect();
    const donorEvmLc = body.donor.toLowerCase();

    const doc = await Donation.create({
      clubId: body.clubId,
      clubName: body.clubName,
      destAccountId: body.destAccountId,
      destEvm: body.destEvm?.toLowerCase(),
      donorEvm: donorEvmLc,
      amountHBAR: body.amountHBAR,
      txHash: body.txHash,
      network: payload.network,
      hcsTopicId: hcs.topicId,
      hcsSequenceNumber: hcs.sequenceNumber,
      timestamp: new Date(),
    });

    await User.findOneAndUpdate(
      { evm: donorEvmLc },
      { $setOnInsert: { evm: donorEvmLc }, $inc: { totalHBAR: body.amountHBAR } },
      { upsert: true }
    );

    return new Response(
      JSON.stringify({ ok: true, ...hcs, dbId: String(doc._id), payload }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (e: any) {
    console.error("HCS receipt error:", e);
    return new Response(
      JSON.stringify({ ok: false, error: e?.message || "Unknown error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
