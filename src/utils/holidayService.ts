import { Holiday } from "../types";

// Meeus/Jones/Butcher algorithm to find Easter Sunday
export function getEasterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const L = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * L) / 451);
  const month = Math.floor((h + L - 7 * m + 114) / 31);
  const day = ((h + L - 7 * m + 114) % 31) + 1;
  return new Date(Date.UTC(year, month - 1, day));
}

export function getNthWeekdayOfMonth(year: number, month: number, weekday: number, n: number): Date {
  // weekday: 0 = Sunday, 1 = Monday, etc.
  // month: 0 = January, 1 = February, etc.
  let date = new Date(Date.UTC(year, month, 1));
  let count = 0;
  while (date.getUTCMonth() === month) {
    if (date.getUTCDay() === weekday) {
      count++;
      if (count === n) {
        return date;
      }
    }
    date.setUTCDate(date.getUTCDate() + 1);
  }
  return new Date(Date.UTC(year, month, 1)); // fallback
}

export function getLastWeekdayOfMonth(year: number, month: number, weekday: number): Date {
  let date = new Date(Date.UTC(year, month + 1, 0)); // last day of month
  while (date.getUTCDay() !== weekday) {
    date.setUTCDate(date.getUTCDate() - 1);
  }
  return date;
}

export function getSwedenMidsummerEve(year: number): Date {
  for (let day = 19; day <= 25; day++) {
    let date = new Date(Date.UTC(year, 5, day)); // June is month 5
    if (date.getUTCDay() === 5) { // 5 is Friday
      return date;
    }
  }
  return new Date(Date.UTC(year, 5, 23)); // fallback
}

export function formatDate(date: Date): string {
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${date.getUTCFullYear()}-${month}-${day}`;
}

// Generate premium mock data for demonstration
export function generateMockHolidays(countryCode: string, year: number): Holiday[] {
  const cc = countryCode.toUpperCase();
  const holidays: Holiday[] = [];

  const addHoliday = (dateStr: string, name: string, localName: string, types: string[], fixed: boolean = true, global: boolean = true, counties: string[] | null = null) => {
    holidays.push({
      date: dateStr,
      name,
      local_name: localName,
      country_code: cc,
      fixed,
      global,
      counties,
      launch_year: null,
      types
    });
  };

  const easter = getEasterSunday(year);
  
  // Good Friday is 2 days before Easter
  const goodFriday = new Date(easter.getTime() - 2 * 24 * 60 * 60 * 1000);
  // Easter Monday is 1 day after Easter
  const easterMonday = new Date(easter.getTime() + 1 * 24 * 60 * 60 * 1000);
  // Ascension is 39 days after Easter
  const ascensionDay = new Date(easter.getTime() + 39 * 24 * 60 * 60 * 1000);
  // Pentecost Monday is 50 days after Easter
  const pentecostMonday = new Date(easter.getTime() + 50 * 24 * 60 * 60 * 1000);

  // Common Holidays
  addHoliday(`${year}-01-01`, "New Year's Day", "New Year's Day", ["Public"]);
  addHoliday(`${year}-12-25`, "Christmas Day", "Christmas Day", ["Public"]);
  addHoliday(`${year}-12-26`, "Boxing Day", "Boxing Day", ["Public"]);

  if (cc === "NO") {
    // Norway Public Holidays
    addHoliday(`${year}-05-01`, "Labor Day", "Offentlig høytidsdag", ["Public"]);
    addHoliday(`${year}-05-17`, "Constitution Day", "Grunnlovsdag", ["Public"]);
    addHoliday(formatDate(goodFriday), "Good Friday", "Langfredag", ["Public"], false);
    addHoliday(formatDate(easterMonday), "Easter Monday", "2. påskedag", ["Public"], false);
    addHoliday(formatDate(ascensionDay), "Ascension Day", "Kristi himmelfartsdag", ["Public"], false);
    addHoliday(formatDate(pentecostMonday), "Whit Monday", "2. pinsedag", ["Public"], false);
    
    // Add some optional/observance/school holidays for fidelity
    addHoliday(`${year}-02-14`, "Valentine's Day", "Valentinsdag", ["Observance"]);
    addHoliday(`${year}-05-08`, "Liberation Day", "Frigjøringsdagen", ["Observance"]);
    addHoliday(`${year}-06-23`, "Midsummer Eve", "Sankthansaften", ["Observance", "Optional"]);
    addHoliday(`${year}-12-24`, "Christmas Eve", "Julaften", ["Optional", "Bank"]);
    addHoliday(`${year}-12-31`, "New Year's Eve", "Nyttårsaften", ["Optional", "Bank"]);
  } 
  else if (cc === "SE") {
    // Sweden Public Holidays
    addHoliday(`${year}-01-06`, "Epiphany", "Trettondedag jul", ["Public"]);
    addHoliday(formatDate(goodFriday), "Good Friday", "Långfredagen", ["Public"], false);
    addHoliday(formatDate(easterMonday), "Easter Monday", "Annandag påsk", ["Public"], false);
    addHoliday(`${year}-05-01`, "May Day", "Första maj", ["Public"]);
    addHoliday(formatDate(ascensionDay), "Ascension Day", "Kristi himmelfärdsdag", ["Public"], false);
    addHoliday(`${year}-06-06`, "National Day", "Sveriges nationaldag", ["Public"]);

    const midsumEve = getSwedenMidsummerEve(year);
    const midsumDay = new Date(midsumEve.getTime() + 24 * 60 * 60 * 1000);
    addHoliday(formatDate(midsumEve), "Midsummer Eve", "Midsommarafton", ["Optional", "Bank"], false);
    addHoliday(formatDate(midsumDay), "Midsummer Day", "Midsommardagen", ["Public"], false);
    
    addHoliday(`${year}-12-24`, "Christmas Eve", "Julafton", ["Optional", "Bank"]);
    addHoliday(`${year}-12-31`, "New Year's Eve", "Nyårsafton", ["Optional", "Bank"]);
  } 
  else if (cc === "GB") {
    // UK Public Holidays
    addHoliday(formatDate(goodFriday), "Good Friday", "Good Friday", ["Public"], false);
    addHoliday(formatDate(easterMonday), "Easter Monday", "Easter Monday", ["Public"], false);
    
    const earlyMay = getNthWeekdayOfMonth(year, 4, 1, 1); // First Monday of May (month index 4)
    addHoliday(formatDate(earlyMay), "Early May Bank Holiday", "Early May Bank Holiday", ["Bank"], false);
    
    const springMay = getLastWeekdayOfMonth(year, 4, 1); // Last Monday of May
    addHoliday(formatDate(springMay), "Spring Bank Holiday", "Spring Bank Holiday", ["Bank"], false);
    
    const summerAug = getLastWeekdayOfMonth(year, 7, 1); // Last Monday of August (month index 7)
    addHoliday(formatDate(summerAug), "Summer Bank Holiday", "Summer Bank Holiday", ["Bank"], false);

    addHoliday(`${year}-11-05`, "Guy Fawkes Night", "Bonfire Night", ["Observance"]);
    addHoliday(`${year}-11-11`, "Remembrance Sunday", "Remembrance Sunday", ["Observance"], false);
  } 
  else if (cc === "US") {
    // US Public Holidays
    const mlk = getNthWeekdayOfMonth(year, 0, 1, 3); // 3rd Monday in Jan
    addHoliday(formatDate(mlk), "Martin Luther King Jr. Day", "Martin Luther King Jr. Day", ["Public"], false);

    const presidentsDay = getNthWeekdayOfMonth(year, 1, 1, 3); // 3rd Monday in Feb
    addHoliday(formatDate(presidentsDay), "Washington's Birthday", "Presidents' Day", ["Public"], false);

    const memorialDay = getLastWeekdayOfMonth(year, 4, 1); // Last Monday in May
    addHoliday(formatDate(memorialDay), "Memorial Day", "Memorial Day", ["Public"], false);

    addHoliday(`${year}-06-19`, "Juneteenth", "Juneteenth National Independence Day", ["Public"]);
    addHoliday(`${year}-07-04`, "Independence Day", "4th of July", ["Public"]);

    const laborDay = getNthWeekdayOfMonth(year, 8, 1, 1); // 1st Monday in Sept
    addHoliday(formatDate(laborDay), "Labor Day", "Labor Day", ["Public"], false);

    const columbusDay = getNthWeekdayOfMonth(year, 9, 1, 2); // 2nd Monday in Oct
    addHoliday(formatDate(columbusDay), "Columbus Day", "Columbus Day", ["Public", "Optional"], false);

    addHoliday(`${year}-11-11`, "Veterans Day", "Veterans Day", ["Public"]);

    const thanksgiving = getNthWeekdayOfMonth(year, 10, 4, 4); // 4th Thursday in Nov
    addHoliday(formatDate(thanksgiving), "Thanksgiving", "Thanksgiving", ["Public"], false);
  } 
  else {
    // Generic generator for other countries to avoid empty states
    addHoliday(`${year}-05-01`, "Labour Day", "Labour Day", ["Public"]);
    addHoliday(formatDate(goodFriday), "Good Friday", "Good Friday", ["Public"], false);
    addHoliday(formatDate(easterMonday), "Easter Monday", "Easter Monday", ["Public"], false);
    addHoliday(`${year}-07-14`, "National Day", "National Day", ["Public"]);
    addHoliday(`${year}-11-01`, "All Saints' Day", "All Saints' Day", ["Public", "Observance"]);
    addHoliday(`${year}-12-24`, "Christmas Eve", "Christmas Eve", ["Optional"]);
    addHoliday(`${year}-12-31`, "New Year's Eve", "New Year's Eve", ["Optional"]);
  }

  // Sort holidays by date
  return holidays.sort((a, b) => a.date.localeCompare(b.date));
}

function extractHolidaysList(data: any): any[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    if (Array.isArray(data.holidays)) return data.holidays;
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data.results)) return data.results;
    if (Array.isArray(data.items)) return data.items;
    
    // Look for any array property inside the object
    for (const key of Object.keys(data)) {
      if (Array.isArray(data[key])) {
        return data[key];
      }
    }
  }
  return [];
}

/**
 * Robust holiday fetcher that can make requests to Express server
 * OR gracefully fallback to client-side data operations if hosted dynamically/statically on Netlify.
 */
export async function getHolidays(countryCode: string, year: number, apiKey: string): Promise<{ holidays: Holiday[]; isMock: boolean; fallbackReason?: string; errorTrace?: string }> {
  const normCC = countryCode.trim().toUpperCase();
  
  try {
    // First attempt to invoke the back-end proxy
    const response = await fetch(`/api/holidays?country_code=${normCC}&year=${year}&token=${encodeURIComponent(apiKey)}`);
    
    // Check if response is HTML (often a 404/fallback served by static hosts like Netlify)
    const contentType = response.headers.get("content-type");
    if (!response.ok || (contentType && contentType.includes("text/html"))) {
      throw new Error(`Invalid response or static server fallback. Status: ${response.status}`);
    }

    const data = await response.json();
    return {
      holidays: data ? extractHolidaysList(data.holidays) : [],
      isMock: !!data?.isMock,
      fallbackReason: data?.fallbackReason,
      errorTrace: data?.errorTrace
    };
  } catch (error) {
    console.warn("[HOLIDAY SERVICE FALLBACK] Route /api/holidays not responding or static fallback triggered. Running in client mode.", error);
    
    // If browser-side is requested with a real key, we can try to query the Live gateway directly!
    if (apiKey && apiKey.trim() !== "") {
      try {
        const queryDate = `${year}-01-01`;
        const directUrl = `https://bs-sta-gateway.ext-abc.com/svc/holiday/api/v1/year?country_code=${normCC.toLowerCase()}&date=${queryDate}`;
        const gatewayRes = await fetch(directUrl, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Accept": "application/json"
          }
        });

        if (gatewayRes.ok) {
          const directData = await gatewayRes.json();
          let isActuallyError = false;
          let errorMsgStr = "";

          if (directData && typeof directData === "object" && (directData.message === "Server Error" || directData.error || (typeof directData.message === "string" && directData.message.includes("Error")))) {
            isActuallyError = true;
            errorMsgStr = directData.message || directData.error || "Internal direct exception";
          }

          const parsedList = isActuallyError ? [] : extractHolidaysList(directData);
          if (parsedList.length > 0) {
            return {
              holidays: parsedList,
              isMock: false
            };
          } else {
            console.warn(`[DIRECT GATEWAY WARNING] Direct fetch returned empty list or error structure: ${errorMsgStr || "No lists"}. Swapping to client mock.`);
            return {
              holidays: generateMockHolidays(countryCode, year),
              isMock: true,
              errorTrace: errorMsgStr || "No lists from direct gateway",
              fallbackReason: errorMsgStr 
                ? `Direct Gateway returned trace: "${errorMsgStr}". Activated client mock dataset.`
                : "Direct Gateway succeeded but returned 0 records. Activated client mock dataset."
            };
          }
        } else {
          console.warn(`[DIRECT GATEWAY FALLBACK FAILED] Status: ${gatewayRes.status}. Reverting to high-fidelity client mock.`);
          return {
            holidays: generateMockHolidays(countryCode, year),
            isMock: true,
            fallbackReason: `Direct gateway connection returned status ${gatewayRes.status}. Loaded local system.`
          };
        }
      } catch (directErr) {
        console.warn("[DIRECT GATEWAY BLOCKED BY CORS] Running high-fidelity local simulation.", directErr);
        return {
          holidays: generateMockHolidays(countryCode, year),
          isMock: true,
          fallbackReason: `Connection to live gateway was blocked by CORS or network timeout. Loaded local system.`
        };
      }
    }

    // Run client mock generator
    return {
      holidays: generateMockHolidays(countryCode, year),
      isMock: true
    };
  }
}

/**
 * Robust date inspector that can query server or fallback to client evaluation
 */
export async function checkHolidayDate(countryCode: string, dateStr: string, apiKey: string): Promise<{ holiday: Holiday | null; isMock: boolean; fallbackReason?: string }> {
  const normCC = countryCode.trim().toUpperCase();

  try {
    const response = await fetch(`/api/check-date?country_code=${normCC}&date=${dateStr}&token=${encodeURIComponent(apiKey)}`);
    
    const contentType = response.headers.get("content-type");
    if (!response.ok || (contentType && contentType.includes("text/html"))) {
      throw new Error(`Invalid response or static server fallback. Status: ${response.status}`);
    }

    const data = await response.json();
    return {
      holiday: data.holiday,
      isMock: !!data.isMock,
      fallbackReason: data.fallbackReason
    };
  } catch (error) {
    console.warn("[HOLIDAY SERVICE FALLBACK] Route /api/check-date not responding. Running client calculation.", error);
    
    if (apiKey && apiKey.trim() !== "") {
      try {
        const directUrl = `https://bs-sta-gateway.ext-abc.com/svc/holiday/api/v1/date?country_code=${normCC.toLowerCase()}&date=${dateStr}`;
        const gatewayRes = await fetch(directUrl, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Accept": "application/json"
          }
        });

        if (gatewayRes.ok) {
          const directVal = await gatewayRes.json();
          let isActuallyError = false;
          let errorMsgStr = "";

          if (directVal && typeof directVal === "object" && (directVal.message === "Server Error" || directVal.error || (typeof directVal.message === "string" && directVal.message.includes("Error")))) {
            isActuallyError = true;
            errorMsgStr = directVal.message || directVal.error || "Internal check error";
          }

          if (isActuallyError) {
            console.warn(`[DIRECT CHECK WARNING] Direct check returned error: ${errorMsgStr}. Falling back to mock matching.`);
            const parsedDate = new Date(dateStr);
            const selectedYear = parsedDate.getUTCFullYear();
            const clientList = generateMockHolidays(countryCode, selectedYear);
            const matched = clientList.find(h => h.date === dateStr);
            return {
              holiday: matched || null,
              isMock: true,
              fallbackReason: `Direct check error message: "${errorMsgStr}"`
            };
          }

          return {
            holiday: directVal, // could be null
            isMock: false
          };
        }
      } catch (directErr) {
        console.warn("[DIRECT GATEWAY BLOCKED BY CORS] Reading client-side dataset.", directErr);
      }
    }

    // fallback matching
    const parsedDate = new Date(dateStr);
    const selectedYear = parsedDate.getUTCFullYear();
    const clientList = generateMockHolidays(countryCode, selectedYear);
    const matched = clientList.find(h => h.date === dateStr);

    return {
      holiday: matched || null,
      isMock: true,
      fallbackReason: "Direct connection blocked/failed. Loaded client calculations."
    };
  }
}
