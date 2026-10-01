"use client";
import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";

interface Village {
  id: number;
  name: string;
  population: number;
  distanceFromDam: number;
  latitude: number;
  longitude: number;
  elevation: number;
  riskZone: string;
  nearestShelter: string;
  emergencyContact: string;
  damId: number;
  damName: string;
  damDistrict: string;
  damState: string;
}

const riskConfig: Record<string, { color: string; bg: string; label: string; icon: string }> = {
  low: { color: "text-green-700", bg: "bg-green-100", label: "Low Risk", icon: "🟢" },
  medium: { color: "text-yellow-700", bg: "bg-yellow-100", label: "Medium Risk", icon: "🟡" },
  high: { color: "text-orange-700", bg: "bg-orange-100", label: "High Risk", icon: "🟠" },
  critical: { color: "text-red-700", bg: "bg-red-100", label: "Critical", icon: "🔴" },
};

export default function VillageManagement() {
  const [villages, setVillages] = useState<Village[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRisk, setFilterRisk] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newVillage, setNewVillage] = useState({ name: "", population: "", distanceFromDam: "", elevation: "", riskZone: "low", nearestShelter: "", emergencyContact: "", damId: "" });

  const fetchVillages = useCallback(async () => {
    try {
      const res = await fetch("/api/villages");
      const json = await res.json();
      setVillages(json.villages || []);
    } catch { console.error("Failed to fetch villages"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchVillages();
  }, [fetchVillages]);

  const filtered = villages.filter((v) => {
    const matchSearch = v.name.toLowerCase().includes(search.toLowerCase()) ||
      (v.damName || "").toLowerCase().includes(search.toLowerCase()) ||
      (v.damState || "").toLowerCase().includes(search.toLowerCase());
    const matchRisk = filterRisk === "all" || v.riskZone === filterRisk;
    return matchSearch && matchRisk;
  });

  const totalPopulation = villages.reduce((s, v) => s + (v.population || 0), 0);
  const criticalCount = villages.filter((v) => v.riskZone === "critical").length;
  const highCount = villages.filter((v) => v.riskZone === "high").length;

  const handleAddVillage = async () => {
    try {
      await fetch("/api/villages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newVillage,
          population: parseInt(newVillage.population),
          distanceFromDam: parseFloat(newVillage.distanceFromDam),
          elevation: parseFloat(newVillage.elevation),
          damId: parseInt(newVillage.damId),
        }),
      });
      setShowAddModal(false);
      fetchVillages();
    } catch { console.error("Failed to add village"); }
  };

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
          <div className="text-2xl font-bold text-blue-600">{villages.length}</div>
          <div className="text-xs text-gray-500 mt-1">Total Villages</div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
          <div className="text-2xl font-bold text-indigo-600">{totalPopulation.toLocaleString()}</div>
          <div className="text-xs text-gray-500 mt-1">Total Population</div>
        </div>
        <div className="bg-red-50 rounded-2xl p-4 shadow-sm border border-red-100 text-center">
          <div className="text-2xl font-bold text-red-600">{criticalCount}</div>
          <div className="text-xs text-red-500 mt-1">Critical Risk</div>
        </div>
        <div className="bg-orange-50 rounded-2xl p-4 shadow-sm border border-orange-100 text-center">
          <div className="text-2xl font-bold text-orange-600">{highCount}</div>
          <div className="text-xs text-orange-500 mt-1">High Risk</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-wrap gap-3 items-center">
        <input
          type="text"
          placeholder="🔍 Search villages, dams, states..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-48 px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex gap-2">
          {["all", "low", "medium", "high", "critical"].map((r) => (
            <button
              key={r}
              onClick={() => setFilterRisk(r)}
              className={`px-3 py-2 rounded-lg text-xs font-medium capitalize transition-all ${
                filterRisk === r ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {r === "all" ? "All" : riskConfig[r]?.icon + " " + riskConfig[r]?.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + Add Village
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Village</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Population</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Distance</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Elevation</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Dam</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Risk Zone</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Shelter</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Contact</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Coords</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="text-center py-8 text-gray-400">Loading villages...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-8 text-gray-400">No villages found</td></tr>
              ) : (
                filtered.map((v, idx) => {
                  const cfg = riskConfig[v.riskZone] || riskConfig.low;
                  return (
                    <motion.tr
                      key={v.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.03 }}
                      className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800 text-sm">{v.name}</p>
                        <p className="text-xs text-gray-400">ID: {v.id}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{v.population?.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{v.distanceFromDam?.toFixed(1)} km</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{v.elevation?.toFixed(1)} m</td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-700">{v.damName}</p>
                        <p className="text-xs text-gray-400">{v.damState}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.color}`}>
                          {cfg.icon} {cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{v.nearestShelter}</td>
                      <td className="px-4 py-3 text-sm text-blue-600 font-mono">{v.emergencyContact}</td>
                      <td className="px-4 py-3 text-xs text-gray-400 font-mono">
                        {v.latitude?.toFixed(3)}, {v.longitude?.toFixed(3)}
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Village Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
          >
            <h3 className="font-bold text-lg text-gray-800 mb-4">➕ Add New Village</h3>
            <div className="space-y-3">
              {[
                { key: "name", label: "Village Name", type: "text" },
                { key: "population", label: "Population", type: "number" },
                { key: "distanceFromDam", label: "Distance from Dam (km)", type: "number" },
                { key: "elevation", label: "Elevation (m)", type: "number" },
                { key: "nearestShelter", label: "Nearest Shelter", type: "text" },
                { key: "emergencyContact", label: "Emergency Contact", type: "text" },
                { key: "damId", label: "Dam ID", type: "number" },
              ].map(({ key, label, type }) => (
                <div key={key}>
                  <label className="text-xs font-medium text-gray-600">{label}</label>
                  <input
                    type={type}
                    value={newVillage[key as keyof typeof newVillage]}
                    onChange={(e) => setNewVillage({ ...newVillage, [key]: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
              <div>
                <label className="text-xs font-medium text-gray-600">Risk Zone</label>
                <select
                  value={newVillage.riskZone}
                  onChange={(e) => setNewVillage({ ...newVillage, riskZone: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">🟢 Low</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="high">🟠 High</option>
                  <option value="critical">🔴 Critical</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowAddModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={handleAddVillage} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700">Add Village</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
