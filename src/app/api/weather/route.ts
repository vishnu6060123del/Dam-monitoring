import { NextResponse } from "next/server";
import { db, isDbAvailable } from "@/db";
import { weather, dams } from "@/db/schema";
import { eq } from "drizzle-orm";
import { mockWeather, mockDams } from "@/lib/mockData";

export async function GET() {
  try {
    if (!isDbAvailable || !db) {
      return NextResponse.json({ weather: mockWeather });
    }
    const weatherData = await db.select({
      id: weather.id,
      damId: weather.damId,
      temperature: weather.temperature,
      humidity: weather.humidity,
      rainfall: weather.rainfall,
      windSpeed: weather.windSpeed,
      weatherCondition: weather.weatherCondition,
      forecast24h: weather.forecast24h,
      recordedAt: weather.recordedAt,
      damName: dams.name,
      damState: dams.state,
    })
    .from(weather)
    .leftJoin(dams, eq(weather.damId, dams.id));

    return NextResponse.json({ weather: weatherData });
  } catch (error) {
    console.error("Weather error:", error);
    return NextResponse.json({ weather: mockWeather });
  }
}
