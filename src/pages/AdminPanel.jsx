import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import UserService from "../api/user-services";

export default function AdminPanel() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const myId = user?.id;

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  // Edit modal state
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    role: "user",
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState(null);

  // Delete confirmation
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await UserService.getAllUsers();
      setUsers(data.data || data.users || []);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to load users.",
      );
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (u) => {
    setEditingUser(u);
    setEditForm({
      name: u.name || "",
      email: u.email || "",
      role: u.role || "user",
    });
    setEditError(null);
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError(null);
    try {
      const updated = await UserService.updateUser(editingUser.id, editForm);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editingUser.id ? { ...u, ...editForm } : u,
        ),
      );
      setEditingUser(null);
    } catch (err) {
      setEditError(
        err.response?.data?.message || err.message || "Update failed.",
      );
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await UserService.deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Delete failed.");
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = users.filter(
    (u) =>
      !search.trim() ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()),
  );

  const stats = {
    total: users.length,
    admins: users.filter((u) => u.role === "admin").length,
    regular: users.filter((u) => u.role !== "admin").length,
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="border-b border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-6 py-4 flex items-center justify-between sticky top-0 z-10 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              Admin Panel
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Manage users and platform settings
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-full border border-indigo-600/20">
            {user?.name}
          </span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* ── Stats ─────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Users", value: stats.total, color: "indigo" },
            { label: "Admins", value: stats.admins, color: "amber" },
            { label: "Regular", value: stats.regular, color: "emerald" },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/10 p-5 shadow-sm"
            >
              <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
                {label}
              </p>
              <p
                className={`text-3xl font-black text-${color}-600 dark:text-${color}-400`}
              >
                {loading ? "—" : value}
              </p>
            </div>
          ))}
        </div>

        {/* ── Error ─────────────────────────────────────────── */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[13px] flex items-center gap-3 animate-fade-in">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
            <button
              onClick={() => setError(null)}
              className="ml-auto text-rose-400 hover:text-rose-600"
            >
              ✕
            </button>
          </div>
        )}

        {/* ── Users Table ───────────────────────────────────── */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden">
          {/* Table Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-white/10">
            <h2 className="text-[14px] font-bold text-slate-900 dark:text-white">
              Users
            </h2>
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-[13px] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all w-52"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16 text-slate-400">
              <svg
                className="w-5 h-5 animate-spin mr-2"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
              Loading users...
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-slate-400 dark:text-slate-500 text-[13px]">
              No users found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-white/5">
                    <th className="px-5 py-3">User</th>
                    <th className="px-5 py-3">Role</th>
                    <th className="px-5 py-3 hidden sm:table-cell">Joined</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {filtered.map((u) => (
                    <tr
                      key={u.id}
                      className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-[12px] font-bold shrink-0">
                            {(u.name || u.email || "?")[0].toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[13px] font-semibold text-slate-900 dark:text-white truncate">
                              {u.name || "—"}
                            </p>
                            <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                              {u.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                            u.role === "admin"
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                              : "bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/10"
                          }`}
                        >
                          {u.role || "user"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 hidden sm:table-cell">
                        <span className="text-[12px] text-slate-400 dark:text-slate-500">
                          {u.createdAt
                            ? new Date(u.createdAt).toLocaleDateString()
                            : "—"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-2">
                          {/* Don't allow editing/deleting self */}
                          {u.id !== myId ? (
                            <>
                              <button
                                onClick={() => openEdit(u)}
                                className="text-[12px] px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all font-medium"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => {
                                  if (
                                    window.confirm(
                                      `Delete ${u.name || u.email}? This cannot be undone.`,
                                    )
                                  ) {
                                    handleDelete(u.id);
                                  }
                                }}
                                disabled={deletingId === u.id}
                                className="text-[12px] px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-all font-medium disabled:opacity-50"
                              >
                                {deletingId === u.id ? "..." : "Delete"}
                              </button>
                            </>
                          ) : (
                            <span className="text-[11px] text-slate-400 dark:text-slate-500 italic font-medium">
                              You
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Edit Modal ────────────────────────────────────────── */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 w-full max-w-sm p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[15px] font-bold text-slate-900 dark:text-white">
                Edit User
              </h3>
              <button
                onClick={() => setEditingUser(null)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg text-slate-400 transition-all"
              >
                ✕
              </button>
            </div>

            {editError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[12px]">
                {editError}
              </div>
            )}

            <form onSubmit={handleEditSave} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                  Name
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, name: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-transparent text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-[13px] transition-all"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, email: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-transparent text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-[13px] transition-all"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                  Role
                </label>
                <select
                  value={editForm.role}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, role: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-[13px] transition-all"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 text-[13px] font-semibold hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 text-white text-[13px] font-bold transition-all flex items-center justify-center gap-2"
                >
                  {editLoading ? (
                    <svg
                      className="w-4 h-4 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                      />
                    </svg>
                  ) : (
                    "Save changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
