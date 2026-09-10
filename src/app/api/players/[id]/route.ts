import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Player } from "@/models/Player";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await context.params;
    const numericId = Number(id);

    const player = isNaN(numericId)
      ? await Player.findOne({ _id: id }).lean()
      : await Player.findOne({ id: numericId }).lean();

    if (!player) {
      return NextResponse.json(
        { success: false, error: `Player with id ${id} not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, player });
  } catch (error: any) {
    console.error(`GET /api/players/[id] error:`, error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch player" },
      { status: 500 }
    );
  }
}
