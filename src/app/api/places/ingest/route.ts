import { NextResponse } from 'next/server'
import { normalizePlaceInput } from '@/lib/places'
import { assertAuthorized, getSupabaseClient } from '@/lib/places-server'
import { Place } from '@/types'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    assertAuthorized(request)

    const body = (await request.json()) as Partial<Place> & Record<string, unknown>
    const payload = normalizePlaceInput(body)

    if (!payload.title) {
      return NextResponse.json({ error: 'title is required' }, { status: 400 })
    }

    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('places')
      .insert([payload])
      .select()
      .single()

    if (error) {
      console.error('Places ingest error:', error)
      return NextResponse.json(
        { error: 'Failed to create place' },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true, place: data })
  } catch (error) {
    if (error instanceof Error && error.name === 'UnauthorizedError') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (error instanceof Error && error.message === 'SPOTS_INGEST_SECRET is not configured') {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.error('Places ingest route error:', error)
    return NextResponse.json(
      { error: 'Invalid ingest request' },
      { status: 400 }
    )
  }
}
