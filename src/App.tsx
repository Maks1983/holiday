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
    return localStorage.getItem("redday_holiday_api_key") || localStorage.getItem("abcyber_holiday_api_key") || "";
  });

  const [apiEndpoint, setApiEndpoint] = useState<string>(() => {
    return localStorage.getItem("redday_holiday_api_endpoint") || localStorage.getItem("abcyber_holiday_api_endpoint") || "https://bs-sta-gateway.ext-abc.com";
  });

  const [countryCode, setCountryCode] = useState("NO");
  const [year, setYear] = useState(2026);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Views navigation state
  const [activeView, setActiveView] = useState<"calendar" | "timeline" | "auditor" | "settings">("calendar");

  const [servedFromCache, setServedFromCache] = useState<boolean | null>(null);
  const [selectedContinent, setSelectedContinent] = useState<string>("All");

  // Filter countries by Selected Continent
  const filteredCountries = selectedContinent === "All" 
    ? COUNTRIES 
    : COUNTRIES.filter(c => c.continent === selectedContinent);

  // Keep API key persisted in local storage
  const handleApiKeyChange = (newKey: string) => {
    setApiKey(newKey);
    localStorage.setItem("redday_holiday_api_key", newKey);
  };

  // Keep API Endpoint persisted in local storage
  const handleApiEndpointChange = (newEndpoint: string) => {
    setApiEndpoint(newEndpoint);
    localStorage.setItem("redday_holiday_api_endpoint", newEndpoint);
  };

  // Fetch holidays list
  const fetchHolidays = async () => {
    setLoading(true);
    setError(null);
    setServedFromCache(null);
    try {
      const data = await getHolidays(countryCode, year, apiKey, apiEndpoint);
      const list = data && Array.isArray(data.holidays) ? data.holidays : [];
      setHolidays(list);
      
      // Look up cached status from the server
      try {
        const response = await fetch(
          `/api/holidays?country_code=${countryCode.toUpperCase()}&year=${year}&token=${encodeURIComponent(apiKey || "")}&endpoint=${encodeURIComponent(apiEndpoint || "")}`
        );
        if (response.ok) {
          const resJson = await response.json();
          setServedFromCache(!!resJson.servedFromCache);
        }
      } catch (e) {
        console.warn("[APP] Could not fetch cache status indicator", e);
      }
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
                Global Holiday Auditing System
              </p>
            </div>
          </div>

          {/* Quick Select Config Panels */}
          <div className="flex items-center gap-2 flex-wrap" id="header-selectors">
            {/* Continent Selector Dropdown */}
            <div className="relative">
              <select
                value={selectedContinent}
                onChange={(e) => {
                  const cont = e.target.value;
                  setSelectedContinent(cont);
                  const list = cont === "All" ? COUNTRIES : COUNTRIES.filter(c => c.continent === cont);
                  if (list.length > 0) {
                    setCountryCode(list[0].code);
                  }
                }}
                className="pl-3 pr-8 py-2 bg-[#fdfdfb]/80 border border-[#5a5a40]/20 text-[#2c2c24] text-xs font-semibold rounded-xl focus:outline-none focus:border-[#5a5a40] focus:ring-1 focus:ring-[#5a5a40] transition-all appearance-none cursor-pointer"
                id="continent-selector"
              >
                <option value="All">🌍 All Continents</option>
                <option value="Europe">🇪🇺 Europe</option>
                <option value="North America">🇺🇸 North America</option>
                <option value="South America">🇧🇷 South America</option>
                <option value="Asia">🇯🇵 Asia</option>
                <option value="Oceania">🇳🇿 Oceania</option>
                <option value="Africa">🇿🇦 Africa</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#5a5a40]/60 text-[10px]">▼</div>
            </div>

            {/* Country Dropdown */}
            <div className="relative">
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="pl-3 pr-8 py-2 bg-[#fdfdfb]/80 border border-[#5a5a40]/20 text-[#2c2c24] text-xs font-semibold rounded-xl focus:outline-none focus:border-[#5a5a40] focus:ring-1 focus:ring-[#5a5a40] transition-all appearance-none cursor-pointer"
                id="country-selector"
              >
                {filteredCountries.map(c => (
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
            <div className="flex items-center gap-1.5" id="status-badges-group">
              {servedFromCache !== null && (
                <div
                  className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-2.5 rounded-xl border select-none transition-all ${
                    servedFromCache
                      ? "bg-sky-50 text-sky-850 border-sky-150"
                      : "bg-[#2c2c24]/5 text-[#2c2c24]/60 border-stone-200"
                  }`}
                  id="header-cache-status-badge"
                  title={servedFromCache ? "Retrieved immediately from the server cache flat-file database" : "Queried directly from live gateway API"}
                >
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${servedFromCache ? "bg-sky-500 animate-pulse" : "bg-teal-500"}`} />
                  <span>{servedFromCache ? "Cached DB" : "Live API"}</span>
                </div>
              )}

              <button
                onClick={() => setActiveView("settings")}
                className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                  apiKey.trim() === ""
                    ? "bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100"
                    : "bg-emerald-50 text-emerald-850 border-emerald-150 hover:bg-emerald-100"
                }`}
                id="status-header-indicator"
                title="Click to view API Settings"
              >
                {apiKey.trim() === "" ? (
                  <>
                    <AlertCircle className="w-3 text-amber-600 shrink-0 select-none animate-pulse" />
                    <span>Config Required</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3 text-emerald-600 shrink-0" />
                    <span>ABC Gateway Active</span>
                  </>
                )}
              </button>
            </div>
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
          {activeView === "settings" ? (
            <AnimatePresence mode="wait">
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                id="tab-content-animator"
              >
                <Settings apiKey={apiKey} onChangeApiKey={handleApiKeyChange} apiEndpoint={apiEndpoint} onChangeApiEndpoint={handleApiEndpointChange} />
              </motion.div>
            </AnimatePresence>
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
                  The application tried to call the Global Holiday Gateway but it returned a query exception:
                  <code className="block bg-[#a65d52]/10 p-2.5 rounded-lg font-mono text-[11px] mt-2 select-all text-[#a65d52] break-all border border-[#a65d52]/15">{error}</code>
                </p>
                <p className="text-xs text-[#2c2c24]/60 pt-1">
                  💡 <b>Pro-Tip:</b> If you don't have active Gateway API credentials, you can check Sweden (SE) 2026, Norway (NO) 2026, and Denmark (DK) 2026 which have been shared and cached directly in our flat-file database!
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
              Global Holiday Audit Network
            </p>
            <p className="max-w-md text-[11px] leading-relaxed text-[#2c2c24]/70">
              Maintained by Global Holiday Systems. This local auditor application is designed for real-time validation of public red days, scheduling closures, and business booking models.
            </p>
          </div>

          {/* Contact Details */}
          <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row gap-4 items-center md:items-end text-[11px]" id="corporate-contact-details">
            <span className="flex items-center gap-1 text-[#2c2c24]/80">
              <Mail className="w-3.5 h-3.5 text-[#5a5a40]" />
              support@holiday-audit.com
            </span>
            <span className="flex items-center gap-1 text-[#2c2c24]/80">
              <Phone className="w-3.5 h-3.5 text-[#5a5a40]" />
              +00 000 00 00
            </span>
          </div>

        </div>
        <div className="max-w-7xl mx-auto border-t border-[#5a5a40]/10 mt-6 pt-4 text-center text-[10px] text-[#2c2c24]/50" id="copyright-box">
          © {new Date().getFullYear()} Global Holiday Systems. All enterprise rights reserved. Under MIT Local Auditor License.
        </div>
      </footer>
    </div>
  );
}
