import { Holiday } from "../types";

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
 * OR gracefully query the live API gateway directly from the browser (e.g. if running statically on Netlify).
 */
export async function getHolidays(
  countryCode: string, 
  year: number, 
  apiKey: string, 
  apiEndpoint: string
): Promise<{ holidays: Holiday[]; isMock: boolean; fallbackReason?: string; errorTrace?: string }> {
  const normCC = countryCode.trim().toUpperCase();
  const cleanEndpoint = (apiEndpoint || "https://bs-sta-gateway.ext-abc.com").trim().replace(/\/$/, "");

  try {
    // First attempt to invoke the back-end proxy
    const response = await fetch(
      `/api/holidays?country_code=${normCC}&year=${year}&token=${encodeURIComponent(apiKey || "")}&endpoint=${encodeURIComponent(cleanEndpoint)}`
    );
    
    const contentType = response.headers.get("content-type");
    if (!response.ok || (contentType && contentType.includes("text/html"))) {
      if (response.status === 404 || (contentType && contentType.includes("text/html"))) {
        // Fallback to direct fetch in client mode if /api/holidays returned 404/HTML (e.g. static Netlify site)
        throw new Error("STATIC_FALLBACK_TRIGGER");
      }
      
      const errData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
      throw new Error(errData.error || `HTTP error ${response.status}`);
    }

    const data = await response.json();
    return {
      holidays: data ? extractHolidaysList(data.holidays) : [],
      isMock: false
    };
  } catch (error: any) {
    if (error.message !== "STATIC_FALLBACK_TRIGGER") {
      throw error;
    }

    console.warn("[HOLIDAY SERVICE FALLBACK] Route /api/holidays not responding or static 404. Attempting direct browser connection.", error);
    
    // Query the Live gateway directly from browser
    try {
      const queryDate = `${year}-01-01`;
      const directUrl = `${cleanEndpoint}/svc/holiday/api/v1/year?country_code=${normCC.toLowerCase()}&date=${queryDate}`;
      const gatewayRes = await fetch(directUrl, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Accept": "application/json"
        }
      });

      const text = await gatewayRes.text();

      if (!gatewayRes.ok) {
        let parsedErr: any = null;
        try {
          parsedErr = JSON.parse(text);
        } catch (e) {}
        const msg = parsedErr?.message || parsedErr?.error || text || `HTTP ${gatewayRes.status}`;
        throw new Error(`Direct Gateway returned HTTP ${gatewayRes.status}: ${msg}`);
      }

      const directData = JSON.parse(text);
      let isActuallyError = false;
      let errorMsgStr = "";

      if (directData && typeof directData === "object") {
        if (directData.message === "Server Error" || directData.error || (typeof directData.message === "string" && directData.message.includes("Error"))) {
          isActuallyError = true;
          errorMsgStr = directData.message || directData.error || "Internal response exception";
        }
      }

      if (isActuallyError) {
        throw new Error(`Direct Gateway returned exceptional payload: ${errorMsgStr}`);
      }

      return {
        holidays: extractHolidaysList(directData),
        isMock: false
      };
    } catch (directErr: any) {
      console.error("[DIRECT GATEWAY BLOCKED OR FAILED]", directErr);
      throw new Error(
        directErr.message || "Failed to connect to Global Holiday API (Possible CORS or network timeout)."
      );
    }
  }
}

/**
 * Robust date auditor that can query server or fallback to client evaluation
 */
export async function checkHolidayDate(
  countryCode: string, 
  dateStr: string, 
  apiKey: string, 
  apiEndpoint: string
): Promise<{ holiday: Holiday | null; isMock: boolean; fallbackReason?: string }> {
  const normCC = countryCode.trim().toUpperCase();
  const cleanEndpoint = (apiEndpoint || "https://bs-sta-gateway.ext-abc.com").trim().replace(/\/$/, "");

  try {
    const response = await fetch(
      `/api/check-date?country_code=${normCC}&date=${dateStr}&token=${encodeURIComponent(apiKey || "")}&endpoint=${encodeURIComponent(cleanEndpoint)}`
    );
    
    const contentType = response.headers.get("content-type");
    if (!response.ok || (contentType && contentType.includes("text/html"))) {
      if (response.status === 404 || (contentType && contentType.includes("text/html"))) {
        throw new Error("STATIC_FALLBACK_TRIGGER");
      }
      const errData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
      throw new Error(errData.error || `HTTP error ${response.status}`);
    }

    const data = await response.json();
    return {
      holiday: data.holiday,
      isMock: false
    };
  } catch (error: any) {
    if (error.message !== "STATIC_FALLBACK_TRIGGER") {
      throw error;
    }

    console.warn("[HOLIDAY SERVICE FALLBACK] Route /api/check-date not responding. Attempting direct browser connection.", error);
    
    try {
      const directUrl = `${cleanEndpoint}/svc/holiday/api/v1/date?country_code=${normCC.toLowerCase()}&date=${dateStr}`;
      const gatewayRes = await fetch(directUrl, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Accept": "application/json"
        }
      });

      const text = await gatewayRes.text();

      if (!gatewayRes.ok) {
        let parsedErr: any = null;
        try {
          parsedErr = JSON.parse(text);
        } catch (e) {}
        const msg = parsedErr?.message || parsedErr?.error || text || `HTTP ${gatewayRes.status}`;
        throw new Error(`Direct Gateway returned HTTP ${gatewayRes.status}: ${msg}`);
      }

      const directVal = JSON.parse(text);
      let isActuallyError = false;
      let errorMsgStr = "";

      if (directVal && typeof directVal === "object") {
        if (directVal.message === "Server Error" || directVal.error || (typeof directVal.message === "string" && directVal.message.includes("Error"))) {
          isActuallyError = true;
          errorMsgStr = directVal.message || directVal.error || "Internal check error";
        }
      }

      if (isActuallyError) {
        throw new Error(`Direct Gateway returned exceptional payload: ${errorMsgStr}`);
      }

      return {
        holiday: directVal,
        isMock: false
      };
    } catch (directErr: any) {
      console.error("[DIRECT GATEWAY CHECK BLOCKED OR FAILED]", directErr);
      throw new Error(
        directErr.message || "Failed to check date on Global Holiday API (Possible CORS or network timeout)."
      );
    }
  }
}
