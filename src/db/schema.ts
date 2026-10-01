import {
  pgTable,
  serial,
  text,
  real,
  integer,
  boolean,
  timestamp,
  varchar,
  jsonb,
} from "drizzle-orm/pg-core";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: varchar("role", { length: 50 }).notNull().default("citizen"), // admin, dam_operator, government_officer, citizen
  phone: varchar("phone", { length: 20 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  lastLogin: timestamp("last_login"),
});

// Dams table
export const dams = pgTable("dams", {
  id: serial("id").primaryKey(),
  damId: varchar("dam_id", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  riverName: varchar("river_name", { length: 255 }),
  state: varchar("state", { length: 100 }),
  district: varchar("district", { length: 100 }),
  latitude: real("latitude"),
  longitude: real("longitude"),
  maxCapacity: real("max_capacity"), // in MCM (Million Cubic Meters)
  currentCapacity: real("current_capacity"),
  waterLevel: real("water_level"), // in meters
  maxWaterLevel: real("max_water_level"),
  inflowRate: real("inflow_rate"), // in cusecs
  outflowRate: real("outflow_rate"),
  totalGates: integer("total_gates").default(0),
  gatesOpen: integer("gates_open").default(0),
  gateOpenTime: timestamp("gate_open_time"),
  gateCloseTime: timestamp("gate_close_time"),
  safetyStatus: varchar("safety_status", { length: 50 }).default("normal"), // normal, watch, warning, danger
  isActive: boolean("is_active").default(true),
  lastUpdated: timestamp("last_updated").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Villages table
export const villages = pgTable("villages", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  population: integer("population"),
  distanceFromDam: real("distance_from_dam"), // in km
  latitude: real("latitude"),
  longitude: real("longitude"),
  elevation: real("elevation"), // in meters
  riskZone: varchar("risk_zone", { length: 50 }).default("low"), // low, medium, high, critical
  nearestShelter: varchar("nearest_shelter", { length: 255 }),
  emergencyContact: varchar("emergency_contact", { length: 20 }),
  damId: integer("dam_id").references(() => dams.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Alerts table
export const alerts = pgTable("alerts", {
  id: serial("id").primaryKey(),
  damId: integer("dam_id").references(() => dams.id),
  alertType: varchar("alert_type", { length: 100 }),
  level: varchar("level", { length: 20 }).default("green"), // green, yellow, orange, red
  message: text("message"),
  waterReleased: real("water_released"),
  expectedArrival: timestamp("expected_arrival"),
  floodRisk: varchar("flood_risk", { length: 50 }),
  safetyInstructions: text("safety_instructions"),
  isResolved: boolean("is_resolved").default(false),
  notificationsSent: jsonb("notifications_sent"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Weather table
export const weather = pgTable("weather", {
  id: serial("id").primaryKey(),
  damId: integer("dam_id").references(() => dams.id),
  temperature: real("temperature"),
  humidity: real("humidity"),
  rainfall: real("rainfall"),
  windSpeed: real("wind_speed"),
  weatherCondition: varchar("weather_condition", { length: 100 }),
  forecast24h: jsonb("forecast_24h"),
  recordedAt: timestamp("recorded_at").defaultNow(),
});

// Sensor readings table
export const sensorReadings = pgTable("sensor_readings", {
  id: serial("id").primaryKey(),
  damId: integer("dam_id").references(() => dams.id),
  sensorType: varchar("sensor_type", { length: 100 }), // water_level, flow, rainfall, gate
  value: real("value"),
  unit: varchar("unit", { length: 50 }),
  status: varchar("status", { length: 50 }).default("online"),
  recordedAt: timestamp("recorded_at").defaultNow(),
});

// Flood predictions table
export const floodPredictions = pgTable("flood_predictions", {
  id: serial("id").primaryKey(),
  damId: integer("dam_id").references(() => dams.id),
  floodProbability: real("flood_probability"),
  floodDepth: real("flood_depth"),
  affectedPopulation: integer("affected_population"),
  floodDuration: real("flood_duration"), // in hours
  affectedVillages: jsonb("affected_villages"),
  riskScore: real("risk_score"),
  aiRecommendations: jsonb("ai_recommendations"),
  predictedAt: timestamp("predicted_at").defaultNow(),
});

// Historical data table
export const historicalData = pgTable("historical_data", {
  id: serial("id").primaryKey(),
  damId: integer("dam_id").references(() => dams.id),
  waterLevel: real("water_level"),
  storagePercentage: real("storage_percentage"),
  rainfall: real("rainfall"),
  discharge: real("discharge"),
  inflowRate: real("inflow_rate"),
  outflowRate: real("outflow_rate"),
  gatesOpen: integer("gates_open"),
  recordedAt: timestamp("recorded_at").defaultNow(),
});

// Emergency contacts table
export const emergencyContacts = pgTable("emergency_contacts", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  designation: varchar("designation", { length: 255 }),
  department: varchar("department", { length: 100 }), // police, fire, hospital, ambulance, disaster_management
  phone: varchar("phone", { length: 20 }),
  phone2: varchar("phone2", { length: 20 }),
  email: varchar("email", { length: 255 }),
  district: varchar("district", { length: 100 }),
  state: varchar("state", { length: 100 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Gate operations log
export const gateOperations = pgTable("gate_operations", {
  id: serial("id").primaryKey(),
  damId: integer("dam_id").references(() => dams.id),
  gateNumber: integer("gate_number"),
  action: varchar("action", { length: 50 }), // open, close
  openingPercentage: real("opening_percentage"),
  operatedBy: integer("operated_by").references(() => users.id),
  reason: text("reason"),
  operatedAt: timestamp("operated_at").defaultNow(),
});

// Audit logs
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  action: varchar("action", { length: 255 }),
  resource: varchar("resource", { length: 100 }),
  resourceId: integer("resource_id"),
  details: jsonb("details"),
  ipAddress: varchar("ip_address", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow(),
});
