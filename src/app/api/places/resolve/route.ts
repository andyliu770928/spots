import { NextResponse } from 'next/server'
import {
  detectSourcePlatform,
} from '@/lib/places'
import { cleanText, resolvePlaceInput } from '@/lib/places-server'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      url?: string
      raw_text?: string
      title?: string
      summary?: string
      tags?: string[] | string
      category?: string
    }

    if (!cleanText(body.url) && !cleanText(body.raw_text) && !cleanText(body.title)) {
      return NextResponse.json(
        { error: 'url, raw_text, or title is required' },
        { status: 400 }
      )
    }

    const resolved = await resolvePlaceInput(body)
    const sourceUrl = cleanText(body.url)
    const source_platform = detectSourcePlatform(sourceUrl || resolved.source_url)

    return NextResponse.json({
      ok: true,
      place: resolved,
      meta: {
        source_platform,
        supports_address_autofill: source_platform === 'google_maps',
      },
    })
  } catch (error) {
    console.error('Places resolve route error:', error)
    return NextResponse.json(
      { error: 'Failed to resolve link data' },
      { status: 500 }
    )
  }
}
