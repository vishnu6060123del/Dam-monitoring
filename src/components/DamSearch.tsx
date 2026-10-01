"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Search, MapPin, Droplets } from "lucide-react";

interface Dam {
  id: number;
  name: string;
  riverName?: string;
  waterLevel: number;
  maxWaterLevel: number;
  currentCapacity: number;
  maxCapacity: number;
  safetyStatus: string;
  latitude: number;
  longitude: number;
  state: string;
  district: string;
  capacityPercentage?: number;
  damId?: string;
}

interface DamSearchProps {
  isDarkMode: boolean;
  onSelectDam?: (dam: Dam) => void;
}

export default function DamSearch({ isDarkMode, onSelectDam }: DamSearchProps) {
  const [activeTab, setActiveTab] = useState<"water-level" | "location">("water-level");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Dam[]>([]);
  const [searched, setSearched] = useState(false);

  // Water level search
  const [minLevel, setMinLevel] = useState("");
  const [maxLevel, setMaxLevel] = useState("");

  // Location search
  const [locationSearch, setLocationSearch] = useState("");
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");

  const handleWaterLevelSearch = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (minLevel) params.append("minLevel", minLevel);
      if (maxLevel) params.append("maxLevel", maxLevel);

      const response = await fetch(`/api/search/water-level?${params}`);
      if (!response.ok) throw new Error("Failed to search");

      const data = await response.json();
      setResults(data.data);
      setSearched(true);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSearch = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (locationSearch) params.append("search", locationSearch);
      if (state) params.append("state", state);
      if (district) params.append("district", district);

      const response = await fetch(`/api/search/location?${params}`);
      if (!response.ok) throw new Error("Failed to search");

      const data = await response.json();
      setResults(data.data);
      setSearched(true);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "danger":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "warning":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "watch":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      default:
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    }
  };

  return (
    <div className={`p-6 rounded-lg ${isDarkMode ? "bg-gray-800" : "bg-white"} shadow-lg`}>
      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-300 dark:border-gray-700">
        <button
          onClick={() => {
            setActiveTab("water-level");
            setResults([]);
            setSearched(false);
          }}
          className={`flex items-center gap-2 px-4 py-3 font-medium transition-all ${
            activeTab === "water-level"
              ? "border-b-2 border-blue-600 text-blue-600"
              : isDarkMode
              ? "text-gray-400 hover:text-gray-200"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <Droplets size={18} />
          Water Level Search
        </button>
        <button
          onClick={() => {
            setActiveTab("location");
            setResults([]);
            setSearched(false);
          }}
          className={`flex items-center gap-2 px-4 py-3 font-medium transition-all ${
            activeTab === "location"
              ? "border-b-2 border-blue-600 text-blue-600"
              : isDarkMode
              ? "text-gray-400 hover:text-gray-200"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <MapPin size={18} />
          Location Search
        </button>
      </div>

      {/* Water Level Search Tab */}
      {activeTab === "water-level" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                Min Water Level (m)
              </label>
              <input
                type="number"
                value={minLevel}
                onChange={(e) => setMinLevel(e.target.value)}
                placeholder="e.g., 100"
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                Max Water Level (m)
              </label>
              <input
                type="number"
                value={maxLevel}
                onChange={(e) => setMaxLevel(e.target.value)}
                placeholder="e.g., 200"
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleWaterLevelSearch}
                disabled={loading}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-all flex items-center justify-center gap-2"
              >
                <Search size={18} />
                {loading ? "Searching..." : "Search"}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Location Search Tab */}
      {activeTab === "location" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                Dam Name/River
              </label>
              <input
                type="text"
                value={locationSearch}
                onChange={(e) => setLocationSearch(e.target.value)}
                placeholder="e.g., Bhakra Dam"
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                State
              </label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="e.g., Himachal Pradesh"
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                District
              </label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="e.g., Kangra"
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleLocationSearch}
                disabled={loading}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-all flex items-center justify-center gap-2"
              >
                <Search size={18} />
                {loading ? "Searching..." : "Search"}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Results */}
      {searched && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-6">
          <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
            Results ({results.length} dams found)
          </h3>

          {results.length === 0 ? (
            <p className={`text-center py-8 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
              No dams found matching your criteria.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map((dam) => (
                <motion.div
                  key={dam.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -4 }}
                  onClick={() => onSelectDam?.(dam)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    isDarkMode ? "bg-gray-700 border-gray-600 hover:border-blue-500" : "bg-gray-50 border-gray-300 hover:border-blue-500"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className={`font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>{dam.name}</h4>
                      <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>{dam.riverName}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded font-semibold ${getStatusColor(dam.safetyStatus)}`}>
                      {dam.safetyStatus}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className={isDarkMode ? "text-gray-400" : "text-gray-600"}>Water Level:</span>
                      <span className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                        {dam.waterLevel?.toFixed(2) || "N/A"} m
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={isDarkMode ? "text-gray-400" : "text-gray-600"}>Capacity:</span>
                      <span className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                        {dam.capacityPercentage?.toFixed(1) || 0}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={isDarkMode ? "text-gray-400" : "text-gray-600"}>Location:</span>
                      <span className={`font-medium text-xs ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                        {dam.state}, {dam.district}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
