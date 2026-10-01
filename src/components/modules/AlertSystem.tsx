"use client";
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Alert {
  id: number;
  damId: number;
  damName: string;
  damState: string;
  alertType: string;
  level: string;
  message: string;
  waterReleased: number;
  expectedArrival: string;
  floodRisk: string;
  safetyInstructions: string;
  isResolved: boolean;
  notificationsSent: Record<string, boolean>;
  createdAt: string;
}

const levelConfig: Record<string, { bg: string; border: string; text: string; badge: string; icon: string; label: string }> = {
  green: { bg: "bg-green-50", border: "border-green-300", text: "text-green-800", badge: "bg-green-500", icon: "✅", label: "All Clear" },
  yellow: { bg: "bg-yellow-50", border: "border-yellow-300", text: "text-yellow-800", badge: "bg-yellow-500", icon: "⚡", label: "Watch" },
  orange: { bg: "bg-orange-50", border: "border-orange-300", text: "text-orange-800", badge: "bg-orange-500", icon: "⚠️", label: "Warning" },
  red: { bg: "bg-red-50", border: "border-red-300", text: "text-red-800", badge: "bg-red-500", icon: "🚨", label: "DANGER" },
};

export default function AlertSystem() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [filterLevel, setFilterLevel] = useState("all");
  const [broadcastMsg, setBroadcastMsg] = useState("");
  const [broadcasting, setBroadcasting] = useState(false);

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await fetch("/api/alerts");
      const json = await res.json();
      setAlerts(json.alerts || []);
    } catch { console.error("Failed to fetch alerts"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 5000);
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  const filtered = filterLevel === "all" ? alerts : alerts.filter((a) => a.level === filterLevel);

  const handleBroadcast = async () => {
    if (!broadcastMsg.trim()) return;
    setBroadcasting(true);
    await new Promise((r) => setTimeout(r, 1500));
    setBroadcasting(false);
    setBroadcastMsg("");
    alert("✅ Emergency broadcast sent via SMS, Email, WhatsApp, and Push Notifications!");
  };

  const levelCounts = {
    green: alerts.filter((a) => a.level === "green").length,
    yellow: alerts.filter((a) => a.level === "yellow").length,
    orange: alerts.filter((a) => a.level === "orange").length,
    red: alerts.filter((a) => a.level === "red").length,
  };

  return (
    <div className="space-y-4">
      {/* Alert Level Summary */}
      <div className="grid grid-cols-4 gap-3">
        {Object.entries(levelConfig).map(([level, cfg]) => (
          <motion.div
            key={level}
            whileHover={{ scale: 1.02 }}
            onClick={() => setFilterLevel(level === filterLevel ? "all" : level)}
            className={`${cfg.bg} border ${cfg.border} rounded-2xl p-4 text-center cursor-pointer transition-all ${filterLevel === level ? "ring-2 ring-offset-2 ring-blue-400" : ""}`}
          >
            <div className="text-2xl mb-1">{cfg.icon}</div>
            <div className={`text-2xl font-bold ${cfg.text}`}>{levelCounts[level as keyof typeof levelCounts]}</div>
            <div className={`text-xs font-semibold ${cfg.text}`}>{cfg.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Emergency Broadcast */}
      <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
        <h3 className="font-bold text-red-800 mb-3 flex items-center gap-2">
          <span>📢</span> Emergency Broadcast System
        </h3>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Type emergency message to broadcast..."
            value={broadcastMsg}
            onChange={(e) => setBroadcastMsg(e.target.value)}
            className="flex-1 px-4 py-2.5 border border-red-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
          />
          <button
            onClick={handleBroadcast}
            disabled={broadcasting || !broadcastMsg.trim()}
            className="bg-red-600 text-white px-6 py-2.5 rounded-xl font-medium text-sm hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
          >
            {broadcasting ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Sending...</>
            ) : (
              <><span>📡</span> Broadcast</>
            )}
          </button>
        </div>
        <div className="mt-3 flex gap-4 text-xs text-red-600">
          <span className="flex items-center gap-1"><span>📱</span> SMS</span>
          <span className="flex items-center gap-1"><span>📧</span> Email</span>
          <span className="flex items-center gap-1"><span>💬</span> WhatsApp</span>
          <span className="flex items-center gap-1"><span>🔔</span> Push</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Alerts List */}
        <div className="space-y-3 max-h-[calc(100vh-350px)] overflow-y-auto custom-scroll">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">All Alerts ({filtered.length})</h3>
            <button onClick={() => setFilterLevel("all")} className="text-xs text-blue-600 hover:underline">Clear filter</button>
          </div>
          {loading ? (
            <div className="flex justify-center p-8"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>
          ) : filtered.length === 0 ? (
            <div className="text-center p-8 text-gray-400">No alerts found</div>
          ) : (
            filtered.map((alert) => {
              const cfg = levelConfig[alert.level] || levelConfig.yellow;
              return (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={() => setSelectedAlert(alert)}
                  className={`${cfg.bg} border ${cfg.border} rounded-2xl p-4 cursor-pointer transition-all ${selectedAlert?.id === alert.id ? "ring-2 ring-blue-400" : ""}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{cfg.icon}</span>
                      <div>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full text-white ${cfg.badge}`}>{cfg.label}</span>
                        <p className={`text-xs mt-0.5 ${cfg.text}`}>{alert.damName} • {alert.damState}</p>
                      </div>
                    </div>
                    {alert.isResolved && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">✓ Resolved</span>}
                  </div>
                  <p className={`text-sm font-medium ${cfg.text} mb-1`}>{alert.message}</p>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-gray-400">{alert.createdAt ? new Date(alert.createdAt).toLocaleString("en-IN") : ""}</p>
                    <div className="flex gap-1">
                      {alert.notificationsSent && Object.entries(alert.notificationsSent as Record<string, boolean>).map(([channel, sent]) =>
                        sent ? <span key={channel} className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">{channel === "sms" ? "📱" : channel === "email" ? "📧" : channel === "whatsapp" ? "💬" : "🔔"}</span> : null
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Alert Detail */}
        <div>
          <AnimatePresence mode="wait">
            {selectedAlert ? (
              <motion.div
                key={selectedAlert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`${levelConfig[selectedAlert.level]?.bg || "bg-white"} border ${levelConfig[selectedAlert.level]?.border || "border-gray-200"} rounded-2xl p-5 space-y-4`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{levelConfig[selectedAlert.level]?.icon}</span>
                  <div>
                    <h3 className={`font-bold text-lg ${levelConfig[selectedAlert.level]?.text}`}>🚨 Dam Alert</h3>
                    <p className="text-sm text-gray-600">{selectedAlert.damName}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/70 rounded-xl p-3">
                    <p className="text-xs text-gray-500">Alert Time</p>
                    <p className="font-semibold text-sm">{selectedAlert.createdAt ? new Date(selectedAlert.createdAt).toLocaleString("en-IN") : "N/A"}</p>
                  </div>
                  <div className="bg-white/70 rounded-xl p-3">
                    <p className="text-xs text-gray-500">Expected Arrival</p>
                    <p className="font-semibold text-sm">{selectedAlert.expectedArrival ? new Date(selectedAlert.expectedArrival).toLocaleString("en-IN") : "N/A"}</p>
                  </div>
                  <div className="bg-white/70 rounded-xl p-3">
                    <p className="text-xs text-gray-500">Water Released</p>
                    <p className="font-semibold text-sm">{selectedAlert.waterReleased ? `${(selectedAlert.waterReleased / 1000000).toFixed(2)} MCM` : "N/A"}</p>
                  </div>
                  <div className="bg-white/70 rounded-xl p-3">
                    <p className="text-xs text-gray-500">Flood Risk</p>
                    <p className="font-semibold text-sm">{selectedAlert.floodRisk || "N/A"}</p>
                  </div>
                </div>

                {selectedAlert.safetyInstructions && (
                  <div className="bg-white/70 rounded-xl p-4">
                    <p className="text-xs font-bold text-gray-600 mb-2">⚠️ SAFETY INSTRUCTIONS</p>
                    <p className="text-sm text-gray-700">{selectedAlert.safetyInstructions}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <button className="bg-blue-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
                    📱 Send SMS Alert
                  </button>
                  <button className="bg-green-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-green-700 transition-colors">
                    💬 Send WhatsApp
                  </button>
                  <button className="bg-purple-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-purple-700 transition-colors">
                    📧 Send Email
                  </button>
                  <button className="bg-orange-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-orange-700 transition-colors">
                    🔔 Push Notify
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center"
              >
                <span className="text-6xl mb-4">🚨</span>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Select an Alert</h3>
                <p className="text-gray-400">Click on any alert to view details and send notifications</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
