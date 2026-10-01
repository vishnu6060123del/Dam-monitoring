"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { format } from "date-fns";

interface HistoricalRecord {
  id: number;
  damId: number;
  waterLevel: number;
  storagePercentage: number;
  rainfall: number;
  discharge: number;
  inflowRate: number;
  outflowRate: number;
  gatesOpen: number;
  recordedAt: string;
}

interface Dam {
  id: number;
  name: string;
}

export default function HistoricalAnalytics() {
  const [data, setData] = useState<HistoricalRecord[]>([]);
  const [dams, setDams] = useState<Dam[]>([]);
  const [selectedDamId, setSelectedDamId] = useState<number | null>(null);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [activeChart, setActiveChart] = useState("waterLevel");

  useEffect(() => {
    fetch("/api/dams").then((r) => r.json()).then((json) => {
      setDams(json.dams || []);
      if (json.dams?.length > 0) setSelectedDamId(json.dams[0].id);
    });
  }, []);

  useEffect(() => {
    if (!selectedDamId) return;
    setLoading(true);
    fetch(`/api/analytics?damId=${selectedDamId}&days=${days}`)
      .then((r) => r.json())
      .then((json) => {
        const sorted = (json.data || []).sort((a: HistoricalRecord, b: HistoricalRecord) =>
          new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
        );
        setData(sorted.slice(-days));
        setLoading(false);
      });
  }, [selectedDamId, days]);

  const chartData = data.map((d) => ({
    date: d.recordedAt ? format(new Date(d.recordedAt), "MM/dd") : "",
    waterLevel: Math.round((d.waterLevel || 0) * 10) / 10,
    storage: Math.round((d.storagePercentage || 0) * 10) / 10,
    rainfall: Math.round((d.rainfall || 0) * 10) / 10,
    inflow: Math.round((d.inflowRate || 0)),
    outflow: Math.round((d.outflowRate || 0)),
    gates: d.gatesOpen || 0,
    discharge: Math.round((d.discharge || 0)),
  }));

  const charts = [
    { id: "waterLevel", label: "Water Level", icon: "💧" },
    { id: "storage", label: "Storage %", icon: "📊" },
    { id: "rainfall", label: "Rainfall", icon: "🌧️" },
    { id: "flow", label: "Inflow vs Outflow", icon: "🌊" },
    { id: "gates", label: "Gate Operations", icon: "🚪" },
  ];

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-wrap gap-3 items-center">
        <select
          value={selectedDamId || ""}
          onChange={(e) => setSelectedDamId(Number(e.target.value))}
          className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {dams.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <div className="flex gap-2">
          {[7, 14, 30].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${days === d ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              {d}D
            </button>
          ))}
        </div>
        <span className="text-sm text-gray-500 ml-auto">{data.length} data points</span>
      </div>

      {/* Chart selector */}
      <div className="flex gap-2 flex-wrap">
        {charts.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveChart(c.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
              activeChart === c.id ? "bg-blue-600 text-white shadow-md" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {c.icon} {c.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl p-12 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <motion.div
          key={activeChart}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
        >
          <h3 className="font-semibold text-gray-800 mb-4">
            {charts.find((c) => c.id === activeChart)?.icon} {charts.find((c) => c.id === activeChart)?.label} — {dams.find((d) => d.id === selectedDamId)?.name}
          </h3>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              {activeChart === "waterLevel" ? (
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="wlGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} unit=" m" />
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} />
                  <Area type="monotone" dataKey="waterLevel" stroke="#2563eb" fill="url(#wlGrad)" strokeWidth={2} name="Water Level (m)" />
                </AreaChart>
              ) : activeChart === "storage" ? (
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="stGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} unit="%" />
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} />
                  <Area type="monotone" dataKey="storage" stroke="#16a34a" fill="url(#stGrad)" strokeWidth={2} name="Storage %" />
                </AreaChart>
              ) : activeChart === "rainfall" ? (
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} unit=" mm" />
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} />
                  <Bar dataKey="rainfall" fill="#0891b2" radius={[4, 4, 0, 0]} name="Rainfall (mm)" />
                </BarChart>
              ) : activeChart === "flow" ? (
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} />
                  <Legend />
                  <Line type="monotone" dataKey="inflow" stroke="#2563eb" strokeWidth={2} dot={false} name="Inflow" />
                  <Line type="monotone" dataKey="outflow" stroke="#dc2626" strokeWidth={2} dot={false} name="Outflow" />
                </LineChart>
              ) : (
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} />
                  <Bar dataKey="gates" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Gates Open" />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* Summary Stats */}
      {!loading && chartData.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Avg Water Level", value: `${(chartData.reduce((s, d) => s + d.waterLevel, 0) / chartData.length).toFixed(1)} m`, icon: "💧" },
            { label: "Avg Storage", value: `${(chartData.reduce((s, d) => s + d.storage, 0) / chartData.length).toFixed(1)}%`, icon: "📊" },
            { label: "Total Rainfall", value: `${chartData.reduce((s, d) => s + d.rainfall, 0).toFixed(1)} mm`, icon: "🌧️" },
            { label: "Avg Inflow", value: `${(chartData.reduce((s, d) => s + d.inflow, 0) / chartData.length).toFixed(0)}`, icon: "⬇️" },
          ].map((item) => (
            <div key={item.label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
              <div className="text-2xl mb-1">{item.icon}</div>
              <div className="font-bold text-gray-800">{item.value}</div>
              <div className="text-xs text-gray-400 mt-0.5">{item.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
