import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { AuctionEvent } from "@/models/AuctionEvent";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const limit = Math.min(Number(searchParams.get("limit")) || 50, 200);
    const eventType = searchParams.get("type");

    const query: Record<string, any> = {};
    if (eventType) {
      query.eventType = eventType;
    }

    const events = await AuctionEvent.find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({ success: true, events });
  } catch (error: any) {
    console.error("GET /api/auction/events error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch auction events" },
      { status: 500 }
    );
  }
}
