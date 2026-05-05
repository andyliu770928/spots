'use client'

import { Place } from '@/types'

async function fetchJSON(url: string, options?: RequestInit) {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export const placesApi = {
  async getPlaces() {
    return fetchJSON('/api/places-list')
  },

  async getPlace(id: string) {
    return fetchJSON(`/api/places/${id}`)
  },

  async addPlace(place: Partial<Place>) {
    return fetchJSON('/api/places-list/add', {
      method: 'POST',
      body: JSON.stringify(place),
    })
  },

  async updatePlace(id: string, updates: Partial<Place>) {
    return fetchJSON(`/api/places/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    })
  },

  async deletePlace(id: string) {
    await fetch(`/api/places/${id}`, { method: 'DELETE' })
  },
}