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

export interface ResolvedPlaceDraft extends Partial<Place> {
  confidence: {
    title: number
    address: number
    category: number
  }
  missing_fields: string[]
}

export const CATEGORY_LABELS: Record<PlaceCategory, string> = {
  spot: '景點',
  food: '美食',
  hotel: '住宿',
  idea: '靈感',
  hiking: '登山',
  dessert: '甜點',
  photography: '攝影',
  hidden_gem: '秘境',
  shop_visit: '探店',
  coffee: '咖啡',
}

export function getCategoryLabel(category: PlaceCategory): string {
  return CATEGORY_LABELS[category] || category
}

export function normalizeRating(value: unknown): number | null | undefined {
  if (value === null) return null
  if (value === undefined || value === '') return undefined

  const parsed = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(parsed)) return undefined
  if (parsed < 1 || parsed > 5) return null

  return Math.round(parsed)
}

export function getRatingLabel(rating?: number | null): string {
  if (!rating) return '沒去過'
  return `${rating} / 5`
}

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

export function inferCategory(input: {
  category?: unknown
  title?: string
  summary?: string
  tags?: string[]
}): PlaceCategory {
  if (ALLOWED_CATEGORIES.includes(input.category as PlaceCategory)) {
    return input.category as PlaceCategory
  }

  const haystack = [input.title, input.summary, ...(input.tags || [])]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  if (/hotel|住宿|旅館|民宿/.test(haystack)) return 'hotel'
  if (/coffee|咖啡|cafe|café/.test(haystack)) return 'coffee'
  if (/dessert|甜點|蛋糕|冰品/.test(haystack)) return 'dessert'
  if (/hiking|trail|登山|步道/.test(haystack)) return 'hiking'
  if (/food|restaurant|餐廳|美食|小吃|料理/.test(haystack)) return 'food'
  if (/photo|攝影|拍照|取景/.test(haystack)) return 'photography'

  return 'spot'
}

export function extractTags(...parts: Array<string | undefined>): string[] {
  const tags = new Set<string>()

  for (const part of parts) {
    if (!part) continue

    for (const match of part.matchAll(/#([\p{L}\p{N}_-]+)/gu)) {
      const value = match[1]?.trim()
      if (value) tags.add(value)
    }
  }

  return Array.from(tags).slice(0, 12)
}

export function extractCityDistrict(text: string): {
  city?: string
  district?: string
} {
  const normalized = text.replace(/\s+/g, ' ')
  const cityMatch = normalized.match(/(台北市|新北市|桃園市|台中市|台南市|高雄市|基隆市|新竹市|嘉義市|新竹縣|苗栗縣|彰化縣|南投縣|雲林縣|嘉義縣|屏東縣|宜蘭縣|花蓮縣|台東縣|澎湖縣|金門縣|連江縣)/)
  const districtMatch = normalized.match(/([^\s,，]+?(區|鄉|鎮|市))/)

  return {
    city: cityMatch?.[1],
    district: districtMatch?.[1],
  }
}

export function buildMissingFields(place: Partial<Place>): string[] {
  const missing: string[] = []

  if (!place.title) missing.push('title')
  if (!place.address) missing.push('address')
  if (!place.city) missing.push('city')
  if (!place.district) missing.push('district')
  if (!place.summary) missing.push('summary')

  return missing
}

export function normalizePlaceInput(input: Partial<Place> & Record<string, unknown>): Partial<Place> {
  const source_url = normalizeText(input.source_url)
  const source_platform = normalizeText(input.source_platform) || detectSourcePlatform(source_url)
  const category = ALLOWED_CATEGORIES.includes(input.category as PlaceCategory)
    ? (input.category as PlaceCategory)
    : 'spot'
  const rating = normalizeRating(input.rating)
  const status = ALLOWED_STATUSES.includes(input.status as PlaceStatus)
    ? (input.status as PlaceStatus)
    : rating && rating > 0
      ? 'visited'
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
    opening_hours: normalizeText(input.opening_hours),
    cover_image_url: normalizeText(input.cover_image_url),
    tags: normalizeTags(input.tags),
    status,
    rating,
  }
}
