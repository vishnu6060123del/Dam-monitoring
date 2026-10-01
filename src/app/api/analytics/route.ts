import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { historicalData } from "@/db/schema";
import { eq, gte, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const damId = searchParams.get("damId");
    const days = parseInt(searchParams.get("days") || "30");

    const since = new Date();
    since.setDate(since.getDate() - days);

    let query = db.select().from(historicalData).where(gte(historicalData.recordedAt, since));

    if (damId) {
      const data = await db.select()
        .from(historicalData)
        .where(eq(historicalData.damId, parseInt(damId)))
        .orderBy(desc(historicalData.recordedAt))
        .limit(days * 4);
      return NextResponse.json({ data });
    }

    const data = await db.select()
      .from(historicalData)
      .orderBy(desc(historicalData.recordedAt))
      .limit(100);

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
