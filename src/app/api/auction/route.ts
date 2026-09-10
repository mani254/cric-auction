import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { AuctionState } from "@/models/AuctionState";
import { Player } from "@/models/Player";
import { Team } from "@/models/Team";

export async function GET() {
  try {
    await connectToDatabase();

    let auctionState = await AuctionState.findOne({ sessionKey: "primary" });
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
      currentPlayer = await Player.findOne({ id: auctionState.currentPlayerId }).lean();
    }

    const teams = await Team.find({}).sort({ id: 1 }).lean();

    const totalCount = await Player.countDocuments();
    const soldCount = await Player.countDocuments({ auctionStatus: "SOLD" });
    const unsoldCount = await Player.countDocuments({ auctionStatus: "UNSOLD" });
    const remainingCount = await Player.countDocuments({
      auctionStatus: { $in: ["NOT_STARTED", "CURRENT"] },
    });

    const totalPurseSpent = teams.reduce((acc, t) => acc + (t.totalSpent || 0), 0);

    return NextResponse.json({
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
    });
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
