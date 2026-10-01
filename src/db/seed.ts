import { db } from "./index";
import { dams, villages, alerts, weather, sensorReadings, floodPredictions, historicalData, emergencyContacts, users } from "./schema";
import bcrypt from "bcryptjs";

async function seed() {
  console.log("Seeding database...");

  // Seed users
  const passwordHash = await bcrypt.hash("admin123", 10);
  await db.insert(users).values([
    { name: "Admin User", email: "admin@damguard.gov.in", passwordHash, role: "admin", phone: "+91-9876543210" },
    { name: "Dam Operator", email: "operator@damguard.gov.in", passwordHash, role: "dam_operator", phone: "+91-9876543211" },
    { name: "Government Officer", email: "officer@damguard.gov.in", passwordHash, role: "government_officer", phone: "+91-9876543212" },
    { name: "Citizen User", email: "citizen@example.com", passwordHash, role: "citizen", phone: "+91-9876543213" },
  ]).onConflictDoNothing();

  // Seed dams
  const damData = await db.insert(dams).values([
    {
      damId: "DAM-KRS-001",
      name: "Krishna Raja Sagara Dam",
      riverName: "Kaveri",
      state: "Karnataka",
      district: "Mysuru",
      latitude: 12.4244,
      longitude: 76.5722,
      maxCapacity: 1369.0,
      currentCapacity: 1120.5,
      waterLevel: 124.8,
      maxWaterLevel: 130.0,
      inflowRate: 52400,
      outflowRate: 35000,
      totalGates: 18,
      gatesOpen: 5,
      gateOpenTime: new Date("2025-01-15T08:00:00"),
      safetyStatus: "warning",
      lastUpdated: new Date(),
    },
    {
      damId: "DAM-NGA-002",
      name: "Nagarjuna Sagar Dam",
      riverName: "Krishna",
      state: "Telangana",
      district: "Nalgonda",
      latitude: 16.5744,
      longitude: 79.3182,
      maxCapacity: 11472.0,
      currentCapacity: 8900.0,
      waterLevel: 179.2,
      maxWaterLevel: 183.0,
      inflowRate: 89000,
      outflowRate: 65000,
      totalGates: 26,
      gatesOpen: 8,
      gateOpenTime: new Date("2025-01-15T06:30:00"),
      safetyStatus: "danger",
      lastUpdated: new Date(),
    },
    {
      damId: "DAM-MET-003",
      name: "Mettur Dam",
      riverName: "Kaveri",
      state: "Tamil Nadu",
      district: "Salem",
      latitude: 11.7857,
      longitude: 77.8004,
      maxCapacity: 2648.0,
      currentCapacity: 1890.0,
      waterLevel: 112.5,
      maxWaterLevel: 120.0,
      inflowRate: 41000,
      outflowRate: 28000,
      totalGates: 30,
      gatesOpen: 3,
      gateOpenTime: new Date("2025-01-15T10:00:00"),
      safetyStatus: "watch",
      lastUpdated: new Date(),
    },
    {
      damId: "DAM-HIR-004",
      name: "Hirakud Dam",
      riverName: "Mahanadi",
      state: "Odisha",
      district: "Sambalpur",
      latitude: 21.5265,
      longitude: 83.8731,
      maxCapacity: 5818.0,
      currentCapacity: 3200.0,
      waterLevel: 625.0,
      maxWaterLevel: 630.0,
      inflowRate: 35000,
      outflowRate: 20000,
      totalGates: 64,
      gatesOpen: 0,
      safetyStatus: "normal",
      lastUpdated: new Date(),
    },
    {
      damId: "DAM-BHK-005",
      name: "Bhakra Nangal Dam",
      riverName: "Sutlej",
      state: "Himachal Pradesh",
      district: "Bilaspur",
      latitude: 31.4117,
      longitude: 76.4311,
      maxCapacity: 9340.0,
      currentCapacity: 7200.0,
      waterLevel: 512.0,
      maxWaterLevel: 518.0,
      inflowRate: 28000,
      outflowRate: 15000,
      totalGates: 10,
      gatesOpen: 2,
      gateOpenTime: new Date("2025-01-15T07:00:00"),
      safetyStatus: "watch",
      lastUpdated: new Date(),
    },
  ]).returning();

  // Seed villages for each dam
  for (const dam of damData) {
    await db.insert(villages).values([
      {
        name: `Village A - ${dam.name.split(" ")[0]}`,
        population: Math.floor(Math.random() * 5000) + 1000,
        distanceFromDam: 5.2,
        latitude: (dam.latitude || 0) + 0.05,
        longitude: (dam.longitude || 0) + 0.08,
        elevation: 85.0,
        riskZone: "critical",
        nearestShelter: "Government School",
        emergencyContact: "+91-9800001111",
        damId: dam.id,
      },
      {
        name: `Village B - ${dam.name.split(" ")[0]}`,
        population: Math.floor(Math.random() * 8000) + 2000,
        distanceFromDam: 12.5,
        latitude: (dam.latitude || 0) + 0.12,
        longitude: (dam.longitude || 0) + 0.15,
        elevation: 95.0,
        riskZone: "high",
        nearestShelter: "Community Hall",
        emergencyContact: "+91-9800002222",
        damId: dam.id,
      },
      {
        name: `Village C - ${dam.name.split(" ")[0]}`,
        population: Math.floor(Math.random() * 10000) + 3000,
        distanceFromDam: 25.0,
        latitude: (dam.latitude || 0) + 0.25,
        longitude: (dam.longitude || 0) + 0.28,
        elevation: 110.0,
        riskZone: "medium",
        nearestShelter: "District Hospital",
        emergencyContact: "+91-9800003333",
        damId: dam.id,
      },
    ]);

    // Seed weather
    await db.insert(weather).values({
      damId: dam.id,
      temperature: 28 + Math.random() * 8,
      humidity: 70 + Math.random() * 25,
      rainfall: Math.random() * 50,
      windSpeed: 10 + Math.random() * 30,
      weatherCondition: ["Heavy Rain", "Moderate Rain", "Cloudy", "Thunderstorm"][Math.floor(Math.random() * 4)],
      forecast24h: JSON.stringify([
        { hour: "06:00", rainfall: Math.random() * 20 },
        { hour: "09:00", rainfall: Math.random() * 30 },
        { hour: "12:00", rainfall: Math.random() * 40 },
        { hour: "15:00", rainfall: Math.random() * 35 },
        { hour: "18:00", rainfall: Math.random() * 25 },
        { hour: "21:00", rainfall: Math.random() * 15 },
      ]),
    });

    // Seed flood prediction
    const riskScore = Math.random() * 100;
    await db.insert(floodPredictions).values({
      damId: dam.id,
      floodProbability: riskScore / 100,
      floodDepth: riskScore > 70 ? 2.5 + Math.random() * 3 : Math.random() * 2,
      affectedPopulation: Math.floor(riskScore * 200),
      floodDuration: 12 + Math.random() * 36,
      riskScore,
      affectedVillages: JSON.stringify(["Village A", "Village B"]),
      aiRecommendations: JSON.stringify({
        shouldOpenGates: riskScore > 60,
        expectedSeverity: riskScore > 80 ? "Severe" : riskScore > 50 ? "Moderate" : "Low",
        optimalRelease: Math.floor(riskScore * 500),
        evacuationRequired: riskScore > 75,
        recommendedActions: [
          "Monitor water levels every 30 minutes",
          "Alert downstream villages",
          "Prepare evacuation routes",
        ],
      }),
    });

    // Seed sensor readings
    await db.insert(sensorReadings).values([
      { damId: dam.id, sensorType: "water_level", value: dam.waterLevel || 0, unit: "meters", status: "online" },
      { damId: dam.id, sensorType: "flow", value: dam.inflowRate || 0, unit: "cusecs", status: "online" },
      { damId: dam.id, sensorType: "rainfall", value: Math.random() * 50, unit: "mm", status: "online" },
      { damId: dam.id, sensorType: "gate", value: dam.gatesOpen || 0, unit: "count", status: "online" },
    ]);

    // Seed alerts
    if ((dam.gatesOpen || 0) > 0) {
      await db.insert(alerts).values({
        damId: dam.id,
        alertType: "gate_opened",
        level: dam.safetyStatus === "danger" ? "red" : dam.safetyStatus === "warning" ? "orange" : "yellow",
        message: `🚨 Gates opened at ${dam.name}. ${dam.gatesOpen} gates currently operational.`,
        waterReleased: (dam.outflowRate || 0) * 3600,
        expectedArrival: new Date(Date.now() + 2 * 60 * 60 * 1000),
        floodRisk: dam.safetyStatus === "danger" ? "High" : "Moderate",
        safetyInstructions: "Move to higher ground immediately. Follow evacuation routes. Do not cross flooded roads.",
        notificationsSent: JSON.stringify({ sms: true, email: true, whatsapp: false, push: true }),
      });
    }

    // Seed historical data (last 30 days)
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      await db.insert(historicalData).values({
        damId: dam.id,
        waterLevel: (dam.waterLevel || 0) - Math.random() * 10,
        storagePercentage: ((dam.currentCapacity || 0) / (dam.maxCapacity || 1)) * 100 - Math.random() * 10,
        rainfall: Math.random() * 60,
        discharge: (dam.outflowRate || 0) - Math.random() * 5000,
        inflowRate: (dam.inflowRate || 0) - Math.random() * 5000,
        outflowRate: (dam.outflowRate || 0) - Math.random() * 3000,
        gatesOpen: Math.floor(Math.random() * (dam.totalGates || 1)),
        recordedAt: date,
      });
    }
  }

  // Seed emergency contacts
  await db.insert(emergencyContacts).values([
    { name: "National Disaster Response Force", designation: "Director", department: "disaster_management", phone: "011-23438091", email: "ndrf@gov.in", district: "National", state: "Central" },
    { name: "Central Water Commission", designation: "Chief Engineer", department: "disaster_management", phone: "011-26103174", email: "cwc@nic.in", district: "National", state: "Central" },
    { name: "Mysuru Police Control Room", designation: "Inspector", department: "police", phone: "0821-2520300", phone2: "100", email: "police@mysuru.gov.in", district: "Mysuru", state: "Karnataka" },
    { name: "Salem Fire Station", designation: "Fire Officer", department: "fire", phone: "0427-2234567", phone2: "101", email: "fire@salem.gov.in", district: "Salem", state: "Tamil Nadu" },
    { name: "Sambalpur District Hospital", designation: "Medical Superintendent", department: "hospital", phone: "0663-2412345", phone2: "108", email: "hospital@sambalpur.gov.in", district: "Sambalpur", state: "Odisha" },
    { name: "National Ambulance Service", designation: "Coordinator", department: "ambulance", phone: "102", email: "ambulance@nhs.gov.in", district: "National", state: "Central" },
    { name: "Nalgonda Police HQ", designation: "Superintendent of Police", department: "police", phone: "08682-224100", phone2: "100", email: "sp@nalgonda.gov.in", district: "Nalgonda", state: "Telangana" },
    { name: "Bilaspur Fire Brigade", designation: "Station Officer", department: "fire", phone: "01978-222101", phone2: "101", email: "fire@bilaspur.hp.gov.in", district: "Bilaspur", state: "Himachal Pradesh" },
  ]).onConflictDoNothing();

  console.log("✅ Database seeded successfully!");
}

seed().catch(console.error);
