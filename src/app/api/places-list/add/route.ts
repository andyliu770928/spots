import { NextResponse } from 'next/server'
import { getDb, buildInsertQuery } from '@/lib/db'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const client = getDb()
    const { query, values } = buildInsertQuery('places', body)
    const [row] = await client.unsafe(query, values as (string | number | boolean | null | Date)[])
    return NextResponse.json(row)
  } catch (error) {
    console.error('Failed to add place:', error)
    return NextResponse.json({ error: 'Failed to add place' }, { status: 500 })
  }
}