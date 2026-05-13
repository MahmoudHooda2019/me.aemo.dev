# Aemo Developer

MIT App Inventor extensions and developer tools built with Vue 3 and TypeScript.

## About

Aemo Developer provides a curated collection of MIT App Inventor extensions and small developer utilities for mobile app development workflows.

## Features

- Extensions library with searchable extension cards and detail pages.
- Markdown documentation for each extension under `public/extensions/`.
- Developer tools such as Base64 encoding and deep-link generation.
- Vue Router detail pages at `/extension/:id`.
- Extension and tool metadata bundled at build time instead of exposed as public JSON files.
- PWA-ready shell with a service worker.

## Quick Start

### Prerequisites

- Node.js 18+
- npm

### Install

```bash
npm install
```

### Develop

```bash
npm run dev
```

The local dev server uses `http://localhost:3000` by default.

### Build

```bash
npm run build
```

### Type Check

```bash
npm run type-check
```

## Extension Docs

Extension metadata lives in `src/data/extensions.json`.

Each extension detail page first uses the explicit `doc` field when present:

```json
{
  "id": "number_checker",
  "doc": "number_checker.md"
}
```

If `doc` is missing, the app falls back to `id + ".md"`, so `number_checker` loads `/extensions/number_checker.md`.

## Deployment Notes

The project uses Cloudflare Pages static deployment support through `public/_headers` and `public/_redirects`. The redirects file keeps direct visits to Vue Router URLs, such as `/extension/number_checker`, working while blocking direct access to the old `/scripts/*.json` paths.

## License

MIT License

Copyright (c) 2023 Aemo Developer
