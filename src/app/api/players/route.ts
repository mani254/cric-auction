import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Player } from "@/models/Player";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const query: Record<string, any> = {};

    if (role && role !== "ALL") {
      query.role = role;
    }
    if (status && status !== "ALL") {
      query.auctionStatus = status;
    }
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    const players = await Player.find(query).sort({ id: 1 }).lean();

    // High-speed in-memory aggregate calculation (0.001ms instead of 4 remote countDocuments round-trips)
    let totalCount = players.length;
    let soldCount = 0;
    let unsoldCount = 0;
    let remainingCount = 0;

    const isFiltered = Boolean((role && role !== "ALL") || (status && status !== "ALL") || search);

    if (isFiltered) {
      const allStatus = await Player.find({}, { auctionStatus: 1 }).lean();
      totalCount = allStatus.length;
      for (const p of allStatus) {
        if (p.auctionStatus === "SOLD") soldCount++;
        else if (p.auctionStatus === "UNSOLD") unsoldCount++;
        else remainingCount++;
      }
    } else {
      for (const p of players) {
        if (p.auctionStatus === "SOLD") soldCount++;
        else if (p.auctionStatus === "UNSOLD") unsoldCount++;
        else remainingCount++;
      }
    }

    return NextResponse.json({
      success: true,
      players,
      summary: {
        total: totalCount,
        sold: soldCount,
        unsold: unsoldCount,
        remaining: remainingCount,
      },
    });
  } catch (error: any) {
    console.error("GET /api/players error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch players" },
      { status: 500 }
    );
  }
}
