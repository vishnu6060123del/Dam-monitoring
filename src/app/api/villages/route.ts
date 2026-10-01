import { NextRequest, NextResponse } from "next/server";
import { db, isDbAvailable } from "@/db";
import { villages, dams } from "@/db/schema";
import { eq } from "drizzle-orm";
import { mockVillages } from "@/lib/mockData";

export async function GET() {
  try {
    if (!isDbAvailable || !db) {
      return NextResponse.json({ villages: mockVillages });
    }
    const allVillages = await db.select({
      id: villages.id,
      name: villages.name,
      population: villages.population,
      distanceFromDam: villages.distanceFromDam,
      latitude: villages.latitude,
      longitude: villages.longitude,
      elevation: villages.elevation,
      riskZone: villages.riskZone,
      nearestShelter: villages.nearestShelter,
      emergencyContact: villages.emergencyContact,
      damId: villages.damId,
      damName: dams.name,
      damDistrict: dams.district,
      damState: dams.state,
    })
    .from(villages)
    .leftJoin(dams, eq(villages.damId, dams.id));

    return NextResponse.json({ villages: allVillages });
  } catch (error) {
    console.error("Villages error:", error);
    return NextResponse.json({ villages: mockVillages });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const [newVillage] = await db.insert(villages).values(body).returning();
    return NextResponse.json({ village: newVillage }, { status: 201 });
  } catch (error) {
    console.error("Village create error:", error);
    return NextResponse.json({ error: "Failed to create village" }, { status: 500 });
  }
}
