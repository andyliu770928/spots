import { NextResponse } from 'next/server'
import { assertAuthorized, getSupabaseClient } from '@/lib/places-server'

export const runtime = 'nodejs'

const UPDATABLE_FIELDS = new Set([
  'title', 'category', 'summary', 'why_go', 'address', 'city', 'district',
  'lat', 'lng', 'opening_hours', 'source_url', 'source_platform',
  'cover_image_url', 'tags', 'status', 'notes',
])

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params
    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    }

    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('places')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Place not found' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Place detail route error:', error)
    return NextResponse.json(
      { error: 'Failed to load place' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    assertAuthorized(request)

    const { id } = await context.params
    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    }

    const body = await request.json()
    const patch: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(body)) {
      if (UPDATABLE_FIELDS.has(key)) {
        patch[key] = value
      }
    }

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: 'No updatable fields provided' }, { status: 400 })
    }

    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('places')
      .update(patch)
      .eq('id', id)
      .select()
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Place not found or update failed' }, { status: 404 })
    }

    return NextResponse.json({ ok: true, place: data })
  } catch (error) {
    if (error instanceof Error && error.name === 'UnauthorizedError') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Place update route error:', error)
    return NextResponse.json({ error: 'Failed to update place' }, { status: 500 })
  }
}
