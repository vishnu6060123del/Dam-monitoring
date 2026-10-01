import { NextRequest, NextResponse } from "next/server";
import { db, isDbAvailable } from "@/db";
import { alerts, dams } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { mockAlerts, mockDams } from "@/lib/mockData";

export async function GET() {
  try {
    if (!isDbAvailable || !db) {
      return NextResponse.json({ alerts: mockAlerts });
    }
    const allAlerts = await db.select({
      id: alerts.id,
      damId: alerts.damId,
      alertType: alerts.alertType,
      level: alerts.level,
      message: alerts.message,
      waterReleased: alerts.waterReleased,
      expectedArrival: alerts.expectedArrival,
      floodRisk: alerts.floodRisk,
      safetyInstructions: alerts.safetyInstructions,
      isResolved: alerts.isResolved,
      notificationsSent: alerts.notificationsSent,
      createdAt: alerts.createdAt,
      damName: dams.name,
      damState: dams.state,
    })
    .from(alerts)
    .leftJoin(dams, eq(alerts.damId, dams.id))
    .orderBy(desc(alerts.createdAt));

    return NextResponse.json({ alerts: allAlerts });
  } catch (error) {
    console.error("Alerts error:", error);
    return NextResponse.json({ alerts: mockAlerts });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const [newAlert] = await db.insert(alerts).values(body).returning();
    return NextResponse.json({ alert: newAlert }, { status: 201 });
  } catch (error) {
    console.error("Alert create error:", error);
    return NextResponse.json({ error: "Failed to create alert" }, { status: 500 });
  }
}
