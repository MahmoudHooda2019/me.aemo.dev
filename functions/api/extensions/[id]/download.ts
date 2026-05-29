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
    const upstream = await fetch(targetUrl, {
      redirect: 'follow',
      headers: {
        'User-Agent': 'AemoDeveloper/1.0'
      }
    })

    if (!upstream.ok || !upstream.body) {
      return new Response('Extension file is temporarily unavailable.', { status: 502 })
    }

    const headers = new Headers({
      'Cache-Control': options.cacheControl,
      'Content-Type': upstream.headers.get('Content-Type') || 'application/octet-stream',
      'X-Content-Type-Options': 'nosniff'
    })
    const contentLength = upstream.headers.get('Content-Length')

    if (contentLength) {
      headers.set('Content-Length', contentLength)
    }

    if (options.contentDisposition) {
      headers.set('Content-Disposition', options.contentDisposition)
    }

    return new Response(upstream.body, {
      status: 200,
      headers
    })
  } catch {
    return new Response('Extension file is temporarily unavailable.', { status: 502 })
  }
}
