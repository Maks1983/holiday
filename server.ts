import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Meeus/Jones/Butcher algorithm to find Easter Sunday
function getEasterSunday(year: number): Date {
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

function getNthWeekdayOfMonth(year: number, month: number, weekday: number, n: number): Date {
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

function getLastWeekdayOfMonth(year: number, month: number, weekday: number): Date {
  let date = new Date(Date.UTC(year, month + 1, 0)); // last day of month
  while (date.getUTCDay() !== weekday) {
    date.setUTCDate(date.getUTCDate() - 1);
  }
  return date;
}

function getSwedenMidsummerEve(year: number): Date {
  for (let day = 19; day <= 25; day++) {
    let date = new Date(Date.UTC(year, 5, day)); // June is month 5
    if (date.getUTCDay() === 5) { // 5 is Friday
      return date;
    }
  }
  return new Date(Date.UTC(year, 5, 23)); // fallback
}

function formatDate(date: Date): string {
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${date.getUTCFullYear()}-${month}-${day}`;
}

// Generate premium mock data for demonstration
function generateMockHolidays(countryCode: string, year: number) {
  const cc = countryCode.toUpperCase();
  const holidays: any[] = [];

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

// REST route to query holidays
app.get("/api/holidays", async (req, res) => {
  const { country_code, year, token } = req.query as { country_code?: string; year?: string; token?: string };

  if (!country_code) {
    return res.status(400).json({ error: "country_code parameter is required" });
  }

  const normalizedCC = country_code.toLowerCase();
  const selectedYear = parseInt(year || String(new Date().getUTCFullYear()), 10);
  
  // Decide if we should do real fetch or mock fetch
  // Real fetch if a token is provided in request OR if there is an env key
  const activeToken = token || process.env.HOLIDAY_API_KEY;

  if (activeToken && activeToken.trim() !== "" && activeToken !== "MY_GEMINI_API_KEY") {
    try {
      // Create request to ABCyber Holiday API
      // Since it's Lookup by Year, the endpoint takes "country_code" and "date" to get the year
      const queryDate = `${selectedYear}-01-01`;
      const url = `https://bs-sta-gateway.ext-abc.com/svc/holiday/api/v1/year?country_code=${normalizedCC}&date=${queryDate}`;

      console.log(`[PROXY] Fetching real holidays from: ${url}`);
      
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${activeToken}`,
          "Accept": "application/json"
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[PROXY ERROR] API returned status ${response.status}: ${errorText}`);
        return res.status(response.status).json({ 
          error: `API returned error status ${response.status}`,
          details: errorText,
          isMock: false
        });
      }

      const data = await response.json();
      return res.json({
        holidays: data,
        isMock: false
      });
    } catch (e: any) {
      console.error(`[PROXY EXCEPTION]`, e);
      return res.status(502).json({
        error: "Failed to connect to the external Holiday API",
        details: e.message || String(e),
        isMock: false
      });
    }
  } else {
    // Return high-fidelity mock data
    console.log(`[MOCK] Returning mock data for ${normalizedCC} / ${selectedYear}`);
    const mockHolidays = generateMockHolidays(normalizedCC.toUpperCase(), selectedYear);
    return res.json({
      holidays: mockHolidays,
      isMock: true
    });
  }
});

// REST route to check a specific date (Lookup by Date)
app.get("/api/check-date", async (req, res) => {
  const { country_code, date, token } = req.query as { country_code?: string; date?: string; token?: string };

  if (!country_code || !date) {
    return res.status(400).json({ error: "country_code and date parameters are required" });
  }

  const normalizedCC = country_code.toLowerCase();
  const activeToken = token || process.env.HOLIDAY_API_KEY;

  if (activeToken && activeToken.trim() !== "" && activeToken !== "MY_GEMINI_API_KEY") {
    try {
      const url = `https://bs-sta-gateway.ext-abc.com/svc/holiday/api/v1/date?country_code=${normalizedCC}&date=${date}`;

      console.log(`[PROXY] Checking date from: ${url}`);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${activeToken}`,
          "Accept": "application/json"
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        return res.status(response.status).json({ 
          error: `API returned error status ${response.status}`,
          details: errorText,
          isMock: false
        });
      }

      const data = await response.json();
      // The API returns the Holiday Object if valid, or null inside data/body if it's not a holiday
      // Note the endpoint says: "The endpoint will return null inside the data object if the date is not a public holiday"
      return res.json({
        holiday: data, // Could be null
        isMock: false
      });
    } catch (e: any) {
      return res.status(502).json({
        error: "Failed to connect to the external Holiday API",
        details: e.message || String(e),
        isMock: false
      });
    }
  } else {
    // Match against mock data
    const parsedDate = new Date(date);
    const selectedYear = parsedDate.getUTCFullYear();
    const mockList = generateMockHolidays(normalizedCC.toUpperCase(), selectedYear);
    
    const matched = mockList.find(h => h.date === date);
    return res.json({
      holiday: matched || null,
      isMock: true
    });
  }
});

// Serve frontend assets
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // SPA fallback route
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SERVER] International Holiday Dashboard running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
