import { connectToDatabase } from "../lib/db";
import { Player } from "../models/Player";
import { Team } from "../models/Team";
import { AuctionState } from "../models/AuctionState";

export async function verifyDatabase() {
  console.log("=== VERIFYING MONGODB DATABASE ===");
  await connectToDatabase();

  const playerCount = await Player.countDocuments();
  const teamCount = await Team.countDocuments();
  const auctionState = await AuctionState.findOne({ sessionKey: "primary" });

  console.log(`Players Count: ${playerCount}`);
  console.log(`Teams Count: ${teamCount}`);
  console.log(`Auction State: ${auctionState ? "Exists" : "MISSING"}`);

  if (playerCount !== 43) {
    throw new Error(`Expected exactly 43 players, found ${playerCount}`);
  }

  if (teamCount !== 3) {
    throw new Error(`Expected exactly 3 teams, found ${teamCount}`);
  }

  // Check unique IDs and names
  const allPlayers = await Player.find({}, "id name role statistics").lean();
  const ids = new Set(allPlayers.map((p) => p.id));
  const names = new Set(allPlayers.map((p) => p.name));

  if (ids.size !== 43) {
    throw new Error(`Duplicate IDs detected! Found ${ids.size} unique IDs for 43 records.`);
  }

  if (names.size !== 43) {
    throw new Error(`Duplicate names detected! Found ${names.size} unique names for 43 records.`);
  }

  // Verify Sample Players
  console.log("\n--- Sample Player 1 (Bandi Thirumala - All Rounder) ---");
  const p1 = await Player.findOne({ id: 1 }).lean();
  console.log(JSON.stringify(p1, null, 2));

  console.log("\n--- Sample Player 10 (Bhargav Reddy - Non-bowler / Wicket Keeper) ---");
  const p10 = await Player.findOne({ id: 10 }).lean();
  console.log(JSON.stringify(p10, null, 2));

  // Verify Teams
  console.log("\n--- Teams in Database ---");
  const teams = await Team.find({}).lean();
  for (const t of teams) {
    console.log(`- ${t.name} (${t.shortName}): Budget=₹${t.initialBudget.toLocaleString("en-IN")}, Remaining=₹${t.remainingBudget.toLocaleString("en-IN")}, Players=${t.playerCount}`);
  }

  console.log("\n=== DATABASE VERIFICATION PASSED SUCCESSFULLY ===");
}

if (require.main === module) {
  verifyDatabase()
    .then(() => {
      process.exit(0);
    })
    .catch((err) => {
      console.error("Verification failed:", err);
      process.exit(1);
    });
}
