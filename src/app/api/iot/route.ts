import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { sensorReadings, dams } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const sensors = await db.select({
      id: sensorReadings.id,
      damId: sensorReadings.damId,
      sensorType: sensorReadings.sensorType,
      value: sensorReadings.value,
      unit: sensorReadings.unit,
      status: sensorReadings.status,
      recordedAt: sensorReadings.recordedAt,
      damName: dams.name,
    })
    .from(sensorReadings)
    .leftJoin(dams, eq(sensorReadings.damId, dams.id))
    .orderBy(desc(sensorReadings.recordedAt));

    return NextResponse.json({ sensors });
  } catch (error) {
    console.error("IoT error:", error);
    return NextResponse.json({ error: "Failed to fetch sensor data" }, { status: 500 });
  }
}

// Simulate IoT update - update dam readings
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { damId } = body;

    // Simulate real-time sensor update
    const [dam] = await db.select().from(dams).where(eq(dams.id, damId));
    if (!dam) return NextResponse.json({ error: "Dam not found" }, { status: 404 });

    const newWaterLevel = (dam.waterLevel || 0) + (Math.random() - 0.4) * 0.5;
    const newInflow = (dam.inflowRate || 0) + (Math.random() - 0.3) * 500;

    await db.update(dams).set({
      waterLevel: Math.min(Math.max(newWaterLevel, 0), dam.maxWaterLevel || 200),
      inflowRate: Math.max(newInflow, 0),
      currentCapacity: Math.min((dam.currentCapacity || 0) + (Math.random() - 0.3) * 50, dam.maxCapacity || 9999),
      lastUpdated: new Date(),
    }).where(eq(dams.id, damId));

    // Insert sensor reading
    await db.insert(sensorReadings).values([
      { damId, sensorType: "water_level", value: newWaterLevel, unit: "meters", status: "online" },
    ]);

    return NextResponse.json({ success: true, damId, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error("IoT update error:", error);
    return NextResponse.json({ error: "Failed to update sensor" }, { status: 500 });
  }
}
