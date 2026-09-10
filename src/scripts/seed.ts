import path from "path";
import fs from "fs";
import mongoose from "mongoose";
import { connectToDatabase } from "../lib/db";
import { Player } from "../models/Player";
import { Team } from "../models/Team";
import { AuctionState } from "../models/AuctionState";
import { AuctionEvent } from "../models/AuctionEvent";

const DATA_PATH = path.resolve(__dirname, "../../../data/players.json");

const DEFAULT_BUDGET = Number(process.env.DEFAULT_TEAM_BUDGET) || 10000000;

export async function seedDatabase(forceReset: boolean = false) {
  console.log("=== SEEDING MONGODB DATABASE ===");
  await connectToDatabase();

  if (!fs.existsSync(DATA_PATH)) {
    throw new Error(`Players JSON not found at ${DATA_PATH}`);
  }

  const fileData = JSON.parse(fs.readFileSync(DATA_PATH, "utf-8"));
  const playersList = fileData.players || [];

  console.log(`Loaded ${playersList.length} players from ${DATA_PATH}`);

  if (forceReset) {
    console.log("[Force Reset] Clearing existing collections...");
    await Player.deleteMany({});
    await Team.deleteMany({});
    await AuctionState.deleteMany({});
    await AuctionEvent.deleteMany({});
  }

  // 1. Seed/Upsert Players
  let insertedCount = 0;
  let updatedCount = 0;

  for (const item of playersList) {
    const details = item.playerDetails;
    const stats = item.statistics;

    const existing = await Player.findOne({ id: details.id });

    if (existing) {
      // Update details and stats while preserving any active auction status if not forceReset
      existing.name = details.name;
      existing.role = details.role;
      existing.battingStyle = details.battingStyle;
      existing.bowlingStyle = details.bowlingStyle;
      existing.basePrice = details.basePrice || 200000;
      existing.statistics = stats;
      if (forceReset) {
        existing.auctionStatus = "NOT_STARTED";
        existing.soldPrice = null;
        existing.teamId = null;
        existing.teamName = null;
      }
      await existing.save();
      updatedCount++;
    } else {
      await Player.create({
        id: details.id,
        name: details.name,
        role: details.role,
        battingStyle: details.battingStyle,
        bowlingStyle: details.bowlingStyle,
        basePrice: details.basePrice || 200000,
        soldPrice: null,
        auctionStatus: "NOT_STARTED",
        teamId: null,
        teamName: null,
        statistics: stats,
      });
      insertedCount++;
    }
  }

  console.log(`[Players] Inserted: ${insertedCount}, Updated: ${updatedCount}, Total: ${await Player.countDocuments()}`);

  // 2. Seed Teams (Team A, Team B, Team C)
  const defaultTeams = [
    {
      id: "team-a",
      name: "Team A",
      shortName: "TMA",
      color: "#F59E0B", // Amber Gold
      initialBudget: DEFAULT_BUDGET,
      remainingBudget: DEFAULT_BUDGET,
      totalSpent: 0,
      playerCount: 0,
      players: [],
    },
    {
      id: "team-b",
      name: "Team B",
      shortName: "TMB",
      color: "#06B6D4", // Electric Cyan
      initialBudget: DEFAULT_BUDGET,
      remainingBudget: DEFAULT_BUDGET,
      totalSpent: 0,
      playerCount: 0,
      players: [],
    },
    {
      id: "team-c",
      name: "Team C",
      shortName: "TMC",
      color: "#10B981", // Stadium Emerald
      initialBudget: DEFAULT_BUDGET,
      remainingBudget: DEFAULT_BUDGET,
      totalSpent: 0,
      playerCount: 0,
      players: [],
    },
  ];

  for (const t of defaultTeams) {
    const existing = await Team.findOne({ id: t.id });
    if (!existing || forceReset) {
      await Team.findOneAndUpdate(
        { id: t.id },
        {
          id: t.id,
          name: t.name,
          shortName: t.shortName,
          color: t.color,
          initialBudget: t.initialBudget,
          remainingBudget: t.remainingBudget,
          totalSpent: 0,
          playerCount: 0,
          players: [],
        },
        { upsert: true, new: true }
      );
    }
  }

  console.log(`[Teams] Total teams in database: ${await Team.countDocuments()}`);

  // 3. Ensure primary AuctionState exists
  let auctionState = await AuctionState.findOne({ sessionKey: "primary" });
  if (!auctionState || forceReset) {
    auctionState = await AuctionState.findOneAndUpdate(
      { sessionKey: "primary" },
      {
        sessionKey: "primary",
        status: "SETUP",
        currentPlayerId: null,
        currentBid: 0,
        currentTeamId: null,
        currentTeamName: null,
        bidHistory: [],
      },
      { upsert: true, new: true }
    );
  }

  console.log(`[AuctionState] Status: ${auctionState.status}`);
  console.log("=== SEEDING COMPLETED SUCCESSFULLY ===");
}

if (require.main === module) {
  const isForce = process.argv.includes("--force");
  seedDatabase(isForce)
    .then(() => {
      process.exit(0);
    })
    .catch((err) => {
      console.error("Seed error:", err);
      process.exit(1);
    });
}
