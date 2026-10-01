import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const allUsers = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      phone: users.phone,
      isActive: users.isActive,
      createdAt: users.createdAt,
      lastLogin: users.lastLogin,
    }).from(users);
    return NextResponse.json({ users: allUsers });
  } catch (error) {
    console.error("Users error:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, role, phone } = body;
    const passwordHash = await bcrypt.hash(password, 10);
    const [newUser] = await db.insert(users).values({ name, email, passwordHash, role, phone }).returning({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
    });
    return NextResponse.json({ user: newUser }, { status: 201 });
  } catch (error) {
    console.error("User create error:", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
