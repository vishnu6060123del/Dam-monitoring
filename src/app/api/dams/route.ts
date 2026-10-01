import { NextRequest, NextResponse } from "next/server";
import { db, isDbAvailable } from "@/db";
import { dams } from "@/db/schema";
import { eq } from "drizzle-orm";
import { mockDams } from "@/lib/mockData";

export async function GET() {
  try {
    if (!isDbAvailable || !db) {
      return NextResponse.json({ dams: mockDams });
    }
    const allDams = await db.select().from(dams).where(eq(dams.isActive, true));
    return NextResponse.json({ dams: allDams || mockDams });
  } catch (error) {
    console.error("Dams fetch error:", error);
    return NextResponse.json({ dams: mockDams });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!isDbAvailable || !db) {
      return NextResponse.json(
        { dam: { id: Date.now(), ...await req.json() } },
        { status: 201 }
      );
    }
    const body = await req.json();
    const [newDam] = await db.insert(dams).values(body).returning();
    return NextResponse.json({ dam: newDam }, { status: 201 });
  } catch (error) {
    console.error("Dam create error:", error);
    return NextResponse.json({ error: "Failed to create dam" }, { status: 500 });
  }
}
