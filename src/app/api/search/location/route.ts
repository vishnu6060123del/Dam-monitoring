import { db } from "@/db";
import { dams } from "@/db/schema";
import { like, eq } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const search = url.searchParams.get("search");
    const state = url.searchParams.get("state");
    const district = url.searchParams.get("district");

    let query = db.select().from(dams);
    const conditions = [];

    // Search by dam name or river name
    if (search) {
      conditions.push(
        like(dams.name, `%${search}%`)
      );
    }

    // Filter by state
    if (state) {
      conditions.push(eq(dams.state, state));
    }

    // Filter by district
    if (district) {
      conditions.push(eq(dams.district, district));
    }

    if (conditions.length > 0) {
      const { and } = require("drizzle-orm");
      query = query.where(and(...conditions));
    }

    const results = await query.orderBy(dams.name);

    return Response.json({
      success: true,
      data: results.map((dam) => ({
        id: dam.id,
        damId: dam.damId,
        name: dam.name,
        riverName: dam.riverName,
        state: dam.state,
        district: dam.district,
        latitude: dam.latitude,
        longitude: dam.longitude,
        waterLevel: dam.waterLevel,
        maxWaterLevel: dam.maxWaterLevel,
        safetyStatus: dam.safetyStatus,
        currentCapacity: dam.currentCapacity,
        maxCapacity: dam.maxCapacity,
      })),
      count: results.length,
    });
  } catch (error) {
    console.error("Dam location search error:", error);
    return Response.json(
      { error: "Failed to search dam locations" },
      { status: 500 }
    );
  }
}
