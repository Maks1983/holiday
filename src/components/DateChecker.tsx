import React, { useState } from "react";
import { Holiday, COUNTRIES } from "../types";
import { checkHolidayDate } from "../utils/holidayService";
import { CalendarCheck2, Search, ArrowRight, ShieldAlert, BadgeCheck, XCircle, RefreshCw } from "lucide-react";

interface DateCheckerProps {
  countryCode: string;
  apiKey: string;
  apiEndpoint: string;
}

export default function DateChecker({ countryCode, apiKey, apiEndpoint }: DateCheckerProps) {
  const [date, setDate] = useState("2026-06-11"); // default to reference day
  const [selectedCC, setSelectedCC] = useState(countryCode);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ holiday: Holiday | null; isMock: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await checkHolidayDate(selectedCC, date, apiKey, apiEndpoint);
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  const getDayName = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  };

  const selectedCountry = COUNTRIES.find(c => c.code === selectedCC);

  return (
    <div className="bg-white border border-[#5a5a40]/10 rounded-3xl p-6 shadow-xs max-w-2xl mx-auto space-y-6" id="date-checker-card">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-[#a65d52]/10 text-[#a65d52] rounded-xl">
          <CalendarCheck2 className="w-5 h-5 animate-pulse" id="checker-icon" />
        </div>
        <div>
          <h2 className="serif text-xl font-bold text-[#2c2c24]">Direct Red Day Auditor</h2>
          <p className="text-xs text-[#2c2c24]/60">Query individual dates on the Holiday Microservice directly</p>
        </div>
      </div>

      <form onSubmit={handleCheck} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end" id="checker-form">
        <div className="sm:col-span-5 space-y-1.5">
          <label className="text-xs font-semibold text-[#2c2c24]/60 uppercase tracking-wider block">Auditor Country</label>
          <select
            value={selectedCC}
            onChange={(e) => setSelectedCC(e.target.value)}
            className="w-full px-3 py-2 bg-[#fdfdfb]/80 border border-[#5a5a40]/20 rounded-xl text-[#2c2c24] text-sm focus:outline-none focus:border-[#5a5a40] focus:ring-1 focus:ring-[#5a5a40] cursor-pointer"
            id="checker-country-select"
          >
            {COUNTRIES.map(c => (
              <option key={c.code} value={c.code}>
                {c.flag} {c.name} ({c.code})
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-4 space-y-1.5">
          <label className="text-xs font-semibold text-[#2c2c24]/60 uppercase tracking-wider block">Target Audit Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 bg-[#fdfdfb]/80 border border-[#5a5a40]/20 rounded-xl text-[#2c2c24] text-sm focus:outline-none focus:border-[#5a5a40] focus:ring-1 focus:ring-[#5a5a40] font-mono"
            id="checker-date-input"
          />
        </div>

        <div className="sm:col-span-3">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-[#5A5A40] hover:bg-[#484833] text-white font-semibold text-sm rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-55 cursor-pointer"
            id="checker-submit-btn"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Querying...
              </>
            ) : (
              <>
                Audit Date <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Main feedback region */}
      <div id="checker-results-pane">
        {error && (
          <div className="bg-[#a65d52]/5 border border-[#a65d52]/15 rounded-xl p-4 flex gap-3 text-[#a65d52] text-xs" id="checker-error-box">
            <XCircle className="w-4 h-4 text-[#a65d52] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block mb-0.5">Audit Service Request Failed</span>
              {error}. Please check your API authorization key in settings.
            </div>
          </div>
        )}

        {result && (
          <div className="mt-4 transition-all">
            {result.holiday ? (
              <div className="bg-[#a65d52]/5 border border-[#a65d52]/15 rounded-2xl p-5 space-y-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4" id="checker-match-pane">
                <div className="flex gap-3.5 items-start">
                  <div className="p-3 bg-[#a65d52] text-white rounded-xl shrink-0">
                    <BadgeCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#a65d52] bg-[#a65d52]/10 border border-[#a65d52]/15 px-2 py-0.5 rounded-full inline-block mb-1.5 font-mono">
                      Red Day Detected
                    </span>
                    <h3 className="serif text-lg font-bold text-[#2c2c24] leading-tight">
                      {result.holiday.name}
                    </h3>
                    <p className="text-xs text-[#2c2c24]/70 italic mt-0.5 font-medium">
                      Localized: {result.holiday.local_name}
                    </p>
                    <p className="text-xs text-[#2c2c24]/50 mt-2 font-semibold">
                      {getDayName(result.holiday.date)} • {selectedCountry?.name}
                    </p>
                  </div>
                </div>

                <div className="bg-white/85 border border-[#a65d52]/15 p-3.5 rounded-xl space-y-2 text-xs font-medium w-full md:w-56 text-[#2c2c24]" id="matching-holiday-props">
                  <div className="flex justify-between border-b border-stone-100 pb-1.5 text-[#2c2c24]/70">
                    <span>Classification</span>
                    <span className="font-bold text-[#a65d52]">{result.holiday.types?.[0] || "Public"}</span>
                  </div>
                  <div className="flex justify-between border-b border-stone-100 pb-1.5 text-[#2c2c24]/70">
                    <span>Fixed Recurrence</span>
                    <span className="font-bold text-[#2c2c24]">{result.holiday.fixed ? "Yes" : "No"}</span>
                  </div>
                  <div className="flex justify-between text-[#2c2c24]/70">
                    <span>Scope Range</span>
                    <span className="font-bold text-[#2c2c24]">{result.holiday.global ? "National" : "Regional"}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[#5a5a40]/5 border border-[#5a5a40]/15 rounded-2xl p-5 flex gap-4 items-center" id="checker-no-match-pane">
                <div className="p-3 bg-[#5a5a40] text-white rounded-xl shrink-0">
                  <BadgeCheck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#5a5a40] bg-[#5a5a40]/10 border border-[#5a5a40]/15 px-2 py-0.5 rounded-full inline-block mb-1 font-mono">
                    Standard Working Day
                  </span>
                  <h3 className="serif text-base font-bold text-[#2c2c24]">
                    No holiday found for {getDayName(date)}
                  </h3>
                  <p className="text-xs text-[#2c2c24]/60 mt-0.5">
                    This date represents a standard, active business calendar date in {selectedCountry?.name}.
                  </p>
                </div>
              </div>
            )}
            
            <div className="flex justify-between items-center text-[10px] text-[#2c2c24]/50 mt-3 px-1">
              <span>AUDIT TIMEFRAME: {date}</span>
              <span className="font-mono bg-[#f5f5f0] text-[#2c2c24]/60 leading-none py-1 px-2.5 rounded-md uppercase font-semibold">
                Live API Source
              </span>
            </div>
          </div>
        )}

        {!result && !error && !loading && (
          <div className="border border-dashed border-[#5a5a40]/20 bg-[#f5f5f0]/30 p-12 rounded-2xl text-center text-[#2c2c24]/50 flex flex-col items-center" id="checker-idle-pane">
            <Search className="w-6 h-6 text-[#5a5a40]/60 mb-2 animate-pulse" />
            <span className="text-xs font-semibold">Ready for auditing. Select country and target date.</span>
          </div>
        )}
      </div>
    </div>
  );
}
