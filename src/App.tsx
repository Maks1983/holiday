import { useState, useEffect } from "react";
import { Holiday, COUNTRIES } from "./types";
import Settings from "./components/Settings";
import DashboardStats from "./components/DashboardStats";
import CalendarView from "./components/CalendarView";
import HolidayList from "./components/HolidayList";
import DateChecker from "./components/DateChecker";
import { getHolidays } from "./utils/holidayService";
import { motion, AnimatePresence } from "motion/react";
import { 
  Globe2, 
  CalendarRange, 
  ListOrdered, 
  Settings2, 
  HelpCircle, 
  RefreshCw, 
  Activity, 
  ShieldCheck, 
  Cpu,
  Mail,
  Phone,
  Building,
  AlertCircle
} from "lucide-react";

export default function App() {
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem("abcyber_holiday_api_key") || "";
  });

  const [apiEndpoint, setApiEndpoint] = useState<string>(() => {
    return localStorage.getItem("abcyber_holiday_api_endpoint") || "https://bs-sta-gateway.ext-abc.com";
  });

  const [countryCode, setCountryCode] = useState("NO");
  const [year, setYear] = useState(2026);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Views navigation state
  const [activeView, setActiveView] = useState<"calendar" | "timeline" | "auditor" | "settings">("calendar");

  // Keep API key persisted in local storage
  const handleApiKeyChange = (newKey: string) => {
    setApiKey(newKey);
    localStorage.setItem("abcyber_holiday_api_key", newKey);
  };

  // Keep API Endpoint persisted in local storage
  const handleApiEndpointChange = (newEndpoint: string) => {
    setApiEndpoint(newEndpoint);
    localStorage.setItem("abcyber_holiday_api_endpoint", newEndpoint);
  };

  // Fetch holidays list
  const fetchHolidays = async () => {
    if (!apiKey.trim()) {
      setHolidays([]);
      setError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getHolidays(countryCode, year, apiKey, apiEndpoint);
      const list = data && Array.isArray(data.holidays) ? data.holidays : [];
      setHolidays(list);
    } catch (err: any) {
      console.error(err);
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, [countryCode, year, apiKey, apiEndpoint]);

  const selectedCountry = COUNTRIES.find(c => c.code === countryCode) || COUNTRIES[0];

  return (
    <div className="min-h-screen bg-[#f5f5f0] text-[#2c2c24] flex flex-col justify-between" id="app-container">
      {/* Dynamic Header */}
      <header className="bg-white border-b border-[#5a5a40]/15 sticky top-0 z-50 shadow-xs" id="app-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex flex-col sm:flex-row items-center justify-between gap-4 py-3 sm:py-0">
          
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#5A5A40] rounded-full flex items-center justify-center text-white shadow-sm hover:rotate-6 transition-all cursor-pointer">
              <Globe2 className="w-5.5 h-5.5" />
            </div>
            <div>
              <h1 className="serif text-2xl sm:text-3xl font-semibold tracking-tight text-[#2c2c24] leading-none flex items-center gap-1.5" id="app-main-title">
                Holiday Horizon
              </h1>
              <p className="text-[10px] uppercase tracking-wider font-semibold opacity-50 mt-1" id="app-subtitle">
                ABCyber AB Enterprise Ecosystem
              </p>
            </div>
          </div>

          {/* Quick Select Config Panels */}
          <div className="flex items-center gap-2 flex-wrap" id="header-selectors">
            {/* Country Dropdown */}
            <div className="relative">
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="pl-3 pr-8 py-2 bg-[#fdfdfb]/80 border border-[#5a5a40]/20 text-[#2c2c24] text-xs font-semibold rounded-xl focus:outline-none focus:border-[#5a5a40] focus:ring-1 focus:ring-[#5a5a40] transition-all appearance-none cursor-pointer"
                id="country-selector"
              >
                {COUNTRIES.map(c => (
                  <option key={c.code} value={c.code}>
                    {c.flag}  {c.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#5a5a40]/60 text-[10px]">▼</div>
            </div>

            {/* Year Dropdown */}
            <div className="relative">
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="pl-3 pr-8 py-2 bg-[#fdfdfb]/80 border border-[#5a5a40]/20 text-[#2c2c24] text-xs font-semibold rounded-xl focus:outline-none focus:border-[#5a5a40] focus:ring-1 focus:ring-[#5a5a40] transition-all appearance-none cursor-pointer"
                id="year-selector"
              >
                {[2023, 2024, 2025, 2026, 2027].map(y => (
                  <option key={y} value={y}>
                    📅  {y}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#5a5a40]/60 text-[10px]">▼</div>
            </div>

            {/* Connection Status Indicator */}
            <button
              onClick={() => setActiveView("settings")}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                apiKey.trim() === ""
                  ? "bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100"
                  : "bg-emerald-50 text-emerald-850 border-emerald-150 hover:bg-emerald-100"
              }`}
              id="status-header-indicator"
              title="Click to view API Settings"
            >
              {apiKey.trim() === "" ? (
                <>
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 select-none animate-pulse" />
                  <span className="hidden sm:inline">Credentials Pending</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="hidden sm:inline">ABC Gateway Active</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8" id="main-workspace">
        
        {/* Navigation Tabs Bar / Sidebar toggle */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-[#5a5a40]/10 p-3 rounded-2xl shadow-3xs" id="navigation-tabs-bar">
          <div className="flex bg-[#f5f5f0] p-1 rounded-xl w-full sm:w-auto" id="view-tabs-toggle">
            <button
              onClick={() => setActiveView("calendar")}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeView === "calendar" ? "bg-white text-[#5a5a40] shadow-sm" : "text-[#5a5a40]/70 hover:text-[#5a5a40]"
              }`}
              id="tab-calendar"
            >
              <CalendarRange className="w-3.5 h-3.5" />
              Calendar Overview
            </button>
            <button
              onClick={() => setActiveView("timeline")}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeView === "timeline" ? "bg-white text-[#5a5a40] shadow-sm" : "text-[#5a5a40]/70 hover:text-[#5a5a40]"
              }`}
              id="tab-timeline"
            >
              <ListOrdered className="w-3.5 h-3.5" />
              Timeline Filter
            </button>
            <button
              onClick={() => setActiveView("auditor")}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeView === "auditor" ? "bg-white text-[#5a5a40] shadow-sm" : "text-[#5a5a40]/70 hover:text-[#5a5a40]"
              }`}
              id="tab-auditor"
            >
              <Activity className="w-3.5 h-3.5" />
              Date Auditor
            </button>
          </div>

          <button
            onClick={() => setActiveView("settings")}
            className={`flex items-center gap-1.5 w-full sm:w-auto px-4 py-2 border rounded-xl text-xs font-bold transition-all cursor-pointer justify-center ${
              activeView === "settings"
                ? "bg-[#5A5A40] text-white border-[#5A5A40]"
                : "bg-white text-[#5a5a40] border-[#5a5a40]/25 hover:bg-[#5a5a40]/5"
            }`}
            id="tab-settings"
          >
            <Settings2 className="w-3.5 h-3.5" />
            API Key & Credentials
          </button>
        </div>

        {/* Dashboard numerical analytics */}
        {!loading && !error && activeView !== "settings" && activeView !== "auditor" && (
          <DashboardStats holidays={holidays} year={year} />
        )}

        {/* Content Viewer pane */}
        <div id="dashboard-content-viewer" className="relative min-h-96">
          {!apiKey.trim() && activeView !== "settings" ? (
            <div className="bg-white border border-[#5a5a40]/10 rounded-3xl p-12 text-center max-w-xl mx-auto flex flex-col items-center space-y-6 shadow-xs" id="app-credentials-missing-screen">
              <div className="p-4 bg-amber-50 text-amber-700 rounded-full border border-amber-100">
                <ShieldCheck className="w-8 h-8 opacity-90 animate-pulse" />
              </div>
              <div className="space-y-2">
                <h3 className="serif text-2xl font-bold text-[#2c2c24]">Authorization Key Required</h3>
                <p className="text-xs text-[#2c2c24]/75 leading-relaxed max-w-md mx-auto">
                  To audit enterprise holiday calendars, you must configure your access token in settings. 
                  In alignment with strict data audit standards, local simulated mock datasets have been fully decommissioned.
                </p>
                <div className="bg-[#f5f5f0] border border-[#5a5a40]/10 rounded-xl p-4 text-left max-w-md mx-auto text-[11px] space-y-1.5 text-[#2c2c24]/80">
                  <span className="font-semibold block text-[#2c2c24]">Audit Directives:</span>
                  <div className="flex items-start gap-2">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>No unverified mockup fallbacks can be loaded.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>An active Access Token (Bearer Auth) is required for each query.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>Verify your connection gateway endpoint setting is pointing to the correct API node.</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-center">
                <button
                  onClick={() => setActiveView("settings")}
                  className="px-5 py-2.5 bg-[#5A5A40] hover:bg-[#484833] text-white text-xs font-semibold rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  Configure Gateway Settings
                </button>
              </div>
            </div>
          ) : loading ? (
            <div className="bg-white border border-[#5a5a40]/10 rounded-3xl p-16 text-center flex flex-col items-center justify-center space-y-3 shadow-xs" id="app-loading-screen">
              <RefreshCw className="w-10 h-10 text-[#5a5a40] animate-spin" />
              <p className="text-sm font-semibold text-[#2c2c24] animate-pulse">Communicating with Holiday API Gateways...</p>
              <p className="text-xs text-[#2c2c24]/60">Loading schedules, mapping red days, and resolving variable holidays.</p>
            </div>
          ) : error ? (
            <div className="bg-[#a65d52]/5 border border-[#a65d52]/20 rounded-3xl p-12 text-center max-w-lg mx-auto flex flex-col items-center space-y-4 shadow-sm" id="app-error-screen">
              <div className="p-4 bg-[#a65d52]/10 text-[#a65d52] rounded-full">
                <HelpCircle className="w-8 h-8 opacity-80" />
              </div>
              <div className="space-y-1.5">
                <h3 className="serif text-2xl font-bold text-[#a65d52]">API Connection Blocked</h3>
                <p className="text-xs text-[#2c2c24] opacity-85 leading-relaxed">
                  The application tried to call the ABCyber Holiday API but the gateway returned a query exception:
                  <code className="block bg-[#a65d52]/10 p-2.5 rounded-lg font-mono text-[11px] mt-2 select-all text-[#a65d52] break-all border border-[#a65d52]/15">{error}</code>
                </p>
                <p className="text-xs text-[#2c2c24]/60 pt-1">
                  💡 Double check your token is typed accurately in Settings. Alternatively, configure your access token in a local <code>.env</code> file under <code>HOLIDAY_API_KEY</code>.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={fetchHolidays}
                  className="px-4 py-2 bg-[#a65d52] hover:bg-[#8e4f45] text-white text-xs font-semibold rounded-lg transition-all"
                >
                  Retry Connection
                </button>
                <button
                  onClick={() => {
                    handleApiKeyChange("");
                    setActiveView("settings");
                    setError(null);
                  }}
                  className="px-4 py-2 bg-white hover:bg-stone-50 border border-[#5a5a40]/25 text-[#2c2c24] text-xs font-semibold rounded-lg transition-all"
                >
                  Configure Settings
                </button>
              </div>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeView}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                id="tab-content-animator"
              >
                {activeView === "calendar" && (
                  <CalendarView holidays={holidays} year={year} />
                )}
                {activeView === "timeline" && (
                  <HolidayList holidays={holidays} selectedCountryName={selectedCountry.name} />
                )}
                {activeView === "auditor" && (
                  <DateChecker countryCode={countryCode} apiKey={apiKey} apiEndpoint={apiEndpoint} />
                )}
                {activeView === "settings" && (
                  <Settings apiKey={apiKey} onChangeApiKey={handleApiKeyChange} apiEndpoint={apiEndpoint} onChangeApiEndpoint={handleApiEndpointChange} />
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </main>

      {/* Corporate Info Footer */}
      <footer className="bg-white border-t border-[#5a5a40]/15 py-8 px-4 sm:px-6 lg:px-8 mt-12 text-xs text-[#2c2c24]/80 font-medium" id="app-footer">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          
          {/* Trademark details */}
          <div className="space-y-1.5 text-center md:text-left">
            <p className="text-[#2c2c24] font-bold flex items-center justify-center md:justify-start gap-1">
              <Building className="w-3.5 h-3.5 text-[#5A5A40]" />
              ABCyber AB Enterprise Ecosystem
            </p>
            <p className="max-w-md text-[11px] leading-relaxed text-[#2c2c24]/70">
              Maintained and distributed by ABCyber AB. This local auditor application is designed for real-time validation of public red days, scheduling closures, and business booking models.
            </p>
          </div>

          {/* Contact Details */}
          <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row gap-4 items-center md:items-end text-[11px]" id="corporate-contact-details">
            <span className="flex items-center gap-1 text-[#2c2c24]/80">
              <Mail className="w-3.5 h-3.5 text-[#5a5a40]" />
              support@abcyber.com
            </span>
            <span className="flex items-center gap-1 text-[#2c2c24]/80">
              <Phone className="w-3.5 h-3.5 text-[#5a5a40]" />
              +46 8 437 335 00
            </span>
          </div>

        </div>
        <div className="max-w-7xl mx-auto border-t border-[#5a5a40]/10 mt-6 pt-4 text-center text-[10px] text-[#2c2c24]/50" id="copyright-box">
          © {new Date().getFullYear()} ABCyber AB. All enterprise rights reserved. Under MIT Local Auditor License.
        </div>
      </footer>
    </div>
  );
}
