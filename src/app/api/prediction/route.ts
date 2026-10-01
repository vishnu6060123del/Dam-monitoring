import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { floodPredictions, dams, villages } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const predictions = await db.select({
      id: floodPredictions.id,
      damId: floodPredictions.damId,
      floodProbability: floodPredictions.floodProbability,
      floodDepth: floodPredictions.floodDepth,
      affectedPopulation: floodPredictions.affectedPopulation,
      floodDuration: floodPredictions.floodDuration,
      riskScore: floodPredictions.riskScore,
      affectedVillages: floodPredictions.affectedVillages,
      aiRecommendations: floodPredictions.aiRecommendations,
      predictedAt: floodPredictions.predictedAt,
      damName: dams.name,
      damState: dams.state,
      damDistrict: dams.district,
    })
    .from(floodPredictions)
    .leftJoin(dams, eq(floodPredictions.damId, dams.id));

    return NextResponse.json({ predictions });
  } catch (error) {
    console.error("Prediction error:", error);
    return NextResponse.json({ error: "Failed to fetch predictions" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { damId, outflowRate, gatesOpen } = body;

    // Calculate water release prediction
    const flowVelocity = 2.5 + Math.random() * 1.5; // m/s
    const damVillages = await db.select().from(villages).where(eq(villages.damId, damId));
    
    const villagePredictions = damVillages.map((v: {
      id: number;
      name: string | null;
      distanceFromDam: number | null;
      riskZone: string | null;
      population: number | null;
    }) => {
      const distanceM = (v.distanceFromDam || 10) * 1000;
      const travelTimeHours = distanceM / (flowVelocity * 3600);
      const arrivalTime = new Date(Date.now() + travelTimeHours * 3600 * 1000);
      const waterLevelRise = Math.max(0, 3 - (v.distanceFromDam || 10) * 0.1);

      return {
        villageId: v.id,
        villageName: v.name,
        distance: v.distanceFromDam,
        estimatedArrival: arrivalTime,
        expectedWaterLevel: waterLevelRise,
        floodRisk: v.riskZone,
        population: v.population,
      };
    });

    return NextResponse.json({
      waterReleased: (outflowRate || 0) * 3600,
      flowVelocity,
      gatesOpen,
      villagePredictions,
    });
  } catch (error) {
    console.error("Prediction calc error:", error);
    return NextResponse.json({ error: "Failed to calculate prediction" }, { status: 500 });
  }
}
