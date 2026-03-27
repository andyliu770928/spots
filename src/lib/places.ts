import { Place, PlaceCategory, PlaceStatus } from '@/types'

const ALLOWED_CATEGORIES: PlaceCategory[] = [
  'spot',
  'food',
  'hotel',
  'idea',
  'hiking',
  'dessert',
  'photography',
  'hidden_gem',
  'shop_visit',
  'coffee',
]

const ALLOWED_STATUSES: PlaceStatus[] = [
  'inbox',
  'shortlisted',
  'visited',
  'archived',
]

export function detectSourcePlatform(url?: string): string {
  const normalized = (url || '').toLowerCase()

  if (!normalized) return ''
  if (normalized.includes('instagram.com') || normalized.includes('instagr.am')) return 'instagram'
  if (normalized.includes('facebook.com') || normalized.includes('fb.watch')) return 'facebook'
  if (normalized.includes('youtube.com') || normalized.includes('youtu.be')) return 'youtube'
  if (normalized.includes('tiktok.com')) return 'tiktok'
  if (normalized.includes('xiaohongshu.com') || normalized.includes('xhslink.com')) return 'xiaohongshu'
  if (normalized.includes('maps.google.') || normalized.includes('google.com/maps')) return 'google_maps'

  return 'web'
}

function normalizeText(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined

  const trimmed = value.trim()
  return trimmed || undefined
}

function normalizeTags(value: unknown): string[] | undefined {
  if (Array.isArray(value)) {
    const tags = value
      .map(item => (typeof item === 'string' ? item.trim() : ''))
      .filter(Boolean)

    return tags.length ? tags : undefined
  }

  if (typeof value === 'string') {
    const tags = value
      .split(',')
      .map(item => item.trim())
      .filter(Boolean)

    return tags.length ? tags : undefined
  }

  return undefined
}

export function normalizePlaceInput(input: Partial<Place> & Record<string, unknown>): Partial<Place> {
  const source_url = normalizeText(input.source_url)
  const source_platform = normalizeText(input.source_platform) || detectSourcePlatform(source_url)
  const category = ALLOWED_CATEGORIES.includes(input.category as PlaceCategory)
    ? (input.category as PlaceCategory)
    : 'spot'
  const status = ALLOWED_STATUSES.includes(input.status as PlaceStatus)
    ? (input.status as PlaceStatus)
    : 'inbox'

  return {
    title: normalizeText(input.title),
    source_url,
    source_platform,
    category,
    city: normalizeText(input.city),
    district: normalizeText(input.district),
    address: normalizeText(input.address),
    summary: normalizeText(input.summary),
    why_go: normalizeText(input.why_go),
    notes: normalizeText(input.notes),
    cover_image_url: normalizeText(input.cover_image_url),
    tags: normalizeTags(input.tags),
    status,
  }
}
