/// <reference types="@cloudflare/workers-types" />

export interface Env {
  ASSETS: Fetcher;
}

export interface Extension {
  id: string;
  title: string;
  price: string | number;
  description?: string;
  icon?: string;
  downloads?: number;
  rating?: number;
  filters?: string[];
  tags?: string[];
  subtitle?: string;
  version?: string;
  lastUpdated?: string;
  url?: string;
  doc?: string;
  author?: string;
  [key: string]: unknown;
}

export interface ExtensionsData {
  extensions: Extension[];
  lastUpdated?: string;
  version?: string;
}

const FALLBACK_EXTENSIONS: Extension[] = [
  {
    id: "number_checker",
    title: "Number Checker",
    subtitle: "Check if a number is prime, even, or odd",
    description: "A powerful extension that helps you check various properties of numbers. Features include prime number checking, even/odd detection, and more mathematical utilities.",
    price: "Free",
    filters: ["all", "free"],
    tags: ["free", "math", "number", "checker", "utility", "prime", "even", "odd"],
    version: "2.0",
    lastUpdated: "2024-03-15",
    url: "https://community.kodular.io/uploads/short-url/gyQ2Kh0OmG6zbybK5VbXzDnvF8c.aix",
    doc: "number_checker.md",
  },
  {
    id: "device_year",
    title: "Device Year",
    subtitle: "Estimate the performance year of an Android device",
    description: "A simple extension that analyzes an Android device's specifications and estimates the year in which the device would be considered high-end. Useful for performance benchmarking and device classification.",
    price: "Free",
    filters: ["all", "free"],
    tags: ["free", "device", "android", "utility", "performance", "year", "analysis", "hardware"],
    version: "0.2",
    lastUpdated: "2022-04-10",
    url: "https://community.kodular.io/uploads/short-url/8v0RM7FPns68mmVb6mROSpnK4up.aix",
    doc: "device_year.md",
  },
  {
    id: "similarity",
    title: "Similarity",
    subtitle: "Calculate similarity score between two strings",
    description: "An extension component for calculating similarity scores between two strings. A score of 0.0 means completely different strings, while 1.0 means identical strings. Supports multiple algorithms for flexible comparison.",
    price: "Free",
    filters: ["all", "free"],
    tags: ["free", "string", "similarity", "text", "algorithm", "utility", "comparison", "analysis"],
    version: "0.1",
    lastUpdated: "2022-01-01",
    url: "https://community.kodular.io/uploads/short-url/v5Q34TK6nbVtUlEFyNSp1RFTObx.aix",
    doc: "similarity.md",
  },
  {
    id: "morse_code",
    title: "Morse Code",
    subtitle: "Encode and decode Morse code",
    description: "A simple extension that allows you to encode text into Morse code and decode Morse code back into readable text. Useful for learning, communication, and fun experiments.",
    price: "Free",
    filters: ["all", "free"],
    tags: ["free", "morse", "code", "encode", "decode", "text", "utility", "communication"],
    version: "1.0",
    lastUpdated: "2022-06-11",
    url: "https://community.kodular.io/uploads/short-url/7NMEXyLfFGUBaUIEM20x2IaiiSs.aix",
    doc: "morse_code.md",
  },
  {
    id: "ruler_picker",
    title: "Ruler Picker",
    subtitle: "Pick numbers using an interactive ruler UI",
    description: "An Android custom view extension that allows users to pick numbers from a given range using an interactive ruler interface. Highly customizable with multiple properties like indicator size, spacing, colors, and value range.",
    price: "Free",
    filters: ["all", "free"],
    tags: ["free", "ui", "picker", "ruler", "input", "design", "android", "component"],
    version: "2.0",
    lastUpdated: "2022-01-01",
    url: "https://community.kodular.io/uploads/short-url/yvVzsXfhrjQZr8gDsdq5VmN6B9B.aix",
    doc: "ruler_picker.md",
  },
  {
    id: "speech_recognition_view",
    title: "SpeechRecognitionView",
    subtitle: "View-style animation for speech recording",
    description: "An extension that enables voice input functionality using microphone recording. Requires internet for processing voice data. Useful for speech-based applications and voice recognition workflows.",
    price: "Free",
    filters: ["all", "free"],
    tags: ["free", "voice", "speech", "audio", "recording", "microphone", "ui", "animation", "input"],
    version: "1.0",
    lastUpdated: "2022-07-24",
    url: "https://drive.google.com/uc?id=19atykVGrdsx3tMObKNFbqzxNby62KZBq&export=download",
    doc: "speech_recognition_view.md",
  },
];

/** Shared response headers for JSON API responses */
const JSON_HEADERS: HeadersInit = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "X-Content-Type-Options": "nosniff",
};

/** Validate that an extension id only contains safe characters */
function isValidId(id: string): boolean {
  return /^[a-zA-Z0-9_-]+$/.test(id);
}

/** Validate that a field name only contains safe characters */
function isValidFieldName(name: string): boolean {
  return /^[a-zA-Z0-9_]+$/.test(name);
}

function isNavigationRequest(request: Request): boolean {
  const accept = request.headers.get("Accept") ?? "";
  return request.mode === "navigate" || accept.includes("text/html");
}

function assetRequest(url: URL, pathname: string): Request {
  return new Request(new URL(pathname, url.origin).toString());
}

async function loadExtensionsFromAssets(env: Env, url: URL): Promise<Extension[]> {
  const assetResponse = await env.ASSETS.fetch(assetRequest(url, "/scripts/extensions.json"));
  if (!assetResponse || assetResponse.status !== 200) return FALLBACK_EXTENSIONS;

  const contentType = assetResponse.headers.get("Content-Type") ?? "";
  if (contentType.includes("text/html")) return FALLBACK_EXTENSIONS;

  try {
    const data: ExtensionsData | Extension[] = await assetResponse.json();
    return Array.isArray(data) ? data : (Array.isArray(data.extensions) ? data.extensions : FALLBACK_EXTENSIONS);
  } catch {
    return FALLBACK_EXTENSIONS;
  }
}

export default {
  async fetch(request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
    try {
      const url = new URL(request.url);

      // Handle CORS preflight requests
      if (request.method === "OPTIONS") {
        return new Response(null, { status: 204, headers: JSON_HEADERS });
      }

      // Only allow GET for the API
      if (url.pathname.startsWith("/api/") && request.method !== "GET") {
        return new Response(
          JSON.stringify({ error: "Method not allowed" }),
          { status: 405, headers: JSON_HEADERS }
        );
      }

      // Only handle /api/extensions endpoints
      if (url.pathname.startsWith("/api/extensions")) {
        const extensions = await loadExtensionsFromAssets(env, url);
        // Parse ?data=id,title,price - validate each field name
        const dataParam = url.searchParams.get("data");
        const dataFields = (dataParam ?? "")
          .split(",")
          .map(f => f.trim())
          .filter(f => f.length > 0 && isValidFieldName(f));

        const pickFields = (obj: Extension): Partial<Extension> => {
          if (dataFields.length === 0) return obj;
          const result: Partial<Extension> = {};
          for (const key of dataFields) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
              result[key as keyof Extension] = obj[key as keyof Extension];
            }
          }
          return result;
        };

        // /api/extensions/:id
        const match = url.pathname.match(/^\/api\/extensions\/([^/]+)$/);
        if (match) {
          const rawId = match[1];

          // Validate the id to prevent path-traversal or injection
          if (!isValidId(rawId)) {
            return new Response(
              JSON.stringify({ error: "Invalid extension id" }),
              { status: 400, headers: JSON_HEADERS }
            );
          }

          const ext = extensions.find(e => e.id === rawId);
          if (!ext) {
            return new Response(
              JSON.stringify({ error: "Extension not found" }),
              { status: 404, headers: JSON_HEADERS }
            );
          }
          return new Response(
            JSON.stringify(pickFields(ext)),
            { status: 200, headers: JSON_HEADERS }
          );
        }

        // /api/extensions?filter=...
        const rawFilter = url.searchParams.get("filter");
        // Validate filter value to prevent unexpected behaviour
        const filter = rawFilter && /^[a-zA-Z0-9_-]+$/.test(rawFilter) ? rawFilter : "all";

        let result: Extension[] = extensions;
        if (filter !== "all") {
          result = extensions.filter(e => e.filters?.includes(filter) ?? false);
        }

        const responseData = dataFields.length > 0 ? result.map(pickFields) : result;

        return new Response(
          JSON.stringify(responseData),
          { status: 200, headers: JSON_HEADERS }
        );
      }

      const assetResponse = await env.ASSETS.fetch(request);
      if (assetResponse.status !== 404 || !isNavigationRequest(request)) {
        return assetResponse;
      }

      return env.ASSETS.fetch(new Request(new URL("/index.html", url).toString(), request));

    } catch (err: unknown) {
      // Log the real error server-side only - never expose internals to the client
      console.error("[worker] unhandled error:", err instanceof Error ? err.message : String(err));
      return new Response(
        JSON.stringify({ error: "Internal server error" }),
        { status: 500, headers: JSON_HEADERS }
      );
    }
  }
};
