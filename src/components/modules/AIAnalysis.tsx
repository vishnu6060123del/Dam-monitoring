"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Dam {
  id: number;
  name: string;
  waterLevel: number;
  maxWaterLevel: number;
  currentCapacity: number;
  maxCapacity: number;
  inflowRate: number;
  outflowRate: number;
  gatesOpen: number;
  totalGates: number;
  safetyStatus: string;
  state: string;
}

interface AIRecommendation {
  damId: number;
  damName: string;
  shouldOpenGates: boolean;
  gatesToOpen: number;
  optimalRelease: number;
  expectedSeverity: string;
  riskScore: number;
  evacuationRequired: boolean;
  actions: string[];
  reasoning: string;
}

function generateAIRecommendations(dams: Dam[]): AIRecommendation[] {
  return dams.map((dam) => {
    const storagePct = dam.maxCapacity ? (dam.currentCapacity / dam.maxCapacity) * 100 : 0;
    const levelPct = dam.maxWaterLevel ? (dam.waterLevel / dam.maxWaterLevel) * 100 : 0;
    const riskScore = (storagePct * 0.4 + levelPct * 0.4 + (dam.inflowRate > dam.outflowRate ? 20 : 0));
    
    const shouldOpenGates = storagePct > 80 || levelPct > 85 || dam.inflowRate > dam.outflowRate * 1.5;
    const evacuationRequired = riskScore > 75 || levelPct > 90;
    const expectedSeverity = riskScore > 80 ? "Severe" : riskScore > 60 ? "Moderate" : riskScore > 40 ? "Low" : "Negligible";
    
    const actions: string[] = [];
    if (shouldOpenGates) actions.push(`Open ${Math.min(Math.ceil(dam.totalGates * 0.3), 5)} additional gates immediately`);
    if (storagePct > 85) actions.push("Increase outflow rate to reduce storage pressure");
    if (dam.inflowRate > dam.outflowRate) actions.push("Balance inflow-outflow ratio urgently");
    if (evacuationRequired) actions.push("Initiate evacuation of downstream villages");
    actions.push("Continue monitoring every 15 minutes");
    if (riskScore > 50) actions.push("Alert downstream village authorities");

    return {
      damId: dam.id,
      damName: dam.name,
      shouldOpenGates,
      gatesToOpen: shouldOpenGates ? Math.min(Math.ceil(dam.totalGates * 0.3), dam.totalGates) : 0,
      optimalRelease: Math.round(dam.inflowRate * 1.1),
      expectedSeverity,
      riskScore: Math.min(riskScore, 100),
      evacuationRequired,
      actions,
      reasoning: `Storage at ${storagePct.toFixed(1)}%, water level at ${levelPct.toFixed(1)}% of maximum. Inflow (${dam.inflowRate?.toLocaleString()} cusecs) ${dam.inflowRate > dam.outflowRate ? "exceeds" : "balanced with"} outflow (${dam.outflowRate?.toLocaleString()} cusecs).`,
    };
  });
}

const severityColors: Record<string, { bg: string; text: string; icon: string }> = {
  Negligible: { bg: "bg-green-50", text: "text-green-700", icon: "✅" },
  Low: { bg: "bg-yellow-50", text: "text-yellow-700", icon: "⚡" },
  Moderate: { bg: "bg-orange-50", text: "text-orange-700", icon: "⚠️" },
  Severe: { bg: "bg-red-50", text: "text-red-700", icon: "🚨" },
};

export default function AIAnalysis() {
  const [dams, setDams] = useState<Dam[]>([]);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    fetch("/api/dams")
      .then((r) => r.json())
      .then((json) => {
        setDams(json.dams || []);
        setRecommendations(generateAIRecommendations(json.dams || []));
        setLoading(false);
      });
  }, []);

  const reanalyze = async () => {
    setAnalyzing(true);
    await new Promise((r) => setTimeout(r, 2000));
    const res = await fetch("/api/dams");
    const json = await res.json();
    setDams(json.dams || []);
    setRecommendations(generateAIRecommendations(json.dams || []));
    setAnalyzing(false);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const criticalCount = recommendations.filter((r) => r.evacuationRequired).length;
  const highRiskCount = recommendations.filter((r) => r.riskScore > 60).length;

  return (
    <div className="space-y-4">
      {/* AI Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-5 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">🤖 AI Analysis Engine</h2>
            <p className="text-blue-100 text-sm mt-1">Real-time flood risk assessment powered by predictive algorithms</p>
          </div>
          <button
            onClick={reanalyze}
            disabled={analyzing}
            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2"
          >
            {analyzing ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Analyzing...</>
            ) : (
              <><span>🔄</span> Re-analyze</>
            )}
          </button>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold">{dams.length}</div>
            <div className="text-xs text-blue-100">Dams Analyzed</div>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-yellow-300">{highRiskCount}</div>
            <div className="text-xs text-blue-100">High Risk Dams</div>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-red-300">{criticalCount}</div>
            <div className="text-xs text-blue-100">Evacuation Required</div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {recommendations.map((rec, idx) => {
          const sev = severityColors[rec.expectedSeverity] || severityColors.Negligible;
          return (
            <motion.div
              key={rec.damId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-gray-800">{rec.damName}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${sev.bg} ${sev.text}`}>
                      {sev.icon} {rec.expectedSeverity}
                    </span>
                    {rec.evacuationRequired && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-red-100 text-red-700 animate-pulse">
                        🚨 Evacuate
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${rec.riskScore > 75 ? "text-red-600" : rec.riskScore > 50 ? "text-orange-600" : "text-green-600"}`}>
                    {rec.riskScore.toFixed(0)}
                  </div>
                  <div className="text-xs text-gray-400">Risk Score</div>
                </div>
              </div>

              {/* Risk bar */}
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${rec.riskScore}%` }}
                  transition={{ duration: 1.2 }}
                  className={`h-full rounded-full ${rec.riskScore > 75 ? "bg-red-500" : rec.riskScore > 50 ? "bg-orange-500" : rec.riskScore > 25 ? "bg-yellow-500" : "bg-green-500"}`}
                />
              </div>

              <div className="bg-gray-50 rounded-xl p-3 mb-3">
                <p className="text-xs text-gray-500 italic">&quot;{rec.reasoning}&quot;</p>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className={`rounded-lg p-2.5 ${rec.shouldOpenGates ? "bg-orange-50" : "bg-green-50"}`}>
                  <p className="text-xs text-gray-500">Gate Status</p>
                  <p className={`text-sm font-bold ${rec.shouldOpenGates ? "text-orange-700" : "text-green-700"}`}>
                    {rec.shouldOpenGates ? `🔓 Open ${rec.gatesToOpen} Gates` : "🔒 Keep Closed"}
                  </p>
                </div>
                <div className="bg-blue-50 rounded-lg p-2.5">
                  <p className="text-xs text-gray-500">Optimal Release</p>
                  <p className="text-sm font-bold text-blue-700">{rec.optimalRelease?.toLocaleString()} cusecs</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-600 mb-2">📋 AI Recommended Actions:</p>
                <ul className="space-y-1">
                  {rec.actions.slice(0, 4).map((action, i) => (
                    <li key={i} className="text-xs text-gray-600 flex gap-2 items-start">
                      <span className="text-blue-400 mt-0.5">▸</span> {action}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
