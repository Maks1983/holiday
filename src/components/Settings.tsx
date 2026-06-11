import React, { useState } from "react";
import { Key, AlertCircle, Info, ShieldCheck, CheckCircle2, Globe2 } from "lucide-react";

interface SettingsProps {
  apiKey: string;
  onChangeApiKey: (key: string) => void;
  apiEndpoint: string;
  onChangeApiEndpoint: (endpoint: string) => void;
}

export default function Settings({ apiKey, onChangeApiKey, apiEndpoint, onChangeApiEndpoint }: SettingsProps) {
  const [tempKey, setTempKey] = useState(apiKey);
  const [tempEndpoint, setTempEndpoint] = useState(apiEndpoint);
  const [successMsg, setSuccessMsg] = useState(false);

  // Load and display Audit logs from file-based json db
  const [logs, setLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const fetchAuditLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await fetch("/api/audit-logs");
      if (res.ok) {
        const data = await res.json();
        setLogs(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("[SETTINGS] Could not fetch db audit logs", err);
    } finally {
      setLoadingLogs(false);
    }
  };

  const clearAuditLogs = async () => {
    if (!window.confirm("Are you sure you want to clear the Server DB transaction audit logs?")) {
      return;
    }
    try {
      const res = await fetch("/api/audit-logs", { method: "DELETE" });
      if (res.ok) {
        setLogs([]);
      }
    } catch (err) {
      console.error("[SETTINGS] Could not clear db logs", err);
    }
  };

  React.useEffect(() => {
    fetchAuditLogs();
  }, [apiKey, apiEndpoint]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onChangeApiKey(tempKey.trim());
    onChangeApiEndpoint(tempEndpoint.trim());
    setSuccessMsg(true);
    setTimeout(() => {
      setSuccessMsg(false);
      fetchAuditLogs();
    }, 1500);
  };

  const hasApiKey = apiKey.trim() !== "";

  return (
    <div id="settings-card" className="bg-white border border-[#5a5a40]/10 rounded-2xl shadow-sm p-6 max-w-xl mx-auto mb-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 sm:p-2.5 rounded-xl bg-[#5a5a40]/10 text-[#5a5a40]">
          <Key className="w-5 h-5" id="settings-key-icon" />
        </div>
        <div>
          <h2 className="serif text-xl font-semibold text-[#2c2c24]" id="settings-title">Global Holiday API Gateway Authorization</h2>
          <p className="text-xs text-[#2c2c24]/60" id="settings-subtitle">Configure your secure access token & endpoint gateway</p>
        </div>
      </div>

      <div className="mb-6">
        <div className={`p-4 rounded-xl flex items-start gap-3 transition-colors ${
          !hasApiKey 
            ? "bg-amber-50 text-amber-900 border border-amber-200" 
            : "bg-emerald-50 text-emerald-850 border border-emerald-150"
        }`} id="api-status-banner">
          {!hasApiKey ? (
            <>
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" id="missing-key-icon" />
              <div className="text-sm">
                <span className="font-semibold block mb-0.5 text-[#2c2c24]">Authorization Key Missing</span>
                Provide your bearer token below to begin auditing holiday date files directly from the Live Microservice. Note: mock fallback data has been disabled.
              </div>
            </>
          ) : (
            <>
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" id="connected-shield-icon" />
              <div className="text-sm">
                <span className="font-semibold block mb-0.5 text-[#2c2c24]">Credentials Ready</span>
                Real-time API requests are configured and proxied securely. Bypassing CORS constraints and auditing holiday date records.
              </div>
            </>
          )}
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4" id="api-key-form">
        <div>
          <label className="block text-xs font-semibold text-[#2c2c24] uppercase tracking-wider mb-2" id="endpoint-label">
            API Gateway Endpoint URL
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="https://bs-sta-gateway.ext-abc.com"
              value={tempEndpoint}
              onChange={(e) => setTempEndpoint(e.target.value)}
              className="w-full px-4 py-3 pl-11 bg-[#fdfdfb]/80 border border-[#5a5a40]/20 rounded-xl text-[#2c2c24] placeholder-stone-400 focus:outline-none focus:border-[#5a5a40] text-sm focus:ring-1 focus:ring-[#5a5a40] transition-all font-mono"
              id="api-endpoint-input"
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5a5a40]/60">
              <Globe2 className="w-4 h-4" />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#2c2c24] uppercase tracking-wider mb-2" id="key-label">
            Access Token (Bearer Authorization)
          </label>
          <div className="relative">
            <input
              type="password"
              placeholder="e.g. your_api_access_token..."
              value={tempKey}
              onChange={(e) => setTempKey(e.target.value)}
              className="w-full px-4 py-3 pl-11 bg-[#fdfdfb]/80 border border-[#5a5a40]/20 rounded-xl text-[#2c2c24] placeholder-stone-400 focus:outline-none focus:border-[#5a5a40] text-sm focus:ring-1 focus:ring-[#5a5a40] transition-all"
              id="api-token-input"
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5a5a40]/60">
              <Key className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-xs text-[#2c2c24]/50 flex items-center gap-1.5" id="privacy-notice">
            <Info className="w-3.5 h-3.5" /> Your token and gateway endpoint config are saved securely to our local database system.
          </p>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            className="px-5 py-2.5 bg-[#5A5A40] hover:bg-[#484833] text-white font-medium text-sm rounded-xl transition-all shadow-sm focus:outline-none focus:ring-1 focus:ring-[#5a5a40] cursor-pointer"
            id="save-token-btn"
          >
            Apply Settings
          </button>
          {apiKey !== "" && (
            <button
              type="button"
              onClick={() => {
                setTempKey("");
                onChangeApiKey("");
              }}
              className="px-4 py-2.5 hover:bg-[#f5f5f0]/50 border border-[#5a5a40]/25 text-[#2c2c24] font-medium text-sm rounded-xl transition-all cursor-pointer"
              id="reset-token-btn"
            >
              Clear Key
            </button>
          )}

          {successMsg && (
            <span className="text-emerald-600 text-xs flex items-center gap-1 animate-fade-in" id="save-success-badge">
              <CheckCircle2 className="w-4 h-4" /> Settings updated successfully!
            </span>
          )}
        </div>
      </form>

      <div className="mt-6 pt-5 border-t border-[#5a5a40]/10" id="docs-help-box">
        <h4 className="text-xs font-semibold text-[#2c2c24] uppercase tracking-wider mb-2">Endpoint URL details</h4>
        <div className="bg-[#f5f5f0]/50 p-3 rounded-lg font-mono text-[10px] text-[#2c2c24]/70 space-y-1 overflow-x-auto border border-[#5a5a40]/5">
          <div><span className="text-[#5A5A40] font-semibold">GET</span> {tempEndpoint || "https://bs-sta-gateway.ext-abc.com"}/svc/holiday/api/v1/year?country_code=no&date=2026-01-01</div>
          <div><span className="text-[#a65d52] font-semibold">HEADER</span> Authorization: Bearer &#123;access_token&#125;</div>
        </div>
      </div>

      {/* Database logs of all audited queries */}
      <div className="mt-8 pt-5 border-t border-[#5a5a40]/10" id="server-db-logs-section">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-xs font-semibold text-[#2c2c24] uppercase tracking-wider">Enterprise Audit Transaction Log</h4>
            <p className="text-[10px] text-[#2c2c24]/50 leading-none mt-1">Real-time trails matching audits against db.json file database</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchAuditLogs}
              className="px-2.5 py-1 hover:bg-[#5a5a40]/10 border border-[#5a5a40]/15 text-[#2c2c24] text-[10px] font-semibold rounded-md transition-all flex items-center gap-1 cursor-pointer"
            >
              Refresh Logs
            </button>
            {logs.length > 0 && (
              <button
                onClick={clearAuditLogs}
                className="px-2.5 py-1 hover:bg-rose-50 hover:text-rose-700 border border-rose-200 text-[#2c2c24]/80 text-[10px] font-semibold rounded-md transition-all cursor-pointer"
              >
                Clear Trails
              </button>
            )}
          </div>
        </div>

        {loadingLogs ? (
          <div className="text-center py-6 text-xs text-[#2c2c24]/50">Reading db.json...</div>
        ) : logs.length === 0 ? (
          <div className="text-center py-6 border border-dashed border-[#5a5a40]/15 rounded-xl bg-[#fdfdfb]/50 text-xs text-[#2c2c24]/40">
            No audit records logged yet. Run holiday queries or check active dates to populate local database histories.
          </div>
        ) : (
          <div className="max-h-72 overflow-y-auto border border-[#5a5a40]/10 rounded-xl divide-y divide-[#5a5a40]/5 bg-[#fdfdfb]/50 font-mono text-[10px]">
            {logs.map((log) => {
              const formattedTime = new Date(log.timestamp).toLocaleTimeString();
              const isSuccess = log.status === 200;
              return (
                <div key={log.id} className="p-3 hover:bg-[#5a5a40]/5 transition-colors flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.5 rounded-sm font-semibold leading-none uppercase ${
                        isSuccess 
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-250" 
                          : "bg-rose-50 text-rose-850 border border-rose-200"
                      }`}>
                        HTTP {log.status}
                      </span>
                      <span className="text-[#2c2c24]/40">{formattedTime}</span>
                      <span className="font-semibold text-[#5a5a40] uppercase">[{log.queryType}]</span>
                    </div>
                    <span className="text-stone-400">ID: {log.id}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-[#2c2c24]/75">
                    <div>
                      <span className="text-stone-400">CC:</span> <strong className="text-[#2c2c24]">{log.countryCode}</strong>
                      <span className="text-stone-400 ml-2">Val:</span> <strong className="text-[#2c2c24]">{log.paramValue}</strong>
                    </div>
                    <div className="text-[9px] text-[#2c2c24]/50 max-w-xs truncate" title={log.endpoint}>
                      {log.endpoint}
                    </div>
                  </div>
                  {log.error && (
                    <div className="text-rose-600 text-[9px] bg-rose-50/50 p-1.5 rounded border border-rose-100 mt-1 max-w-full overflow-x-auto whitespace-pre-wrap">
                      Error detail: {log.error}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
