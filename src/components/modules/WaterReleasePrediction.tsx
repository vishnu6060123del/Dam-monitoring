"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";

interface Dam {
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
}

interface VillagePrediction {
  villageId: number;
  villageName: string;
  distance: number;
  estimatedArrival: string;
  expectedWaterLevel: number;
  floodRisk: string;
  population: number;
}

interface PredictionResult {
  waterReleased: number;
  flowVelocity: number;
  gatesOpen: number;
  villagePredictions: VillagePrediction[];
}

const riskColors: Record<string, { bg: string; text: string; border: string; icon: string }> = {
  low: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200", icon: "🟢" },
  medium: { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200", icon: "🟡" },
  high: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", icon: "🟠" },
  critical: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", icon: "🔴" },
};

export default function WaterReleasePrediction() {
  const [dams, setDams] = useState<Dam[]>([]);
  const [selectedDam, setSelectedDam] = useState<Dam | null>(null);
  const [gatesOpen, setGatesOpen] = useState(1);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetch("/api/dams")
      .then((r) => r.json())
      .then((json) => {
        setDams(json.dams || []);
        if (json.dams?.length > 0) {
          setSelectedDam(json.dams[0]);
          setGatesOpen(json.dams[0].gatesOpen || 1);
        }
        setFetching(false);
      });
  }, []);

  const calculate = async () => {
    if (!selectedDam) return;
    setLoading(true);
    try {
      const res = await fetch("/api/prediction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          damId: selectedDam.id,
          outflowRate: selectedDam.outflowRate,
          gatesOpen,
        }),
      });
      const json = await res.json();
      setResult(json);
    } catch { console.error("Failed to calculate"); }
    finally { setLoading(false); }
  };

  if (fetching) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Calculator */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-4">💧 Water Release Calculator</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Select Dam</label>
            <select
              value={selectedDam?.id || ""}
              onChange={(e) => {
                const dam = dams.find((d) => d.id === Number(e.target.value));
                if (dam) { setSelectedDam(dam); setGatesOpen(dam.gatesOpen || 1); }
              }}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {dams.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Gates to Open: <strong>{gatesOpen}</strong></label>
            <input
              type="range"
              min={1}
              max={selectedDam?.totalGates || 10}
              value={gatesOpen}
              onChange={(e) => setGatesOpen(Number(e.target.value))}
              className="w-full h-2 accent-blue-600 mt-2"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>1</span>
              <span>{selectedDam?.totalGates || 10}</span>
            </div>
          </div>
          <div className="flex items-end">
            <button
              onClick={calculate}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-medium text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Calculating...</>
              ) : (
                <><span>⚡</span> Calculate Prediction</>
              )}
            </button>
          </div>
        </div>

        {selectedDam && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-gray-100">
            <div className="bg-blue-50 rounded-xl p-3">
              <p className="text-xs text-blue-500">Current Outflow</p>
              <p className="font-bold text-blue-800">{selectedDam.outflowRate?.toLocaleString()} cusecs</p>
            </div>
            <div className="bg-indigo-50 rounded-xl p-3">
              <p className="text-xs text-indigo-500">Water Level</p>
              <p className="font-bold text-indigo-800">{selectedDam.waterLevel?.toFixed(1)} / {selectedDam.maxWaterLevel} m</p>
            </div>
            <div className="bg-orange-50 rounded-xl p-3">
              <p className="text-xs text-orange-500">Gates Open</p>
              <p className="font-bold text-orange-800">{selectedDam.gatesOpen} / {selectedDam.totalGates}</p>
            </div>
            <div className={`rounded-xl p-3 ${selectedDam.safetyStatus === "danger" ? "bg-red-50" : selectedDam.safetyStatus === "warning" ? "bg-orange-50" : "bg-green-50"}`}>
              <p className="text-xs text-gray-500">Safety Status</p>
              <p className={`font-bold capitalize ${selectedDam.safetyStatus === "danger" ? "text-red-700" : selectedDam.safetyStatus === "warning" ? "text-orange-700" : "text-green-700"}`}>
                {selectedDam.safetyStatus}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Release Summary */}
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-5 text-white">
            <h3 className="font-bold text-lg mb-3">🚨 Water Release Prediction Results</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/15 rounded-xl p-3 text-center">
                <div className="text-xs text-blue-100 mb-1">Water Released</div>
                <div className="text-xl font-bold">{(result.waterReleased / 1000000).toFixed(2)} MCM</div>
              </div>
              <div className="bg-white/15 rounded-xl p-3 text-center">
                <div className="text-xs text-blue-100 mb-1">Flow Velocity</div>
                <div className="text-xl font-bold">{result.flowVelocity?.toFixed(2)} m/s</div>
              </div>
              <div className="bg-white/15 rounded-xl p-3 text-center">
                <div className="text-xs text-blue-100 mb-1">Gates Open</div>
                <div className="text-xl font-bold">{result.gatesOpen}</div>
              </div>
            </div>
          </div>

          {/* Village Predictions */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4">🏘️ Downstream Village Impact Prediction</h3>
            <div className="space-y-3">
              {result.villagePredictions?.map((vp) => {
                const cfg = riskColors[vp.floodRisk] || riskColors.low;
                return (
                  <motion.div
                    key={vp.villageId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`${cfg.bg} border ${cfg.border} rounded-xl p-4`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className={`font-semibold text-sm ${cfg.text}`}>{vp.villageName}</h4>
                        <p className="text-xs text-gray-500 mt-0.5">👥 Population: {vp.population?.toLocaleString()}</p>
                      </div>
                      <span className={`text-sm font-bold px-3 py-1 rounded-full ${cfg.bg} ${cfg.text} border ${cfg.border}`}>
                        {cfg.icon} {vp.floodRisk?.toUpperCase()} RISK
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 mt-3">
                      <div className="bg-white/70 rounded-lg p-2">
                        <p className="text-xs text-gray-500">📍 Distance</p>
                        <p className="font-semibold text-sm text-gray-800">{vp.distance?.toFixed(1)} km</p>
                      </div>
                      <div className="bg-white/70 rounded-lg p-2">
                        <p className="text-xs text-gray-500">⏰ ETA</p>
                        <p className="font-semibold text-sm text-gray-800">
                          {vp.estimatedArrival ? format(new Date(vp.estimatedArrival), "HH:mm, dd MMM") : "N/A"}
                        </p>
                      </div>
                      <div className="bg-white/70 rounded-lg p-2">
                        <p className="text-xs text-gray-500">💧 Water Rise</p>
                        <p className="font-semibold text-sm text-gray-800">{vp.expectedWaterLevel?.toFixed(2)} m</p>
                      </div>
                    </div>
                    {vp.floodRisk === "critical" && (
                      <div className="mt-3 bg-red-100 rounded-lg p-2">
                        <p className="text-xs text-red-700 font-semibold">⚠️ IMMEDIATE ACTION REQUIRED: Evacuate residents to higher ground!</p>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
