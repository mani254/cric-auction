import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { AuctionState } from "@/models/AuctionState";
import { Team } from "@/models/Team";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const teamId = body.teamId;

    if (!teamId) {
      return NextResponse.json(
        { success: false, error: "teamId is required." },
        { status: 400 }
      );
    }

    const team = await Team.findOne({ id: teamId });
    if (!team) {
      return NextResponse.json(
        { success: false, error: `Team ${teamId} not found.` },
        { status: 404 }
      );
    }

    let auctionState = await AuctionState.findOne({ sessionKey: "primary" });
    if (!auctionState) {
      auctionState = new AuctionState({ sessionKey: "primary" });
    }

    // Changing selected team does NOT change current bid
    auctionState.currentTeamId = team.id;
    auctionState.currentTeamName = team.name;
    await auctionState.save();

    return NextResponse.json({
      success: true,
      message: `Selected ${team.name}`,
      auctionState,
    });
  } catch (error: any) {
    console.error("POST /api/auction/select-team error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to select team" },
      { status: 500 }
    );
  }
}
