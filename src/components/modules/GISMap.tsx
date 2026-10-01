"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const MapComponent = dynamic(() => import("@/components/MapComponent"), { ssr: false, loading: () => (
  <div className="flex items-center justify-center h-full bg-blue-50 rounded-2xl">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
      <p className="text-blue-600 font-medium">Loading Interactive Map...</p>
    </div>
  </div>
) });

interface Dam {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  safetyStatus: string;
  waterLevel: number;
  maxWaterLevel: number;
  gatesOpen: number;
  totalGates: number;
  state: string;
  riverName: string;
}

interface Village {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  riskZone: string;
  population: number;
  damName: string;
}

export default function GISMap() {
  const [dams, setDams] = useState<Dam[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLayer, setShowLayer] = useState({ dams: true, villages: true, floodZones: true, shelters: true });

  useEffect(() => {
    Promise.all([
      fetch("/api/dams").then((r) => r.json()),
      fetch("/api/villages").then((r) => r.json()),
    ]).then(([damsData, villagesData]) => {
      setDams(damsData.dams || []);
      setVillages(villagesData.villages || []);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-4 h-full">
      {/* Layer controls */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-wrap gap-3 items-center">
        <span className="font-semibold text-gray-700 text-sm">Map Layers:</span>
        {Object.entries(showLayer).map(([layer, visible]) => (
          <button
            key={layer}
            onClick={() => setShowLayer((prev) => ({ ...prev, [layer]: !prev[layer as keyof typeof prev] }))}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
              visible ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500"
            }`}
          >
            {layer === "dams" ? "🏗️" : layer === "villages" ? "🏘️" : layer === "floodZones" ? "🌊" : "🏥"} {layer === "floodZones" ? "Flood Zones" : layer.charAt(0).toUpperCase() + layer.slice(1)}
          </button>
        ))}
        <div className="ml-auto flex gap-4 text-xs">
          <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-green-500"></div> Normal</span>
          <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-yellow-500"></div> Watch</span>
          <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-orange-500"></div> Warning</span>
          <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-red-500"></div> Danger</span>
        </div>
      </div>

      {/* Map */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden" style={{ height: "calc(100vh - 280px)", minHeight: "400px" }}>
        {loading ? (
          <div className="flex items-center justify-center h-full bg-blue-50">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-blue-600 font-medium">Loading Map Data...</p>
            </div>
          </div>
        ) : (
          <MapComponent dams={dams} villages={villages} showLayer={showLayer} />
        )}
      </div>
    </div>
  );
}
