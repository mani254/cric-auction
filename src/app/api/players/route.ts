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

    // Aggregates for auction summary
    const totalCount = await Player.countDocuments();
    const soldCount = await Player.countDocuments({ auctionStatus: "SOLD" });
    const unsoldCount = await Player.countDocuments({ auctionStatus: "UNSOLD" });
    const remainingCount = await Player.countDocuments({
      auctionStatus: { $in: ["NOT_STARTED", "CURRENT"] },
    });

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
