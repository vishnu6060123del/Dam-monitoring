"use client";
import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";

interface DashboardData {
  totalDams: number;
  totalGatesOpen: number;
  totalInflow: number;
  totalOutflow: number;
  avgWaterLevel: number;
  avgStoragePct: number;
  activeAlerts: number;
  statusCounts: { normal: number; watch: number; warning: number; danger: number };
  dams: DamItem[];
  alerts: AlertItem[];
  lastUpdated: string;
}

interface DamItem {
  id: number;
  name: string;
  riverName: string;
  state: string;
  waterLevel: number;
  maxWaterLevel: number;
  currentCapacity: number;
  maxCapacity: number;
  inflowRate: number;
  outflowRate: number;
  gatesOpen: number;
  totalGates: number;
  safetyStatus: string;
  lastUpdated: string;
}

interface AlertItem {
  id: number;
  level: string;
  message: string;
  createdAt: string;
  damName: string;
}

const statusConfig: Record<string, { color: string; bg: string; label: string; icon: string }> = {
  normal: { color: "text-green-700", bg: "bg-green-100", label: "Normal", icon: "✅" },
  watch: { color: "text-yellow-700", bg: "bg-yellow-100", label: "Watch", icon: "👁️" },
  warning: { color: "text-orange-700", bg: "bg-orange-100", label: "Warning", icon: "⚠️" },
  danger: { color: "text-red-700", bg: "bg-red-100", label: "Danger", icon: "🚨" },
};

function StatCard({ icon, label, value, sub, color, onClick }: { icon: string; label: string; value: string | number; sub?: string; color: string; onClick?: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, boxShadow: "0 8px 25px rgba(0,0,0,0.1)" }}
      onClick={onClick}
      className={`bg-white rounded-2xl p-5 shadow-sm border border-gray-100 ${onClick ? "cursor-pointer" : ""}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{label}</p>
          <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${color.replace("text-", "bg-").replace("-600", "-100").replace("-700", "-100")}`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
}

function WaterLevelBar({ level, max, label }: { level: number; max: number; label: string }) {
  const pct = Math.min((level / max) * 100, 100);
  const color = pct > 90 ? "bg-red-500" : pct > 75 ? "bg-orange-500" : pct > 50 ? "bg-yellow-500" : "bg-blue-500";
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs mb-1">
        <span className="font-medium text-gray-700">{label}</span>
        <span className={`font-bold ${pct > 90 ? "text-red-600" : pct > 75 ? "text-orange-600" : "text-blue-600"}`}>{pct.toFixed(1)}%</span>
      </div>
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-400 mt-0.5">
        <span>{level.toFixed(1)} m</span>
        <span>Max: {max} m</span>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const { isDarkMode, setActiveModule, setSelectedDamId, addNotification } = useAppStore();

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const json = await res.json();
      if (json && json.totalDams) {
        setData(json);
      } else {
        console.error("Invalid dashboard data received:", json);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  useEffect(() => {
    if (data?.statusCounts.danger && data.statusCounts.danger > 0) {
      addNotification({ message: `⚠️ ${data.statusCounts.danger} dam(s) in DANGER status!`, level: "red" });
    }
  }, [data?.statusCounts.danger]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-500">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (!data) return <div className="text-center text-red-500 p-8">Failed to load dashboard data</div>;

  const totalCapacity = data.dams.reduce((s, d) => s + (d.maxCapacity || 0), 0);
  const currentStorage = data.dams.reduce((s, d) => s + (d.currentCapacity || 0), 0);

  return (
    <div className="space-y-6">
      {/* Alert Banner */}
      {data.statusCounts.danger > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3"
        >
          <span className="text-2xl animate-bounce">🚨</span>
          <div>
            <p className="font-bold text-red-800">CRITICAL ALERT: {data.statusCounts.danger} dam(s) in DANGER status!</p>
            <p className="text-red-600 text-sm">Immediate action required. Check dam monitoring module.</p>
          </div>
          <button onClick={() => setActiveModule("alerts")} className="ml-auto bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700">
            View Alerts →
          </button>
        </motion.div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="🏗️" label="Total Dams Monitored" value={data.totalDams} sub="Active monitoring" color="text-blue-600" onClick={() => setActiveModule("dams")} />
        <StatCard icon="📊" label="Avg Storage" value={`${data.avgStoragePct.toFixed(1)}%`} sub={`${(currentStorage / 1000).toFixed(1)} BCM stored`} color="text-indigo-600" />
        <StatCard icon="⬇️" label="Total Inflow" value={`${(data.totalInflow / 1000).toFixed(0)}k`} sub="cusecs across all dams" color="text-cyan-600" />
        <StatCard icon="⬆️" label="Total Outflow" value={`${(data.totalOutflow / 1000).toFixed(0)}k`} sub="cusecs released" color="text-teal-600" />
        <StatCard icon="🚪" label="Gates Open" value={data.totalGatesOpen} sub="Across all dams" color="text-orange-600" onClick={() => setActiveModule("dams")} />
        <StatCard icon="🚨" label="Active Alerts" value={data.activeAlerts} sub="Unresolved alerts" color="text-red-600" onClick={() => setActiveModule("alerts")} />
        <StatCard icon="✅" label="Safe Dams" value={data.statusCounts.normal} sub="Normal operation" color="text-green-600" />
        <StatCard icon="⚠️" label="Critical Dams" value={data.statusCounts.warning + data.statusCounts.danger} sub="Needs attention" color="text-red-600" />
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-4 gap-3">
        {Object.entries(statusConfig).map(([status, cfg]) => (
          <div key={status} className={`${cfg.bg} rounded-xl p-4 text-center`}>
            <div className="text-2xl mb-1">{cfg.icon}</div>
            <div className={`text-2xl font-bold ${cfg.color}`}>{data.statusCounts[status as keyof typeof data.statusCounts]}</div>
            <div className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</div>
          </div>
        ))}
      </div>

      {/* Dam Water Levels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">💧 Water Level Status</h3>
            <button onClick={() => setActiveModule("dams")} className="text-blue-600 text-sm hover:underline">View all →</button>
          </div>
          <div className="space-y-2">
            {data.dams.map((dam) => (
              <WaterLevelBar
                key={dam.id}
                label={dam.name}
                level={dam.waterLevel || 0}
                max={dam.maxWaterLevel || 100}
              />
            ))}
          </div>
        </div>

        {/* Dam Cards */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">🏗️ Dam Status Overview</h3>
            <button onClick={() => setActiveModule("dams")} className="text-blue-600 text-sm hover:underline">Manage →</button>
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto custom-scroll">
            {data.dams.map((dam) => {
              const cfg = statusConfig[dam.safetyStatus] || statusConfig.normal;
              return (
                <motion.div
                  key={dam.id}
                  whileHover={{ x: 4 }}
                  onClick={() => { setSelectedDamId(dam.id); setActiveModule("dams"); }}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer border border-gray-100"
                >
                  <div className={`w-10 h-10 ${cfg.bg} rounded-lg flex items-center justify-center text-lg`}>
                    {cfg.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 text-sm truncate">{dam.name}</p>
                    <p className="text-xs text-gray-500">{dam.riverName} • {dam.state}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
                    <p className="text-xs text-gray-400 mt-0.5">{dam.gatesOpen}/{dam.totalGates} gates</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Alerts */}
      {data.alerts.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">🚨 Recent Alerts</h3>
            <button onClick={() => setActiveModule("alerts")} className="text-blue-600 text-sm hover:underline">View all →</button>
          </div>
          <div className="space-y-2">
            {data.alerts.map((alert) => {
              const levelColors: Record<string, string> = { red: "border-red-300 bg-red-50", orange: "border-orange-300 bg-orange-50", yellow: "border-yellow-300 bg-yellow-50", green: "border-green-300 bg-green-50" };
              return (
                <div key={alert.id} className={`p-3 rounded-xl border ${levelColors[alert.level] || levelColors.yellow}`}>
                  <div className="flex items-start gap-2">
                    <span>{alert.level === "red" ? "🚨" : alert.level === "orange" ? "⚠️" : "⚡"}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">{alert.message}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{alert.damName} • {alert.createdAt ? new Date(alert.createdAt).toLocaleString("en-IN") : ""}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Last updated */}
      <div className="text-center text-xs text-gray-400">
        🕐 Last updated: {new Date(data.lastUpdated).toLocaleTimeString("en-IN")} • Auto-refreshing every 5 seconds
      </div>
    </div>
  );
}
