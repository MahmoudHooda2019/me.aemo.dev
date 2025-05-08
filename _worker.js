export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Serve extensions data as API endpoint
    if (url.pathname === "/api/extensions") {
      // Fetch the JSON file from static assets
      const jsonResponse = await env.ASSETS.fetch(new Request("/extensions/extensions.json", request));
      return new Response(await jsonResponse.body, {
        headers: { "Content-Type": "application/json" }
      });
    }

    // Fallback to static assets
    return env.ASSETS.fetch(request);
  }
}