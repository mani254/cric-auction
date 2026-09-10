import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { AuctionState } from "@/models/AuctionState";
import { Team } from "@/models/Team";
import { Player } from "@/models/Player";
import { AuctionEvent } from "@/models/AuctionEvent";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json().catch(() => ({}));
    const resetBudgets = body.resetBudgets !== false;

    // 1. Reset all players
    await Player.updateMany(
      {},
      {
        $set: {
          auctionStatus: "NOT_STARTED",
          soldPrice: null,
          teamId: null,
          teamName: null,
        },
      }
    );

    // 2. Reset teams
    const teams = await Team.find({});
    for (const team of teams) {
      team.remainingBudget = team.initialBudget;
      team.totalSpent = 0;
      team.playerCount = 0;
      team.players = [];
      await team.save();
    }

    // 3. Reset auction state
    await AuctionState.findOneAndUpdate(
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
      { upsert: true }
    );

    // 4. Log reset event
    await AuctionEvent.create({
      eventType: "AUCTION_RESET",
      details: { resetAt: new Date() },
      timestamp: new Date(),
    });

    const refreshedTeams = await Team.find({}).sort({ id: 1 }).lean();

    return NextResponse.json({
      success: true,
      message: "Auction reset successfully",
      teams: refreshedTeams,
    });
  } catch (error: any) {
    console.error("POST /api/auction/reset error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to reset auction" },
      { status: 500 }
    );
  }
}
