import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { normalizePlaceInput } from '@/lib/places'
import { Place } from '@/types'

export const runtime = 'nodejs'

function getIngestSecret(request: Request): string {
  return (
    request.headers.get('x-spots-ingest-secret') ||
    request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ||
    ''
  )
}

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error('Supabase environment variables are missing')
  }

  return createClient(url, key)
}

export async function POST(request: Request) {
  try {
    const expectedSecret = process.env.SPOTS_INGEST_SECRET

    if (!expectedSecret) {
      return NextResponse.json(
        { error: 'SPOTS_INGEST_SECRET is not configured' },
        { status: 500 }
      )
    }

    const providedSecret = getIngestSecret(request)
    if (providedSecret !== expectedSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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
    console.error('Places ingest route error:', error)
    return NextResponse.json(
      { error: 'Invalid ingest request' },
      { status: 400 }
    )
  }
}
