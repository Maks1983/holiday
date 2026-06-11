import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// REST route to query holidays
app.get("/api/holidays", async (req, res) => {
  const { country_code, year, token, endpoint } = req.query as { country_code?: string; year?: string; token?: string; endpoint?: string };

  if (!country_code) {
    return res.status(400).json({ error: "country_code parameter is required" });
  }

  // Enterprise API lookup systems require standard ISO-3166-1 alpha-2 country codes
  const normalizedCC = country_code.trim().toUpperCase();
  const selectedYear = parseInt(year || String(new Date().getUTCFullYear()), 10);
  
  const activeToken = token || process.env.HOLIDAY_API_KEY;

  if (!activeToken || activeToken.trim() === "" || activeToken === "MY_GEMINI_API_KEY") {
    return res.status(401).json({ error: "Access Token is missing. Please configure your ABCyber access token in settings." });
  }

  try {
    const queryDate = `${selectedYear}-01-01`;
    let baseEndpoint = (endpoint || process.env.HOLIDAY_API_ENDPOINT || "https://bs-sta-gateway.ext-abc.com").trim();
    if (baseEndpoint.endsWith("/")) {
      baseEndpoint = baseEndpoint.slice(0, -1);
    }
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
      return res.status(response.status).json({ error: errorMsg });
    }

    let data: any;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
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

    return res.json({
      holidays: extractedHolidays,
      isMock: false
    });
  } catch (e: any) {
    console.warn(`[PROXY EXCEPTION]`, e);
    return res.status(500).json({ error: e.message || String(e) });
  }
});

// REST route to check a specific date (Lookup by Date)
app.get("/api/check-date", async (req, res) => {
  const { country_code, date, token, endpoint } = req.query as { country_code?: string; date?: string; token?: string; endpoint?: string };

  if (!country_code || !date) {
    return res.status(400).json({ error: "country_code and date parameters are required" });
  }

  const normalizedCC = country_code.trim().toUpperCase();
  const activeToken = token || process.env.HOLIDAY_API_KEY;

  if (!activeToken || activeToken.trim() === "" || activeToken === "MY_GEMINI_API_KEY") {
    return res.status(401).json({ error: "Access Token is missing. Please configure your ABCyber access token in settings." });
  }

  try {
    let baseEndpoint = (endpoint || process.env.HOLIDAY_API_ENDPOINT || "https://bs-sta-gateway.ext-abc.com").trim();
    if (baseEndpoint.endsWith("/")) {
      baseEndpoint = baseEndpoint.slice(0, -1);
    }
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
      return res.status(response.status).json({ error: errorMsg });
    }

    let data: any;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
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
      return res.status(422).json({ error: errorMsgStr });
    }

    return res.json({
      holiday: data,
      isMock: false
    });
  } catch (e: any) {
    console.warn(`[PROXY CHECK EXCEPTION] ${e.message}`);
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
