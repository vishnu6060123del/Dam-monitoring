"use client";
import { useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { motion } from "framer-motion";
import { ChevronDown, Download, Filter, Search, Trash2 } from "lucide-react";

interface Log {
  id: number;
  userId: number | null;
  userName: string | null;
  userEmail: string | null;
  action: string;
  resource: string;
  resourceId: number | null;
  details: any;
  ipAddress: string | null;
  createdAt: string;
}

export default function Logs() {
  const { user, isDarkMode } = useAppStore();
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [resource, setResource] = useState("");
  const [action, setAction] = useState("");
  const [expandedLog, setExpandedLog] = useState<number | null>(null);

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== "admin") {
      window.location.href = "/";
    }
  }, [user]);

  // Fetch logs
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          ...(search && { search }),
          ...(resource && { resource }),
          ...(action && { action }),
        });

        const response = await fetch(`/api/logs?${params}`);
        if (!response.ok) throw new Error("Failed to fetch logs");

        const result = await response.json();
        setLogs(result.data);
        setTotal(result.pagination.total);
      } catch (error) {
        console.error("Error fetching logs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [page, limit, search, resource, action]);

  const handleExportCSV = () => {
    const csv = [
      ["ID", "User", "Email", "Action", "Resource", "IP Address", "Date"],
      ...logs.map((log) => [
        log.id,
        log.userName || "N/A",
        log.userEmail || "N/A",
        log.action,
        log.resource,
        log.ipAddress || "N/A",
        new Date(log.createdAt).toLocaleString(),
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString()}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const pages = Math.ceil(total / limit);

  if (user?.role !== "admin") {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className={`text-3xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
            System Logs
          </h2>
          <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
            View all system activity and audit logs
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
        >
          <Download size={18} />
          Export CSV
        </button>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className={`p-4 rounded-lg ${isDarkMode ? "bg-gray-800" : "bg-white"} shadow-md space-y-3`}
      >
        <div className="flex items-center gap-2 mb-3">
          <Filter size={20} />
          <h3 className={`font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>Filters</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
              Search
            </label>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="User, email, action..."
                className={`w-full pl-9 pr-3 py-2 rounded-lg border ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
              Resource
            </label>
            <select
              value={resource}
              onChange={(e) => {
                setResource(e.target.value);
                setPage(1);
              }}
              className={`w-full px-3 py-2 rounded-lg border ${
                isDarkMode
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="">All Resources</option>
              <option value="user">User</option>
              <option value="dam">Dam</option>
              <option value="alert">Alert</option>
              <option value="village">Village</option>
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
              Action
            </label>
            <select
              value={action}
              onChange={(e) => {
                setAction(e.target.value);
                setPage(1);
              }}
              className={`w-full px-3 py-2 rounded-lg border ${
                isDarkMode
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="">All Actions</option>
              <option value="CREATE">Create</option>
              <option value="UPDATE">Update</option>
              <option value="DELETE">Delete</option>
              <option value="LOGIN">Login</option>
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
              Per Page
            </label>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(parseInt(e.target.value));
                setPage(1);
              }}
              className={`w-full px-3 py-2 rounded-lg border ${
                isDarkMode
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Logs Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className={`rounded-lg ${isDarkMode ? "bg-gray-800" : "bg-white"} shadow-md overflow-hidden`}
      >
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center">
            <p className={isDarkMode ? "text-gray-400" : "text-gray-500"}>No logs found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className={`${isDarkMode ? "bg-gray-700" : "bg-gray-50"} border-b ${isDarkMode ? "border-gray-600" : "border-gray-200"}`}>
                <tr>
                  <th className={`px-6 py-3 text-left font-semibold ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>ID</th>
                  <th className={`px-6 py-3 text-left font-semibold ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>User</th>
                  <th className={`px-6 py-3 text-left font-semibold ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Action</th>
                  <th className={`px-6 py-3 text-left font-semibold ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Resource</th>
                  <th className={`px-6 py-3 text-left font-semibold ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>IP Address</th>
                  <th className={`px-6 py-3 text-left font-semibold ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Date</th>
                  <th className={`px-6 py-3 text-left font-semibold ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}></th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, idx) => (
                  <motion.tr
                    key={log.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.02 }}
                    className={`border-b ${isDarkMode ? "border-gray-700 hover:bg-gray-700" : "border-gray-200 hover:bg-gray-50"} transition-colors`}
                  >
                    <td className={`px-6 py-4 font-mono text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                      #{log.id}
                    </td>
                    <td className={`px-6 py-4 ${isDarkMode ? "text-gray-200" : "text-gray-900"}`}>
                      <div>
                        <p className="font-medium">{log.userName || "System"}</p>
                        <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>{log.userEmail}</p>
                      </div>
                    </td>
                    <td className={`px-6 py-4 font-medium`}>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        log.action === "CREATE" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" :
                        log.action === "UPDATE" ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" :
                        log.action === "DELETE" ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" :
                        "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className={`px-6 py-4 capitalize ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                      {log.resource}
                    </td>
                    <td className={`px-6 py-4 font-mono text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                      {log.ipAddress || "N/A"}
                    </td>
                    <td className={`px-6 py-4 text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                        className={`p-1 rounded hover:bg-opacity-50 ${isDarkMode ? "hover:bg-gray-600" : "hover:bg-gray-200"}`}
                      >
                        <ChevronDown
                          size={18}
                          className={`transition-transform ${expandedLog === log.id ? "rotate-180" : ""}`}
                        />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Pagination */}
      {pages > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-between"
        >
          <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} logs
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className={`px-3 py-2 rounded-lg ${
                page === 1
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-blue-600 hover:text-white transition-all"
              } ${isDarkMode ? "bg-gray-800 text-gray-300" : "bg-gray-200 text-gray-800"}`}
            >
              Previous
            </button>
            {Array.from({ length: Math.min(5, pages) }, (_, i) => {
              const pageNum = page > 3 ? page - 2 + i : i + 1;
              if (pageNum > pages) return null;
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`px-3 py-2 rounded-lg transition-all ${
                    pageNum === page
                      ? "bg-blue-600 text-white"
                      : `${isDarkMode ? "bg-gray-800 hover:bg-gray-700" : "bg-gray-200 hover:bg-gray-300"}`
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setPage(Math.min(pages, page + 1))}
              disabled={page === pages}
              className={`px-3 py-2 rounded-lg ${
                page === pages
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-blue-600 hover:text-white transition-all"
              } ${isDarkMode ? "bg-gray-800 text-gray-300" : "bg-gray-200 text-gray-800"}`}
            >
              Next
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
