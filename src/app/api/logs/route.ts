import { or, and } from "drizzle-orm";
import { getAuthUser } from "@/lib/auth";
import { db } from "@/db";
import { auditLogs, users, dams } from "@/db/schema";
import { eq, desc, like } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const authUser = await getAuthUser();
    
    // Only admins can access logs
    if (!authUser || authUser.role !== "admin") {
      return Response.json(
        { error: "Unauthorized. Only admins can access logs." },
        { status: 403 }
      );
    }

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "50");
    const search = url.searchParams.get("search") || "";
    const resource = url.searchParams.get("resource") || "";
    const action = url.searchParams.get("action") || "";
    const offset = (page - 1) * limit;

    let query = db.select({
      id: auditLogs.id,
      userId: auditLogs.userId,
      userName: users.name,
      userEmail: users.email,
      action: auditLogs.action,
      resource: auditLogs.resource,
      resourceId: auditLogs.resourceId,
      details: auditLogs.details,
      ipAddress: auditLogs.ipAddress,
      createdAt: auditLogs.createdAt,
    })
    .from(auditLogs)
    .leftJoin(users, eq(auditLogs.userId, users.id));

    // Apply filters
    const conditions = [];
    if (search) {
      conditions.push(
        or(
          like(users.name, `%${search}%`),
          like(users.email, `%${search}%`),
          like(auditLogs.action, `%${search}%`)
        )
      );
    }
    if (resource) {
      conditions.push(eq(auditLogs.resource, resource));
    }
    if (action) {
      conditions.push(eq(auditLogs.action, action));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const logs = await query
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count
    const countResult = await db
      .select({ count: auditLogs.id })
      .from(auditLogs);
    
    const total = countResult.length;

    return Response.json({
      success: true,
      data: logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Logs API error:", error);
    return Response.json(
      { error: "Failed to fetch logs" },
      { status: 500 }
    );
  }
}
