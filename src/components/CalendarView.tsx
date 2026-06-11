import React, { useState, ReactNode } from "react";
import { Holiday } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, Sparkles, HelpCircle, CalendarRange } from "lucide-react";

interface CalendarViewProps {
  holidays: Holiday[];
  year: number;
}

export default function CalendarView({ holidays, year }: CalendarViewProps) {
  // Let's support zooming into a month. null means showing all 12 mini months.
  const [zoomedMonth, setZoomedMonth] = useState<number | null>(null);
  const [selectedDayHoliday, setSelectedDayHoliday] = useState<Holiday | null>(null);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const weekdayShort = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

  // Helper: Get days list for a month
  const getDaysInMonth = (monthIndex: number) => {
    return new Date(year, monthIndex + 1, 0).getDate();
  };

  // Helper: Get day of week the month starts on (adjusted for Monday as index 0)
  const getStartDayIndex = (monthIndex: number) => {
    const day = new Date(year, monthIndex, 1).getDay(); // 0 is Sunday, 1 is Monday, etc.
    // Map to: 0 is Monday, 1 is Tuesday ... 6 is Sunday
    return day === 0 ? 6 : day - 1;
  };

  // Helper: Get holidays for a specific day
  const getHolidaysForDay = (monthIndex: number, dayNum: number) => {
    const dateStr = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
    return holidays.filter(h => h.date === dateStr);
  };

  // Render a mini-month calendar grid
  const renderMiniMonth = (monthIndex: number) => {
    const daysInMonth = getDaysInMonth(monthIndex);
    const startOffset = getStartDayIndex(monthIndex);
    const cells: React.ReactNode[] = [];

    // Empty cells before month starts
    for (let i = 0; i < startOffset; i++) {
      cells.push(<div key={`empty-${i}`} className="w-5 h-5" />);
    }

    // Days cells
    for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
      const dayHolidays = getHolidaysForDay(monthIndex, dayNum);
      const isHoliday = dayHolidays.length > 0;
      const isPublic = dayHolidays.some(h => h.types?.includes("Public"));

      let cellStyle = "text-[#2c2c24]/80 hover:bg-[#5a5a40]/10";
      if (isHoliday) {
        cellStyle = isPublic 
          ? "bg-[#a65d52]/10 text-[#a65d52] font-bold border border-[#a65d52]/20" 
          : "bg-[#5a5a40]/10 text-[#5a5a40] font-bold border border-[#5a5a40]/20";
      }

      cells.push(
        <button
          key={`day-${dayNum}`}
          onClick={(e) => {
            e.stopPropagation();
            if (isHoliday) {
              setSelectedDayHoliday(dayHolidays[0]);
            }
            setZoomedMonth(monthIndex);
          }}
          className={`w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-medium transition-all cursor-pointer ${cellStyle}`}
          title={isHoliday ? dayHolidays.map(h => h.name).join(", ") : undefined}
          id={`mini-month-${monthIndex}-day-${dayNum}`}
        >
          {dayNum}
        </button>
      );
    }

    return (
      <div 
        key={monthIndex}
        onClick={() => setZoomedMonth(monthIndex)}
        className="bg-white border border-[#5a5a40]/10 p-4 rounded-xl shadow-2xs hover:shadow-xs hover:border-[#5a5a40]/25 transition-all cursor-zoom-in text-center select-none"
        id={`mini-month-card-${monthIndex}`}
      >
        <h4 className="serif text-sm font-semibold text-[#2c2c24] mb-2 truncate">
          {monthNames[monthIndex]}
        </h4>
        <div className="grid grid-cols-7 gap-1 text-[8px] font-semibold text-stone-400 mb-1.5">
          {weekdayShort.map(w => <div key={w}>{w}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells}
        </div>
      </div>
    );
  };

  // Render a detailed large month calendar grid
  const renderZoomedMonth = (monthIndex: number) => {
    const daysInMonth = getDaysInMonth(monthIndex);
    const startOffset = getStartDayIndex(monthIndex);
    const cells: React.ReactNode[] = [];

    // Empty cells
    for (let i = 0; i < startOffset; i++) {
      cells.push(<div key={`zoomed-empty-${i}`} className="aspect-square bg-stone-50/40 rounded-xl" />);
    }

    // Days cells
    for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
      const dayHolidays = getHolidaysForDay(monthIndex, dayNum);
      const isHoliday = dayHolidays.length > 0;
      const isPublic = dayHolidays.some(h => h.types?.includes("Public"));

      let cellStyle = "bg-white border border-[#5a5a40]/10 hover:border-[#5a5a40]/30";
      if (isHoliday) {
        cellStyle = isPublic
          ? "bg-[#a65d52]/5 border-2 border-[#a65d52]/30 hover:bg-[#a65d52]/10"
          : "bg-[#5a5a40]/5 border-2 border-[#5a5a40]/20 hover:bg-[#5a5a40]/10";
      }

      cells.push(
        <button
          key={`zoomed-day-${dayNum}`}
          onClick={() => {
            if (isHoliday) {
              setSelectedDayHoliday(dayHolidays[0]);
            } else {
              setSelectedDayHoliday(null);
            }
          }}
          className={`aspect-square p-2 rounded-xl flex flex-col justify-between items-start transition-all cursor-pointer relative group ${cellStyle}`}
          id={`zoomed-day-cell-${dayNum}`}
        >
          <span className={`text-xs font-semibold ${isHoliday ? (isPublic ? "text-[#a65d52]" : "text-[#5a5a40]") : "text-stone-500"}`}>
            {dayNum}
          </span>
          
          {isHoliday && (
            <div className="w-full text-left space-y-0.5">
              {dayHolidays.slice(0, 2).map((h, i) => (
                <div 
                  key={i} 
                  className={`text-[9px] leading-tight font-medium truncate py-0.5 px-1 rounded-md ${
                    isPublic ? "bg-[#a65d52]/10 text-[#a65d52]" : "bg-[#5a5a40]/10 text-[#5a5a40]"
                  }`}
                  id={`holiday-label-dayIndex-${dayNum}-${i}`}
                >
                  {h.name}
                </div>
              ))}
              {dayHolidays.length > 2 && (
                <div className="text-[8px] font-bold text-stone-400 pl-1">
                  +{dayHolidays.length - 2} more
                </div>
              )}
            </div>
          )}
        </button>
      );
    }

    const monthHolidaysList = holidays.filter(h => {
      const parts = h.date.split("-");
      return parseInt(parts[1], 10) - 1 === monthIndex;
    });

    return (
      <div className="bg-white border border-[#5a5a40]/10 p-6 rounded-2xl shadow-sm space-y-6" id="zoomed-calendar-view">
        {/* Navigation / Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-[#5a5a40]/10 pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setZoomedMonth(null)}
              className="px-3 py-1.5 bg-stone-50 border border-[#5a5a40]/25 hover:bg-[#5a5a40]/5 text-xs font-semibold text-[#2c2c24] rounded-lg transition-all cursor-pointer"
              id="back-to-year-btn"
            >
              ← Back to Year View
            </button>
            <h3 className="serif text-xl font-bold text-[#2c2c24]" id="zoomed-month-header">
              {monthNames[monthIndex]} {year}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={monthIndex === 0}
              onClick={() => {
                setZoomedMonth(monthIndex - 1);
                setSelectedDayHoliday(null);
              }}
              className="p-1.5 hover:bg-[#5a5a40]/5 border border-[#5a5a40]/20 rounded-lg disabled:opacity-30 transition-all text-[#5a5a40] cursor-pointer"
              id="prev-month-btn"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={monthIndex === 11}
              onClick={() => {
                setZoomedMonth(monthIndex + 1);
                setSelectedDayHoliday(null);
              }}
              className="p-1.5 hover:bg-[#5a5a40]/5 border border-[#5a5a40]/20 rounded-lg disabled:opacity-30 transition-all text-[#5a5a40] cursor-pointer"
              id="next-month-btn"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Calendar Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="zoomed-calendar-layout">
          {/* Left: The Grid itself */}
          <div className="lg:col-span-8 space-y-3">
            <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-bold text-[#2c2c24]/50 py-1" id="weekday-row">
              {weekdayShort.map(w => (
                <div key={w} className="py-1">{w}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {cells}
            </div>
          </div>

          {/* Right: Holidays event card / list sidebar */}
          <div className="lg:col-span-4 space-y-4" id="zoomed-calendar-sidebar">
            <div className="bg-[#f5f5f0]/30 border border-[#5a5a40]/10 p-4 rounded-xl space-y-4">
              <h4 className="serif text-sm font-bold text-[#2c2c24] flex items-center gap-1.5" id="events-this-month-hdr">
                <CalendarRange className="w-4 h-4 text-[#5a5a40]" />
                Events in {monthNames[monthIndex]}
              </h4>

              {monthHolidaysList.length === 0 ? (
                <div className="text-center py-8 text-xs text-stone-450 italic">
                  No public holidays in this month.
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1" id="month-holidays-list shadow-inner">
                  {monthHolidaysList.map((h, i) => {
                    const isPublic = h.types?.includes("Public");
                    const isSel = selectedDayHoliday?.date === h.date;
                    return (
                      <button
                        key={i}
                        onClick={() => setSelectedDayHoliday(h)}
                        className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all flex justify-between items-center cursor-pointer ${
                          isSel
                            ? "bg-[#5A5A40] text-white border-[#5A5A40]"
                            : isPublic
                            ? "bg-[#a65d52]/5 text-[#2c2c24] border-[#a65d52]/15 hover:border-[#a65d52]/35"
                            : "bg-[#5a5a40]/5 text-[#2c2c24] border-[#5a5a40]/10 hover:border-[#5a5a40]/25"
                        }`}
                        id={`sidebar-holiday-entry-${i}`}
                      >
                        <div className="truncate pr-2">
                          <span className="font-semibold block truncate leading-tight">{h.name}</span>
                          <span className={`text-[10px] truncate leading-none mt-0.5 ${isSel ? "text-stone-200" : "text-[#2c2c24]/60"}`}>
                            {h.local_name !== h.name ? h.local_name : "Public Holiday"}
                          </span>
                        </div>
                        <span className="font-mono text-[10px] shrink-0 font-bold opacity-80">
                          {h.date.split("-")[2]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Selected day inspect drawer */}
            <AnimatePresence mode="wait">
              {selectedDayHoliday ? (
                <motion.div
                  key={selectedDayHoliday.date}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className={`border p-4 rounded-xl shadow-xs space-y-3 ${
                    selectedDayHoliday.types?.includes("Public")
                      ? "bg-[#a65d52]/5 border-[#a65d52]/15"
                      : "bg-[#5a5a40]/5 border-[#5a5a40]/15"
                  }`}
                  id="selected-holiday-inspection-card"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h4 className="serif text-base font-bold text-[#2c2c24] leading-tight">
                        {selectedDayHoliday.name}
                      </h4>
                      <p className="text-xs text-[#2c2c24]/60 font-medium italic mt-0.5">
                        {selectedDayHoliday.local_name}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-[#5a5a40]/10 text-[#5a5a40] shrink-0">
                      {selectedDayHoliday.types?.[0] || "Holiday"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs border-t border-[#5a5a40]/10 pt-3" id="inspection-details-grid">
                    <div>
                      <span className="text-[#2c2c24]/50 block text-[9px] uppercase font-bold tracking-wider">Date</span>
                      <span className="font-mono font-medium text-[#2c2c24]">{selectedDayHoliday.date}</span>
                    </div>
                    <div>
                      <span className="text-[#2c2c24]/50 block text-[9px] uppercase font-bold tracking-wider">Occurrence</span>
                      <span className="font-medium text-[#2c2c24]">{selectedDayHoliday.fixed ? "Fixed Repeat" : "Floating/Variable"}</span>
                    </div>
                    <div>
                      <span className="text-[#2c2c24]/50 block text-[9px] uppercase font-bold tracking-wider">Scope</span>
                      <span className="font-medium text-[#2c2c24]">{selectedDayHoliday.global ? "National (Global)" : "Regional"}</span>
                    </div>
                    <div>
                      <span className="text-[#2c2c24]/50 block text-[9px] uppercase font-bold tracking-wider">Territories</span>
                      <span className="font-medium text-[#2c2c24]">
                        {selectedDayHoliday.counties ? selectedDayHoliday.counties.join(", ") : "All Counties"}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="border border-dashed border-[#5a5a40]/20 bg-[#f5f5f0]/50 p-6 rounded-xl flex flex-col items-center text-center text-[#2c2c24]/60 text-xs shadow-3xs" id="inspection-card-placeholder">
                  <Sparkles className="w-5 h-5 text-[#5a5a40]/60 mb-2 animate-pulse" />
                  Select a highlighted holiday on the grid or list to inspect full attributes.
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white border border-[#5a5a40]/10 rounded-3xl p-6 shadow-xs" id="calendar-view-main-wrapper">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="serif text-xl font-bold text-[#2c2c24]" id="calendar-tab-title">Sleek Calendar Overview</h2>
          <p className="text-xs text-[#2c2c24]/60" id="calendar-tab-desc">High-contrast micro and macro map of national red days</p>
        </div>
        <div className="flex gap-4 text-xs font-semibold" id="calendar-legends">
          <div className="flex items-center gap-1.5 text-[#a65d52]">
            <span className="w-2.5 h-2.5 bg-[#a65d52]/10 border border-[#a65d52]/20 rounded" />
            <span>Public / Red</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#5a5a40]">
            <span className="w-2.5 h-2.5 bg-[#5a5a40]/10 border border-[#5a5a40]/20 rounded" />
            <span>Others</span>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {zoomedMonth === null ? (
          <motion.div
            key="year-grid"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
            id="mini-months-grid"
          >
            {monthNames.map((_, i) => renderMiniMonth(i))}
          </motion.div>
        ) : (
          <motion.div
            key="zoomed-month"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
          >
            {renderZoomedMonth(zoomedMonth)}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
