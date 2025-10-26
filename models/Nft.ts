import { Schema, model, models } from "mongoose";

const NftSchema = new Schema(
  {
    tokenId: { type: String, index: true },
    serial: { type: Number, index: true },
    donorEvm: { type: String, index: true },     // lowercased
    donorAccountId: { type: String },
    clubId: { type: String },
    mintedAt: { type: Date, default: Date.now },
    transferred: { type: Boolean, default: false },
    transferAt: { type: Date },
  },
  { timestamps: true }
);

NftSchema.index({ tokenId: 1, serial: 1 }, { unique: true });

export default models.Nft || model("Nft", NftSchema);
