import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { AuctionState } from "@/models/AuctionState";
import { Player } from "@/models/Player";
import { AuctionEvent } from "@/models/AuctionEvent";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const playerId = Number(body.playerId);
    const forceReauction = Boolean(body.forceReauction);

    if (isNaN(playerId)) {
      return NextResponse.json(
        { success: false, error: "Valid playerId is required." },
        { status: 400 }
      );
    }

    const player = await Player.findOne({ id: playerId });
    if (!player) {
      return NextResponse.json(
        { success: false, error: `Player with id ${playerId} not found.` },
        { status: 404 }
      );
    }

    let auctionState = await AuctionState.findOne({ sessionKey: "primary" });
    if (!auctionState) {
      auctionState = new AuctionState({ sessionKey: "primary" });
    }

    // If player is already SOLD or UNSOLD and forceReauction is NOT set:
    // Simply set auctionState.currentPlayerId to view their completed details without mutating their status or bidding state!
    if ((player.auctionStatus === "SOLD" || player.auctionStatus === "UNSOLD") && !forceReauction) {
      auctionState.currentPlayerId = player.id;
      // Set display bid to sold price or base price
      auctionState.currentBid = player.soldPrice || player.basePrice;
      auctionState.currentTeamId = player.teamId || null;
      auctionState.currentTeamName = player.teamName || null;
      await auctionState.save();

      return NextResponse.json({
        success: true,
        message: `Viewing completed auction for ${player.name} (${player.auctionStatus})`,
        currentPlayer: player,
        auctionState,
        isCompleted: true,
      });
    }

    // Otherwise, this is a live bidding session for NOT_STARTED or CURRENT player (or forceReauction)
    // If there was a previous player that was CURRENT (and not yet SOLD), revert them to NOT_STARTED
    if (auctionState.currentPlayerId && auctionState.currentPlayerId !== playerId) {
      const prevPlayer = await Player.findOne({ id: auctionState.currentPlayerId });
      if (prevPlayer && prevPlayer.auctionStatus === "CURRENT") {
        prevPlayer.auctionStatus = "NOT_STARTED";
        await prevPlayer.save();
      }
    }

    // Set new player to CURRENT
    player.auctionStatus = "CURRENT";
    player.soldPrice = null;
    player.teamId = null;
    player.teamName = null;

    auctionState.status = "LIVE";
    auctionState.currentPlayerId = player.id;
    auctionState.currentBid = player.basePrice || 200000;
    auctionState.currentTeamId = null;
    auctionState.currentTeamName = null;
    auctionState.bidHistory = [];

    // Run saves concurrently
    await Promise.all([
      player.save(),
      auctionState.save(),
      AuctionEvent.create({
        eventType: "PLAYER_STARTED",
        playerId: player.id,
        playerName: player.name,
        teamId: null,
        teamName: null,
        amount: player.basePrice,
        details: { role: player.role, basePrice: player.basePrice },
        timestamp: new Date(),
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: `Player ${player.name} is now current`,
      currentPlayer: player,
      auctionState,
      isCompleted: false,
    });
  } catch (error: any) {
    console.error("POST /api/auction/select-player error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to select player" },
      { status: 500 }
    );
  }
}
