import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const client = getDb()
    const rows = await client`SELECT * FROM places ORDER BY created_at DESC`
    return NextResponse.json(rows)
  } catch (error) {
    console.error('Failed to fetch places:', error)
    return NextResponse.json({ error: 'Failed to fetch places' }, { status: 500 })
  }
}