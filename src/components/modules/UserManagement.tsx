"use client";
import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  phone: string;
  isActive: boolean;
  createdAt: string;
  lastLogin: string;
}

const roleConfig: Record<string, { icon: string; color: string; bg: string }> = {
  admin: { icon: "👑", color: "text-purple-700", bg: "bg-purple-100" },
  dam_operator: { icon: "🔧", color: "text-blue-700", bg: "bg-blue-100" },
  government_officer: { icon: "🏛️", color: "text-green-700", bg: "bg-green-100" },
  citizen: { icon: "👤", color: "text-gray-700", bg: "bg-gray-100" },
};

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", role: "citizen", phone: "" });
  const [adding, setAdding] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/users");
      const json = await res.json();
      setUsers(json.users || []);
    } catch { console.error("Failed to fetch users"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filtered = users.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === "all" || u.role === filterRole;
    return matchSearch && matchRole;
  });

  const handleAddUser = async () => {
    setAdding(true);
    try {
      await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });
      setShowAddModal(false);
      setNewUser({ name: "", email: "", password: "", role: "citizen", phone: "" });
      fetchUsers();
    } catch { console.error("Failed to add user"); }
    finally { setAdding(false); }
  };

  const roleCounts = {
    admin: users.filter((u) => u.role === "admin").length,
    dam_operator: users.filter((u) => u.role === "dam_operator").length,
    government_officer: users.filter((u) => u.role === "government_officer").length,
    citizen: users.filter((u) => u.role === "citizen").length,
  };

  return (
    <div className="space-y-4">
      {/* Role Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Object.entries(roleConfig).map(([role, cfg]) => (
          <div key={role} className={`${cfg.bg} rounded-2xl p-4 text-center`}>
            <div className="text-2xl mb-1">{cfg.icon}</div>
            <div className={`text-2xl font-bold ${cfg.color}`}>{roleCounts[role as keyof typeof roleCounts]}</div>
            <div className={`text-xs font-medium ${cfg.color} capitalize`}>{role.replace("_", " ")}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-wrap gap-3 items-center">
        <input
          type="text"
          placeholder="🔍 Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-48 px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex gap-2">
          {["all", "admin", "dam_operator", "government_officer", "citizen"].map((r) => (
            <button
              key={r}
              onClick={() => setFilterRole(r)}
              className={`px-3 py-2 rounded-lg text-xs font-medium capitalize transition-all ${
                filterRole === r ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {r === "all" ? "All" : `${roleConfig[r]?.icon} ${r.replace("_", " ")}`}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + Add User
        </button>
      </div>

      {/* User Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">User</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Role</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Phone</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Joined</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400">Loading users...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400">No users found</td></tr>
            ) : (
              filtered.map((user, idx) => {
                const cfg = roleConfig[user.role] || roleConfig.citizen;
                return (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 text-sm">{user.name}</p>
                          <p className="text-xs text-gray-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.color} capitalize`}>
                        {cfg.icon} {user.role.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 font-mono">{user.phone || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {user.isActive ? "✓ Active" : "○ Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">{user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN") : "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button className="text-xs text-blue-600 hover:underline">Edit</button>
                        <button className="text-xs text-red-500 hover:underline">Disable</button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
          >
            <h3 className="font-bold text-lg text-gray-800 mb-4">👤 Add New User</h3>
            <div className="space-y-3">
              {[
                { key: "name", label: "Full Name", type: "text" },
                { key: "email", label: "Email Address", type: "email" },
                { key: "password", label: "Password", type: "password" },
                { key: "phone", label: "Phone Number", type: "tel" },
              ].map(({ key, label, type }) => (
                <div key={key}>
                  <label className="text-xs font-medium text-gray-600">{label}</label>
                  <input
                    type={type}
                    value={newUser[key as keyof typeof newUser]}
                    onChange={(e) => setNewUser({ ...newUser, [key]: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
              <div>
                <label className="text-xs font-medium text-gray-600">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="citizen">👤 Citizen</option>
                  <option value="dam_operator">🔧 Dam Operator</option>
                  <option value="government_officer">🏛️ Government Officer</option>
                  <option value="admin">👑 Admin</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowAddModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={handleAddUser} disabled={adding} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                {adding ? "Adding..." : "Add User"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
