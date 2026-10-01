import { db } from "@/db";
import { dams } from "@/db/schema";
import { like, gte, lte } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const minLevel = url.searchParams.get("minLevel");
    const maxLevel = url.searchParams.get("maxLevel");
    const search = url.searchParams.get("search");

    let query = db.select().from(dams);
    const conditions = [];

    // Filter by min water level
    if (minLevel) {
      conditions.push(gte(dams.waterLevel, parseFloat(minLevel)));
    }

    // Filter by max water level
    if (maxLevel) {
      conditions.push(lte(dams.waterLevel, parseFloat(maxLevel)));
    }

    // Search by dam name or river name
    if (search) {
      conditions.push(
        like(dams.name, `%${search}%`)
      );
    }

    if (conditions.length > 0) {
      const { and } = require("drizzle-orm");
      query = query.where(and(...conditions));
    }

    const results = await query.orderBy(dams.waterLevel);

    return Response.json({
      success: true,
      data: results.map((dam) => ({
        id: dam.id,
        name: dam.name,
        riverName: dam.riverName,
        waterLevel: dam.waterLevel,
        maxWaterLevel: dam.maxWaterLevel,
        currentCapacity: dam.currentCapacity,
        maxCapacity: dam.maxCapacity,
        safetyStatus: dam.safetyStatus,
        latitude: dam.latitude,
        longitude: dam.longitude,
        state: dam.state,
        district: dam.district,
        capacityPercentage: dam.maxCapacity ? ((dam.currentCapacity || 0) / dam.maxCapacity) * 100 : 0,
      })),
      count: results.length,
    });
  } catch (error) {
    console.error("Water level search error:", error);
    return Response.json(
      { error: "Failed to fetch water levels" },
      { status: 500 }
    );
  }
}
