"use client";
import { useAppStore } from "@/store/useAppStore";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const moduleLabels: Record<string, string> = {
  dashboard: "Dashboard",
  dams: "Dam Monitoring",
  prediction: "Water Release Prediction",
  alerts: "Alert System",
  villages: "Village Management",
  map: "Interactive GIS Map",
  weather: "Weather Monitoring",
  flood: "Flood Prediction",
  ai: "AI Analysis",
  emergency: "Emergency Response",
  analytics: "Historical Analytics",
  reports: "Reports",
  iot: "IoT Integration",
  users: "User Management",
};

export default function Topbar() {
  const { activeModule, isDarkMode, toggleDarkMode, notifications, clearNotification, user, setUser } = useAppStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    window.location.reload();
  };

  return (
    <header className={`h-16 flex items-center justify-between px-6 border-b shadow-sm ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
      <div>
        <h2 className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-800"}`}>
          {moduleLabels[activeModule] || "Dashboard"}
        </h2>
        <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
          {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Status indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          Live
        </div>

        {/* Dark mode */}
        <button
          onClick={toggleDarkMode}
          className={`p-2 rounded-lg transition-colors ${isDarkMode ? "bg-gray-700 text-yellow-400 hover:bg-gray-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
        >
          {isDarkMode ? "☀️" : "🌙"}
        </button>

        {/* Location Detector */}
        <a
          href="/locate-user"
          className={`p-2 rounded-lg transition-colors ${isDarkMode ? "bg-gray-700 text-purple-400 hover:bg-gray-600" : "bg-gray-100 text-purple-600 hover:bg-gray-200"}`}
          title="Locate User by Mobile or Email"
        >
          📍
        </a>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`relative p-2 rounded-lg transition-colors ${isDarkMode ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >
            🔔
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {notifications.length}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`absolute right-0 top-12 w-80 ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border rounded-xl shadow-xl z-50`}
              >
                <div className="p-3 border-b border-gray-200">
                  <h3 className={`font-semibold text-sm ${isDarkMode ? "text-white" : "text-gray-800"}`}>Notifications</h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className={`p-4 text-sm text-center ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>No new notifications</p>
                  ) : (
                    notifications.map((n) => (
                      <div key={n.id} className={`p-3 border-b ${isDarkMode ? "border-gray-700" : "border-gray-100"} flex gap-2`}>
                        <span className="text-base">
                          {n.level === "red" ? "🚨" : n.level === "orange" ? "⚠️" : n.level === "yellow" ? "⚡" : "ℹ️"}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>{n.message}</p>
                        </div>
                        <button onClick={() => clearNotification(n.id)} className="text-gray-400 hover:text-red-500 text-xs">✕</button>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User menu */}
        {user && (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${isDarkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-100 hover:bg-gray-200"}`}
            >
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {user.name.charAt(0)}
              </div>
              <span className={`text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>{user.name.split(" ")[0]}</span>
              <span className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>▼</span>
            </button>
            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`absolute right-0 top-10 w-44 ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border rounded-xl shadow-xl z-50`}
                >
                  <div className="p-2">
                    <div className={`px-3 py-2 text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"} border-b ${isDarkMode ? "border-gray-700" : "border-gray-100"} mb-1`}>
                      {user.role.replace("_", " ")}
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      🚪 Logout
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </header>
  );
}
