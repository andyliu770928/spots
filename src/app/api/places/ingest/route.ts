import { NextResponse } from 'next/server'
import { assertAuthorized, getDb } from '@/lib/places-server'
import { normalizePlaceInput } from '@/lib/places'
import { buildInsertQuery } from '@/lib/db'
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

    const client = getDb()
    const { query, values } = buildInsertQuery('places', payload as Record<string, unknown>)
    const [data] = await client.unsafe(query, values as (string | number | boolean | null | Date)[])

    return NextResponse.json({ ok: true, place: data })
  } catch (error) {
    if (error instanceof Error && error.name === 'UnauthorizedError') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (error instanceof Error && error.message === 'SPOTS_INGEST_SECRET is not configured') {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (error instanceof Error && error.message === 'DATABASE_URL is not configured') {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.error('Places ingest error:', error)
    return NextResponse.json(
      { error: 'Invalid ingest request' },
      { status: 400 }
    )
  }
}