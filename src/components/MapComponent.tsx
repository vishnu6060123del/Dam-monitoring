"use client";
import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

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

interface ShowLayer {
  dams: boolean;
  villages: boolean;
  floodZones: boolean;
  shelters: boolean;
}

interface MapComponentProps {
  dams: Dam[];
  villages: Village[];
  showLayer: ShowLayer;
}

const statusColors: Record<string, string> = {
  normal: "#16a34a",
  watch: "#f59e0b",
  warning: "#f97316",
  danger: "#dc2626",
};

const riskColors: Record<string, string> = {
  low: "#16a34a",
  medium: "#f59e0b",
  high: "#f97316",
  critical: "#dc2626",
};

export default function MapComponent({ dams, villages, showLayer }: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersRef = useRef<L.LayerGroup[]>([]);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Fix leaflet default marker icons
    delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });

    // Center on India
    const map = L.map(mapRef.current, {
      center: [20.5937, 78.9629],
      zoom: 5,
      zoomControl: true,
    });

    mapInstanceRef.current = map;

    // Tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
    }).addTo(map);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing layers
    layersRef.current.forEach((l) => map.removeLayer(l));
    layersRef.current = [];

    // Dam markers
    if (showLayer.dams && dams.length > 0) {
      const damLayer = L.layerGroup();
      dams.forEach((dam) => {
        if (!dam.latitude || !dam.longitude) return;
        const color = statusColors[dam.safetyStatus] || "#2563eb";
        const icon = L.divIcon({
          className: "",
          html: `<div style="
            width:36px;height:36px;
            background:${color};
            border:3px solid white;
            border-radius:50%;
            display:flex;align-items:center;justify-content:center;
            font-size:16px;
            box-shadow:0 2px 8px rgba(0,0,0,0.3);
            cursor:pointer;
          ">🏗️</div>`,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });

        const pct = dam.maxWaterLevel ? (dam.waterLevel / dam.maxWaterLevel) * 100 : 0;
        const marker = L.marker([dam.latitude, dam.longitude], { icon })
          .bindPopup(`
            <div style="font-family:sans-serif;min-width:200px">
              <h3 style="font-weight:bold;font-size:14px;margin:0 0 8px">${dam.name}</h3>
              <p style="margin:2px 0;font-size:12px">🏞️ River: ${dam.riverName}</p>
              <p style="margin:2px 0;font-size:12px">📍 ${dam.state}</p>
              <p style="margin:2px 0;font-size:12px">💧 Water Level: ${dam.waterLevel?.toFixed(1)} / ${dam.maxWaterLevel} m</p>
              <p style="margin:2px 0;font-size:12px">🚪 Gates: ${dam.gatesOpen} / ${dam.totalGates} open</p>
              <div style="margin-top:8px;background:#f3f4f6;border-radius:4px;height:8px;overflow:hidden">
                <div style="width:${pct}%;height:100%;background:${color};border-radius:4px"></div>
              </div>
              <p style="font-size:10px;color:${color};font-weight:bold;margin-top:4px">Status: ${dam.safetyStatus?.toUpperCase()}</p>
            </div>
          `);
        damLayer.addLayer(marker);

        // Flood zone circle
        if (showLayer.floodZones && dam.safetyStatus !== "normal") {
          const circle = L.circle([dam.latitude, dam.longitude], {
            radius: 20000,
            fillColor: color,
            fillOpacity: 0.1,
            color,
            weight: 2,
            opacity: 0.4,
            dashArray: "6",
          });
          damLayer.addLayer(circle);
        }
      });
      damLayer.addTo(map);
      layersRef.current.push(damLayer);
    }

    // Village markers
    if (showLayer.villages && villages.length > 0) {
      const villageLayer = L.layerGroup();
      villages.forEach((village) => {
        if (!village.latitude || !village.longitude) return;
        const color = riskColors[village.riskZone] || "#16a34a";
        const icon = L.divIcon({
          className: "",
          html: `<div style="
            width:28px;height:28px;
            background:${color};
            border:2px solid white;
            border-radius:4px;
            display:flex;align-items:center;justify-content:center;
            font-size:13px;
            box-shadow:0 2px 6px rgba(0,0,0,0.2);
            cursor:pointer;
          ">🏘️</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const marker = L.marker([village.latitude, village.longitude], { icon })
          .bindPopup(`
            <div style="font-family:sans-serif;min-width:180px">
              <h3 style="font-weight:bold;font-size:13px;margin:0 0 6px">${village.name}</h3>
              <p style="margin:2px 0;font-size:12px">👥 Population: ${village.population?.toLocaleString()}</p>
              <p style="margin:2px 0;font-size:12px">🏗️ Dam: ${village.damName}</p>
              <p style="margin:2px 0;font-size:12px;color:${color};font-weight:bold">⚠️ Risk: ${village.riskZone?.toUpperCase()}</p>
            </div>
          `);
        villageLayer.addLayer(marker);
      });
      villageLayer.addTo(map);
      layersRef.current.push(villageLayer);
    }

    // Fit map to markers
    if (dams.length > 0) {
      const bounds = L.latLngBounds(
        dams.filter((d) => d.latitude && d.longitude).map((d) => [d.latitude, d.longitude] as [number, number])
      );
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [40, 40] });
      }
    }
  }, [dams, villages, showLayer]);

  return <div ref={mapRef} style={{ width: "100%", height: "100%", minHeight: "400px" }} />;
}
