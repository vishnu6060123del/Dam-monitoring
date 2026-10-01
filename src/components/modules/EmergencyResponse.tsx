"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Contact {
  id: number;
  name: string;
  designation: string;
  department: string;
  phone: string;
  phone2: string;
  email: string;
  district: string;
  state: string;
}

const deptConfig: Record<string, { icon: string; color: string; bg: string; label: string }> = {
  police: { icon: "👮", color: "text-blue-700", bg: "bg-blue-50", label: "Police" },
  fire: { icon: "🚒", color: "text-red-700", bg: "bg-red-50", label: "Fire Brigade" },
  hospital: { icon: "🏥", color: "text-green-700", bg: "bg-green-50", label: "Hospital" },
  ambulance: { icon: "🚑", color: "text-orange-700", bg: "bg-orange-50", label: "Ambulance" },
  disaster_management: { icon: "🛡️", color: "text-purple-700", bg: "bg-purple-50", label: "Disaster Mgmt" },
};

const shelters = [
  { name: "Government High School, Mysuru", capacity: 500, contact: "+91-9800011111", district: "Mysuru" },
  { name: "Community Hall, Nalgonda", capacity: 300, contact: "+91-9800022222", district: "Nalgonda" },
  { name: "District Stadium, Salem", capacity: 1000, contact: "+91-9800033333", district: "Salem" },
  { name: "Panchayat Office, Sambalpur", capacity: 200, contact: "+91-9800044444", district: "Sambalpur" },
  { name: "Dharamshala, Bilaspur", capacity: 400, contact: "+91-9800055555", district: "Bilaspur" },
];

const evacuationRoutes = [
  { from: "Village A, Mysuru", to: "Government School Shelter", distance: "5.2 km", route: "NH-275 → Ring Road → School Road", status: "clear" },
  { from: "Village B, Nalgonda", to: "Community Hall", distance: "8.5 km", route: "SH-4 → NH-163 → Hall Street", status: "clear" },
  { from: "Village C, Salem", to: "District Stadium", distance: "12.0 km", route: "Salem Bypass → Stadium Road", status: "caution" },
  { from: "Village A, Sambalpur", to: "Panchayat Office", distance: "3.8 km", route: "River Road → Panchayat Lane", status: "blocked" },
];

export default function EmergencyResponse() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDept, setFilterDept] = useState("all");
  const [broadcastSent, setBroadcastSent] = useState(false);

  useEffect(() => {
    fetch("/api/emergency")
      .then((r) => r.json())
      .then((json) => { setContacts(json.contacts || []); setLoading(false); });
  }, []);

  const filtered = filterDept === "all" ? contacts : contacts.filter((c) => c.department === filterDept);

  const handleBroadcast = async () => {
    setBroadcastSent(true);
    await new Promise((r) => setTimeout(r, 2000));
    alert("🚨 Emergency broadcast sent to all authorities!\n✅ Police notified\n✅ Fire Brigade alerted\n✅ Hospitals prepared\n✅ Ambulances dispatched\n✅ Disaster management activated");
    setBroadcastSent(false);
  };

  return (
    <div className="space-y-4">
      {/* Emergency Banner */}
      <div className="bg-red-600 rounded-2xl p-5 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">🚨 Emergency Response Command Center</h2>
            <p className="text-red-100 text-sm mt-1">One-click emergency broadcast to all authorities</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleBroadcast}
            disabled={broadcastSent}
            className="bg-white text-red-600 font-bold px-6 py-3 rounded-xl hover:bg-red-50 transition-colors flex items-center gap-2 shadow-lg"
          >
            {broadcastSent ? (
              <><div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div> Sending...</>
            ) : (
              <><span className="text-xl">📡</span> EMERGENCY BROADCAST</>
            )}
          </motion.button>
        </div>
        <div className="grid grid-cols-4 gap-3 mt-4">
          {["📱 SMS", "📧 Email", "💬 WhatsApp", "📻 Radio"].map((ch) => (
            <div key={ch} className="bg-white/10 rounded-lg py-2 text-center text-sm">{ch}</div>
          ))}
        </div>
      </div>

      {/* Quick Contacts */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {["100", "101", "102", "108", "1077"].map((num, i) => {
          const labels = ["🚔 Police", "🚒 Fire", "🚑 Ambulance", "🏥 Emergency", "🛡️ Disaster"];
          return (
            <motion.a
              key={num}
              href={`tel:${num}`}
              whileHover={{ scale: 1.05 }}
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center hover:shadow-md transition-all cursor-pointer"
            >
              <p className="text-2xl mb-1">{labels[i].split(" ")[0]}</p>
              <p className="font-bold text-2xl text-blue-600">{num}</p>
              <p className="text-xs text-gray-500 mt-0.5">{labels[i].slice(3)}</p>
            </motion.a>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Contacts */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex gap-2 flex-wrap">
            {["all", ...Object.keys(deptConfig)].map((dept) => (
              <button
                key={dept}
                onClick={() => setFilterDept(dept)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                  filterDept === dept ? "bg-blue-600 text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                {dept === "all" ? "All Contacts" : `${deptConfig[dept]?.icon} ${deptConfig[dept]?.label}`}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center p-8"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filtered.map((contact) => {
                const cfg = deptConfig[contact.department] || deptConfig.police;
                return (
                  <motion.div
                    key={contact.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`${cfg.bg} rounded-2xl p-4 border border-white shadow-sm`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{cfg.icon}</span>
                      <div className="flex-1">
                        <p className={`font-semibold text-sm ${cfg.color}`}>{contact.name}</p>
                        <p className="text-xs text-gray-500">{contact.designation}</p>
                        <p className="text-xs text-gray-400">{contact.district}, {contact.state}</p>
                        <div className="mt-2 flex gap-2 flex-wrap">
                          <a href={`tel:${contact.phone}`} className={`text-xs font-bold px-2 py-1 rounded-lg bg-white ${cfg.color} hover:opacity-80 transition-opacity`}>
                            📞 {contact.phone}
                          </a>
                          {contact.phone2 && (
                            <a href={`tel:${contact.phone2}`} className={`text-xs font-bold px-2 py-1 rounded-lg bg-white ${cfg.color} hover:opacity-80`}>
                              📞 {contact.phone2}
                            </a>
                          )}
                        </div>
                        {contact.email && (
                          <a href={`mailto:${contact.email}`} className="text-xs text-blue-500 hover:underline mt-1 block">{contact.email}</a>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Shelters & Routes */}
        <div className="space-y-4">
          {/* Shelters */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-3">🏥 Relief Shelters</h3>
            <div className="space-y-2">
              {shelters.map((s, i) => (
                <div key={i} className="bg-green-50 rounded-xl p-3">
                  <p className="text-sm font-medium text-green-800">{s.name}</p>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-green-600">👥 Cap: {s.capacity}</span>
                    <span className="text-xs text-green-600 font-mono">{s.contact}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Evacuation Routes */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-3">🛣️ Evacuation Routes</h3>
            <div className="space-y-2">
              {evacuationRoutes.map((r, i) => (
                <div key={i} className={`rounded-xl p-3 ${r.status === "clear" ? "bg-green-50" : r.status === "caution" ? "bg-yellow-50" : "bg-red-50"}`}>
                  <div className="flex justify-between items-start">
                    <p className="text-xs font-medium text-gray-700">{r.from}</p>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${r.status === "clear" ? "bg-green-200 text-green-800" : r.status === "caution" ? "bg-yellow-200 text-yellow-800" : "bg-red-200 text-red-800"}`}>
                      {r.status === "clear" ? "✓ Clear" : r.status === "caution" ? "⚠ Caution" : "✕ Blocked"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">→ {r.to} ({r.distance})</p>
                  <p className="text-xs text-gray-400 mt-0.5 font-mono">{r.route}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
