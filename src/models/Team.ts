import mongoose, { Schema } from "mongoose";
import { ITeam } from "@/types";

const TeamPlayerSchema = new Schema(
  {
    playerId: { type: Number, required: true },
    name: { type: String, required: true },
    role: { type: String, required: true },
    soldPrice: { type: Number, required: true },
  },
  { _id: false }
);

const TeamSchema = new Schema<ITeam>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, unique: true },
    shortName: { type: String, required: true },
    color: { type: String, required: true },
    initialBudget: { type: Number, required: true, default: 10000000 },
    remainingBudget: { type: Number, required: true, default: 10000000 },
    totalSpent: { type: Number, required: true, default: 0 },
    playerCount: { type: Number, required: true, default: 0 },
    players: { type: [TeamPlayerSchema], default: [] },
  },
  { timestamps: true }
);

export const Team =
  mongoose.models.Team || mongoose.model<ITeam>("Team", TeamSchema);
