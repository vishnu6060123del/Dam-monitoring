"use client";
import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import Dashboard from "@/components/modules/Dashboard";
import DamMonitoring from "@/components/modules/DamMonitoring";
import AlertSystem from "@/components/modules/AlertSystem";
import VillageManagement from "@/components/modules/VillageManagement";
import GISMap from "@/components/modules/GISMap";
import WeatherMonitoring from "@/components/modules/WeatherMonitoring";
import FloodPrediction from "@/components/modules/FloodPrediction";
import AIAnalysis from "@/components/modules/AIAnalysis";
import EmergencyResponse from "@/components/modules/EmergencyResponse";
import HistoricalAnalytics from "@/components/modules/HistoricalAnalytics";
import Reports from "@/components/modules/Reports";
import UserManagement from "@/components/modules/UserManagement";
import IoTSensors from "@/components/modules/IoTSensors";
import WaterReleasePrediction from "@/components/modules/WaterReleasePrediction";
import Logs from "@/components/modules/Logs";
import { AnimatePresence, motion } from "framer-motion";

function ModuleContent({ module }: { module: string }) {
  const components: Record<string, React.ReactNode> = {
    dashboard: <Dashboard />,
    dams: <DamMonitoring />,
    prediction: <WaterReleasePrediction />,
    alerts: <AlertSystem />,
    villages: <VillageManagement />,
    map: <GISMap />,
    weather: <WeatherMonitoring />,
    flood: <FloodPrediction />,
    ai: <AIAnalysis />,
    emergency: <EmergencyResponse />,
    analytics: <HistoricalAnalytics />,
    reports: <Reports />,
    iot: <IoTSensors />,
    users: <UserManagement />,
    logs: <Logs />,
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={module}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
      >
        {components[module] || <Dashboard />}
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  const { user, setUser, activeModule, isDarkMode } = useAppStore();

  useEffect(() => {
    // Set default open-source user if not already set
    if (!user) {
      setUser({
        id: 0,
        name: "DamGuard Open Source",
        email: "opensource@damguard.local",
        role: "admin",
      });
    }
  }, [user, setUser]);

  return (
    <div className={`h-screen flex overflow-hidden ${isDarkMode ? "dark bg-gray-900" : "bg-gray-50"}`}>
      {/* Sidebar */}
      <div className="flex-shrink-0 h-full">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-5 custom-scroll">
          <ModuleContent module={activeModule} />
        </main>
      </div>
    </div>
  );
}
