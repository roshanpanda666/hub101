"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Types
interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface Resource {
  _id: string;
  subject_name: string;
  branch: string;
  type: string;
  is_approved: boolean;
  uploaded_by: string;
}

interface Config {
  key: string;
  value: string;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"users" | "resources" | "settings">("users");
  const [users, setUsers] = useState<User[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [aiPrompt, setAiPrompt] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === "users") {
        const res = await fetch("/api/admin/users");
        if (res.status === 403 || res.status === 401) return router.push("/admin/login");
        const data = await res.json();
        if (data.success) setUsers(data.users);
      } else if (activeTab === "resources") {
        const res = await fetch("/api/admin/resources");
        if (res.status === 403 || res.status === 401) return router.push("/admin/login");
        const data = await res.json();
        if (data.success) setResources(data.resources);
      } else if (activeTab === "settings") {
        const res = await fetch("/api/admin/config?key=ai_prompt");
        if (res.status === 403 || res.status === 401) return router.push("/admin/login");
        const data = await res.json();
        if (data.success && data.value) setAiPrompt(data.value);
      }
    } catch (e) {
      console.error("Failed to fetch data", e);
    } finally {
      setLoading(false);
    }
  };

  // --- Handlers ---

  const deleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    await fetch(`/api/admin/users?id=${id}`, { method: "DELETE" });
    fetchData(); // Refresh
  };

  const updateUserRole = async (id: string, newRole: string) => {
    await fetch(`/api/admin/users`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: id, role: newRole }),
    });
    fetchData();
  };

  const deleteResource = async (id: string) => {
    if (!confirm("Delete this resource?")) return;
    await fetch(`/api/admin/resources?id=${id}`, { method: "DELETE" });
    fetchData();
  };

  const toggleApproval = async (id: string, currentStatus: boolean) => {
    await fetch(`/api/admin/resources`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resourceId: id, is_approved: !currentStatus }),
    });
    fetchData();
  };

  const saveAiPrompt = async () => {
    await fetch(`/api/admin/config`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "ai_prompt", value: aiPrompt }),
    });
    alert("AI Prompt updated!");
  };

  // --- Render Helpers ---

  if (loading && users.length === 0 && resources.length === 0 && !aiPrompt) {
      return <div className="p-10 text-center">Loading Admin Panel...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
            Admin Dashboard
          </h1>
          <button onClick={() => router.push("/")} className="text-sm text-gray-400 hover:text-white">
            Exit to Home
          </button>
        </header>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-700 pb-2">
          {["users", "resources", "settings"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 rounded-t-lg transition-colors ${
                activeTab === tab
                  ? "bg-purple-600/20 text-purple-400 border-b-2 border-purple-500"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="glass-card p-6 min-h-[500px]">
          {activeTab === "users" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">User Management</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-700 text-gray-400">
                      <th className="p-3">Name</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Role</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user._id} className="border-b border-gray-800 hover:bg-gray-800/50">
                        <td className="p-3">{user.name}</td>
                        <td className="p-3 text-gray-400">{user.email}</td>
                        <td className="p-3">
                          <select
                            value={user.role}
                            onChange={(e) => updateUserRole(user._id, e.target.value)}
                            className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm outline-none focus:border-purple-500"
                          >
                            {["user", "admin", "developer", "cr", "hod"].map((r) => (
                              <option key={r} value={r}>{r}</option>
                            ))}
                          </select>
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => deleteUser(user._id)}
                            className="text-red-400 hover:text-red-300 text-sm"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "resources" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Resource Management</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-700 text-gray-400">
                        <th className="p-3">Subject</th>
                        <th className="p-3">Type</th>
                        <th className="p-3">Branch</th>
                        <th className="p-3">Uploader</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resources.map((res) => (
                        <tr key={res._id} className="border-b border-gray-800 hover:bg-gray-800/50">
                            <td className="p-3">{res.subject_name}</td>
                            <td className="p-3 capitalize">{res.type}</td>
                            <td className="p-3">{res.branch}</td>
                            <td className="p-3 text-sm text-gray-400">{res.uploaded_by}</td>
                            <td className="p-3">
                                <span className={`px-2 py-1 rounded text-xs font-bold ${res.is_approved ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500"}`}>
                                    {res.is_approved ? "Approved" : "Pending"}
                                </span>
                            </td>
                            <td className="p-3 flex gap-2">
                                <button
                                    onClick={() => toggleApproval(res._id, res.is_approved)}
                                    className={`text-xs px-2 py-1 rounded border ${res.is_approved ? "border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/10" : "border-green-500/50 text-green-500 hover:bg-green-500/10"}`}
                                >
                                    {res.is_approved ? "Revoke" : "Approve"}
                                </button>
                                <button
                                    onClick={() => deleteResource(res._id)}
                                    className="text-xs px-2 py-1 rounded border border-red-500/50 text-red-500 hover:bg-red-500/10"
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="max-w-2xl">
              <h2 className="text-xl font-semibold mb-4">AI System Configuration</h2>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-400 mb-2">
                    System Prompt for Gemini AI
                </label>
                <p className="text-xs text-gray-500 mb-2">
                    This instruction set defines how the AI behaves. Changes take effect on the next user query.
                </p>
                <textarea
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    rows={10}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-4 text-sm font-mono text-gray-300 focus:outline-none focus:border-purple-500 resize-y"
                    placeholder="You are a helpful assistant..."
                />
              </div>
              <button
                onClick={saveAiPrompt}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Save Configuration
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
