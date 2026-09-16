import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Team } from "@/models/Team";
import { verifyAdminToken } from "@/lib/adminAuth";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!verifyAdminToken(req)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  try {
    await connectToDatabase();
    const { id } = await context.params;
    const team = await Team.findOne({ id }).lean();
    if (!team) {
      return NextResponse.json({ success: false, error: "Team not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, team });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!verifyAdminToken(req)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  try {
    await connectToDatabase();
    const { id } = await context.params;
    const body = await req.json();

    // Prevent overwriting financial state
    const { remainingBudget, totalSpent, playerCount, players, _id, ...safeUpdates } = body;

    const team = await Team.findOneAndUpdate(
      { id },
      { $set: safeUpdates },
      { new: true }
    );

    if (!team) {
      return NextResponse.json({ success: false, error: "Team not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, team });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
