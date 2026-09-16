import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { AuctionState } from "@/models/AuctionState";
import { Player } from "@/models/Player";
import { Team } from "@/models/Team";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const includePlayers = searchParams.get("includePlayers") === "true";

    // Run core queries concurrently in a single round-trip
    const [auctionStateDoc, teams, allPlayers] = await Promise.all([
      AuctionState.findOne({ sessionKey: "primary" }),
      Team.find({}).sort({ id: 1 }).lean(),
      Player.find({}).sort({ id: 1 }).lean(),
    ]);

    let auctionState = auctionStateDoc;
    if (!auctionState) {
      auctionState = await AuctionState.create({
        sessionKey: "primary",
        status: "SETUP",
        currentPlayerId: null,
        currentBid: 0,
        currentTeamId: null,
        currentTeamName: null,
        bidHistory: [],
      });
    }

    let currentPlayer = null;
    if (auctionState.currentPlayerId) {
      currentPlayer = allPlayers.find((p) => p.id === auctionState!.currentPlayerId) || null;
    }

    // High-speed in-memory summary calculation (eliminates 4 slow remote countDocuments round-trips)
    const totalCount = allPlayers.length;
    let soldCount = 0;
    let unsoldCount = 0;
    let remainingCount = 0;

    for (const p of allPlayers) {
      if (p.auctionStatus === "SOLD") soldCount++;
      else if (p.auctionStatus === "UNSOLD") unsoldCount++;
      else remainingCount++;
    }

    const totalPurseSpent = teams.reduce((acc, t) => acc + (t.totalSpent || 0), 0);

    const resPayload: Record<string, any> = {
      success: true,
      auctionState,
      currentPlayer,
      teams,
      summary: {
        total: totalCount,
        sold: soldCount,
        unsold: unsoldCount,
        remaining: remainingCount,
        totalPurseSpent,
      },
    };

    if (includePlayers) {
      resPayload.players = allPlayers;
    }

    return NextResponse.json(resPayload);
  } catch (error: any) {
    console.error("GET /api/auction error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch auction state" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json().catch(() => ({}));
    const action = body.action || "start";

    let state = await AuctionState.findOne({ sessionKey: "primary" });
    if (!state) {
      state = new AuctionState({ sessionKey: "primary" });
    }

    if (action === "start") {
      state.status = "LIVE";
      await state.save();
    } else if (action === "pause") {
      state.status = "PAUSED";
      await state.save();
    }

    return NextResponse.json({ success: true, auctionState: state });
  } catch (error: any) {
    console.error("POST /api/auction error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update auction state" },
      { status: 500 }
    );
  }
}
