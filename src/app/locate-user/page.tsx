"use client";
import { motion } from "framer-motion";
import LocationDetector from "@/components/LocationDetector";

export default function LocateUserPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-12 px-4"
      >
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-3">DamGuard User Location Finder</h1>
          <p className="text-lg text-blue-100">
            Quickly locate dam officials and staff across India's water infrastructure network
          </p>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto py-12 px-4">
        <LocationDetector />

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-12 grid md:grid-cols-3 gap-6"
        >
          <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-blue-500">
            <h3 className="text-xl font-bold text-gray-900 mb-2">🔍 Mobile Lookup</h3>
            <p className="text-gray-600 text-sm">
              Search for users by their mobile number and instantly retrieve their location and assignment details.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-indigo-500">
            <h3 className="text-xl font-bold text-gray-900 mb-2">📧 Email Search</h3>
            <p className="text-gray-600 text-sm">
              Find officials by their email address with high-confidence identification across all dam locations.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-purple-500">
            <h3 className="text-xl font-bold text-gray-900 mb-2">🌍 Geolocation</h3>
            <p className="text-gray-600 text-sm">
              Use browser geolocation or IP-based detection to identify nearest dam facilities and staff.
            </p>
          </div>
        </motion.div>

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 bg-white rounded-xl p-8 shadow-lg"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">About This Feature</h2>
          <div className="space-y-4 text-gray-700">
            <p>
              <strong>Purpose:</strong> The User Location Detector helps rapidly identify and locate DamGuard personnel across India's vast network of water management facilities.
            </p>
            <p>
              <strong>How It Works:</strong> By providing your mobile number or email address, you can instantly retrieve your location profile including your assigned dam, district, state, and precise geographic coordinates.
            </p>
            <p>
              <strong>Privacy & Security:</strong> This feature uses encrypted lookups against our secure database. All location data is logged and can only be accessed by authorized personnel.
            </p>
            <p>
              <strong>Use Cases:</strong>
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Emergency response coordination</li>
              <li>Staff location verification during critical situations</li>
              <li>Resource allocation and dispatch optimization</li>
              <li>Multi-site personnel tracking</li>
              <li>Incident response team mobilization</li>
            </ul>
          </div>
        </motion.div>

        {/* Coverage Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-8 border border-green-200"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Coverage Across India</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-green-900 mb-3">🏗️ Major Dams Covered:</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>✅ Rajgarh Dam (Madhya Pradesh)</li>
                <li>✅ Narmada Dam (Gujarat)</li>
                <li>✅ Krishna Dam (Andhra Pradesh)</li>
                <li>✅ Godavari Dam (Telangana)</li>
                <li>✅ Tungabhadra Dam (Karnataka)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-green-900 mb-3">👥 Personnel Types:</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>✅ Dam Operators</li>
                <li>✅ Government Officers</li>
                <li>✅ Emergency Response Teams</li>
                <li>✅ Maintenance Staff</li>
                <li>✅ Administrative Personnel</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
