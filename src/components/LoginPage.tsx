"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";

export default function LoginPage() {
  const [email, setEmail] = useState("admin@damguard.gov.in");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { setUser } = useAppStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Login failed");
      } else {
        setUser(json.user);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const demoAccounts = [
    { label: "Admin", email: "admin@damguard.gov.in", role: "Full access" },
    { label: "Operator", email: "operator@damguard.gov.in", role: "Dam operations" },
    { label: "Officer", email: "officer@damguard.gov.in", role: "Gov. oversight" },
    { label: "Citizen", email: "citizen@example.com", role: "Public view" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
        backgroundSize: "40px 40px",
      }} />

      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center relative z-10">
        {/* Left: Branding */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="text-white space-y-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-4xl shadow-xl">
              💧
            </div>
            <div>
              <h1 className="text-4xl font-bold">DamGuard</h1>
              <p className="text-blue-200">Smart Dam Monitoring System</p>
            </div>
          </div>

          <p className="text-blue-100 text-lg leading-relaxed">
            Real-time dam monitoring, flood prediction, and emergency alert management for India's water infrastructure.
          </p>

          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: "🏗️", label: "5 Dams", sub: "Monitored" },
              { icon: "🌊", label: "Real-time", sub: "Water Levels" },
              { icon: "🤖", label: "AI-Powered", sub: "Predictions" },
              { icon: "🚨", label: "Instant", sub: "Alerts" },
            ].map((item) => (
              <div key={item.label} className="bg-white/10 backdrop-blur-sm rounded-xl p-3 flex items-center gap-3">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <p className="font-bold text-sm">{item.label}</p>
                  <p className="text-blue-200 text-xs">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-xs text-blue-300">
            🔒 Government of India | Ministry of Jal Shakti | Secure Authentication
          </div>
        </motion.div>

        {/* Right: Login Form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white rounded-3xl p-8 shadow-2xl"
        >
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Welcome Back</h2>
            <p className="text-gray-500 text-sm mt-1">Sign in to your DamGuard account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.gov.in"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-xl"
              >
                ⚠️ {error}
              </motion.div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Signing in...</>
              ) : (
                "Sign In to DamGuard"
              )}
            </motion.button>
          </form>

          {/* Demo accounts */}
          <div className="mt-6">
            <p className="text-xs text-gray-400 text-center mb-3">🔑 Demo Accounts (password: admin123)</p>
            <div className="grid grid-cols-2 gap-2">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.email}
                  onClick={() => { setEmail(acc.email); setPassword("admin123"); }}
                  className="text-left p-2.5 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 rounded-xl transition-all"
                >
                  <p className="text-xs font-semibold text-gray-700">{acc.label}</p>
                  <p className="text-xs text-gray-400">{acc.role}</p>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
