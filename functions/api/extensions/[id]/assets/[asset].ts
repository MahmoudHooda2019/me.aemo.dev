type RouteParams = Record<string, string | string[]>

const ASSET_TARGETS: Record<string, Record<string, string>> = {
  number_checker: {
    all_blocks: 'https://kodular-community.s3.dualstack.eu-west-1.amazonaws.com/original/3X/4/9/496d29b1667f26709176f649640a9371b723980f.png'
  },
  device_year: {
    all_blocks: 'https://cdn.community.kodular.io/original/3X/e/d/edb57cbc207551ec87002df96eeebb2c96d353b8.png',
    demo: 'https://cdn.community.kodular.io/original/3X/5/2/52e4538c1508611cf8ceadceeb6b27146945767e.png'
  },
  similarity: {
    all_blocks: 'https://cdn.community.kodular.io/original/3X/1/9/19a5c8011fe78cddbcfcd05da9581b51d62d8811.png',
    demo_blocks: 'https://cdn.community.kodular.io/original/3X/1/6/16dc7e028fbb8975009324583bd2b7c624904df4.png'
  },
  morse_code: {
    all_blocks: 'https://cdn.community.kodular.io/original/3X/e/4/e4f831e91c40ba3169f020b039679cdfb1331104.png',
    demo_blocks: 'https://cdn.community.kodular.io/original/3X/9/b/9b9732724af78e6a20e1100ab72382d956c8409f.png',
    output: 'https://cdn.community.kodular.io/optimized/3X/d/a/da0f80a86f8d41638eab870ebb8f1da2e549158e_2_281x500.png'
  },
  ruler_picker: {
    all_blocks: 'https://cdn.community.kodular.io/optimized/3X/b/0/b03c9516ae4b1581acf6cbb8e6e6bc5df0693a5e_2_202x500.png',
    preview: 'https://cdn.community.kodular.io/original/3X/a/1/a1b6ba7ab28972f0adb04c400e7b2197f5a1111e.gif'
  },
  speech_recognition_view: {
    all_blocks: 'https://cdn.community.kodular.io/optimized/3X/4/6/46bc4073ebdd7844cab7ca824257c7ce44a132e9_2_182x500.png',
    demo_blocks: 'https://cdn.community.kodular.io/optimized/3X/1/b/1b2c916002d6c5af13854b2788f0247980995a2f_2_690x491.png',
    demo: 'https://cdn.community.kodular.io/original/3X/4/7/47e1e0129e1a3b0276e5b9217c5e953d08eb0605.gif'
  }
}

export async function onRequestGet(context: { params: RouteParams }): Promise<Response> {
  const extensionId = getRouteParam(context.params.id)
  const assetId = getRouteParam(context.params.asset)
  const targetUrl = extensionId && assetId ? ASSET_TARGETS[extensionId]?.[assetId] : ''

  if (!targetUrl) {
    return new Response('Extension asset not found.', { status: 404 })
  }

  return proxyAsset(targetUrl)
}

function getRouteParam(value: string | string[] | undefined): string {
  const routeParam = Array.isArray(value) ? value[0] : value
  return routeParam && /^[a-z0-9_-]+$/i.test(routeParam) ? routeParam : ''
}

async function proxyAsset(targetUrl: string): Promise<Response> {
  try {
    const upstream = await fetch(targetUrl, {
      redirect: 'follow',
      headers: {
        'User-Agent': 'AemoDeveloper/1.0'
      }
    })

    if (!upstream.ok || !upstream.body) {
      return new Response('Extension asset is temporarily unavailable.', { status: 502 })
    }

    const headers = new Headers({
      'Cache-Control': 'public, max-age=86400',
      'Content-Type': upstream.headers.get('Content-Type') || 'application/octet-stream',
      'X-Content-Type-Options': 'nosniff'
    })
    const contentLength = upstream.headers.get('Content-Length')

    if (contentLength) {
      headers.set('Content-Length', contentLength)
    }

    return new Response(upstream.body, {
      status: 200,
      headers
    })
  } catch {
    return new Response('Extension asset is temporarily unavailable.', { status: 502 })
  }
}
