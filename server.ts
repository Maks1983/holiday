import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Flat-file JSON Database Implementation
interface DatabaseSchema {
  holidayCache: {
    [key: string]: {
      countryCode: string;
      year: number;
      holidays: any[];
      cachedAt: string;
    };
  };
  dateCheckCache: {
    [key: string]: {
      countryCode: string;
      date: string;
      holiday: any | null;
      cachedAt: string;
    };
  };
  auditLogs: Array<{
    id: string;
    timestamp: string;
    endpoint: string;
    queryType: string;
    countryCode: string;
    paramValue: string;
    status: number;
    error?: string;
    servedFromCache?: boolean;
  }>;
}

const DB_PATH = path.join(process.cwd(), "db.json");

function getInitialDb(): DatabaseSchema {
  return {
    holidayCache: {},
    dateCheckCache: {},
    auditLogs: []
  };
}

function readDb(): DatabaseSchema {
  try {
    if (!fs.existsSync(DB_PATH)) {
      const initial = getInitialDb();
      fs.writeFileSync(DB_PATH, JSON.stringify(initial, null, 2), "utf-8");
      return initial;
    }
    const data = fs.readFileSync(DB_PATH, "utf-8");
    const parsed = JSON.parse(data);
    if (!parsed.holidayCache) parsed.holidayCache = {};
    if (!parsed.dateCheckCache) parsed.dateCheckCache = {};
    if (!parsed.auditLogs) parsed.auditLogs = [];
    return parsed as DatabaseSchema;
  } catch (err) {
    console.error("[DATABASE] Error reading db.json, returning default initial state", err);
    return getInitialDb();
  }
}

function writeDb(data: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("[DATABASE] Error writing db.json", err);
  }
}

function addAuditLog(entry: Omit<DatabaseSchema["auditLogs"][0], "id" | "timestamp">) {
  try {
    const db = readDb();
    const newLog = {
      id: Math.random().toString(36).substring(2, 11),
      timestamp: new Date().toISOString(),
      ...entry
    };
    db.auditLogs.unshift(newLog);
    if (db.auditLogs.length > 100) {
      db.auditLogs = db.auditLogs.slice(0, 100); // capped at 100 entries for efficiency
    }
    writeDb(db);
  } catch (err) {
    console.error("[DATABASE] Exception logging transaction", err);
  }
}

// REST route to save configuration (Deprecated server-side - now stored exclusively in the browser)
app.post("/api/config", (req, res) => {
  return res.json({ success: true, warning: "Stored in browser localStorage only for privacy." });
});

// REST route to read configuration
app.get("/api/config", (req, res) => {
  return res.json({});
});

// REST route to fetch audit transaction logs
app.get("/api/audit-logs", (req, res) => {
  const db = readDb();
  return res.json(db.auditLogs);
});

// REST route to clear audit transaction logs
app.delete("/api/audit-logs", (req, res) => {
  const db = readDb();
  db.auditLogs = [];
  writeDb(db);
  return res.json({ success: true });
});

// REST route to query holidays
app.get("/api/holidays", async (req, res) => {
  const { country_code, year, token, endpoint } = req.query as { country_code?: string; year?: string; token?: string; endpoint?: string };

  if (!country_code) {
    addAuditLog({
      endpoint: endpoint || "UNKNOWN",
      queryType: "YEAR",
      countryCode: "UNKNOWN",
      paramValue: year || "UNKNOWN",
      status: 400,
      error: "country_code parameter is required"
    });
    return res.status(400).json({ error: "country_code parameter is required" });
  }

  // Enterprise API lookup systems require standard ISO-3166-1 alpha-2 country codes
  const normalizedCC = country_code.trim().toUpperCase();
  const selectedYear = parseInt(year || String(new Date().getUTCFullYear()), 10);
  const cacheKey = `${normalizedCC}-${selectedYear}`;

  // Read DB to check for cached holidays
  const db = readDb();
  if (db.holidayCache && db.holidayCache[cacheKey]) {
    console.log(`[CACHE HIT] Serving holidays for ${cacheKey} from Server DB`);
    addAuditLog({
      endpoint: "SERVER_DB_CACHE",
      queryType: "YEAR",
      countryCode: normalizedCC,
      paramValue: String(selectedYear),
      status: 200,
      servedFromCache: true
    });
    return res.json({
      holidays: db.holidayCache[cacheKey].holidays,
      isMock: false,
      servedFromCache: true
    });
  }

  // NO CACHE FOUND - Needs Authorization tokens from request
  const activeToken = token || process.env.HOLIDAY_API_KEY;
  let baseEndpoint = (endpoint || process.env.HOLIDAY_API_ENDPOINT || "https://bs-sta-gateway.ext-abc.com").trim();
  if (baseEndpoint.endsWith("/")) {
    baseEndpoint = baseEndpoint.slice(0, -1);
  }

  if (!activeToken || activeToken.trim() === "" || activeToken === "MY_GEMINI_API_KEY") {
    addAuditLog({
      endpoint: baseEndpoint,
      queryType: "YEAR",
      countryCode: normalizedCC,
      paramValue: String(selectedYear),
      status: 401,
      error: "Access Token is missing"
    });
    return res.status(401).json({ error: "Access Token is missing. Please configure your Holiday API access token in settings to fetch live red days." });
  }

  try {
    const queryDate = `${selectedYear}-01-01`;
    const url = `${baseEndpoint}/svc/holiday/api/v1/year?country_code=${normalizedCC.toLowerCase()}&date=${queryDate}`;

    console.log(`[PROXY] Fetching real holidays from: ${url}`);
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${activeToken}`,
        "Accept": "application/json"
      }
    });

    const responseText = await response.text();

    if (!response.ok) {
      console.warn(`[PROXY WARNING] Gateway returned HTTP ${response.status}: ${responseText}`);
      let parsedErr: any = null;
      try {
        parsedErr = JSON.parse(responseText);
      } catch (err) {}
      
      const errorMsg = parsedErr?.message || parsedErr?.error || responseText || `HTTP error ${response.status}`;
      addAuditLog({
        endpoint: baseEndpoint,
        queryType: "YEAR",
        countryCode: normalizedCC,
        paramValue: String(selectedYear),
        status: response.status,
        error: errorMsg
      });
      return res.status(response.status).json({ error: errorMsg });
    }

    let data: any;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      addAuditLog({
        endpoint: baseEndpoint,
        queryType: "YEAR",
        countryCode: normalizedCC,
        paramValue: String(selectedYear),
        status: 502,
        error: "Invalid JSON response"
      });
      return res.status(502).json({ error: "Invalid JSON response returned from upstream." });
    }
    
    let extractedHolidays: any[] = [];
    let isActuallyError = false;
    let errorMsgStr = "";

    if (data && typeof data === "object") {
      if (data.message === "Server Error" || data.error || (typeof data.message === "string" && data.message.includes("Error"))) {
        isActuallyError = true;
        errorMsgStr = data.message || data.error || "Internal response exception";
      }
    }

    if (isActuallyError) {
      console.warn(`[PROXY WARNING] Gateway returned error structure: ${errorMsgStr}`);
      addAuditLog({
        endpoint: baseEndpoint,
        queryType: "YEAR",
        countryCode: normalizedCC,
        paramValue: String(selectedYear),
        status: 422,
        error: errorMsgStr
      });
      return res.status(422).json({ error: errorMsgStr });
    }

    if (Array.isArray(data)) {
      extractedHolidays = data;
    } else if (data && typeof data === "object") {
      if (Array.isArray(data.holidays)) {
        extractedHolidays = data.holidays;
      } else if (Array.isArray(data.data)) {
        extractedHolidays = data.data;
      } else if (Array.isArray(data.results)) {
        extractedHolidays = data.results;
      } else {
        for (const key of Object.keys(data)) {
          if (Array.isArray(data[key])) {
            extractedHolidays = data[key];
            break;
          }
        }
      }
    }

    // Success! Store results in files database cache to prevent API spamming
    try {
      const writeDbInstance = readDb();
      writeDbInstance.holidayCache[cacheKey] = {
        countryCode: normalizedCC,
        year: selectedYear,
        holidays: extractedHolidays,
        cachedAt: new Date().toISOString()
      };
      writeDb(writeDbInstance);
      console.log(`[CACHE STORE] Holiday list for ${cacheKey} saved to Server DB`);
    } catch (cacheErr) {
      console.error("[CACHE ERROR] Failed to write holidayCache", cacheErr);
    }

    addAuditLog({
      endpoint: baseEndpoint,
      queryType: "YEAR",
      countryCode: normalizedCC,
      paramValue: String(selectedYear),
      status: 200,
      servedFromCache: false
    });

    return res.json({
      holidays: extractedHolidays,
      isMock: false,
      servedFromCache: false
    });
  } catch (e: any) {
    console.warn(`[PROXY EXCEPTION]`, e);
    addAuditLog({
      endpoint: baseEndpoint,
      queryType: "YEAR",
      countryCode: normalizedCC,
      paramValue: String(selectedYear),
      status: 500,
      error: e.message || String(e)
    });
    return res.status(500).json({ error: e.message || String(e) });
  }
});

// REST route to check a specific date (Lookup by Date)
app.get("/api/check-date", async (req, res) => {
  const { country_code, date, token, endpoint } = req.query as { country_code?: string; date?: string; token?: string; endpoint?: string };

  if (!country_code || !date) {
    addAuditLog({
      endpoint: endpoint || "UNKNOWN",
      queryType: "DATE",
      countryCode: country_code || "UNKNOWN",
      paramValue: date || "UNKNOWN",
      status: 400,
      error: "country_code and date parameters are required"
    });
    return res.status(400).json({ error: "country_code and date parameters are required" });
  }

  const normalizedCC = country_code.trim().toUpperCase();
  const cacheKey = `${normalizedCC}-${date}`;

  // Read DB to check for cached dates
  const db = readDb();
  if (db.dateCheckCache && db.dateCheckCache[cacheKey]) {
    console.log(`[CACHE HIT] Serving date check for ${cacheKey} from Server DB`);
    addAuditLog({
      endpoint: "SERVER_DB_CACHE",
      queryType: "DATE",
      countryCode: normalizedCC,
      paramValue: date,
      status: 200,
      servedFromCache: true
    });
    return res.json({
      holiday: db.dateCheckCache[cacheKey].holiday,
      isMock: false,
      servedFromCache: true
    });
  }

  // NO CACHE FOUND - Require activeToken and endpoint
  const activeToken = token || process.env.HOLIDAY_API_KEY;
  let baseEndpoint = (endpoint || process.env.HOLIDAY_API_ENDPOINT || "https://bs-sta-gateway.ext-abc.com").trim();
  if (baseEndpoint.endsWith("/")) {
    baseEndpoint = baseEndpoint.slice(0, -1);
  }

  if (!activeToken || activeToken.trim() === "" || activeToken === "MY_GEMINI_API_KEY") {
    addAuditLog({
      endpoint: baseEndpoint,
      queryType: "DATE",
      countryCode: normalizedCC,
      paramValue: date,
      status: 401,
      error: "Access Token is missing"
    });
    return res.status(401).json({ error: "Access Token is missing. Please configure your Holiday API access token in settings to audit live dates." });
  }

  try {
    const url = `${baseEndpoint}/svc/holiday/api/v1/date?country_code=${normalizedCC.toLowerCase()}&date=${date}`;

    console.log(`[PROXY] Checking date from: ${url}`);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${activeToken}`,
        "Accept": "application/json"
      }
    });

    const responseText = await response.text();

    if (!response.ok) {
      console.warn(`[PROXY CHECK WARNING] HTTP status ${response.status}: ${responseText}`);
      let parsedErr: any = null;
      try {
        parsedErr = JSON.parse(responseText);
      } catch (err) {}
      
      const errorMsg = parsedErr?.message || parsedErr?.error || responseText || `HTTP error ${response.status}`;
      addAuditLog({
        endpoint: baseEndpoint,
        queryType: "DATE",
        countryCode: normalizedCC,
        paramValue: date,
        status: response.status,
        error: errorMsg
      });
      return res.status(response.status).json({ error: errorMsg });
    }

    let data: any;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      addAuditLog({
        endpoint: baseEndpoint,
        queryType: "DATE",
        countryCode: normalizedCC,
        paramValue: date,
        status: 502,
        error: "Invalid JSON response"
      });
      return res.status(502).json({ error: "Invalid JSON response returned from upstream." });
    }
    
    let isActuallyError = false;
    let errorMsgStr = "";
    if (data && typeof data === "object") {
      if (data.message === "Server Error" || data.error || (typeof data.message === "string" && data.message.includes("Error"))) {
        isActuallyError = true;
        errorMsgStr = data.message || data.error || "Response contains server error";
      }
    }

    if (isActuallyError) {
      console.warn(`[PROXY CHECK WARNING] Inner gateway message error: ${errorMsgStr}`);
      addAuditLog({
        endpoint: baseEndpoint,
        queryType: "DATE",
        countryCode: normalizedCC,
        paramValue: date,
        status: 422,
        error: errorMsgStr
      });
      return res.status(422).json({ error: errorMsgStr });
    }

    // Success! Store result in file database cache
    try {
      const writeDbInstance = readDb();
      writeDbInstance.dateCheckCache[cacheKey] = {
        countryCode: normalizedCC,
        date: date,
        holiday: data,
        cachedAt: new Date().toISOString()
      };
      writeDb(writeDbInstance);
      console.log(`[CACHE STORE] Date check for ${cacheKey} saved to Server DB`);
    } catch (cacheErr) {
      console.error("[CACHE ERROR] Failed to write dateCheckCache", cacheErr);
    }

    addAuditLog({
      endpoint: baseEndpoint,
      queryType: "DATE",
      countryCode: normalizedCC,
      paramValue: date,
      status: 200,
      servedFromCache: false
    });

    return res.json({
      holiday: data,
      isMock: false,
      servedFromCache: false
    });
  } catch (e: any) {
    console.warn(`[PROXY CHECK EXCEPTION] ${e.message}`);
    addAuditLog({
      endpoint: baseEndpoint,
      queryType: "DATE",
      countryCode: normalizedCC,
      paramValue: date,
      status: 500,
      error: e.message || String(e)
    });
    return res.status(500).json({ error: e.message || String(e) });
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
