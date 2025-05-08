export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);

      // Serve extensions data as API endpoint
      if (url.pathname === "/api/extensions") {
        // Construct absolute URL for the asset
        const assetUrl = new URL("/extensions/extensions.json", request.url).toString();
        const assetResponse = await env.ASSETS.fetch(new Request(assetUrl, request));
        if (!assetResponse || assetResponse.status !== 200) {
          return new Response(JSON.stringify({ error: "extensions.json not found" }), { status: 404, headers: { "Content-Type": "application/json" } });
        }
        // Return the asset response directly (streams the body)
        return new Response(assetResponse.body, {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
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