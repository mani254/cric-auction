import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { AuctionState } from "@/models/AuctionState";
import { Team } from "@/models/Team";
import { Player } from "@/models/Player";
import { AuctionEvent } from "@/models/AuctionEvent";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { teamId, increment, customAmount, isOpeningBid } = body;

    // Parallel initial lookups if teamId is provided
    const [auctionState, initialTeam] = await Promise.all([
      AuctionState.findOne({ sessionKey: "primary" }),
      teamId ? Team.findOne({ id: teamId }) : Promise.resolve(null),
    ]);

    if (!auctionState || !auctionState.currentPlayerId) {
      return NextResponse.json(
        { success: false, error: "No active player currently under auction." },
        { status: 400 }
      );
    }

    const targetTeamId = teamId || auctionState.currentTeamId;
    if (!targetTeamId) {
      return NextResponse.json(
        { success: false, error: "No team selected. Please select a bidding team first." },
        { status: 400 }
      );
    }

    const [player, team] = await Promise.all([
      Player.findOne({ id: auctionState.currentPlayerId }),
      initialTeam && initialTeam.id === targetTeamId ? Promise.resolve(initialTeam) : Team.findOne({ id: targetTeamId }),
    ]);

    if (!player || player.auctionStatus !== "CURRENT") {
      return NextResponse.json(
        { success: false, error: "Active player is not in CURRENT auction status." },
        { status: 400 }
      );
    }

    if (!team) {
      return NextResponse.json(
        { success: false, error: `Team ${targetTeamId} not found.` },
        { status: 404 }
      );
    }

    let newBid = auctionState.currentBid;

    if (customAmount !== undefined && customAmount !== null) {
      newBid = Number(customAmount);
    } else if (increment !== undefined && increment !== null) {
      newBid = Number(auctionState.currentBid) + Number(increment);
    } else if (isOpeningBid) {
      newBid = auctionState.currentBid;
    } else {
      return NextResponse.json(
        { success: false, error: "Provide an increment amount, customAmount, or isOpeningBid." },
        { status: 400 }
      );
    }

    if (isNaN(newBid) || newBid <= 0) {
      return NextResponse.json(
        { success: false, error: "Bid amount must be a positive number." },
        { status: 400 }
      );
    }

    // Bid must be strictly greater than current bid unless it's the opening bid when no team has bid yet
    if (!isOpeningBid && auctionState.currentTeamId !== null && newBid <= auctionState.currentBid) {
      return NextResponse.json(
        {
          success: false,
          error: `New bid (₹${newBid.toLocaleString("en-IN")}) must be higher than current bid (₹${auctionState.currentBid.toLocaleString("en-IN")}).`,
        },
        { status: 400 }
      );
    }

    // CRITICAL BUSINESS RULE: Team cannot bid more than its remaining budget
    if (newBid > team.remainingBudget) {
      return NextResponse.json(
        {
          success: false,
          error: `${team.name} cannot bid ₹${newBid.toLocaleString("en-IN")}. Remaining purse is only ₹${team.remainingBudget.toLocaleString("en-IN")}.`,
        },
        { status: 400 }
      );
    }

    const prevBid = auctionState.currentBid;

    // Update auction state
    auctionState.currentBid = newBid;
    auctionState.currentTeamId = team.id;
    auctionState.currentTeamName = team.name;
    auctionState.bidHistory.push({
      teamId: team.id,
      teamName: team.name,
      amount: newBid,
      timestamp: new Date(),
    });

    // Run database writes in parallel
    await Promise.all([
      auctionState.save(),
      AuctionEvent.create({
        eventType: "BID",
        playerId: player.id,
        playerName: player.name,
        teamId: team.id,
        teamName: team.name,
        amount: newBid,
        details: { previousBid: prevBid, newBid },
        timestamp: new Date(),
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: `Bid of ₹${newBid.toLocaleString("en-IN")} placed by ${team.name}`,
      auctionState,
      leadingTeam: {
        id: team.id,
        name: team.name,
        color: team.color,
        remainingBudget: team.remainingBudget,
      },
    });
  } catch (error: any) {
    console.error("POST /api/auction/bid error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to place bid" },
      { status: 500 }
    );
  }
}
