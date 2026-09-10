import mongoose, { Schema } from "mongoose";
import { IPlayer } from "@/types";

const StatisticsSchema = new Schema(
  {
    statsPlayerId: { type: Number, required: true },
    seasonId: { type: Number, default: null },
    playerOfTheMatch: { type: Number, default: 0 },
    bestBowler: { type: Number, default: 0 },
    bestBatter: { type: Number, default: 0 },
    matches: { type: Number, default: 0 },
    battingInnings: { type: Number, default: 0 },
    runs: { type: Number, default: 0 },
    hs: { type: String, default: null },
    hsRuns: { type: Number, default: 0 },
    hsNotOut: { type: Boolean, default: false },
    avg: { type: Number, default: null },
    sr: { type: Number, default: null },
    s30: { type: Number, default: 0 },
    s50: { type: Number, default: 0 },
    s100: { type: Number, default: 0 },
    s4: { type: Number, default: 0 },
    s6: { type: Number, default: 0 },
    ducks: { type: Number, default: 0 },
    bowlingInnings: { type: Number, default: 0 },
    overs: { type: Number, default: null },
    wickets: { type: Number, default: 0 },
    bestBowling: { type: String, default: null },
    w3: { type: Number, default: 0 },
    w5: { type: Number, default: 0 },
    maidens: { type: Number, default: 0 },
    economy: { type: Number, default: null },
  },
  { _id: false }
);

const PlayerSchema = new Schema<IPlayer>(
  {
    id: { type: Number, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true, index: true },
    role: {
      type: String,
      required: true,
      enum: ["All Rounder", "Batsman", "Bowler", "Wicket Keeper"],
    },
    battingStyle: { type: String, required: true, enum: ["RHB", "LHB"] },
    bowlingStyle: { type: String, default: null },
    basePrice: { type: Number, required: true, default: 200000 },
    soldPrice: { type: Number, default: null },
    auctionStatus: {
      type: String,
      required: true,
      enum: ["NOT_STARTED", "CURRENT", "SOLD", "UNSOLD"],
      default: "NOT_STARTED",
      index: true,
    },
    teamId: { type: String, default: null },
    teamName: { type: String, default: null },
    statistics: { type: StatisticsSchema, required: true },
  },
  { timestamps: true }
);

export const Player =
  mongoose.models.Player || mongoose.model<IPlayer>("Player", PlayerSchema);
