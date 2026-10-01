import { NextResponse } from "next/server";
import { db } from "@/db";
import { emergencyContacts } from "@/db/schema";

export async function GET() {
  try {
    const contacts = await db.select().from(emergencyContacts);
    return NextResponse.json({ contacts });
  } catch (error) {
    console.error("Emergency contacts error:", error);
    return NextResponse.json({ error: "Failed to fetch emergency contacts" }, { status: 500 });
  }
}
