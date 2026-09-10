import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Team } from "@/models/Team";

export async function GET() {
  try {
    await connectToDatabase();
    const teams = await Team.find({}).sort({ id: 1 }).lean();
    return NextResponse.json({ success: true, teams });
  } catch (error: any) {
    console.error("GET /api/teams error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch teams" },
      { status: 500 }
    );
  }
}
