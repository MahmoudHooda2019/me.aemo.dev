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

        // /api/extensions/:id
        const match = url.pathname.match(/^\/api\/extensions\/([^\/]+)$/);
        if (match) {
          const id = match[1];
          const ext = extensions.find(e => e.id === id);
          if (!ext) {
            return new Response(JSON.stringify({ error: "Extension not found" }), { status: 404, headers: { "Content-Type": "application/json" } });
          }
          return new Response(JSON.stringify(ext), { status: 200, headers: { "Content-Type": "application/json" } });
        }

        // /api/extensions?filter=...
        const filter = url.searchParams.get("filter");
        if (filter && filter !== "all") {
          const filtered = extensions.filter(e => e.filters && e.filters.includes(filter));
          return new Response(JSON.stringify(filtered), { status: 200, headers: { "Content-Type": "application/json" } });
        }

        // /api/extensions (all)
        return new Response(JSON.stringify(extensions), { status: 200, headers: { "Content-Type": "application/json" } });
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