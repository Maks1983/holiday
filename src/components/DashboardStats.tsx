import { Holiday } from "../types";
import { Calendar, CheckCircle, RefreshCw, BarChart2, PieChart, Star } from "lucide-react";

interface DashboardStatsProps {
  holidays: Holiday[];
  year: number;
}

export default function DashboardStats({ holidays, year }: DashboardStatsProps) {
  // Today's date reference is June 11, 2026
  const REFERENCE_TODAY = "2026-06-11";

  const safeHolidays = Array.isArray(holidays) ? holidays : [];

  const totalCount = safeHolidays.length;
  
  // Public vs other types
  const publicHolidays = safeHolidays.filter(h => h.types?.includes("Public"));
  const publicCount = publicHolidays.length;

  const otherCount = totalCount - publicCount;

  // Fixed vs Variable
  const fixedCount = safeHolidays.filter(h => h.fixed).length;
  const variableCount = totalCount - fixedCount;
  const fixedPercentage = totalCount > 0 ? Math.round((fixedCount / totalCount) * 100) : 0;

  // Remaining list
  const upcomingCount = safeHolidays.filter(h => h.date >= REFERENCE_TODAY).length;

  // Breakdown by month
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const monthDistribution = Array(12).fill(0);
  safeHolidays.forEach(h => {
    if (h && h.date) {
      const parts = h.date.split("-");
      if (parts.length > 1) {
        const month = parseInt(parts[1], 10) - 1;
        if (month >= 0 && month < 12) {
          monthDistribution[month]++;
        }
      }
    }
  });

  const maxMonthCount = Math.max(...monthDistribution, 1);

  // Breakdown by type
  const typeCounts: Record<string, number> = {};
  safeHolidays.forEach(h => {
    h.types?.forEach(t => {
      typeCounts[t] = (typeCounts[t] || 0) + 1;
    });
  });

  const typeColors: Record<string, { bg: string; text: string; bar: string }> = {
    Public: { bg: "bg-[#a65d52]/10", text: "text-[#a65d52]", bar: "bg-[#a65d52]" },
    Bank: { bg: "bg-[#5a5a40]/10", text: "text-[#5a5a40]", bar: "bg-[#5a5a40]" },
    School: { bg: "bg-[#5a5a40]/5", text: "text-[#5a5a40]/80", bar: "bg-[#5a5a40]/70" },
    Authorities: { bg: "bg-stone-100", text: "text-[#2c2c24]/80", bar: "bg-[#5a5a40]/40" },
    Optional: { bg: "bg-stone-50", text: "text-[#5a5a40]", bar: "bg-[#5a5a40]/55" },
    Observance: { bg: "bg-stone-100", text: "text-stone-700", bar: "bg-[#5a5a40]/30" }
  };

  return (
    <div className="space-y-6" id="dashboard-stats-wrapper">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="stats-grid">
        {/* Total Holidays Card */}
        <div className="bg-white border border-[#5a5a40]/10 p-5 rounded-2xl shadow-xs flex items-center gap-4 transition-all hover:border-[#5a5a40]/25" id="stat-card-total">
          <div className="p-3 bg-[#5a5a40]/10 text-[#5a5a40] rounded-xl">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-[#2c2c24]/60 font-medium uppercase tracking-wider">Total Holidays</p>
            <h3 className="serif text-3xl font-bold text-[#2c2c24] tracking-tight">{totalCount}</h3>
            <p className="text-[10px] text-stone-400 mt-0.5">Recorded for {year}</p>
          </div>
        </div>

        {/* Public Days Card */}
        <div className="bg-white border border-[#a65d52]/15 p-5 rounded-2xl shadow-xs flex items-center gap-4 transition-all hover:border-[#a65d52]/30" id="stat-card-public">
          <div className="p-3 bg-[#a65d52]/10 text-[#a65d52] rounded-xl">
            <Star className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-[#2c2c24]/60 font-medium uppercase tracking-wider">Public / Red Days</p>
            <h3 className="serif text-3xl font-bold text-[#2c2c24] tracking-tight">{publicCount}</h3>
            <p className="text-[10px] text-stone-400 mt-0.5">{otherCount} observing bank/others</p>
          </div>
        </div>

        {/* Fixed Date Card */}
        <div className="bg-white border border-[#5a5a40]/10 p-5 rounded-2xl shadow-xs flex items-center gap-4 transition-all hover:border-[#5a5a40]/25" id="stat-card-fixed">
          <div className="p-3 bg-[#5a5a40]/10 text-[#5a5a40] rounded-xl">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-[#2c2c24]/60 font-medium uppercase tracking-wider">Fixed Recurring Days</p>
            <h3 className="serif text-3xl font-bold text-[#2c2c24] tracking-tight">{fixedPercentage}%</h3>
            <p className="text-[10px] text-stone-400 mt-0.5">{variableCount} floating/lunar events</p>
          </div>
        </div>

        {/* Upcoming Holidays Card */}
        <div className="bg-white border border-[#5a5a40]/10 p-5 rounded-2xl shadow-xs flex items-center gap-4 transition-all hover:border-[#5a5a40]/25" id="stat-card-upcoming">
          <div className="p-3 bg-[#5a5a40]/10 text-[#5a5a40] rounded-xl">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-[#2c2c24]/60 font-medium uppercase tracking-wider">Upcoming Holidays</p>
            <h3 className="serif text-3xl font-bold text-[#2c2c24] tracking-tight">{upcomingCount}</h3>
            <p className="text-[10px] text-stone-400 mt-0.5">Left in current year</p>
          </div>
        </div>
      </div>

      {/* Visualizations row: Month distribution and Type Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="dashboard-charts-row">
        {/* Monthly Holiday Density */}
        <div className="bg-white border border-[#5a5a40]/10 rounded-2xl p-6 shadow-xs lg:col-span-7" id="chart-month-distribution">
          <div className="flex items-center justify-between mb-5 border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-[#5a5a40]" />
              <h3 className="serif text-lg font-semibold text-[#2c2c24]">Monthly Holiday Density</h3>
            </div>
            <span className="text-[10px] text-[#2c2c24]/60 uppercase tracking-widest bg-[#f5f5f0] px-2.5 py-1 rounded-md font-mono">Distribution</span>
          </div>

          <div className="space-y-3" id="month-bars-container">
            {monthNames.map((month, index) => {
              const count = monthDistribution[index];
              const ratio = count / maxMonthCount;
              const widthPercentage = Math.max(ratio * 100, 3); // Minimum 3% to make 0 readable but small

              return (
                <div key={month} className="flex items-center group" id={`month-row-${index}`}>
                  {/* Left Label */}
                  <span className="w-24 text-xs font-medium text-[#2c2c24]/80 truncate group-hover:text-[#2c2c24] transition-colors">
                    {month}
                  </span>
                  
                  {/* Bar Background */}
                  <div className="flex-1 bg-[#f5f5f0]/50 border border-stone-200/40 h-6 rounded-lg relative overflow-hidden flex items-center px-2">
                    {count > 0 && (
                      <div
                        style={{ width: `${widthPercentage}%` }}
                        className="absolute left-0 top-0 bottom-0 bg-[#5a5a40]/10 border-r-2 border-[#5a5a40] transition-all duration-500 group-hover:bg-[#5a5a40]/15"
                      />
                    )}
                    {/* Tiny Count badge on the bar */}
                    {count > 0 ? (
                      <span className="relative z-10 text-[10px] font-semibold text-[#5a5a40]">
                        {count} {count === 1 ? "holiday" : "holidays"}
                      </span>
                    ) : (
                      <span className="text-[10px] text-stone-300 font-mono italic">No events</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Categories / Type Breakdown */}
        <div className="bg-white border border-[#5a5a40]/10 rounded-2xl p-6 shadow-xs lg:col-span-5 flex flex-col justify-between" id="chart-type-breakdown">
          <div>
            <div className="flex items-center justify-between mb-5 border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <PieChart className="w-4 h-4 text-[#5a5a40]" />
                <h3 className="serif text-lg font-semibold text-[#2c2c24]">Classification Categorization</h3>
              </div>
              <span className="text-[10px] text-[#2c2c24]/60 uppercase tracking-widest bg-[#f5f5f0] px-2.5 py-1 rounded-md font-mono">By Type</span>
            </div>

            <p className="text-xs text-[#2c2c24]/70 mb-4">
              Analyzing the types assigned in the ABCyber dataset. Some holidays may feature multiple classifications.
            </p>

            <div className="space-y-4" id="type-cards-list">
              {Object.keys(typeCounts).length === 0 ? (
                <div className="text-center py-8 text-xs text-stone-300 italic animate-pulse">No types detected in this dataset.</div>
              ) : (
                Object.entries(typeCounts).map(([type, count]) => {
                  const style = typeColors[type] || { bg: "bg-stone-50", text: "text-stone-700", bar: "bg-[#5a5a40]/50" };
                  const pct = Math.round((count / totalCount) * 100);

                  return (
                    <div key={type} className="space-y-1.5" id={`type-row-${type}`}>
                      <div className="flex justify-between items-center text-xs">
                        <span className={`px-2 py-0.5 rounded-md font-medium text-[11px] ${style.bg} ${style.text}`}>
                          {type}
                        </span>
                        <span className="font-mono text-[11px] font-semibold text-[#2c2c24]/80">
                          {count} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full bg-[#f5f5f0] h-2 rounded-full overflow-hidden border border-stone-200/20">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${style.bar}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-stone-100" id="disclaimer-text">
            <div className="flex items-start gap-2 text-[11px] text-[#2c2c24]/60">
              <Star className="w-3.5 h-3.5 text-[#5a5a40] shrink-0 mt-0.5 animate-pulse" />
              <span>
                Red Days are officially mandated public resting periods. Bank & School holidays represent operational limitations or closures of financial institutions and educational centers respectively.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
