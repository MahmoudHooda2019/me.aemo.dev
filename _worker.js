export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);

      // Only handle /api/extensions endpoints
      if (url.pathname.startsWith("/api/extensions")) {
        // Fetch all extensions from the static JSON
        const assetUrl = new URL("/extensions/extensions.json", request.url).toString();
        const assetResponse = await env.ASSETS.fetch(new Request(assetUrl, request));
        if (!assetResponse || assetResponse.status !== 200) {
          return new Response(JSON.stringify({ error: "extensions.json not found" }), { status: 404, headers: { "Content-Type": "application/json" } });
        }
        const extensions = await assetResponse.json();

        // Parse ?data=id,title,price
        const dataFields = url.searchParams.get("data")?.split(",").map(f => f.trim()).filter(Boolean);
        const pickFields = (obj) => {
          if (!dataFields || dataFields.length === 0) return obj;
          const result = {};
          for (const key of dataFields) {
            if (key in obj) result[key] = obj[key];
          }
          return result;
        };

        // /api/extensions/:id
        const match = url.pathname.match(/^\/api\/extensions\/([^\/]+)$/);
        if (match) {
          const id = match[1];
          const ext = extensions.find(e => e.id === id);
          if (!ext) {
            return new Response(JSON.stringify({ error: "Extension not found" }), { status: 404, headers: { "Content-Type": "application/json" } });
          }
          return new Response(JSON.stringify(pickFields(ext)), { status: 200, headers: { "Content-Type": "application/json" } });
        }

        // /api/extensions?filter=...
        const filter = url.searchParams.get("filter");
        let result = extensions;
        if (filter && filter !== "all") {
          result = extensions.filter(e => e.filters && e.filters.includes(filter));
        }
        // Apply data fields selection
        if (dataFields && dataFields.length > 0) {
          result = result.map(pickFields);
        }
        return new Response(JSON.stringify(result), { status: 200, headers: { "Content-Type": "application/json" } });
      }

      // Fallback to static assets
      return env.ASSETS.fetch(request);
    } catch (err) {
      return new Response(
        JSON.stringify({ error: "Worker exception", message: err && err.message ? err.message : String(err) }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }
}