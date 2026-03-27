import { NextResponse } from 'next/server'
import axios from 'axios'
import * as cheerio from 'cheerio'
import {
  buildMissingFields,
  detectSourcePlatform,
  extractCityDistrict,
  extractTags,
  inferCategory,
  normalizePlaceInput,
  ResolvedPlaceDraft,
} from '@/lib/places'
import { Place } from '@/types'

export const runtime = 'nodejs'

type LinkPreviewResponse = {
  title?: string
  description?: string
  image?: string
  platform?: string
}

function buildUserAgent() {
  return 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
}

function absoluteUrl(baseUrl: string, value?: string): string | undefined {
  if (!value) return undefined

  try {
    return new URL(value, baseUrl).toString()
  } catch {
    return value
  }
}

function cleanText(value?: string): string | undefined {
  if (!value) return undefined

  const cleaned = value.replace(/\s+/g, ' ').trim()
  return cleaned || undefined
}

function parseGoogleMaps(url: URL): Partial<Place> {
  const query = cleanText(
    url.searchParams.get('query') ||
      url.searchParams.get('q') ||
      url.searchParams.get('destination') ||
      ''
  )

  const locationBits = extractCityDistrict(query || '')

  return {
    title: query?.split(',')[0]?.trim() || query,
    source_url: url.toString(),
    source_platform: 'google_maps',
    address: query,
    city: locationBits.city,
    district: locationBits.district,
    category: 'spot',
    status: 'inbox',
  }
}

async function fetchPageMetadata(targetUrl: string): Promise<LinkPreviewResponse> {
  const response = await axios.get(targetUrl, {
    headers: { 'User-Agent': buildUserAgent() },
    timeout: 8000,
  })

  const html = typeof response.data === 'string' ? response.data : ''
  const $ = cheerio.load(html)

  const title = cleanText(
    $('meta[property="og:title"]').attr('content') ||
      $('meta[name="twitter:title"]').attr('content') ||
      $('title').text()
  )
  const description = cleanText(
    $('meta[property="og:description"]').attr('content') ||
      $('meta[name="description"]').attr('content') ||
      $('meta[name="twitter:description"]').attr('content')
  )
  const image = absoluteUrl(
    targetUrl,
    $('meta[property="og:image"]').attr('content') ||
      $('meta[name="twitter:image"]').attr('content')
  )

  return {
    title,
    description,
    image,
    platform: detectSourcePlatform(targetUrl),
  }
}

function buildResolvedPlaceDraft(place: Partial<Place>): ResolvedPlaceDraft {
  const normalized = normalizePlaceInput(place as Partial<Place> & Record<string, unknown>)

  return {
    ...normalized,
    confidence: {
      title: normalized.title ? 0.95 : 0.1,
      address: normalized.address ? 0.8 : 0.2,
      category: normalized.category && normalized.category !== 'spot' ? 0.75 : 0.45,
    },
    missing_fields: buildMissingFields(normalized),
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      url?: string
      title?: string
      summary?: string
      tags?: string[] | string
      category?: string
    }

    const rawUrl = cleanText(body.url)
    if (!rawUrl) {
      return NextResponse.json({ error: 'url is required' }, { status: 400 })
    }

    const parsedUrl = new URL(rawUrl)
    const source_platform = detectSourcePlatform(rawUrl)

    if (source_platform === 'google_maps') {
      const resolved = buildResolvedPlaceDraft(parseGoogleMaps(parsedUrl))
      return NextResponse.json({ ok: true, place: resolved })
    }

    const preview = await fetchPageMetadata(rawUrl)
    const combinedSummary = cleanText([body.summary, preview.description].filter(Boolean).join(' '))
    const tags = extractTags(body.summary, preview.description, preview.title, ...(Array.isArray(body.tags) ? body.tags : [typeof body.tags === 'string' ? body.tags : '']))
    const locationBits = extractCityDistrict([preview.title, preview.description, body.summary].filter(Boolean).join(' '))
    const category = inferCategory({
      category: body.category,
      title: preview.title || body.title,
      summary: combinedSummary,
      tags,
    })

    const resolved = buildResolvedPlaceDraft({
      title: preview.title || cleanText(body.title),
      source_url: rawUrl,
      source_platform,
      category,
      city: locationBits.city,
      district: locationBits.district,
      address: undefined,
      summary: combinedSummary,
      why_go: combinedSummary,
      tags,
      cover_image_url: preview.image,
      status: 'inbox',
    })

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
