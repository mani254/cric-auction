import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { AuctionState } from "@/models/AuctionState";
import { Player } from "@/models/Player";
import { AuctionEvent } from "@/models/AuctionEvent";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const auctionState = await AuctionState.findOne({ sessionKey: "primary" });

    if (!auctionState || !auctionState.currentPlayerId) {
      return NextResponse.json(
        { success: false, error: "No active player currently under auction to mark as UNSOLD." },
        { status: 400 }
      );
    }

    const playerId = auctionState.currentPlayerId;
    const player = await Player.findOne({ id: playerId });

    if (!player) {
      return NextResponse.json(
        { success: false, error: `Player ${playerId} not found.` },
        { status: 404 }
      );
    }

    // Mark player as UNSOLD with zero budget impact
    player.auctionStatus = "UNSOLD";
    player.soldPrice = null;
    player.teamId = null;
    player.teamName = null;

    // Clear auction state active player
    auctionState.currentPlayerId = null;
    auctionState.currentBid = 0;
    auctionState.currentTeamId = null;
    auctionState.currentTeamName = null;
    auctionState.bidHistory = [];

    // Run saves and event log concurrently
    await Promise.all([
      player.save(),
      auctionState.save(),
      AuctionEvent.create({
        eventType: "UNSOLD",
        playerId: player.id,
        playerName: player.name,
        teamId: null,
        teamName: null,
        amount: player.basePrice,
        details: { role: player.role, basePrice: player.basePrice },
        timestamp: new Date(),
      }),
    ]);

    const nextPlayer: any = await Player.findOne({ auctionStatus: "NOT_STARTED" }).sort({ id: 1 }).lean();

    return NextResponse.json({
      success: true,
      message: `${player.name} went UNSOLD`,
      player,
      auctionState,
      nextPlayerId: nextPlayer ? nextPlayer.id : null,
    });
  } catch (error: any) {
    console.error("POST /api/auction/unsold error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to mark player as UNSOLD" },
      { status: 500 }
    );
  }
}
