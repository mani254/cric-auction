import mongoose, { Schema } from "mongoose";
import { IAuctionEvent } from "@/types";

const AuctionEventSchema = new Schema<IAuctionEvent>(
  {
    eventType: {
      type: String,
      required: true,
      enum: [
        "PLAYER_STARTED",
        "BID",
        "SOLD",
        "UNSOLD",
        "BUDGET_UPDATED",
        "AUCTION_RESET",
      ],
      index: true,
    },
    playerId: { type: Number, default: null, index: true },
    playerName: { type: String, default: null },
    teamId: { type: String, default: null, index: true },
    teamName: { type: String, default: null },
    amount: { type: Number, default: null },
    details: { type: Schema.Types.Mixed, default: {} },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

export const AuctionEvent =
  mongoose.models.AuctionEvent ||
  mongoose.model<IAuctionEvent>("AuctionEvent", AuctionEventSchema);
