"use client";
import { useState } from "react";
import { motion } from "framer-motion";

interface UserLocation {
  id: number;
  name: string;
  email: string;
  mobile: string;
  damName: string;
  location: { lat: number; lng: number };
  district: string;
  state: string;
  role: string;
  lastActive: string;
}

interface LocationResult {
  found: boolean;
  user?: UserLocation;
  approximateLocation?: { lat: number; lng: number; district: string; state: string };
  confidence: string;
  message?: string;
  timestamp: string;
}

export default function LocationDetector() {
  const [searchType, setSearchType] = useState<"mobile" | "email">("mobile");
  const [searchValue, setSearchValue] = useState("");
  const [result, setResult] = useState<LocationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showBrowserLocation, setShowBrowserLocation] = useState(false);
  const [browserLocation, setBrowserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const payload =
        searchType === "mobile"
          ? { mobile: searchValue }
          : { email: searchValue };

      const res = await fetch("/api/user/location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to lookup location");
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleGetBrowserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setBrowserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setShowBrowserLocation(true);
        },
        (error) => {
          setError(`Geolocation error: ${error.message}`);
        }
      );
    } else {
      setError("Geolocation is not supported by your browser");
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100"
      >
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-2xl">
              📍
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">User Location Detector</h2>
              <p className="text-sm text-gray-500">Find dam officials and staff by their contact information</p>
            </div>
          </div>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-8 space-y-4">
          {/* Search Type Tabs */}
          <div className="flex gap-2 mb-4">
            <button
              type="button"
              onClick={() => {
                setSearchType("mobile");
                setSearchValue("");
                setResult(null);
              }}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                searchType === "mobile"
                  ? "bg-blue-500 text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              📱 Mobile Number
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchType("email");
                setSearchValue("");
                setResult(null);
              }}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                searchType === "email"
                  ? "bg-blue-500 text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              ✉️ Email Address
            </button>
          </div>

          {/* Input Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {searchType === "mobile" ? "Mobile Number" : "Email Address"}
            </label>
            <input
              type={searchType === "mobile" ? "tel" : "email"}
              placeholder={searchType === "mobile" ? "e.g., 9876543210" : "e.g., user@damguard.gov.in"}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Search Button */}
          <button
            type="submit"
            disabled={loading || !searchValue}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? "🔍 Searching..." : "🔍 Search Location"}
          </button>
        </form>

        {/* Browser Geolocation */}
        <div className="mb-6 pb-6 border-b border-gray-200">
          <button
            type="button"
            onClick={handleGetBrowserLocation}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2 px-4 rounded-lg font-medium hover:shadow-md transition-all"
          >
            🌍 Use My Current Location
          </button>
          {browserLocation && (
            <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-700">
                📍 <strong>Your Location:</strong> Latitude {browserLocation.lat.toFixed(4)}, Longitude{" "}
                {browserLocation.lng.toFixed(4)}
              </p>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
          >
            <p className="text-red-700 font-medium">❌ {error}</p>
          </motion.div>
        )}

        {/* Results */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {result.found ? (
              <>
                {/* Found User */}
                <div className="bg-green-50 border-2 border-green-400 rounded-xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-green-900">{result.user?.name}</h3>
                      <p className="text-sm text-green-700 mt-1">
                        ✅ <strong>HIGH CONFIDENCE</strong> - Exact match found
                      </p>
                    </div>
                    <div className="text-4xl">✅</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-green-600 uppercase font-semibold">Mobile</p>
                      <p className="text-lg font-mono text-green-900">{result.user?.mobile}</p>
                    </div>
                    <div>
                      <p className="text-xs text-green-600 uppercase font-semibold">Email</p>
                      <p className="text-lg text-green-900 break-all">{result.user?.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-green-600 uppercase font-semibold">Dam Assignment</p>
                      <p className="text-lg font-semibold text-green-900">{result.user?.damName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-green-600 uppercase font-semibold">Role</p>
                      <p className="text-lg text-green-900">{result.user?.role}</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4 mb-4">
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>📍 Location:</strong>
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-green-100 p-3 rounded">
                        <p className="text-xs text-gray-600">District</p>
                        <p className="font-bold text-green-900">{result.user?.district}</p>
                      </div>
                      <div className="bg-green-100 p-3 rounded">
                        <p className="text-xs text-gray-600">State</p>
                        <p className="font-bold text-green-900">{result.user?.state}</p>
                      </div>
                      <div className="bg-green-100 p-3 rounded col-span-2">
                        <p className="text-xs text-gray-600">Coordinates</p>
                        <p className="font-mono text-sm text-green-900">
                          {result.user?.location.lat.toFixed(4)}°, {result.user?.location.lng.toFixed(4)}°
                        </p>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500">
                    Last active: {new Date(result.user?.lastActive || "").toLocaleString()}
                  </p>
                </div>
              </>
            ) : (
              <>
                {/* Not Found */}
                <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-yellow-900">User Not Found</h3>
                      <p className="text-sm text-yellow-700 mt-1">
                        ⚠️ <strong>LOW CONFIDENCE</strong> - {result.message}
                      </p>
                    </div>
                    <div className="text-4xl">🔍</div>
                  </div>

                  {result.approximateLocation && (
                    <div className="bg-white rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-3">
                        <strong>Approximate Location (from IP):</strong>
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-yellow-100 p-3 rounded">
                          <p className="text-xs text-gray-600">District</p>
                          <p className="font-bold text-yellow-900">{result.approximateLocation.district}</p>
                        </div>
                        <div className="bg-yellow-100 p-3 rounded">
                          <p className="text-xs text-gray-600">State</p>
                          <p className="font-bold text-yellow-900">{result.approximateLocation.state}</p>
                        </div>
                        <div className="bg-yellow-100 p-3 rounded col-span-2">
                          <p className="text-xs text-gray-600">Coordinates</p>
                          <p className="font-mono text-sm text-yellow-900">
                            {result.approximateLocation.lat.toFixed(4)}°, {result.approximateLocation.lng.toFixed(4)}°
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            <p className="text-xs text-gray-500 text-center">
              Detection timestamp: {new Date(result.timestamp).toLocaleString()}
            </p>
          </motion.div>
        )}

        {/* Sample Data Hint */}
        {!result && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-700 mb-2">
              <strong>💡 Sample data for testing:</strong>
            </p>
            <div className="text-xs text-blue-600 space-y-1">
              <p>Mobile: <code className="bg-white px-2 py-1 rounded">9876543210</code> - Rajesh Kumar</p>
              <p>Email: <code className="bg-white px-2 py-1 rounded">priya.sharma@damguard.gov.in</code> - Priya Sharma</p>
              <p>Mobile: <code className="bg-white px-2 py-1 rounded">9876543212</code> - Arjun Singh</p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
