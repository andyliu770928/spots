import { NextResponse } from 'next/server'
import {
  assertAuthorized,
  getSupabaseClient,
  resolvePlaceInput,
} from '@/lib/places-server'
import { normalizePlaceInput } from '@/lib/places'
import { Place } from '@/types'

export const runtime = 'nodejs'

type CaptureRequest = Partial<Place> & {
  url?: string
  raw_text?: string
  dry_run?: boolean
  hours?: string
}

export async function POST(request: Request) {
  try {
    assertAuthorized(request)

    const body = (await request.json()) as CaptureRequest
    const resolved = await resolvePlaceInput(body)
    const payload = normalizePlaceInput({
      ...resolved,
      ...body,
      source_url: body.source_url || body.url || resolved.source_url,
      opening_hours: body.opening_hours || body.hours || resolved.opening_hours,
    })

    if (!payload.title) {
      return NextResponse.json({ error: 'title is required' }, { status: 400 })
    }

    if (body.dry_run) {
      return NextResponse.json({
        ok: true,
        dry_run: true,
        place: payload,
        missing_fields: resolved.missing_fields,
        confidence: resolved.confidence,
      })
    }

    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('places')
      .insert([payload])
      .select()
      .single()

    if (error) {
      console.error('Places capture error:', error)
      return NextResponse.json(
        { error: 'Failed to create place' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ok: true,
      place: data,
      resolved: {
        missing_fields: resolved.missing_fields,
        confidence: resolved.confidence,
      },
    })
  } catch (error) {
    if (error instanceof Error && error.name === 'UnauthorizedError') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (error instanceof Error && error.message === 'SPOTS_INGEST_SECRET is not configured') {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.error('Places capture route error:', error)
    return NextResponse.json(
      { error: 'Failed to capture place' },
      { status: 400 }
    )
  }
}
