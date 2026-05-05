import { createClient } from '@/lib/supabase/client'
import { Place, Trip, TripItem } from '@/types'

const supabase = createClient()

export const api = {
  // Places
  async getPlaces() {
    const { data, error } = await supabase
      .from('places')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data as Place[]
  },

  async getPlace(id: string) {
    const { data, error } = await supabase
      .from('places')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return data as Place
  },

  async addPlace(place: Partial<Place>) {
    const { data, error } = await supabase
      .from('places')
      .insert([place])
      .select()
      .single()
    if (error) throw error
    return data as Place
  },

  async updatePlace(id: string, updates: Partial<Place>) {
    const { data, error } = await supabase
      .from('places')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data as Place
  },

  async deletePlace(id: string) {
    const { error } = await supabase
      .from('places')
      .delete()
      .eq('id', id)
    if (error) throw error
  },

  // Trips
  async getTrips() {
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data as Trip[]
  },

  async getTripWithItems(id: string) {
    const { data, error } = await supabase
      .from('trips')
      .select(`
        *,
        trip_items (
          *,
          place:places (*)
        )
      `)
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  },

  async addTripItem(item: Partial<TripItem>) {
    const { data, error } = await supabase
      .from('trip_items')
      .insert([item])
      .select()
      .single()
    if (error) throw error
    return data
  }
}
