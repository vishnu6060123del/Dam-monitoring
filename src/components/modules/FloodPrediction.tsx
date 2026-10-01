"use client";
import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

interface Prediction {
  id: number;
  damId: number;
  damName: string;
  damState: string;
  damDistrict: string;
  floodProbability: number;
  floodDepth: number;
  affectedPopulation: number;
  floodDuration: number;
  riskScore: number;
  affectedVillages: string[];
  aiRecommendations: {
    shouldOpenGates: boolean;
    expectedSeverity: string;
    optimalRelease: number;
    evacuationRequired: boolean;
    recommendedActions: string[];
  };
  predictedAt: string;
}

function RiskMeter({ value, label }: { value: number; label: string }) {
  const color = value > 75 ? "#dc2626" : value > 50 ? "#f97316" : value > 25 ? "#f59e0b" : "#16a34a";
  const pct = Math.min(value, 100);

  return (
    <div className="text-center">
      <div className="relative w-32 h-32 mx-auto">
        <svg viewBox="0 0 120 120" className="w-full h-full">
          <circle cx="60" cy="60" r="50" fill="none" stroke="#f1f5f9" strokeWidth="10" />
          <circle
            cx="60" cy="60" r="50" fill="none"
            stroke={color} strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${(pct / 100) * 314} 314`}
            transform="rotate(-90 60 60)"
            style={{ transition: "stroke-dasharray 1.5s ease" }}
          />
          <text x="60" y="58" textAnchor="middle" fontSize="20" fontWeight="bold" fill={color}>{pct.toFixed(0)}%</text>
          <text x="60" y="75" textAnchor="middle" fontSize="9" fill="#94a3b8">Risk Score</text>
        </svg>
      </div>
      <p className="text-sm font-medium text-gray-700 mt-1">{label}</p>
    </div>
  );
}

export default function FloodPrediction() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [selected, setSelected] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPredictions = useCallback(async () => {
    try {
      const res = await fetch("/api/prediction");
      const json = await res.json();
      const preds = (json.predictions || []).map((p: Prediction) => ({
        ...p,
        affectedVillages: typeof p.affectedVillages === "string" ? JSON.parse(p.affectedVillages) : p.affectedVillages,
        aiRecommendations: typeof p.aiRecommendations === "string" ? JSON.parse(p.aiRecommendations) : p.aiRecommendations,
      }));
      setPredictions(preds);
      if (!selected && preds.length > 0) setSelected(preds[0]);
    } catch { console.error("Failed to fetch predictions"); }
    finally { setLoading(false); }
  }, [selected]);

  useEffect(() => {
    fetchPredictions();
    const interval = setInterval(fetchPredictions, 10000);
    return () => clearInterval(interval);
  }, [fetchPredictions]);

  const radarData = predictions.map((p) => ({
    subject: p.damName?.split(" ")[0] || "",
    risk: Math.round(p.riskScore || 0),
    probability: Math.round((p.floodProbability || 0) * 100),
  }));

  const barData = predictions.map((p) => ({
    name: p.damName?.split(" ")[0] || "",
    population: p.affectedPopulation || 0,
    depth: (p.floodDepth || 0) * 1000,
  }));

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Risk Meters */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-4">🌊 Flood Risk Assessment</h3>
        <div className="flex flex-wrap justify-around gap-4">
          {predictions.map((p) => (
            <motion.div
              key={p.id}
              whileHover={{ scale: 1.05 }}
              onClick={() => setSelected(p)}
              className={`cursor-pointer p-3 rounded-2xl transition-all ${selected?.id === p.id ? "ring-2 ring-blue-400 bg-blue-50" : "hover:bg-gray-50"}`}
            >
              <RiskMeter value={p.riskScore || 0} label={p.damName || ""} />
            </motion.div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Radar Chart */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-3">📡 Risk Radar</h3>
          <div style={{ height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#f1f5f9" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <Radar name="Risk Score" dataKey="risk" stroke="#dc2626" fill="#dc2626" fillOpacity={0.2} />
                <Radar name="Probability" dataKey="probability" stroke="#2563eb" fill="#2563eb" fillOpacity={0.2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-3">👥 Affected Population</h3>
          <div style={{ height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} />
                <Bar dataKey="population" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Selected Prediction Detail */}
      {selected && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
        >
          <h3 className="font-semibold text-gray-800 mb-4">
            🔍 Detailed Prediction — {selected.damName}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className={`rounded-xl p-3 text-center ${(selected.floodProbability || 0) > 0.7 ? "bg-red-50" : "bg-blue-50"}`}>
              <p className={`text-2xl font-bold ${(selected.floodProbability || 0) > 0.7 ? "text-red-600" : "text-blue-600"}`}>
                {((selected.floodProbability || 0) * 100).toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500 mt-1">Flood Probability</p>
            </div>
            <div className="bg-orange-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-orange-600">{selected.floodDepth?.toFixed(1)}m</p>
              <p className="text-xs text-gray-500 mt-1">Expected Depth</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-purple-600">{selected.affectedPopulation?.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">Affected People</p>
            </div>
            <div className="bg-yellow-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-yellow-600">{selected.floodDuration?.toFixed(0)}h</p>
              <p className="text-xs text-gray-500 mt-1">Duration</p>
            </div>
          </div>

          {selected.aiRecommendations && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`rounded-xl p-4 ${selected.aiRecommendations.evacuationRequired ? "bg-red-50 border border-red-200" : "bg-green-50 border border-green-200"}`}>
                <p className="font-semibold text-sm mb-2">
                  {selected.aiRecommendations.evacuationRequired ? "🚨 EVACUATION REQUIRED" : "✅ No Evacuation Needed"}
                </p>
                <p className="text-sm">Expected Severity: <strong>{selected.aiRecommendations.expectedSeverity}</strong></p>
                <p className="text-sm">Gates Should Open: <strong>{selected.aiRecommendations.shouldOpenGates ? "Yes" : "No"}</strong></p>
                <p className="text-sm">Optimal Release: <strong>{selected.aiRecommendations.optimalRelease?.toLocaleString()} cusecs</strong></p>
              </div>
              <div className="bg-blue-50 rounded-xl p-4">
                <p className="font-semibold text-sm mb-2">📋 Recommended Actions</p>
                <ul className="space-y-1">
                  {(selected.aiRecommendations.recommendedActions || []).map((action, i) => (
                    <li key={i} className="text-sm text-gray-700 flex gap-2">
                      <span className="text-blue-500">•</span> {action}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
