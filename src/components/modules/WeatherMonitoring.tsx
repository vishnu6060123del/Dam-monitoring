"use client";
import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

interface WeatherData {
  id: number;
  damId: number;
  damName: string;
  damState: string;
  temperature: number;
  humidity: number;
  rainfall: number;
  windSpeed: number;
  weatherCondition: string;
  forecast24h: Array<{ hour: string; rainfall: number }>;
  recordedAt: string;
}

const weatherIcons: Record<string, string> = {
  "Heavy Rain": "🌧️",
  "Moderate Rain": "🌦️",
  Cloudy: "☁️",
  Thunderstorm: "⛈️",
  Clear: "☀️",
  Sunny: "🌞",
};

export default function WeatherMonitoring() {
  const [weather, setWeather] = useState<WeatherData[]>([]);
  const [selected, setSelected] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchWeather = useCallback(async () => {
    try {
      const res = await fetch("/api/weather");
      const json = await res.json();
      setWeather(json.weather || []);
      if (!selected && json.weather?.length > 0) setSelected(json.weather[0]);
    } catch { console.error("Failed to fetch weather"); }
    finally { setLoading(false); }
  }, [selected]);

  useEffect(() => {
    fetchWeather();
    const interval = setInterval(fetchWeather, 30000);
    return () => clearInterval(interval);
  }, [fetchWeather]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Weather Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {weather.map((w) => (
          <motion.div
            key={w.id}
            whileHover={{ y: -2 }}
            onClick={() => setSelected(w)}
            className={`bg-white rounded-2xl p-5 shadow-sm border cursor-pointer transition-all ${
              selected?.id === w.id ? "border-blue-400 shadow-blue-100 shadow-md" : "border-gray-100"
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-gray-800 text-sm">{w.damName}</h3>
                <p className="text-xs text-gray-400">{w.damState}</p>
              </div>
              <span className="text-3xl">{weatherIcons[w.weatherCondition] || "🌤️"}</span>
            </div>
            <p className="text-xs text-gray-500 font-medium mb-3">{w.weatherCondition}</p>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-orange-50 rounded-xl p-2.5">
                <p className="text-xs text-orange-500">🌡️ Temperature</p>
                <p className="font-bold text-orange-800">{w.temperature?.toFixed(1)}°C</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-2.5">
                <p className="text-xs text-blue-500">💧 Rainfall</p>
                <p className="font-bold text-blue-800">{w.rainfall?.toFixed(1)} mm</p>
              </div>
              <div className="bg-cyan-50 rounded-xl p-2.5">
                <p className="text-xs text-cyan-500">💦 Humidity</p>
                <p className="font-bold text-cyan-800">{w.humidity?.toFixed(1)}%</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-2.5">
                <p className="text-xs text-gray-500">💨 Wind</p>
                <p className="font-bold text-gray-800">{w.windSpeed?.toFixed(1)} km/h</p>
              </div>
            </div>

            {/* Rainfall bar */}
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Rainfall intensity</span>
                <span className={w.rainfall > 30 ? "text-red-600 font-bold" : w.rainfall > 15 ? "text-orange-500" : "text-green-600"}>{w.rainfall > 30 ? "Heavy" : w.rainfall > 15 ? "Moderate" : "Light"}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${w.rainfall > 30 ? "bg-red-500" : w.rainfall > 15 ? "bg-orange-500" : "bg-blue-500"}`}
                  style={{ width: `${Math.min((w.rainfall / 50) * 100, 100)}%` }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Selected Dam Forecast */}
      {selected && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
        >
          <h3 className="font-semibold text-gray-800 mb-4">
            📊 24-Hour Rainfall Forecast — {selected.damName}
          </h3>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={Array.isArray(selected.forecast24h) ? selected.forecast24h : []}>
                <defs>
                  <linearGradient id="rainfallGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="hour" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} unit=" mm" />
                <Tooltip
                  contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
                  labelStyle={{ fontWeight: "bold" }}
                />
                <Area type="monotone" dataKey="rainfall" stroke="#2563eb" fill="url(#rainfallGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Weather Summary */}
          <div className="mt-4 grid grid-cols-4 gap-3">
            {[
              { icon: "🌡️", label: "Temperature", value: `${selected.temperature?.toFixed(1)}°C`, color: "text-orange-600" },
              { icon: "💧", label: "Rainfall", value: `${selected.rainfall?.toFixed(1)} mm`, color: "text-blue-600" },
              { icon: "💦", label: "Humidity", value: `${selected.humidity?.toFixed(1)}%`, color: "text-cyan-600" },
              { icon: "💨", label: "Wind Speed", value: `${selected.windSpeed?.toFixed(1)} km/h`, color: "text-gray-600" },
            ].map((item) => (
              <div key={item.label} className="bg-gray-50 rounded-xl p-3 text-center">
                <div className="text-xl mb-1">{item.icon}</div>
                <div className={`font-bold text-sm ${item.color}`}>{item.value}</div>
                <div className="text-xs text-gray-400">{item.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
