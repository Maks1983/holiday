import { useState } from "react";
import { Holiday } from "../types";
import { Search, Calendar, Filter, Star, Clock, CheckCircle2, AlertTriangle } from "lucide-react";

interface HolidayListProps {
  holidays: Holiday[];
  selectedCountryName: string;
}

export default function HolidayList({ holidays, selectedCountryName }: HolidayListProps) {
  const REFERENCE_TODAY = "2026-06-11";

  const [searchText, setSearchText] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [fixedFilter, setFixedFilter] = useState<"all" | "fixed" | "floating">("all");
  const [upcomingOnly, setUpcomingOnly] = useState(false);

  // Toggle classification types list filters
  const toggleTypeFilter = (type: string) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(prev => prev.filter(t => t !== type));
    } else {
      setSelectedTypes(prev => [...prev, type]);
    }
  };

  const getMonthAbbreviation = (dateStr: string) => {
    const monthIndex = parseInt(dateStr.split("-")[1], 10) - 1;
    const abs = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    return abs[monthIndex] || "DAT";
  };

  const getDayNumber = (dateStr: string) => {
    return parseInt(dateStr.split("-")[2], 10);
  };

  // Days difference countdown calc
  const getCountdown = (dateStr: string) => {
    const today = new Date(REFERENCE_TODAY);
    const target = new Date(dateStr);
    
    today.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);
    
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return { style: "bg-[#a65d52] text-white animate-pulse", text: "Today" };
    } else if (diffDays === 1) {
      return { style: "bg-[#a65d52]/80 text-white", text: "Tomorrow" };
    } else if (diffDays < 0) {
      return { style: "bg-stone-100 text-stone-400 border border-stone-200/50", text: `Passed (${Math.abs(diffDays)}d ago)` };
    } else {
      return { style: "bg-[#5a5a40]/10 text-[#5a5a40] border border-[#5a5a40]/15", text: `In ${diffDays} days` };
    }
  };

  // Find all available types in the active holiday array
  const availableTypesSet = new Set<string>();
  holidays.forEach(h => {
    h.types?.forEach(t => availableTypesSet.add(t));
  });
  const availableTypes = Array.from(availableTypesSet);

  // Colored tags
  const typeColors: Record<string, string> = {
    Public: "bg-[#a65d52]/10 text-[#a65d52] border-[#a65d52]/20",
    Bank: "bg-[#5a5a40]/15 text-[#5a5a40] border-[#5a5a40]/25",
    School: "bg-[#5a5a40]/5 text-[#5a5a40]/80 border-[#5a5a40]/15",
    Authorities: "bg-stone-100 text-stone-700 border-stone-250",
    Optional: "bg-stone-50 text-[#5a5a40] border-stone-200",
    Observance: "bg-stone-100 text-[#2c2c24]/85 border-stone-200"
  };

  // Filters application
  const filteredHolidays = holidays.filter(holiday => {
    // 1. Text Search matching
    const searchMatch = 
      holiday.name.toLowerCase().includes(searchText.toLowerCase()) || 
      holiday.local_name.toLowerCase().includes(searchText.toLowerCase()) ||
      holiday.date.includes(searchText);

    // 2. Types matching
    const typeMatch = 
      selectedTypes.length === 0 || 
      (holiday.types && holiday.types.some(t => selectedTypes.includes(t)));

    // 3. Fixed vs Floating matching
    const fixedMatch = 
      fixedFilter === "all" ||
      (fixedFilter === "fixed" && holiday.fixed) ||
      (fixedFilter === "floating" && !holiday.fixed);

    // 4. Upcoming only matching
    const upcomingMatch = 
      !upcomingOnly || 
      holiday.date >= REFERENCE_TODAY;

    return searchMatch && typeMatch && fixedMatch && upcomingMatch;
  });

  return (
    <div className="space-y-6" id="holiday-list-wrapper">
      {/* Search and Filters Panel */}
      <div className="bg-white border border-[#5a5a40]/10 shadow-xs rounded-2xl p-5 space-y-4" id="filters-panel">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Main search */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by name, localized name, or month..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-[#fdfdfb]/80 border border-[#5a5a40]/20 rounded-xl text-[#2c2c24] placeholder-stone-400 text-sm focus:outline-none focus:border-[#5a5a40] focus:ring-1 focus:ring-[#5a5a40] transition-all"
              id="list-search-input"
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5a5a40]/60">
              <Search className="w-4 h-4" />
            </div>
          </div>

          {/* Quick toggle options */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setUpcomingOnly(!upcomingOnly)}
              className={`px-4 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                upcomingOnly
                  ? "bg-[#5A5A40] border-[#5A5A40] text-white"
                  : "bg-white border-[#5a5a40]/25 text-[#2c2c24] hover:bg-[#5a5a40]/5"
              }`}
              id="upcoming-filter-toggle"
            >
              <Clock className="w-3.5 h-3.5" />
              Upcoming Only
            </button>

            {/* Fixed vs Floating selector */}
            <div className="inline-flex rounded-xl bg-[#f5f5f0] p-1 border border-[#5a5a40]/15" id="fixed-floating-selector">
              <button
                onClick={() => setFixedFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  fixedFilter === "all" ? "bg-white text-[#2c2c24] shadow-3xs" : "text-[#2c2c24]/60 hover:text-[#2c2c24]"
                }`}
                id="filter-all"
              >
                All Days
              </button>
              <button
                onClick={() => setFixedFilter("fixed")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  fixedFilter === "fixed" ? "bg-white text-[#2c2c24] shadow-3xs" : "text-[#2c2c24]/60 hover:text-[#2c2c24]"
                }`}
                id="filter-fixed"
              >
                Fixed
              </button>
              <button
                onClick={() => setFixedFilter("floating")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  fixedFilter === "floating" ? "bg-white text-[#2c2c24] shadow-3xs" : "text-[#2c2c24]/60 hover:text-[#2c2c24]"
                }`}
                id="filter-floating"
              >
                Floating
              </button>
            </div>
          </div>
        </div>

        {/* Categories checklist */}
        {availableTypes.length > 0 && (
          <div className="border-t border-stone-100 pt-3" id="type-badge-filters-section">
            <span className="text-[10px] uppercase font-bold text-[#2c2c24]/60 tracking-wider block mb-2">
              Filter by Classification Model
            </span>
            <div className="flex flex-wrap gap-1.5">
              {availableTypes.map(type => {
                const isSelected = selectedTypes.includes(type);
                return (
                  <button
                    key={type}
                    onClick={() => toggleTypeFilter(type)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#5A5A40] text-white border-[#5A5A40]"
                        : "bg-[#f5f5f0] text-[#2c2c24] border-stone-100 hover:bg-[#5a5a40]/10"
                    }`}
                    id={`filter-badge-${type}`}
                  >
                    {type}
                  </button>
                );
              })}
              {selectedTypes.length > 0 && (
                <button
                  onClick={() => setSelectedTypes([])}
                  className="px-2 py-1 text-[10px] text-[#5A5A40] font-semibold hover:underline cursor-pointer"
                  id="clear-type-badge-filters"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main Results Listing */}
      <div className="space-y-3" id="list-results-container">
        <div className="flex justify-between items-center text-xs text-[#2c2c24]/60 font-semibold px-2">
          <span>SHOWING {filteredHolidays.length} HOLIDAYS IN {selectedCountryName.toUpperCase()}</span>
          <span>REFERENCE TIMELINE: {REFERENCE_TODAY}</span>
        </div>

        {filteredHolidays.length === 0 ? (
          <div className="bg-white border border-[#5a5a40]/10 rounded-2xl p-12 text-center text-stone-450 flex flex-col items-center shadow-xs" id="empty-state">
            <AlertTriangle className="w-8 h-8 text-[#a65d52] mb-2 animate-bounce" />
            <h4 className="serif text-base font-semibold text-[#2c2c24]">No holidays found</h4>
            <p className="text-xs text-[#2c2c24]/60 mt-1 max-w-xs mx-auto">
              No dates match your active criteria. Try adjusting your searches, tags, or switches.
            </p>
          </div>
        ) : (
          <div className="space-y-3" id="list-cards-content">
            {filteredHolidays.map((holiday, idx) => {
              const countdown = getCountdown(holiday.date);
              const dayNum = getDayNumber(holiday.date);
              const mName = getMonthAbbreviation(holiday.date);

              return (
                <div
                  key={holiday.date + "-" + holiday.name + "-" + idx}
                  className="bg-white border border-[#5a5a40]/10 rounded-2xl p-4 shadow-2xs hover:shadow-xs hover:border-[#5a5a40]/25 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  id={`holiday-row-card-${idx}`}
                >
                  {/* Left Side: Date block & Text Name details */}
                  <div className="flex items-center gap-4">
                    {/* Visual Date Badge */}
                    <div className="w-12 h-14 bg-[#5a5a40]/10 rounded-xl overflow-hidden border border-[#5a5a40]/20 shrink-0 flex flex-col hover:scale-105 transition-all">
                      <div className="bg-[#5A5A40] text-white text-[9px] font-bold text-center py-0.5 uppercase tracking-wider">
                        {mName}
                      </div>
                      <div className="serif flex-1 flex items-center justify-center font-bold text-[#2c2c24] text-base leading-none">
                        {dayNum}
                      </div>
                    </div>

                    {/* Holiday specifications */}
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-[#2c2c24] text-sm leading-tight">
                          {holiday.name}
                        </h4>
                        
                        {/* Categories badges */}
                        {holiday.types?.map((t, tid) => {
                          const tagClass = typeColors[t] || "bg-[#f5f5f0] text-[#2c2c24]/80 border-stone-200";
                          return (
                            <span 
                              key={tid} 
                              className={`text-[9px] font-semibold border px-1.5 py-0.2 rounded-md ${tagClass}`}
                            >
                              {t}
                            </span>
                          );
                        })}
                      </div>

                      {/* Subtitles (localized names if different / county details) */}
                      <p className="text-xs text-[#2c2c24]/60 italic mt-0.5">
                        {holiday.name !== holiday.local_name ? holiday.local_name : "Public Holiday"}
                      </p>

                      <div className="flex flex-wrap gap-4 text-[10px] text-[#2c2c24]/50 mt-2 font-semibold">
                        <span className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#5a5a40]/60" />
                          {holiday.fixed ? "Repeated Annual" : "Floating/Variable Event"}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#a65d52]/60" />
                          {holiday.global ? "Nationwide (Global)" : "Regional / County Specific"}
                        </span>
                        {holiday.counties && (
                          <span className="text-[#5a5a40] underline cursor-help" title={holiday.counties.join(", ")}>
                            {holiday.counties.length} regions
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Proportional Countdown Counter */}
                  <div className="shrink-0 flex items-center sm:self-center">
                    <span className={`px-2.5 py-1.5 rounded-xl font-mono text-[11px] font-semibold tracking-tight ${countdown.style}`}>
                      {countdown.text}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
