export type PlaceStatus = 'inbox' | 'shortlisted' | 'visited' | 'archived'

export type PlaceCategory =
  | 'spot'
  | 'food'
  | 'hotel'
  | 'idea'
  | 'hiking'
  | 'dessert'
  | 'photography'
  | 'hidden_gem'
  | 'shop_visit'
  | 'coffee'

export interface Place {
  id: string
  user_id?: string
  title: string
  category: PlaceCategory
  city?: string
  district?: string
  address?: string
  lat?: number
  lng?: number
  source_url?: string
  source_platform?: string
  summary?: string
  why_go?: string
  tags?: string[]
  status: PlaceStatus
  notes?: string
  cover_image_url?: string
  created_at: string
  updated_at: string
}

export interface Trip {
  id: string
  user_id?: string
  title: string
  trip_date?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface TripItem {
  id: string
  trip_id: string
  place_id: string
  sort_order: number
  note?: string
  place?: Place // Joined data
  created_at: string
}
