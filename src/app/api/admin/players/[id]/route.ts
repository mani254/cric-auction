import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Player } from "@/models/Player";
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
    const player = await Player.findOne({ id: Number(id) }).lean();
    if (!player) {
      return NextResponse.json({ success: false, error: "Player not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, player });
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

    // Prevent accidental overwrite of auction-critical fields
    const { auctionStatus, teamId, teamName, soldPrice, _id, ...safeUpdates } = body;

    const player = await Player.findOneAndUpdate(
      { id: Number(id) },
      { $set: safeUpdates },
      { new: true }
    );

    if (!player) {
      return NextResponse.json({ success: false, error: "Player not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, player });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
