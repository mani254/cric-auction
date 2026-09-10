import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Team } from "@/models/Team";
import { AuctionEvent } from "@/models/AuctionEvent";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();

    // Supports either single team { teamId, budget } or bulk { budgets: { [teamId]: number } }
    const updates: Array<{ teamId: string; budget: number }> = [];

    if (body.budgets && typeof body.budgets === "object") {
      for (const [tId, bVal] of Object.entries(body.budgets)) {
        updates.push({ teamId: tId, budget: Number(bVal) });
      }
    } else if (body.teamId && body.budget !== undefined) {
      updates.push({ teamId: body.teamId, budget: Number(body.budget) });
    } else {
      return NextResponse.json(
        { success: false, error: "Invalid payload. Provide teamId and budget, or budgets object." },
        { status: 400 }
      );
    }

    const modifiedTeams = [];

    for (const update of updates) {
      const budgetNum = Number(update.budget);
      if (isNaN(budgetNum) || budgetNum < 0) {
        return NextResponse.json(
          { success: false, error: `Invalid budget amount for ${update.teamId}: must be a non-negative number.` },
          { status: 400 }
        );
      }

      const team = await Team.findOne({ id: update.teamId });
      if (!team) {
        return NextResponse.json(
          { success: false, error: `Team ${update.teamId} not found` },
          { status: 404 }
        );
      }

      // If team has already spent money, remaining budget = new initial budget - spent
      const newRemaining = budgetNum - (team.totalSpent || 0);
      if (newRemaining < 0) {
        return NextResponse.json(
          {
            success: false,
            error: `Budget ₹${budgetNum.toLocaleString("en-IN")} cannot be lower than current spent amount ₹${team.totalSpent.toLocaleString("en-IN")}`,
          },
          { status: 400 }
        );
      }

      team.initialBudget = budgetNum;
      team.remainingBudget = newRemaining;
      await team.save();

      await AuctionEvent.create({
        eventType: "BUDGET_UPDATED",
        teamId: team.id,
        teamName: team.name,
        amount: budgetNum,
        details: { initialBudget: budgetNum, remainingBudget: newRemaining },
        timestamp: new Date(),
      });

      modifiedTeams.push(team);
    }

    const allTeams = await Team.find({}).sort({ id: 1 }).lean();

    return NextResponse.json({
      success: true,
      message: "Team budgets updated successfully",
      teams: allTeams,
    });
  } catch (error: any) {
    console.error("POST /api/teams/budget error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update team budgets" },
      { status: 500 }
    );
  }
}
