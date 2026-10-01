import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { dams, weather, sensorReadings, floodPredictions, villages, alerts, historicalData } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const damId = parseInt(id);
    const [dam] = await db.select().from(dams).where(eq(dams.id, damId));
    if (!dam) return NextResponse.json({ error: "Dam not found" }, { status: 404 });

    const [latestWeather] = await db.select().from(weather).where(eq(weather.damId, damId)).limit(1);
    const sensors = await db.select().from(sensorReadings).where(eq(sensorReadings.damId, damId));
    const [prediction] = await db.select().from(floodPredictions).where(eq(floodPredictions.damId, damId)).limit(1);
    const damVillages = await db.select().from(villages).where(eq(villages.damId, damId));
    const damAlerts = await db.select().from(alerts).where(eq(alerts.damId, damId));
    const history = await db.select().from(historicalData).where(eq(historicalData.damId, damId));

    return NextResponse.json({ dam, weather: latestWeather, sensors, prediction, villages: damVillages, alerts: damAlerts, history });
  } catch (error) {
    console.error("Dam detail error:", error);
    return NextResponse.json({ error: "Failed to fetch dam details" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const damId = parseInt(id);
    const body = await req.json();
    const [updated] = await db.update(dams).set({ ...body, lastUpdated: new Date() }).where(eq(dams.id, damId)).returning();
    return NextResponse.json({ dam: updated });
  } catch (error) {
    console.error("Dam update error:", error);
    return NextResponse.json({ error: "Failed to update dam" }, { status: 500 });
  }
}
