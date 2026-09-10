import mongoose, { Schema } from "mongoose";
import { IAuctionState } from "@/types";

const BidHistorySchema = new Schema(
  {
    teamId: { type: String, required: true },
    teamName: { type: String, required: true },
    amount: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const AuctionStateSchema = new Schema<IAuctionState>(
  {
    sessionKey: { type: String, required: true, unique: true, default: "primary" },
    status: {
      type: String,
      required: true,
      enum: ["SETUP", "LIVE", "PAUSED", "COMPLETED"],
      default: "SETUP",
    },
    currentPlayerId: { type: Number, default: null },
    currentBid: { type: Number, default: 0 },
    currentTeamId: { type: String, default: null },
    currentTeamName: { type: String, default: null },
    bidHistory: { type: [BidHistorySchema], default: [] },
  },
  { timestamps: true }
);

export const AuctionState =
  mongoose.models.AuctionState ||
  mongoose.model<IAuctionState>("AuctionState", AuctionStateSchema);
