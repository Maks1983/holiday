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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onChangeApiKey(tempKey.trim());
    onChangeApiEndpoint(tempEndpoint.trim());
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 3000);
  };

  const hasApiKey = apiKey.trim() !== "";

  return (
    <div id="settings-card" className="bg-white border border-[#5a5a40]/10 rounded-2xl shadow-sm p-6 max-w-xl mx-auto mb-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 sm:p-2.5 rounded-xl bg-[#5a5a40]/10 text-[#5a5a40]">
          <Key className="w-5 h-5" id="settings-key-icon" />
        </div>
        <div>
          <h2 className="serif text-xl font-semibold text-[#2c2c24]" id="settings-title">ABCyber API Gateway Authorization</h2>
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
                Provide your bearer token below to begin auditing holiday date files directly from the ABCyber Microservice. Note: mock fallback data has been disabled.
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
              placeholder="e.g. your_abcyber_access_token..."
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
            <Info className="w-3.5 h-3.5" /> Your token is only used for local proxy requests to ABCyber and is never shared otherwise.
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
    </div>
  );
}
