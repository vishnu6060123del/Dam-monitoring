import { NextRequest, NextResponse } from "next/server";
import { db, isDbAvailable } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth";
import { mockUsers } from "@/lib/mockData";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    let user;

    if (!isDbAvailable || !db) {
      // Use mock data
      user = mockUsers.find((u) => u.email === email);
      if (!user) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }

      // Check password against mock data (all mock users have password: admin123)
      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }
    } else {
      const [dbUser] = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (!dbUser) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }

      const valid = await bcrypt.compare(password, dbUser.passwordHash);
      if (!valid) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }

      user = dbUser;
    }

    const token = await signToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });

    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 86400,
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
