import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyUsage } from '../api/usage-services';
import { getMyLogs } from '../api/log-services';

const CATEGORY_COLORS = {
  auth:   'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  usage:  'bg-amber-500/10  text-amber-400  border-amber-500/20',
  admin:  'bg-rose-500/10   text-rose-400   border-rose-500/20',
  system: 'bg-slate-500/10  text-slate-400  border-slate-500/20',
  api:    'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};

const RESOURCE_META = [
  { key: 'images',    label: 'Images',    icon: '🖼️',  color: 'indigo' },
  { key: 'videos',    label: 'Videos',    icon: '🎬',  color: 'violet' },
  { key: 'apiCalls',  label: 'API Calls', icon: '⚡',  color: 'amber'  },
  { key: 'documents', label: 'Documents', icon: '📄',  color: 'emerald'},
];

function ResourceGauge({ label, icon, color, used, limit, remaining }) {
  const pct = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;
  const danger = pct >= 90;
  const warning = pct >= 70 && pct < 90;

  const barColor = danger
    ? 'bg-rose-500'
    : warning
    ? 'bg-amber-500'
    : `bg-${color}-500`;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/10 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">{label}</span>
        </div>
        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
          danger  ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
          warning ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
          `bg-${color}-500/10 text-${color}-400 border-${color}-500/20`
        }`}>
          {remaining} left
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden mb-2">
        <div
          className={`h-full rounded-full transition-all duration-700 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex justify-between text-[11px] text-slate-400 dark:text-slate-500">
        <span>{used} used</span>
        <span>{limit} limit</span>
      </div>
    </div>
  );
}

export default function UsageDashboard() {
  const navigate = useNavigate();
  const [usage, setUsage]     = useState(null);
  const [logs,  setLogs]      = useState([]);
  const [logPage, setLogPage] = useState(1);
  const [logTotal, setLogTotal] = useState(0);
  const [logCategory, setLogCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    getMyUsage()
      .then(setUsage)
      .catch(err => setError(err.response?.data?.message || 'Failed to load usage.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setLogsLoading(true);
    getMyLogs({ page: logPage, limit: 10, category: logCategory || undefined })
      .then(data => { setLogs(data.logs); setLogTotal(data.total); })
      .catch(() => {})
      .finally(() => setLogsLoading(false));
  }, [logPage, logCategory]);

  const planBadgeColor =
    usage?.plan === 'enterprise' ? 'bg-violet-500/10 text-violet-400 border-violet-500/20' :
    usage?.plan === 'pro'        ? 'bg-amber-500/10  text-amber-400  border-amber-500/20'  :
                                   'bg-slate-500/10  text-slate-400  border-slate-500/20';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">

      {/* ── Header ───────────────────────────────────────── */}
      <div className="sticky top-0 z-10 border-b border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Usage Dashboard</h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Your quota and activity overview</p>
          </div>
        </div>
        {usage && (
          <span className={`text-[11px] font-bold px-3 py-1 rounded-full border uppercase tracking-wide ${planBadgeColor}`}>
            {usage.plan} plan
          </span>
        )}
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">

        {/* ── Error ───────────────────────────────────────── */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[13px]">
            {error}
          </div>
        )}

        {/* ── Plan info bar ────────────────────────────────── */}
        {usage && !loading && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/10 p-5 shadow-sm flex flex-wrap gap-6 items-center">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Reset Period</p>
              <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 capitalize">{usage.resetPeriod}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Next Reset</p>
              <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">
                {new Date(usage.nextResetAt).toLocaleString()}
              </p>
            </div>
            {usage.isLocked && (
              <div className="ml-auto flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-2">
                <span className="text-rose-400 text-lg">🔒</span>
                <div>
                  <p className="text-[11px] font-bold text-rose-400">Account Locked</p>
                  <p className="text-[11px] text-rose-400/70">{usage.lockReason || 'Contact support'}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Resource Gauges ──────────────────────────────── */}
        {loading ? (
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/10 animate-pulse" />
            ))}
          </div>
        ) : usage?.resources ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

        {/* ── Activity Logs ────────────────────────────────── */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-white/10">
            <h2 className="text-[14px] font-bold text-slate-900 dark:text-white">Activity Logs</h2>
            <select
              value={logCategory}
              onChange={e => { setLogCategory(e.target.value); setLogPage(1); }}
              className="px-3 py-1.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-[12px] text-slate-700 dark:text-slate-200 focus:outline-none focus:border-indigo-500 transition-all"
            >
              <option value="">All categories</option>
              <option value="auth">Auth</option>
              <option value="usage">Usage</option>
              <option value="admin">Admin</option>
              <option value="system">System</option>
              <option value="api">API</option>
            </select>
          </div>

          {logsLoading ? (
            <div className="py-10 flex items-center justify-center text-slate-400 text-[13px]">
              <svg className="w-4 h-4 animate-spin mr-2" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Loading logs…
            </div>
          ) : logs.length === 0 ? (
            <div className="py-10 text-center text-slate-400 dark:text-slate-500 text-[13px]">
              No activity logs yet.
            </div>
          ) : (
            <>
              <div className="divide-y divide-slate-100 dark:divide-white/5">
                {logs.map(log => (
                  <div key={log.id} className="px-5 py-3 flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`shrink-0 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[log.category] || CATEGORY_COLORS.system}`}>
                        {log.category}
                      </span>
                      <span className="text-[13px] text-slate-700 dark:text-slate-200 font-medium truncate">
                        {log.action.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <span className="shrink-0 text-[11px] text-slate-400 dark:text-slate-500">
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {logTotal > 10 && (
                <div className="px-5 py-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                  <span className="text-[12px] text-slate-400">{logTotal} total</span>
                  <div className="flex gap-2">
                    <button
                      disabled={logPage <= 1}
                      onClick={() => setLogPage(p => p - 1)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 text-[12px] text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
                    >← Prev</button>
                    <span className="px-3 py-1.5 text-[12px] text-slate-500">Page {logPage}</span>
                    <button
                      disabled={logPage * 10 >= logTotal}
                      onClick={() => setLogPage(p => p + 1)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 text-[12px] text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
                    >Next →</button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
