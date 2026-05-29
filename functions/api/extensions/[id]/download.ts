type RouteParams = Record<string, string | string[]>

interface DownloadTarget {
  url: string
  filename: string
}

const DOWNLOAD_TARGETS: Record<string, DownloadTarget> = {
  number_checker: {
    url: 'https://community.kodular.io/uploads/short-url/gyQ2Kh0OmG6zbybK5VbXzDnvF8c.aix',
    filename: 'number_checker.aix'
  },
  device_year: {
    url: 'https://community.kodular.io/uploads/short-url/8v0RM7FPns68mmVb6mROSpnK4up.aix',
    filename: 'device_year.aix'
  },
  similarity: {
    url: 'https://community.kodular.io/uploads/short-url/v5Q34TK6nbVtUlEFyNSp1RFTObx.aix',
    filename: 'similarity.aix'
  },
  morse_code: {
    url: 'https://community.kodular.io/uploads/short-url/7NMEXyLfFGUBaUIEM20x2IaiiSs.aix',
    filename: 'morse_code.aix'
  },
  ruler_picker: {
    url: 'https://community.kodular.io/uploads/short-url/yvVzsXfhrjQZr8gDsdq5VmN6B9B.aix',
    filename: 'ruler_picker.aix'
  },
  speech_recognition_view: {
    url: 'https://drive.google.com/uc?id=19atykVGrdsx3tMObKNFbqzxNby62KZBq&export=download',
    filename: 'speech_recognition_view.aix'
  }
}

export async function onRequestGet(context: { params: RouteParams }): Promise<Response> {
  const extensionId = getRouteParam(context.params.id)
  const target = extensionId ? DOWNLOAD_TARGETS[extensionId] : undefined

  if (!target) {
    return new Response('Extension file not found.', { status: 404 })
  }

  return proxyFile(target.url, {
    cacheControl: 'private, no-store',
    contentDisposition: `attachment; filename="${target.filename}"`
  })
}

function getRouteParam(value: string | string[] | undefined): string {
  const routeParam = Array.isArray(value) ? value[0] : value
  return routeParam && /^[a-z0-9_-]+$/i.test(routeParam) ? routeParam : ''
}

async function proxyFile(
  targetUrl: string,
  options: { cacheControl: string; contentDisposition?: string }
): Promise<Response> {
  try {
    console.log(`Fetching: ${targetUrl}`)
    const upstream = await fetch(targetUrl, {
      timeout: 30000
    })

    console.log(`Response status: ${upstream.status}`)

    // Handle redirects manually
    if ([301, 302, 303, 307, 308].includes(upstream.status)) {
      const location = upstream.headers.get('Location')
      console.log(`Redirect to: ${location}`)
      if (location) {
        return proxyFile(location, options)
      }
    }

    if (!upstream.ok) {
      console.error(`Upstream not ok: status=${upstream.status}`)
      return new Response(`Upstream error: ${upstream.status}`, { status: 502 })
    }

    // Buffer the entire response body
    const buffer = await upstream.arrayBuffer()
    console.log(`Buffer size: ${buffer.byteLength}`)

    const headers = new Headers({
      'Cache-Control': options.cacheControl,
      'Content-Type': upstream.headers.get('Content-Type') || 'application/octet-stream',
      'X-Content-Type-Options': 'nosniff',
      'Content-Length': buffer.byteLength.toString()
    })

    if (options.contentDisposition) {
      headers.set('Content-Disposition', options.contentDisposition)
    }

    return new Response(buffer, {
      status: 200,
      headers
    })
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error(`Proxy error: ${errorMsg}`)
    return new Response(`Proxy error: ${errorMsg}`, { status: 502 })
  }
}
