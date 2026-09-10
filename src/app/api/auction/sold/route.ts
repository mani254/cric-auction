import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { AuctionState } from "@/models/AuctionState";
import { Team } from "@/models/Team";
import { Player } from "@/models/Player";
import { AuctionEvent } from "@/models/AuctionEvent";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const auctionState = await AuctionState.findOne({ sessionKey: "primary" });

    if (!auctionState || !auctionState.currentPlayerId) {
      return NextResponse.json(
        { success: false, error: "No active player currently under auction to mark as SOLD." },
        { status: 400 }
      );
    }

    if (!auctionState.currentTeamId) {
      return NextResponse.json(
        { success: false, error: "Cannot mark SOLD: No bidding team has been selected." },
        { status: 400 }
      );
    }

    const playerId = auctionState.currentPlayerId;
    const teamId = auctionState.currentTeamId;
    const finalAmount = auctionState.currentBid;

    // Prevent double-SOLD: check player status atomically
    const player = await Player.findOne({ id: playerId });
    if (!player) {
      return NextResponse.json(
        { success: false, error: `Player ${playerId} not found.` },
        { status: 404 }
      );
    }

    if (player.auctionStatus === "SOLD") {
      return NextResponse.json(
        { success: false, error: `Player ${player.name} is ALREADY SOLD to ${player.teamName}. Double-sold operation prevented.` },
        { status: 400 }
      );
    }

    const team = await Team.findOne({ id: teamId });
    if (!team) {
      return NextResponse.json(
        { success: false, error: `Winning team ${teamId} not found.` },
        { status: 404 }
      );
    }

    if (team.remainingBudget < finalAmount) {
      return NextResponse.json(
        {
          success: false,
          error: `Insufficient budget! ${team.name} only has ₹${team.remainingBudget.toLocaleString("en-IN")} remaining, but final bid is ₹${finalAmount.toLocaleString("en-IN")}.`,
        },
        { status: 400 }
      );
    }

    // 1. Deduct budget and add to team squad atomically
    team.remainingBudget -= finalAmount;
    team.totalSpent += finalAmount;
    team.playerCount += 1;
    team.players.push({
      playerId: player.id,
      name: player.name,
      role: player.role,
      soldPrice: finalAmount,
    });
    await team.save();

    // 2. Mark player as SOLD
    player.auctionStatus = "SOLD";
    player.soldPrice = finalAmount;
    player.teamId = team.id;
    player.teamName = team.name;
    await player.save();

    // 3. Clear active player from AuctionState
    auctionState.currentPlayerId = null;
    auctionState.currentBid = 0;
    auctionState.currentTeamId = null;
    auctionState.currentTeamName = null;
    auctionState.bidHistory = [];
    await auctionState.save();

    // 4. Log SOLD event
    await AuctionEvent.create({
      eventType: "SOLD",
      playerId: player.id,
      playerName: player.name,
      teamId: team.id,
      teamName: team.name,
      amount: finalAmount,
      details: { role: player.role, soldPrice: finalAmount, teamRemainingBudget: team.remainingBudget },
      timestamp: new Date(),
    });

    // 5. Fetch next available player suggestion if any
    const nextPlayer: any = await Player.findOne({ auctionStatus: "NOT_STARTED" }).sort({ id: 1 }).lean();

    return NextResponse.json({
      success: true,
      message: `SOLD! ${player.name} sold to ${team.name} for ₹${finalAmount.toLocaleString("en-IN")}`,
      soldPlayer: player,
      winningTeam: team,
      auctionState,
      nextPlayerId: nextPlayer ? nextPlayer.id : null,
    });
  } catch (error: any) {
    console.error("POST /api/auction/sold error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to finalize SOLD operation" },
      { status: 500 }
    );
  }
}
