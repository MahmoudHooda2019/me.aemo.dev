// Cloudflare Pages Function for /api/extensions
import type { PagesFunction } from '@cloudflare/workers-types';

interface Extension {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  price: string;
  filters: string[];
  tags: string[];
  version: string;
  lastUpdated: string;
  url: string;
  doc: string;
}

const JSON_HEADERS: HeadersInit = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "X-Content-Type-Options": "nosniff",
};

function isValidId(id: string): boolean {
  return /^[a-zA-Z0-9_-]+$/.test(id);
}

function isValidFieldName(name: string): boolean {
  return /^[a-zA-Z0-9_]+$/.test(name);
}

export const onRequestGet: PagesFunction = async (context) => {
  const url = new URL(context.request.url);
  const pathParts = url.pathname.split('/').filter(Boolean);
  
  // pathParts should be ['api', 'extensions', ...]
  const id = pathParts[2]; // Optional ID

  try {
    // Fetch extensions from static JSON
    const assetResponse = await context.env.ASSETS.fetch(
      new Request(`${url.origin}/scripts/extensions.json`)
    );

    if (!assetResponse || assetResponse.status !== 200) {
      return new Response(
        JSON.stringify({ error: "Resource not found" }),
        { status: 404, headers: JSON_HEADERS }
      );
    }

    const extensions: Extension[] = await assetResponse.json();

    // Parse ?data=id,title,price for field selection
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
    if (id) {
      if (!isValidId(id)) {
        return new Response(
          JSON.stringify({ error: "Invalid extension id" }),
          { status: 400, headers: JSON_HEADERS }
        );
      }

      const ext = extensions.find(e => e.id === id);
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
    const filter = rawFilter && /^[a-zA-Z0-9_-]+$/.test(rawFilter) ? rawFilter : "all";

    let result = extensions;
    if (filter !== "all") {
      result = extensions.filter(e => e.filters?.includes(filter) ?? false);
    }

    const responseData = dataFields.length > 0 ? result.map(pickFields) : result;

    return new Response(
      JSON.stringify(responseData),
      { status: 200, headers: JSON_HEADERS }
    );

  } catch (err) {
    console.error("[api/extensions] error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: JSON_HEADERS }
    );
  }
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    }
  });
};
