import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import UserService from "../api/user-services";
import {
  getUserUsage,
  updateUserPlan,
  resetUserUsage,
  lockUser,
  unlockUser,
  getAllPlans,
} from "../api/usage-services";

// ── small helpers ──────────────────────────────────────────────────────────────

const PLAN_COLORS = {
  free:       "bg-slate-500/10 text-slate-400  border-slate-500/20",
  pro:        "bg-amber-500/10 text-amber-400  border-amber-500/20",
  enterprise: "bg-violet-500/10 text-violet-400 border-violet-500/20",
};

function MiniGauges({ resources }) {
  if (!resources) return null;
  const items = [
    { key: "images",    label: "Img",  color: "indigo" },
    { key: "videos",    label: "Vid",  color: "violet" },
    { key: "apiCalls",  label: "API",  color: "amber"  },
    { key: "documents", label: "Doc",  color: "emerald"},
  ];
  return (
    <div className="grid grid-cols-2 gap-2 mt-3">
      {items.map(({ key, label, color }) => {
        const { used = 0, limit = 0 } = resources[key] || {};
        const pct = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;
        const danger = pct >= 90;
        return (
          <div key={key}>
            <div className="flex justify-between text-[10px] text-slate-400 mb-1">
              <span>{label}</span>
              <span className={danger ? "text-rose-400" : ""}>{used}/{limit}</span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${danger ? "bg-rose-500" : `bg-${color}-500`}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── main ───────────────────────────────────────────────────────────────────────

export default function AdminPanel() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const myId = user?.id;

  // ── page-level tab ────────────────────────────────────────────
  const [pageTab, setPageTab] = useState("users");

  // ── users tab state ───────────────────────────────────────────
  const [users, setUsers]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [search, setSearch]       = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm]   = useState({ name: "", email: "", role: "user" });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // ── usage tab state ───────────────────────────────────────────
  const [plans, setPlans]           = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);   // { id, name, email }
  const [userUsage, setUserUsage]   = useState(null);
  const [usageLoading, setUsageLoading] = useState(false);
  const [usageError, setUsageError] = useState(null);
  const [planDraft, setPlanDraft]   = useState("");
  const [lockReason, setLockReason] = useState("");
  const [actionLoading, setActionLoading] = useState(null); // 'plan'|'lock'|'unlock'|'reset'
  const [actionMsg, setActionMsg]   = useState(null);

  // ── fetch users on mount ──────────────────────────────────────
  useEffect(() => {
    fetchUsers();
  }, []);

  // ── fetch plans when usage tab opens ─────────────────────────
  useEffect(() => {
    if (pageTab !== "usage" || plans.length > 0) return;
    getAllPlans().then(setPlans).catch(() => {});
  }, [pageTab]);

  // ── fetch per-user usage when a user is selected ─────────────
  useEffect(() => {
    if (!selectedUser) return;
    setUsageLoading(true);
    setUsageError(null);
    setActionMsg(null);
    getUserUsage(selectedUser.id)
      .then(data => { setUserUsage(data); setPlanDraft(data.plan || ""); })
      .catch(err => setUsageError(err.response?.data?.message || "Failed to load usage."))
      .finally(() => setUsageLoading(false));
  }, [selectedUser]);

  const fetchUsers = async () => {
    setLoading(true); setError(null);
    try {
      const data = await UserService.getAllUsers();
      setUsers(data.data || data.users || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load users.");
    } finally { setLoading(false); }
  };

  const openEdit = (u) => {
    setEditingUser(u);
    setEditForm({ name: u.name || "", email: u.email || "", role: u.role || "user" });
    setEditError(null);
  };

  const handleEditSave = async (e) => {
    e.preventDefault(); setEditLoading(true); setEditError(null);
    try {
      await UserService.updateUser(editingUser.id, editForm);
      setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...editForm } : u));
      setEditingUser(null);
    } catch (err) {
      setEditError(err.response?.data?.message || "Update failed.");
    } finally { setEditLoading(false); }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await UserService.deleteUser(id);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (err) {
      setError(err.response?.data?.message || "Delete failed.");
    } finally { setDeletingId(null); }
  };

  // ── usage tab actions ─────────────────────────────────────────
  const doAction = useCallback(async (type, fn) => {
    setActionLoading(type); setActionMsg(null); setUsageError(null);
    try {
      await fn();
      // Refresh usage after action
      const fresh = await getUserUsage(selectedUser.id);
      setUserUsage(fresh); setPlanDraft(fresh.plan || "");
      setActionMsg(`✓ Done`);
      setTimeout(() => setActionMsg(null), 3000);
    } catch (err) {
      setUsageError(err.response?.data?.message || "Action failed.");
    } finally { setActionLoading(null); }
  }, [selectedUser]);

  const handleChangePlan = () => {
    if (!planDraft || planDraft === userUsage?.plan) return;
    if (!window.confirm(`Change plan to "${planDraft}"?`)) return;
    doAction("plan", () => updateUserPlan(selectedUser.id, planDraft));
  };

  const handleLock = () => {
    if (!window.confirm(`Lock ${selectedUser?.name || selectedUser?.email}?`)) return;
    doAction("lock", () => lockUser(selectedUser.id, lockReason || "Locked by admin"));
  };

  const handleUnlock = () => doAction("unlock", () => unlockUser(selectedUser.id));

  const handleReset = () => {
    if (!window.confirm("Reset all usage counters to zero?")) return;
    doAction("reset", () => resetUserUsage(selectedUser.id));
  };

  // ── derived ───────────────────────────────────────────────────
  const filtered = users.filter(u =>
    !search.trim() ||
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );
  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === "admin").length,
    regular: users.filter(u => u.role !== "admin").length,
  };

  // ── render ────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">

      {/* Header */}
      <div className="border-b border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-6 py-4 flex items-center justify-between sticky top-0 z-10 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Admin Panel</h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Manage users and platform settings</p>
          </div>
        </div>
        <span className="text-[11px] font-bold bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-full border border-indigo-600/20">{user?.name}</span>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Users", value: stats.total,   color: "indigo"  },
            { label: "Admins",      value: stats.admins,  color: "amber"   },
            { label: "Regular",     value: stats.regular, color: "emerald" },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/10 p-5 shadow-sm">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">{label}</p>
              <p className={`text-3xl font-black text-${color}-600 dark:text-${color}-400`}>{loading ? "—" : value}</p>
            </div>
          ))}
        </div>

        {/* Error banner */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[13px] flex items-center gap-3 animate-fade-in">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-auto text-rose-400 hover:text-rose-600">✕</button>
          </div>
        )}

        {/* Page tab switcher */}
        <div className="flex gap-1 bg-slate-100 dark:bg-white/5 rounded-xl p-1 w-fit">
          {[["users", "Users"], ["usage", "Usage & Plans"]].map(([id, label]) => (
            <button
              key={id}
              onClick={() => setPageTab(id)}
              className={`px-4 py-2 rounded-lg text-[13px] font-semibold transition-all ${
                pageTab === id
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── Users Tab ──────────────────────────────────────────── */}
        {pageTab === "users" && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-white/10">
              <h2 className="text-[14px] font-bold text-slate-900 dark:text-white">Users</h2>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input type="text" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-[13px] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all w-52" />
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16 text-slate-400 gap-2">
                <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
                Loading users...
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-[13px]">No users found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-white/5">
                      <th className="px-5 py-3">User</th>
                      <th className="px-5 py-3">Role</th>
                      <th className="px-5 py-3 hidden sm:table-cell">Joined</th>
                      <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {filtered.map(u => (
                      <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-[12px] font-bold shrink-0">
                              {(u.name || u.email || "?")[0].toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-[13px] font-semibold text-slate-900 dark:text-white truncate">{u.name || "—"}</p>
                              <p className="text-[11px] text-slate-400 truncate">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${u.role === "admin" ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20" : "bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/10"}`}>
                            {u.role || "user"}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 hidden sm:table-cell">
                          <span className="text-[12px] text-slate-400">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center justify-end gap-2">
                            {u.id !== myId ? (
                              <>
                                <button onClick={() => openEdit(u)} className="text-[12px] px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all font-medium">Edit</button>
                                <button onClick={() => { if (window.confirm(`Delete ${u.name || u.email}? This cannot be undone.`)) handleDelete(u.id); }} disabled={deletingId === u.id} className="text-[12px] px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-all font-medium disabled:opacity-50">
                                  {deletingId === u.id ? "..." : "Delete"}
                                </button>
                              </>
                            ) : (
                              <span className="text-[11px] text-slate-400 italic font-medium">You</span>
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
        )}

        {/* ── Usage Tab ──────────────────────────────────────────── */}
        {pageTab === "usage" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* User picker list */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-200 dark:border-white/10">
                <h3 className="text-[13px] font-bold text-slate-900 dark:text-white">Select User</h3>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-white/5 max-h-[520px] overflow-y-auto">
                {loading ? (
                  <div className="py-10 text-center text-slate-400 text-[13px]">Loading…</div>
                ) : users.filter(u => u.role !== "admin").length === 0 ? (
                  <div className="py-10 text-center text-slate-400 text-[13px]">No regular users.</div>
                ) : (
                  users.filter(u => u.role !== "admin").map(u => (
                    <button
                      key={u.id}
                      onClick={() => setSelectedUser(u)}
                      className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ${selectedUser?.id === u.id ? "bg-indigo-50 dark:bg-indigo-500/10" : "hover:bg-slate-50 dark:hover:bg-white/[0.02]"}`}
                    >
                      <div className="w-7 h-7 shrink-0 rounded-full bg-indigo-600 flex items-center justify-center text-white text-[11px] font-bold">
                        {(u.name || u.email || "?")[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[12px] font-semibold text-slate-900 dark:text-white truncate">{u.name || "—"}</p>
                        <p className="text-[11px] text-slate-400 truncate">{u.email}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Usage detail panel */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
              {!selectedUser ? (
                <div className="h-full flex items-center justify-center py-20 text-slate-400 text-[13px]">
                  ← Select a user to view their usage
                </div>
              ) : (
                <div className="p-6 space-y-5">
                  {/* User header */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white text-[14px] font-bold shrink-0">
                      {(selectedUser.name || selectedUser.email || "?")[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-[15px] font-bold text-slate-900 dark:text-white">{selectedUser.name || "—"}</p>
                      <p className="text-[12px] text-slate-400">{selectedUser.email}</p>
                    </div>
                    {userUsage && (
                      <span className={`ml-auto text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full border ${PLAN_COLORS[userUsage.plan] || PLAN_COLORS.free}`}>
                        {userUsage.plan}
                      </span>
                    )}
                  </div>

                  {usageError && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[12px]">{usageError}</div>
                  )}
                  {actionMsg && (
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[12px]">{actionMsg}</div>
                  )}

                  {usageLoading ? (
                    <div className="py-8 flex items-center justify-center gap-2 text-slate-400 text-[13px]">
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
                      Loading usage…
                    </div>
                  ) : userUsage ? (
                    <>
                      {/* Gauges */}
                      <MiniGauges resources={userUsage.resources} />

                      {/* Plan info */}
                      <div className="grid grid-cols-2 gap-3 text-[12px]">
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Reset Period</p>
                          <p className="font-semibold text-slate-700 dark:text-slate-200 capitalize">{userUsage.resetPeriod}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Next Reset</p>
                          <p className="font-semibold text-slate-700 dark:text-slate-200">{userUsage.nextResetAt ? new Date(userUsage.nextResetAt).toLocaleDateString() : "—"}</p>
                        </div>
                      </div>

                      {/* Lock banner */}
                      {userUsage.isLocked && (
                        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-2">
                          <span className="text-rose-400">🔒</span>
                          <span className="text-[12px] text-rose-400 font-medium">{userUsage.lockReason || "Account locked"}</span>
                        </div>
                      )}

                      {/* ── Actions ──────────────────────────────── */}
                      <div className="border-t border-slate-200 dark:border-white/10 pt-5 space-y-4">
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Admin Actions</p>

                        {/* Change plan */}
                        <div className="flex items-center gap-3">
                          <select
                            value={planDraft}
                            onChange={e => setPlanDraft(e.target.value)}
                            className="flex-1 px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-[13px] text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-all"
                          >
                            {plans.length === 0
                              ? <option value={userUsage.plan}>{userUsage.plan}</option>
                              : plans.map(p => <option key={p.planName} value={p.planName}>{p.planName}</option>)
                            }
                          </select>
                          <button
                            onClick={handleChangePlan}
                            disabled={!!actionLoading || planDraft === userUsage.plan}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-[13px] font-bold rounded-xl transition-all"
                          >
                            {actionLoading === "plan" ? "..." : "Change Plan"}
                          </button>
                        </div>

                        {/* Lock with reason */}
                        {!userUsage.isLocked ? (
                          <div className="flex items-center gap-3">
                            <input
                              value={lockReason}
                              onChange={e => setLockReason(e.target.value)}
                              placeholder="Lock reason (optional)"
                              className="flex-1 px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-[13px] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-rose-400 transition-all"
                            />
                            <button
                              onClick={handleLock}
                              disabled={!!actionLoading}
                              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-[13px] font-bold rounded-xl transition-all"
                            >
                              {actionLoading === "lock" ? "..." : "Lock"}
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={handleUnlock}
                            disabled={!!actionLoading}
                            className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-[13px] font-bold rounded-xl transition-all"
                          >
                            {actionLoading === "unlock" ? "..." : "Unlock Account"}
                          </button>
                        )}

                        {/* Reset counters */}
                        <button
                          onClick={handleReset}
                          disabled={!!actionLoading}
                          className="w-full py-2 border border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/5 hover:bg-amber-500/10 text-[13px] font-bold rounded-xl transition-all disabled:opacity-50"
                        >
                          {actionLoading === "reset" ? "..." : "Reset Usage Counters"}
                        </button>
                      </div>
                    </>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Edit User Modal ─────────────────────────────────────── */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 w-full max-w-sm p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[15px] font-bold text-slate-900 dark:text-white">Edit User</h3>
              <button onClick={() => setEditingUser(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg text-slate-400 transition-all">✕</button>
            </div>
            {editError && <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[12px]">{editError}</div>}
            <form onSubmit={handleEditSave} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Name</label>
                <input type="text" value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-transparent text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-[13px] transition-all" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Email</label>
                <input type="email" value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-transparent text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-[13px] transition-all" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Role</label>
                <select value={editForm.role} onChange={e => setEditForm(f => ({ ...f, role: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-[13px] transition-all">
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditingUser(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 text-[13px] font-semibold hover:bg-slate-50 dark:hover:bg-white/5 transition-all">Cancel</button>
                <button type="submit" disabled={editLoading} className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-[13px] font-bold transition-all">
                  {editLoading ? "Saving…" : "Save changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
