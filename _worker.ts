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
  version?: string;
  author?: string;
  [key: string]: unknown;
}

export interface ExtensionsData {
  extensions: Extension[];
  lastUpdated?: string;
  version?: string;
}

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
        // Fetch all extensions from the static JSON (internal fetch — no user input in URL)
        const assetUrl = new URL("/extensions/extensions.json", url.origin).toString();
        const assetResponse = await env.ASSETS.fetch(new Request(assetUrl));

        if (!assetResponse || assetResponse.status !== 200) {
          return new Response(
            JSON.stringify({ error: "Resource not found" }),
            { status: 404, headers: JSON_HEADERS }
          );
        }

        const data: ExtensionsData = await assetResponse.json();
        const extensions: Extension[] = Array.isArray(data.extensions) ? data.extensions : [];

        // Parse ?data=id,title,price — validate each field name
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

      // Fallback to static assets
      return env.ASSETS.fetch(request);

    } catch (err: unknown) {
      // Log the real error server-side only — never expose internals to the client
      console.error("[worker] unhandled error:", err instanceof Error ? err.message : String(err));
      return new Response(
        JSON.stringify({ error: "Internal server error" }),
        { status: 500, headers: JSON_HEADERS }
      );
    }
  }
};
