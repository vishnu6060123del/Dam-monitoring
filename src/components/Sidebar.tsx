"use client";
import { useAppStore } from "@/store/useAppStore";
import { motion } from "framer-motion";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: "🏠" },
  { id: "dams", label: "Dam Monitoring", icon: "🏗️" },
  { id: "prediction", label: "Water Release", icon: "💧" },
  { id: "alerts", label: "Alert System", icon: "🚨" },
  { id: "villages", label: "Villages", icon: "🏘️" },
  { id: "map", label: "GIS Map", icon: "🗺️" },
  { id: "weather", label: "Weather", icon: "⛅" },
  { id: "flood", label: "Flood Prediction", icon: "🌊" },
  { id: "ai", label: "AI Analysis", icon: "🤖" },
  { id: "emergency", label: "Emergency", icon: "🚑" },
  { id: "analytics", label: "Analytics", icon: "📈" },
  { id: "reports", label: "Reports", icon: "📄" },
  { id: "iot", label: "IoT Sensors", icon: "📡" },
  { id: "users", label: "User Management", icon: "👥" },
  { id: "logs", label: "System Logs", icon: "📋" },
];

export default function Sidebar() {
  const { activeModule, setActiveModule, isDarkMode, user } = useAppStore();

  const visibleItems = navItems.filter((item) => {
    if (item.id === "logs") return user?.role === "admin";
    if (user?.role === "citizen") return ["dashboard", "alerts", "weather", "map", "flood", "villages"].includes(item.id);
    if (user?.role === "dam_operator") return !["users", "reports"].includes(item.id) || true;
    return true;
  });

  return (
    <aside className={`w-64 h-full flex flex-col ${isDarkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"} border-r shadow-lg`}>
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white text-xl">💧</span>
          </div>
          <div>
            <h1 className={`font-bold text-lg leading-none ${isDarkMode ? "text-white" : "text-gray-900"}`}>DamGuard</h1>
            <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Smart Monitoring</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 custom-scroll">
        <div className="px-3 space-y-1">
          {navItems.map((item) => (
            <motion.button
              key={item.id}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveModule(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeModule === item.id
                  ? "bg-blue-600 text-white shadow-md"
                  : isDarkMode
                  ? "text-gray-300 hover:bg-gray-800"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
              {item.id === "alerts" && (
                <span className="ml-auto bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">3</span>
              )}
            </motion.button>
          ))}
        </div>
      </nav>

      {/* User info */}
      {user && (
        <div className={`px-4 py-4 border-t ${isDarkMode ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-gray-50"}`}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className={`text-sm font-medium truncate ${isDarkMode ? "text-white" : "text-gray-800"}`}>{user.name}</p>
              <p className={`text-xs truncate capitalize ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                {user.role.replace("_", " ")}
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
