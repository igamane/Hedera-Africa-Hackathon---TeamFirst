import { Schema, model, models } from "mongoose";

const UserSchema = new Schema(
  {
    evm: { type: String, unique: true, index: true },    // lowercased
    accountId: { type: String },
    totalHBAR: { type: Number, default: 0 },
    badges: [{ tokenId: String, serial: Number }],
  },
  { timestamps: true }
);

export default models.User || model("User", UserSchema);
