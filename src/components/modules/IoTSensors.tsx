"use client";
import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface Sensor {
  id: number;
  damId: number;
  damName: string;
  sensorType: string;
  value: number;
  unit: string;
  status: string;
  recordedAt: string;
}

interface Dam {
  id: number;
  name: string;
}

const sensorConfig: Record<string, { icon: string; color: string; bg: string; label: string }> = {
  water_level: { icon: "📏", color: "text-blue-600", bg: "bg-blue-50", label: "Water Level" },
  flow: { icon: "🌊", color: "text-cyan-600", bg: "bg-cyan-50", label: "Flow Rate" },
  rainfall: { icon: "🌧️", color: "text-indigo-600", bg: "bg-indigo-50", label: "Rainfall" },
  gate: { icon: "🚪", color: "text-orange-600", bg: "bg-orange-50", label: "Gate Status" },
};

function generateLiveData(baseValue: number, count: number = 20) {
  return Array.from({ length: count }, (_, i) => ({
    t: i,
    v: +(baseValue + (Math.random() - 0.5) * baseValue * 0.05).toFixed(2),
  }));
}

export default function IoTSensors() {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [dams, setDams] = useState<Dam[]>([]);
  const [loading, setLoading] = useState(true);
  const [liveData, setLiveData] = useState<Record<number, { t: number; v: number }[]>>({});
  const [updating, setUpdating] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const fetchSensors = useCallback(async () => {
    try {
      const [sRes, dRes] = await Promise.all([
        fetch("/api/iot").then((r) => r.json()),
        fetch("/api/dams").then((r) => r.json()),
      ]);
      setSensors(sRes.sensors || []);
      setDams(dRes.dams || []);
      setLastUpdate(new Date());

      // Generate live chart data per sensor
      const newLiveData: Record<number, { t: number; v: number }[]> = {};
      (sRes.sensors || []).forEach((s: Sensor) => {
        newLiveData[s.id] = newLiveData[s.id]
          ? [...newLiveData[s.id].slice(-19), { t: Date.now(), v: +(s.value + (Math.random() - 0.5) * s.value * 0.02).toFixed(2) }]
          : generateLiveData(s.value || 10);
      });
      setLiveData(newLiveData);
    } catch { console.error("Failed to fetch sensors"); }
    finally { setLoading(false); }
  }, []);

  const simulateUpdate = async (damId: number) => {
    setUpdating(true);
    try {
      await fetch("/api/iot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ damId }),
      });
      await fetchSensors();
    } catch { console.error("Failed to update sensor"); }
    finally { setUpdating(false); }
  };

  useEffect(() => {
    fetchSensors();
    const interval = setInterval(fetchSensors, 5000);
    return () => clearInterval(interval);
  }, [fetchSensors]);

  // Group sensors by dam
  const sensorsByDam: Record<string, Sensor[]> = {};
  sensors.forEach((s) => {
    const key = s.damName || `Dam ${s.damId}`;
    if (!sensorsByDam[key]) sensorsByDam[key] = [];
    sensorsByDam[key].push(s);
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl p-5 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">📡 IoT Sensor Network</h2>
            <p className="text-indigo-100 text-sm mt-1">Real-time sensor data from all dam monitoring stations</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 justify-end">
              <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm">Live Updates</span>
            </div>
            <p className="text-indigo-100 text-xs mt-1">Updated: {lastUpdate.toLocaleTimeString("en-IN")}</p>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-3 mt-4">
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <div className="text-xl font-bold">{sensors.length}</div>
            <div className="text-xs text-indigo-100">Total Sensors</div>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <div className="text-xl font-bold text-green-300">{sensors.filter((s) => s.status === "online").length}</div>
            <div className="text-xs text-indigo-100">Online</div>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <div className="text-xl font-bold text-red-300">{sensors.filter((s) => s.status !== "online").length}</div>
            <div className="text-xs text-indigo-100">Offline</div>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <div className="text-xl font-bold">5s</div>
            <div className="text-xs text-indigo-100">Update Interval</div>
          </div>
        </div>
      </div>

      {/* Sensor Types Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Object.entries(sensorConfig).map(([type, cfg]) => {
          const typeSensors = sensors.filter((s) => s.sensorType === type);
          const latest = typeSensors[0];
          return (
            <div key={type} className={`${cfg.bg} rounded-2xl p-4 border border-white shadow-sm`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{cfg.icon}</span>
                <span className={`text-sm font-semibold ${cfg.color}`}>{cfg.label}</span>
              </div>
              <div className={`text-2xl font-bold ${cfg.color}`}>
                {latest ? `${latest.value?.toFixed(1)} ${latest.unit}` : "N/A"}
              </div>
              <div className="flex items-center gap-1 mt-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-500">{typeSensors.length} sensors active</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sensors by Dam */}
      {loading ? (
        <div className="flex justify-center p-8"><div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>
      ) : (
        Object.entries(sensorsByDam).map(([damName, damSensors]) => (
          <div key={damName} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                🏗️ {damName}
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                  {damSensors.filter((s) => s.status === "online").length}/{damSensors.length} online
                </span>
              </h3>
              <button
                onClick={() => simulateUpdate(damSensors[0]?.damId)}
                disabled={updating}
                className="text-xs bg-blue-100 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-1"
              >
                {updating ? <><div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div> Updating...</> : "🔄 Simulate Update"}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {damSensors.map((sensor) => {
                const cfg = sensorConfig[sensor.sensorType] || sensorConfig.water_level;
                const chartData = liveData[sensor.id] || generateLiveData(sensor.value || 10);
                return (
                  <motion.div
                    key={sensor.id}
                    className={`${cfg.bg} rounded-xl p-3`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <span>{cfg.icon}</span>
                        <span className={`text-xs font-semibold ${cfg.color}`}>{cfg.label}</span>
                      </div>
                      <div className={`flex items-center gap-1 text-xs ${sensor.status === "online" ? "text-green-600" : "text-red-500"}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${sensor.status === "online" ? "bg-green-500 animate-pulse" : "bg-red-500"}`}></div>
                        {sensor.status}
                      </div>
                    </div>
                    <div className={`text-xl font-bold ${cfg.color} mb-2`}>
                      {sensor.value?.toFixed(2)} <span className="text-sm font-normal">{sensor.unit}</span>
                    </div>
                    <div style={{ height: 50 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <Line type="monotone" dataKey="v" stroke={cfg.color.replace("text-", "").includes("blue") ? "#2563eb" : cfg.color.includes("cyan") ? "#0891b2" : cfg.color.includes("indigo") ? "#4f46e5" : "#f97316"} strokeWidth={1.5} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{sensor.recordedAt ? new Date(sensor.recordedAt).toLocaleTimeString("en-IN") : ""}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
