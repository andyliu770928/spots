import { NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/places-server'

export const runtime = 'nodejs'

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
