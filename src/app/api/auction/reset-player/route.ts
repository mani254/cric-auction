import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Player } from "@/models/Player";
import { Team } from "@/models/Team";
import { AuctionState } from "@/models/AuctionState";
import { AuctionEvent } from "@/models/AuctionEvent";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const playerId = Number(body.playerId);

    if (isNaN(playerId)) {
      return NextResponse.json(
        { success: false, error: "Valid playerId is required." },
        { status: 400 }
      );
    }

    const player = await Player.findOne({ id: playerId });
    if (!player) {
      return NextResponse.json(
        { success: false, error: `Player ${playerId} not found.` },
        { status: 404 }
      );
    }

    const prevStatus = player.auctionStatus;
    const soldPrice = player.soldPrice || 0;
    const teamId = player.teamId;

    // 1. If player was SOLD to a team, restore team budget and squad
    if (prevStatus === "SOLD" && teamId) {
      const team = await Team.findOne({ id: teamId });
      if (team) {
        team.remainingBudget += soldPrice;
        team.totalSpent = Math.max(0, team.totalSpent - soldPrice);
        team.players = team.players.filter((p: any) => p.playerId !== playerId);
        team.playerCount = team.players.length;
        await team.save();
      }
    }

    // 2. Reset player in database
    player.auctionStatus = "NOT_STARTED";
    player.soldPrice = null;
    player.teamId = null;
    player.teamName = null;
    await player.save();

    // 3. Update auction state if this player was active
    const auctionState = await AuctionState.findOne({ sessionKey: "primary" });
    if (auctionState && auctionState.currentPlayerId === playerId) {
      auctionState.currentPlayerId = null;
      auctionState.currentBid = 0;
      auctionState.currentTeamId = null;
      auctionState.currentTeamName = null;
      auctionState.bidHistory = [];
      await auctionState.save();
    }

    // 4. Log event
    await AuctionEvent.create({
      eventType: "AUCTION_RESET",
      playerId: player.id,
      playerName: player.name,
      teamId: teamId || null,
      amount: soldPrice || null,
      details: {
        action: "UNDO_PLAYER_AUCTION",
        previousStatus: prevStatus,
        refundedAmount: soldPrice,
      },
      timestamp: new Date(),
    });

    const refreshedTeams = await Team.find({}).sort({ id: 1 }).lean();
    const refreshedAuctionState = await AuctionState.findOne({ sessionKey: "primary" }).lean();

    return NextResponse.json({
      success: true,
      message: `Auction for ${player.name} has been reset. Status is now NOT AUCTIONED${
        soldPrice > 0 ? ` and ₹${soldPrice.toLocaleString("en-IN")} was refunded to team purse.` : "."
      }`,
      player,
      teams: refreshedTeams,
      auctionState: refreshedAuctionState,
    });
  } catch (error: any) {
    console.error("POST /api/auction/reset-player error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to reset player auction" },
      { status: 500 }
    );
  }
}
