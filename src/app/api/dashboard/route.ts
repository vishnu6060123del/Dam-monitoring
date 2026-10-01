import { NextResponse } from "next/server";
import { db, isDbAvailable } from "@/db";

// Mock dashboard data for open-source/demo mode
const MOCK_DASHBOARD_DATA = {
  totalDams: 5,
  totalGatesOpen: 3,
  totalInflow: 1250.5,
  totalOutflow: 980.3,
  avgWaterLevel: 85.2,
  avgStoragePct: 78.5,
  activeAlerts: 3,
  statusCounts: {
    normal: 3,
    watch: 1,
    warning: 1,
    danger: 0,
  },
  dams: [
    {
      id: 1,
      name: "Rajgarh Dam",
      riverName: "Kali Sindh",
      state: "Madhya Pradesh",
      waterLevel: 87.5,
      maxWaterLevel: 95.0,
      currentCapacity: 450,
      maxCapacity: 580,
      gatesOpen: 1,
      totalGates: 4,
      inflowRate: 250.5,
      outflowRate: 180.2,
      safetyStatus: "normal",
      lastUpdated: new Date().toISOString(),
    },
    {
      id: 2,
      name: "Narmada Dam",
      riverName: "Narmada",
      state: "Gujarat",
      waterLevel: 85.2,
      maxWaterLevel: 92.0,
      currentCapacity: 320,
      maxCapacity: 420,
      gatesOpen: 1,
      totalGates: 3,
      inflowRate: 300.0,
      outflowRate: 250.5,
      safetyStatus: "normal",
      lastUpdated: new Date().toISOString(),
    },
    {
      id: 3,
      name: "Krishna Dam",
      riverName: "Krishna",
      state: "Andhra Pradesh",
      waterLevel: 82.8,
      maxWaterLevel: 90.0,
      currentCapacity: 280,
      maxCapacity: 350,
      gatesOpen: 1,
      totalGates: 3,
      inflowRate: 200.0,
      outflowRate: 150.1,
      safetyStatus: "watch",
      lastUpdated: new Date().toISOString(),
    },
    {
      id: 4,
      name: "Godavari Dam",
      riverName: "Godavari",
      state: "Telangana",
      waterLevel: 88.5,
      maxWaterLevel: 94.0,
      currentCapacity: 380,
      maxCapacity: 450,
      gatesOpen: 0,
      totalGates: 5,
      inflowRate: 350.0,
      outflowRate: 320.0,
      safetyStatus: "warning",
      lastUpdated: new Date().toISOString(),
    },
    {
      id: 5,
      name: "Tungabhadra Dam",
      riverName: "Tungabhadra",
      state: "Karnataka",
      waterLevel: 81.2,
      maxWaterLevel: 88.0,
      currentCapacity: 240,
      maxCapacity: 310,
      gatesOpen: 0,
      totalGates: 3,
      inflowRate: 150.0,
      outflowRate: 80.5,
      safetyStatus: "normal",
      lastUpdated: new Date().toISOString(),
    },
  ],
  alerts: [
    {
      id: 1,
      level: "warning",
      message: "Water level approaching maximum capacity at Godavari Dam",
      createdAt: new Date().toISOString(),
      damName: "Godavari Dam",
    },
    {
      id: 2,
      level: "info",
      message: "Increased inflow detected at Krishna Dam",
      createdAt: new Date().toISOString(),
      damName: "Krishna Dam",
    },
    {
      id: 3,
      level: "warning",
      message: "Gate operation anomaly detected at Rajgarh Dam",
      createdAt: new Date().toISOString(),
      damName: "Rajgarh Dam",
    },
  ],
  lastUpdated: new Date().toISOString(),
};

export async function GET() {
  try {
    // If database is available, query real data
    if (isDbAvailable && db) {
      try {
        const { dams, alerts, floodPredictions } = await import("@/db/schema");
        const { eq } = await import("drizzle-orm");
        
        const allDams = await db.select().from(dams).where(eq(dams.isActive, true));
        const activeAlerts = await db.select().from(alerts).where(eq(alerts.isResolved, false));
        
        const totalDams = allDams.length;
        const totalGatesOpen = allDams.reduce((sum: number, d: any) => sum + (d.gatesOpen || 0), 0);
        const totalInflow = allDams.reduce((sum: number, d: any) => sum + (d.inflowRate || 0), 0);
        const totalOutflow = allDams.reduce((sum: number, d: any) => sum + (d.outflowRate || 0), 0);
        const avgWaterLevel = allDams.reduce((sum: number, d: any) => sum + (d.waterLevel || 0), 0) / (totalDams || 1);
        const avgStoragePct = allDams.reduce((sum: number, d: any) => {
          const pct = d.maxCapacity ? ((d.currentCapacity || 0) / d.maxCapacity) * 100 : 0;
          return sum + pct;
        }, 0) / (totalDams || 1);

        const statusCounts = {
          normal: allDams.filter((d: any) => d.safetyStatus === "normal").length,
          watch: allDams.filter((d: any) => d.safetyStatus === "watch").length,
          warning: allDams.filter((d: any) => d.safetyStatus === "warning").length,
          danger: allDams.filter((d: any) => d.safetyStatus === "danger").length,
        };

        return NextResponse.json({
          totalDams,
          totalGatesOpen,
          totalInflow,
          totalOutflow,
          avgWaterLevel: Math.round(avgWaterLevel * 10) / 10,
          avgStoragePct: Math.round(avgStoragePct * 10) / 10,
          activeAlerts: activeAlerts.length,
          statusCounts,
          dams: allDams,
          alerts: activeAlerts.slice(0, 5),
          lastUpdated: new Date().toISOString(),
        });
      } catch (dbError) {
        console.warn("Database query failed, using mock data:", dbError);
        return NextResponse.json(MOCK_DASHBOARD_DATA);
      }
    }

    // Return mock data for open-source/demo mode
    return NextResponse.json(MOCK_DASHBOARD_DATA);
  } catch (error) {
    console.error("Dashboard error:", error);
    // Always return mock data as fallback
    return NextResponse.json(MOCK_DASHBOARD_DATA);
  }
}
