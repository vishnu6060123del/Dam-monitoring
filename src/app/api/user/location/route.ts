import { NextResponse } from "next/server";

// Mock database of users with their locations
const MOCK_USER_LOCATIONS = [
  {
    id: 1,
    name: "Rajesh Kumar",
    email: "rajesh.kumar@damguard.gov.in",
    mobile: "9876543210",
    damName: "Rajgarh Dam",
    location: { lat: 23.1815, lng: 75.8624 },
    district: "Rajgarh",
    state: "Madhya Pradesh",
    role: "Dam Operator",
    lastActive: new Date().toISOString(),
  },
  {
    id: 2,
    name: "Priya Sharma",
    email: "priya.sharma@damguard.gov.in",
    mobile: "9876543211",
    damName: "Narmada Dam",
    location: { lat: 21.8132, lng: 73.8291 },
    district: "Vadodara",
    state: "Gujarat",
    role: "Government Officer",
    lastActive: new Date().toISOString(),
  },
  {
    id: 3,
    name: "Arjun Singh",
    email: "arjun.singh@damguard.gov.in",
    mobile: "9876543212",
    damName: "Krishna Dam",
    location: { lat: 16.4521, lng: 81.0901 },
    district: "Kurnool",
    state: "Andhra Pradesh",
    role: "Dam Operator",
    lastActive: new Date().toISOString(),
  },
  {
    id: 4,
    name: "Neha Patel",
    email: "neha.patel@damguard.gov.in",
    mobile: "9876543213",
    damName: "Godavari Dam",
    location: { lat: 18.4386, lng: 78.5278 },
    district: "Karimnagar",
    state: "Telangana",
    role: "Government Officer",
    lastActive: new Date().toISOString(),
  },
  {
    id: 5,
    name: "Vikram Reddy",
    email: "vikram.reddy@damguard.gov.in",
    mobile: "9876543214",
    damName: "Tungabhadra Dam",
    location: { lat: 15.2993, lng: 76.4992 },
    district: "Ballari",
    state: "Karnataka",
    role: "Dam Operator",
    lastActive: new Date().toISOString(),
  },
];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { mobile, email, ipAddress } = body;

    if (!mobile && !email && !ipAddress) {
      return NextResponse.json(
        { error: "Mobile number, email, or IP address is required" },
        { status: 400 }
      );
    }

    // Search by mobile number
    if (mobile) {
      const user = MOCK_USER_LOCATIONS.find(
        (u) => u.mobile === mobile || u.mobile.includes(mobile.slice(-4))
      );
      if (user) {
        return NextResponse.json({
          found: true,
          user,
          confidence: "HIGH",
          timestamp: new Date().toISOString(),
        });
      }
    }

    // Search by email
    if (email) {
      const user = MOCK_USER_LOCATIONS.find(
        (u) => u.email.toLowerCase() === email.toLowerCase()
      );
      if (user) {
        return NextResponse.json({
          found: true,
          user,
          confidence: "HIGH",
          timestamp: new Date().toISOString(),
        });
      }
    }

    // Simulate IP-based geolocation
    if (ipAddress) {
      // In production, you'd use a real geolocation API like MaxMind GeoIP2
      // For now, return a mock location based on IP pattern
      const ipSegments = ipAddress.split(".");
      const mockUser = MOCK_USER_LOCATIONS[parseInt(ipSegments[2]) % 5];

      return NextResponse.json({
        found: false,
        approximateLocation: {
          lat: mockUser.location.lat + Math.random() * 0.5,
          lng: mockUser.location.lng + Math.random() * 0.5,
          district: mockUser.district,
          state: mockUser.state,
        },
        confidence: "LOW",
        message: "User not found, but location detected from IP",
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json(
      { error: "User not found" },
      { status: 404 }
    );
  } catch (error) {
    console.error("Location lookup error:", error);
    return NextResponse.json(
      { error: "Failed to lookup user location" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    // Extract client IP from request headers
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";

    // Get all users for reference (admin endpoint)
    return NextResponse.json({
      users: MOCK_USER_LOCATIONS,
      requestingIp: ip,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
