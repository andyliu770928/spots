import axios from 'axios'
import * as cheerio from 'cheerio'
import { createClient } from '@supabase/supabase-js'
import { Place } from '@/types'
import {
  buildMissingFields,
  detectSourcePlatform,
  extractCityDistrict,
  extractTags,
  inferCategory,
  normalizePlaceInput,
  ResolvedPlaceDraft,
} from '@/lib/places'

type LinkPreviewResponse = {
  title?: string
  description?: string
  image?: string
  platform?: string
}

export type CaptureInput = Omit<Partial<Place>, 'category' | 'tags'> & {
  url?: string
  raw_text?: string
  hours?: string
  category?: string
  tags?: string[] | string
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

export function cleanText(value?: string): string | undefined {
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

function buildResolvedPlaceDraft(place: Record<string, unknown>): ResolvedPlaceDraft {
  const normalized = normalizePlaceInput(place)

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

export function getIngestSecret(request: Request): string {
  return (
    request.headers.get('x-spots-ingest-secret') ||
    request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ||
    ''
  )
}

export function assertAuthorized(request: Request) {
  const expectedSecret = process.env.SPOTS_INGEST_SECRET

  if (!expectedSecret) {
    throw new Error('SPOTS_INGEST_SECRET is not configured')
  }

  const providedSecret = getIngestSecret(request)
  if (providedSecret !== expectedSecret) {
    const error = new Error('Unauthorized')
    error.name = 'UnauthorizedError'
    throw error
  }
}

export function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error('Supabase environment variables are missing')
  }

  return createClient(url, key)
}

export async function resolvePlaceInput(input: CaptureInput): Promise<ResolvedPlaceDraft> {
  const rawUrl = cleanText(input.url || input.source_url)
  const rawText = cleanText(input.raw_text)
  const explicitTitle = cleanText(input.title)
  const explicitSummary = cleanText(input.summary)
  const explicitWhyGo = cleanText(input.why_go)
  const explicitAddress = cleanText(input.address)
  const explicitOpeningHours = cleanText(input.opening_hours || input.hours)
  const explicitSourcePlatform = cleanText(input.source_platform)
  const explicitTags = Array.isArray(input.tags)
    ? input.tags
    : typeof input.tags === 'string'
      ? input.tags
      : undefined

  if (!rawUrl && !rawText && !explicitTitle) {
    throw new Error('url, raw_text, or title is required')
  }

  if (rawUrl) {
    const parsedUrl = new URL(rawUrl)
    const source_platform = explicitSourcePlatform || detectSourcePlatform(rawUrl)

    if (source_platform === 'google_maps') {
      return buildResolvedPlaceDraft({
        ...parseGoogleMaps(parsedUrl),
        ...input,
        source_url: rawUrl,
        source_platform,
        opening_hours: explicitOpeningHours,
      })
    }

    const preview = await fetchPageMetadata(rawUrl)
    const combinedText = [rawText, explicitSummary, preview.description].filter(Boolean).join(' ')
    const tags = extractTags(
      rawText,
      explicitSummary,
      preview.description,
      explicitTitle,
      preview.title,
      ...(Array.isArray(explicitTags) ? explicitTags : [explicitTags])
    )
    const locationBits = extractCityDistrict(
      [preview.title, preview.description, rawText, explicitSummary].filter(Boolean).join(' ')
    )
    const category = inferCategory({
      category: input.category,
      title: explicitTitle || preview.title,
      summary: combinedText,
      tags,
    })

    return buildResolvedPlaceDraft({
      ...input,
      title: explicitTitle || preview.title,
      source_url: rawUrl,
      source_platform,
      category,
      city: cleanText(input.city) || locationBits.city,
      district: cleanText(input.district) || locationBits.district,
      address: explicitAddress,
      summary: cleanText(combinedText),
      why_go: explicitWhyGo || cleanText(combinedText),
      tags,
      rating: input.rating ?? null,
      opening_hours: explicitOpeningHours,
      cover_image_url: cleanText(input.cover_image_url) || preview.image,
      status: input.status || 'inbox',
    })
  }

  const tags = extractTags(
    rawText,
    explicitSummary,
    explicitTitle,
    ...(Array.isArray(explicitTags) ? explicitTags : [explicitTags])
  )
  const mergedSummary = cleanText([rawText, explicitSummary].filter(Boolean).join(' '))
  const locationBits = extractCityDistrict(
    [explicitTitle, rawText, explicitSummary, explicitAddress].filter(Boolean).join(' ')
  )
  const category = inferCategory({
    category: input.category,
    title: explicitTitle,
    summary: mergedSummary,
    tags,
  })

  return buildResolvedPlaceDraft({
    ...input,
    title: explicitTitle,
    category,
    city: cleanText(input.city) || locationBits.city,
    district: cleanText(input.district) || locationBits.district,
    address: explicitAddress,
    summary: mergedSummary,
    why_go: explicitWhyGo || mergedSummary,
    tags,
    source_platform: explicitSourcePlatform || (rawText ? 'manual' : ''),
    opening_hours: explicitOpeningHours,
    status: input.status || 'inbox',
  })
}
