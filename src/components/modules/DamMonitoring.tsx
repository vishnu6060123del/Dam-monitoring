"use client";
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import DamSearch from "@/components/DamSearch";

interface Dam {
  id: number;
  damId: string;
  name: string;
  riverName: string;
  state: string;
  district: string;
  latitude: number;
  longitude: number;
  maxCapacity: number;
  currentCapacity: number;
  waterLevel: number;
  maxWaterLevel: number;
  inflowRate: number;
  outflowRate: number;
  totalGates: number;
  gatesOpen: number;
  gateOpenTime: string;
  gateCloseTime: string;
  safetyStatus: string;
  lastUpdated: string;
}

const statusConfig: Record<string, { color: string; bg: string; border: string; label: string; icon: string }> = {
  normal: { color: "text-green-700", bg: "bg-green-50", border: "border-green-300", label: "Normal", icon: "✅" },
  watch: { color: "text-yellow-700", bg: "bg-yellow-50", border: "border-yellow-300", label: "Watch", icon: "👁️" },
  warning: { color: "text-orange-700", bg: "bg-orange-50", border: "border-orange-300", label: "Warning", icon: "⚠️" },
  danger: { color: "text-red-700", bg: "bg-red-50", border: "border-red-300", label: "DANGER", icon: "🚨" },
};

function CircularGauge({ value, max, label, color }: { value: number; max: number; label: string; color: string }) {
  const pct = Math.min((value / max) * 100, 100);
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (pct / 100) * circumference;
  const strokeColor = pct > 90 ? "#dc2626" : pct > 75 ? "#f59e0b" : pct > 50 ? "#2563eb" : "#16a34a";

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-24">
        <svg className="transform -rotate-90" width="96" height="96">
          <circle cx="48" cy="48" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="8" />
          <motion.circle
            cx="48" cy="48" r={radius} fill="none"
            stroke={strokeColor} strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold text-gray-800">{pct.toFixed(0)}%</span>
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-1 text-center">{label}</p>
      <p className="text-xs font-semibold text-gray-700">{value.toFixed(1)} / {max}</p>
    </div>
  );
}

export default function DamMonitoring() {
  const [dams, setDams] = useState<Dam[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDam, setSelectedDam] = useState<Dam | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const { selectedDamId, setSelectedDamId } = useAppStore();

  const fetchDams = useCallback(async () => {
    try {
      const res = await fetch("/api/dams");
      const json = await res.json();
      setDams(json.dams || []);
      if (selectedDamId && !selectedDam) {
        const found = json.dams?.find((d: Dam) => d.id === selectedDamId);
        if (found) setSelectedDam(found);
      }
    } catch { console.error("Failed to fetch dams"); }
    finally { setLoading(false); }
  }, [selectedDamId, selectedDam]);

  useEffect(() => {
    fetchDams();
    const interval = setInterval(fetchDams, 5000);
    return () => clearInterval(interval);
  }, [fetchDams]);

  const filtered = dams.filter((d) => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.state.toLowerCase().includes(search.toLowerCase()) ||
      d.riverName?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || d.safetyStatus === filterStatus;
    return matchSearch && matchStatus;
  });

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-gray-500">Loading dam data...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-wrap gap-3 items-center">
        <input
          type="text"
          placeholder="🔍 Search dams, rivers, states..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-48 px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex gap-2">
          {["all", "normal", "watch", "warning", "danger"].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-2 rounded-lg text-xs font-medium capitalize transition-all ${
                filterStatus === s ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {s === "all" ? "All" : statusConfig[s]?.icon + " " + statusConfig[s]?.label}
            </button>
          ))}
        </div>
        <span className="text-sm text-gray-500 ml-auto">{filtered.length} dams</span>
      </div>

      {/* Advanced Search */}
      <DamSearch isDarkMode={false} onSelectDam={(dam) => {
        setSelectedDam(dam as Dam);
        setSelectedDamId(dam.id);
      }} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Dam List */}
        <div className="lg:col-span-1 space-y-3 max-h-[calc(100vh-250px)] overflow-y-auto custom-scroll">
          {filtered.map((dam) => {
            const cfg = statusConfig[dam.safetyStatus] || statusConfig.normal;
            const storagePct = dam.maxCapacity ? (dam.currentCapacity / dam.maxCapacity) * 100 : 0;
            return (
              <motion.div
                key={dam.id}
                whileHover={{ x: 4 }}
                onClick={() => { setSelectedDam(dam); setSelectedDamId(dam.id); }}
                className={`bg-white rounded-2xl p-4 shadow-sm border cursor-pointer transition-all ${
                  selectedDam?.id === dam.id ? "border-blue-400 shadow-blue-100 shadow-md" : "border-gray-100"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-800 text-sm">{dam.name}</h3>
                    <p className="text-xs text-gray-500">{dam.riverName} • {dam.district}, {dam.state}</p>
                    <p className="text-xs text-gray-400 font-mono">{dam.damId}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${cfg.bg} ${cfg.color}`}>
                    {cfg.icon} {cfg.label}
                  </span>
                </div>
                <div className="mt-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500">Storage</span>
                    <span className="font-medium">{storagePct.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${storagePct > 90 ? "bg-red-500" : storagePct > 75 ? "bg-orange-500" : "bg-blue-500"}`}
                      style={{ width: `${storagePct}%` }}
                    />
                  </div>
                </div>
                <div className="mt-2 flex justify-between text-xs text-gray-500">
                  <span>💧 WL: {dam.waterLevel?.toFixed(1)}m</span>
                  <span>🚪 {dam.gatesOpen}/{dam.totalGates} gates open</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Dam Detail */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {selectedDam ? (
              <motion.div
                key={selectedDam.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {/* Header */}
                <div className={`bg-white rounded-2xl p-5 shadow-sm border ${statusConfig[selectedDam.safetyStatus]?.border || "border-gray-100"}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-gray-800">{selectedDam.name}</h2>
                      <p className="text-gray-500">{selectedDam.riverName} River • {selectedDam.district}, {selectedDam.state}</p>
                      <p className="text-sm text-gray-400 font-mono mt-0.5">ID: {selectedDam.damId} | 📍 {selectedDam.latitude?.toFixed(4)}°N, {selectedDam.longitude?.toFixed(4)}°E</p>
                    </div>
                    <span className={`px-3 py-1.5 rounded-xl text-sm font-bold ${statusConfig[selectedDam.safetyStatus]?.bg} ${statusConfig[selectedDam.safetyStatus]?.color} animate-pulse`}>
                      {statusConfig[selectedDam.safetyStatus]?.icon} {statusConfig[selectedDam.safetyStatus]?.label}
                    </span>
                  </div>

                  {/* Gauges */}
                  <div className="flex justify-around py-4 border-t border-b border-gray-100 my-4">
                    <CircularGauge value={selectedDam.waterLevel || 0} max={selectedDam.maxWaterLevel || 100} label="Water Level" color="blue" />
                    <CircularGauge value={selectedDam.currentCapacity || 0} max={selectedDam.maxCapacity || 1000} label="Capacity (MCM)" color="indigo" />
                    <CircularGauge value={selectedDam.gatesOpen || 0} max={selectedDam.totalGates || 1} label="Gates Open" color="orange" />
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      { label: "Water Level", value: `${selectedDam.waterLevel?.toFixed(2)} m`, icon: "📏" },
                      { label: "Max Water Level", value: `${selectedDam.maxWaterLevel} m`, icon: "⬆️" },
                      { label: "Current Capacity", value: `${selectedDam.currentCapacity?.toFixed(1)} MCM`, icon: "💧" },
                      { label: "Max Capacity", value: `${selectedDam.maxCapacity} MCM`, icon: "🏦" },
                      { label: "Inflow Rate", value: `${selectedDam.inflowRate?.toLocaleString()} cusecs`, icon: "⬇️" },
                      { label: "Outflow Rate", value: `${selectedDam.outflowRate?.toLocaleString()} cusecs`, icon: "⬆️" },
                      { label: "Total Gates", value: selectedDam.totalGates, icon: "🚪" },
                      { label: "Gates Open", value: `${selectedDam.gatesOpen} / ${selectedDam.totalGates}`, icon: "🔓" },
                      { label: "Last Updated", value: selectedDam.lastUpdated ? new Date(selectedDam.lastUpdated).toLocaleTimeString("en-IN") : "N/A", icon: "🕐" },
                    ].map((item) => (
                      <div key={item.label} className="bg-gray-50 rounded-xl p-3">
                        <p className="text-xs text-gray-500 mb-1">{item.icon} {item.label}</p>
                        <p className="font-semibold text-gray-800 text-sm">{item.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Gate Times */}
                  {selectedDam.gateOpenTime && (
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <div className="bg-orange-50 rounded-xl p-3">
                        <p className="text-xs text-orange-600">🔓 Gate Open Time</p>
                        <p className="font-semibold text-orange-800 text-sm">{new Date(selectedDam.gateOpenTime).toLocaleString("en-IN")}</p>
                      </div>
                      {selectedDam.gateCloseTime && (
                        <div className="bg-green-50 rounded-xl p-3">
                          <p className="text-xs text-green-600">🔒 Gate Close Time</p>
                          <p className="font-semibold text-green-800 text-sm">{new Date(selectedDam.gateCloseTime).toLocaleString("en-IN")}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center"
              >
                <span className="text-6xl mb-4">🏗️</span>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Select a Dam</h3>
                <p className="text-gray-400">Click on any dam from the list to view detailed monitoring information</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
