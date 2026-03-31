import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { getMyUsage } from "../api/usage-services";
import { getMyLogs } from "../api/log-services";

// ── tiny helpers ─────────────────────────────────────────────────────────────

const TABS = [
  {
    id: "account",
    label: "My Account",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="10" r="3" />
        <path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" />
      </svg>
    ),
  },
  {
    id: "usage",
    label: "Usage",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 3v18h18" />
        <path d="m19 9-5 5-4-4-3 3" />
      </svg>
    ),
  },
  {
    id: "security",
    label: "Security",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
  },
  {
    id: "danger",
    label: "Danger Zone",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
        <line x1="12" x2="12" y1="9" y2="13" />
        <line x1="12" x2="12.01" y1="17" y2="17" />
      </svg>
    ),
  },
];

const RESOURCE_META = [
  { key: "images", label: "Images", icon: "🖼️", color: "indigo" },
  { key: "videos", label: "Videos", icon: "🎬", color: "violet" },
  { key: "apiCalls", label: "API Calls", icon: "⚡", color: "amber" },
  { key: "documents", label: "Documents", icon: "📄", color: "emerald" },
];

const LOG_CATEGORY_COLORS = {
  auth: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  usage: "bg-amber-500/10  text-amber-400  border-amber-500/20",
  admin: "bg-rose-500/10   text-rose-400   border-rose-500/20",
  system: "bg-slate-500/10  text-slate-400  border-slate-500/20",
  api: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

const PLAN_COLORS = {
  free: "bg-slate-500/10  text-slate-400  border-slate-500/20",
  pro: "bg-amber-500/10  text-amber-400  border-amber-500/20",
  enterprise: "bg-violet-500/10 text-violet-400 border-violet-500/20",
};

// ── Resource Gauge ────────────────────────────────────────────────────────────

function ResourceGauge({ label, icon, color, used = 0, limit = 0 }) {
  const pct = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;
  const danger = pct >= 90;
  const warning = pct >= 70 && pct < 90;
  const remaining = Math.max(limit - used, 0);

  const barColor = danger
    ? "bg-rose-500"
    : warning
      ? "bg-amber-500"
      : `bg-${color}-500`;
  const badgeColor = danger
    ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
    : warning
      ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
      : `bg-${color}-500/10 text-${color}-400 border-${color}-500/20`;

  return (
    <div className="bg-slate-50 dark:bg-white/[0.03] rounded-2xl border border-slate-200 dark:border-white/10 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-base">{icon}</span>
          <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">
            {label}
          </span>
        </div>
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeColor}`}
        >
          {remaining} left
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden mb-2">
        <div
          className={`h-full rounded-full transition-all duration-700 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between text-[11px] text-slate-400">
        <span>{used} used</span>
        <span>{limit} limit</span>
      </div>
    </div>
  );
}

// ── Main Settings page ────────────────────────────────────────────────────────

export default function Settings() {
  const { user, updateMe, deleteMe, changePassword } = useAuth();
  const navigate = useNavigate();

  // ── form state ────────────────────────────────────────────
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [activeTab, setActiveTab] = useState("account");

  // ── usage state ───────────────────────────────────────────
  const [usage, setUsage] = useState(null);
  const [usageLoading, setUsageLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [logPage, setLogPage] = useState(1);
  const [logTotal, setLogTotal] = useState(0);
  const [logCategory, setLogCategory] = useState("");
  const [logsLoading, setLogsLoading] = useState(false);

  // ── populate from user context ────────────────────────────
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
    }
    setError(null);
    setSuccessMsg(null);
    setPassword("");
    setCurrentPassword("");
    setNewPassword("");
  }, [user]);

  // ── fetch usage when "usage" tab opens ───────────────────
  useEffect(() => {
    if (activeTab !== "usage") return;
    setUsageLoading(true);
    getMyUsage()
      .then(setUsage)
      .catch(() => {})
      .finally(() => setUsageLoading(false));
  }, [activeTab]);

  // ── fetch logs on tab open / page / category change ──────
  useEffect(() => {
    if (activeTab !== "usage") return;
    setLogsLoading(true);
    getMyLogs({ page: logPage, limit: 10, category: logCategory || undefined })
      .then((d) => {
        setLogs(d.logs);
        setLogTotal(d.total);
      })
      .catch(() => {})
      .finally(() => setLogsLoading(false));
  }, [activeTab, logPage, logCategory]);

  const switchTab = useCallback((id) => {
    setActiveTab(id);
    setError(null);
    setSuccessMsg(null);
  }, []);

  // ── handlers ──────────────────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsSaving(true);
    try {
      await updateMe({ name, phone });
      setSuccessMsg("Profile updated!");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsSaving(true);
    if (!currentPassword || !newPassword) {
      setError("Both current and new passwords are required.");
      setIsSaving(false);
      return;
    }
    try {
      await changePassword(currentPassword, newPassword);
      setSuccessMsg("Password changed!");
      setCurrentPassword("");
      setNewPassword("");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to change password.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    setError(null);
    if (!password) {
      setError("Password is required to delete your account.");
      return;
    }
    if (!window.confirm("Are you absolutely sure? This cannot be undone."))
      return;
    setIsDeleting(true);
    try {
      await deleteMe(password);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete account.");
      setIsDeleting(false);
    }
  };

  // ── render ────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center sm:py-10 sm:px-4 py-0 px-0">
      <div className="w-full h-full sm:h-auto max-w-2xl bg-white dark:bg-slate-900 sm:rounded-2xl rounded-none sm:shadow-xl shadow-none sm:border border-none border-slate-200 dark:border-white/10 flex flex-col overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-4 px-5 sm:px-8 py-5 sm:py-6 border-b border-slate-200 dark:border-white/10 shrink-0">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 shrink-0 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
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
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight truncate">
              Settings
            </h1>
            <p className="text-[12px] sm:text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
              Manage your account preferences and security.
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row h-full sm:min-h-[500px]">
          {/* Sidebar nav */}
          <div className="md:w-56 border-b md:border-b-0 md:border-r border-slate-200 dark:border-white/10 p-3 sm:p-4 shrink-0 flex flex-row md:flex-col gap-1 overflow-x-auto hide-scrollbar">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => switchTab(tab.id)}
                className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 rounded-xl text-[13px] font-medium transition-all whitespace-nowrap
                                    ${
                                      tab.id === "danger" &&
                                      activeTab !== "danger"
                                        ? "text-slate-600 dark:text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-500/5 hover:text-rose-600 dark:hover:text-rose-400 md:mt-auto"
                                        : tab.id === "danger" &&
                                            activeTab === "danger"
                                          ? "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 md:mt-auto"
                                          : activeTab === tab.id
                                            ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
                                    }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content area */}
          <div className="flex-1 p-5 sm:p-6 md:p-8 overflow-y-auto">
            {/* Alerts */}
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[13px] flex items-start gap-3 animate-fade-in">
                <svg
                  className="shrink-0 mt-0.5"
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{error}</span>
              </div>
            )}
            {successMsg && (
              <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[13px] flex items-start gap-3 animate-fade-in">
                <svg
                  className="shrink-0 mt-0.5"
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>{successMsg}</span>
              </div>
            )}

            {/* ── Account Tab ───────────────────────────────── */}
            {activeTab === "account" && (
              <div className="animate-fade-in space-y-6 max-w-md">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                    Profile Details
                  </h3>
                  <p className="text-[13px] text-slate-500 dark:text-slate-400">
                    Update your personal information here.
                  </p>
                </div>
                <form onSubmit={handleSave} className="space-y-5">
                  <div>
                    <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                      Email (Read Only)
                    </label>
                    <input
                      type="email"
                      value={email}
                      disabled
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-500 text-[14px] cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-transparent text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-[14px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-transparent text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-[14px]"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-[14px] font-bold rounded-xl transition-all shadow-md"
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                </form>
              </div>
            )}

            {/* ── Usage Tab ─────────────────────────────────── */}
            {activeTab === "usage" && (
              <div className="animate-fade-in space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                    Usage & Quota
                  </h3>
                  <p className="text-[13px] text-slate-500 dark:text-slate-400">
                    Your current plan usage and activity history.
                  </p>
                </div>

                {/* Account locked banner */}
                {usage?.isLocked && (
                  <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3">
                    <span className="text-rose-400 text-xl">🔒</span>
                    <div>
                      <p className="text-[13px] font-bold text-rose-400">
                        Account Restricted
                      </p>
                      <p className="text-[12px] text-rose-400/70 mt-0.5">
                        {usage.lockReason || "Contact support for assistance."}
                      </p>
                    </div>
                  </div>
                )}

                {/* Plan info row */}
                {usageLoading ? (
                  <div className="h-20 rounded-2xl bg-slate-100 dark:bg-white/5 animate-pulse" />
                ) : usage ? (
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 flex flex-wrap gap-6 items-center">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                        Current Plan
                      </p>
                      <span
                        className={`text-[12px] font-bold px-3 py-1 rounded-full border uppercase tracking-wide ${PLAN_COLORS[usage.plan] || PLAN_COLORS.free}`}
                      >
                        {usage.plan}
                      </span>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                        Reset Period
                      </p>
                      <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 capitalize">
                        {usage.resetPeriod}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                        Next Reset
                      </p>
                      <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">
                        {usage.nextResetAt
                          ? new Date(usage.nextResetAt).toLocaleDateString()
                          : "—"}
                      </p>
                    </div>
                  </div>
                ) : null}

                {/* Resource gauges */}
                {usageLoading ? (
                  <div className="grid grid-cols-2 gap-3">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className="h-24 rounded-2xl bg-slate-100 dark:bg-white/5 animate-pulse"
                      />
                    ))}
                  </div>
                ) : usage?.resources ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {RESOURCE_META.map(({ key, label, icon, color }) => (
                      <ResourceGauge
                        key={key}
                        label={label}
                        icon={icon}
                        color={color}
                        {...usage.resources[key]}
                      />
                    ))}
                  </div>
                ) : null}

                {/* Activity log */}
                {/* <div className="rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden">
                                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02]">
                                        <h4 className="text-[13px] font-bold text-slate-900 dark:text-white">Activity Log</h4>
                                        <select
                                            value={logCategory}
                                            onChange={e => { setLogCategory(e.target.value); setLogPage(1); }}
                                            className="px-2.5 py-1.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-[12px] text-slate-700 dark:text-slate-200 focus:outline-none focus:border-indigo-500 transition-all"
                                        >
                                            <option value="">All</option>
                                            <option value="auth">Auth</option>
                                            <option value="usage">Usage</option>
                                            <option value="admin">Admin</option>
                                            <option value="system">System</option>
                                            <option value="api">API</option>
                                        </select>
                                    </div>

                                    {logsLoading ? (
                                        <div className="py-8 flex items-center justify-center text-slate-400 text-[13px] gap-2">
                                            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
                                            Loading…
                                        </div>
                                    ) : logs.length === 0 ? (
                                        <div className="py-8 text-center text-slate-400 text-[13px]">No activity logs yet.</div>
                                    ) : (
                                        <>
                                            <div className="divide-y divide-slate-100 dark:divide-white/5">
                                                {logs.map(log => (
                                                    <div key={log.id} className="px-4 py-3 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                                                        <div className="flex items-center gap-2.5 min-w-0">
                                                            <span className={`shrink-0 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border ${LOG_CATEGORY_COLORS[log.category] || LOG_CATEGORY_COLORS.system}`}>
                                                                {log.category}
                                                            </span>
                                                            <span className="text-[13px] text-slate-700 dark:text-slate-300 truncate">{log.action.replace(/_/g, ' ')}</span>
                                                        </div>
                                                        <span className="shrink-0 text-[11px] text-slate-400">{new Date(log.createdAt).toLocaleString()}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            {logTotal > 10 && (
                                                <div className="px-4 py-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                                                    <span className="text-[12px] text-slate-400">{logTotal} total</span>
                                                    <div className="flex gap-2">
                                                        <button disabled={logPage <= 1} onClick={() => setLogPage(p => p - 1)} className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 text-[12px] text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-200 dark:hover:bg-white/10 transition-all">← Prev</button>
                                                        <span className="px-3 py-1.5 text-[12px] text-slate-500">Page {logPage}</span>
                                                        <button disabled={logPage * 10 >= logTotal} onClick={() => setLogPage(p => p + 1)} className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 text-[12px] text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-200 dark:hover:bg-white/10 transition-all">Next →</button>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div> */}

                {/* Billing — coming soon */}
                <div className="rounded-2xl border border-dashed border-slate-300 dark:border-white/10 p-5 flex items-start gap-4">
                  <div className="w-10 h-10 shrink-0 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 text-lg">
                    💳
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-slate-700 dark:text-slate-200 mb-1">
                      Billing & Payments
                    </p>
                    <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      We're working on a billing portal. Paid plans will be
                      available soon.
                    </p>
                    <span className="mt-2.5 inline-block text-[11px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                      Coming soon
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ── Security Tab ──────────────────────────────── */}
            {activeTab === "security" && (
              <div className="animate-fade-in space-y-6 max-w-md">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                    Change Password
                  </h3>
                  <p className="text-[13px] text-slate-500 dark:text-slate-400">
                    Use a long, random password to stay secure.
                  </p>
                </div>
                <form onSubmit={handlePasswordChange} className="space-y-5">
                  <div>
                    <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-transparent text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-[14px]"
                      placeholder="Current password"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-transparent text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-[14px]"
                      placeholder="New password"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSaving || !currentPassword || !newPassword}
                    className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-[14px] font-bold rounded-xl transition-all shadow-md"
                  >
                    {isSaving ? "Updating..." : "Change Password"}
                  </button>
                </form>
              </div>
            )}

            {/* ── Danger Zone Tab ───────────────────────────── */}
            {activeTab === "danger" && (
              <div className="animate-fade-in space-y-6 max-w-md">
                <div>
                  <h3 className="text-lg font-bold text-rose-600 dark:text-rose-400 mb-1">
                    Danger Zone
                  </h3>
                  <p className="text-[13px] text-slate-500 dark:text-slate-400">
                    Permanently delete your account and all associated data.
                  </p>
                </div>
                <form onSubmit={handleDelete} className="space-y-5">
                  <div className="p-5 rounded-xl border border-rose-500/30 bg-rose-500/5">
                    <h4 className="text-rose-700 dark:text-rose-400 font-bold text-[14px] mb-2">
                      Warning
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400 text-[13px] leading-relaxed">
                      Once you delete your account, there is no going back. All
                      of your conversations, knowledge bases, and generated
                      content will be permanently wiped from our servers.
                    </p>
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                      Confirm Current Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-rose-200 dark:border-rose-500/30 bg-transparent text-slate-900 dark:text-white focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all text-[14px]"
                      placeholder="Enter password to verify"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isDeleting || !password}
                    className="w-full py-3 px-4 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-[14px] font-bold rounded-xl transition-all shadow-md"
                  >
                    {isDeleting ? "Deleting..." : "Permanently Delete Account"}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
