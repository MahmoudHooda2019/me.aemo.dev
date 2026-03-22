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

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    try {
      const url = new URL(request.url);

      // Only handle /api/extensions endpoints
      if (url.pathname.startsWith("/api/extensions")) {
        // Fetch all extensions from the static JSON
        const baseUrl = url.origin;
        const assetUrl = new URL("extensions/extensions.json", baseUrl + "/").toString();
        const assetResponse = await env.ASSETS.fetch(new Request(assetUrl, request));
        
        if (!assetResponse || assetResponse.status !== 200) {
          return new Response(
            JSON.stringify({ error: "extensions.json not found" }), 
            { 
              status: 404, 
              headers: { 
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
              } 
            }
          );
        }

        const data: ExtensionsData = await assetResponse.json();
        const extensions: Extension[] = data.extensions || [];

        // Parse ?data=id,title,price
        const dataParam = url.searchParams.get("data");
        const dataFields = dataParam?.split(",").map(f => f.trim()).filter(Boolean) ?? [];
        
        const pickFields = (obj: Extension): Partial<Extension> => {
          if (dataFields.length === 0) return obj;
          const result: Partial<Extension> = {};
          for (const key of dataFields) {
            if (key in obj) {
              result[key as keyof Extension] = obj[key as keyof Extension];
            }
          }
          return result;
        };

        // /api/extensions/:id
        const match = url.pathname.match(/^\/api\/extensions\/([^\/]+)$/);
        if (match) {
          const id = match[1];
          const ext = extensions.find(e => e.id === id);
          if (!ext) {
            return new Response(
              JSON.stringify({ error: "Extension not found" }), 
              { 
                status: 404, 
                headers: { 
                  "Content-Type": "application/json",
                  "Access-Control-Allow-Origin": "*"
                } 
              }
            );
          }
          return new Response(
            JSON.stringify(pickFields(ext)), 
            { 
              status: 200, 
              headers: { 
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
              } 
            }
          );
        }

        // /api/extensions?filter=...
        const filter = url.searchParams.get("filter");
        let result: Extension[] = extensions;
        
        if (filter && filter !== "all") {
          result = extensions.filter(e => e.filters?.includes(filter) ?? false);
        }
        
        // Apply data fields selection
        const responseData = dataFields.length > 0 
          ? result.map(pickFields) 
          : result;
          
        return new Response(
          JSON.stringify(responseData), 
          { 
            status: 200, 
            headers: { 
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            } 
          }
        );
      }

      // Fallback to static assets
      return env.ASSETS.fetch(request);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return new Response(
        JSON.stringify({ error: "Worker exception", message }), 
        { 
          status: 500, 
          headers: { 
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          } 
        }
      );
    }
  }
};
