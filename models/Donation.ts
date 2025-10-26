import { Schema, model, models } from "mongoose";

const DonationSchema = new Schema(
  {
    clubId: { type: String, index: true, required: true },
    clubName: String,
    destAccountId: { type: String, index: true },
    destEvm: { type: String, index: true },
    donorEvm: { type: String, index: true, required: true },  // lowercased
    donorAccountId: { type: String },
    amountHBAR: { type: Number, required: true },
    txHash: { type: String, index: true },
    timestamp: { type: Date, index: true, default: Date.now },
    network: { type: String, default: "testnet" },
    hcsTopicId: String,
    hcsSequenceNumber: Number,
  },
  { timestamps: true }
);

DonationSchema.index({ destEvm: 1, timestamp: -1 });
DonationSchema.index({ clubId: 1, timestamp: -1 });

export default models.Donation || model("Donation", DonationSchema);
