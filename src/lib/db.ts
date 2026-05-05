import postgres from 'postgres'

let _db: ReturnType<typeof postgres> | null = null

export function getDb(): ReturnType<typeof postgres> {
  if (!_db) {
    const databaseUrl = process.env.DATABASE_URL
    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is not set')
    }
    _db = postgres(databaseUrl, {
      ssl: 'require',
      connect_timeout: 10,
    })
  }
  return _db
}

// Helper to build INSERT query with parameterized values
export function buildInsertQuery(table: string, data: Record<string, unknown>): { query: string; values: unknown[] } {
  const columns = Object.keys(data)
  const values = Object.values(data)
  const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ')
  return {
    query: `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders}) RETURNING *`,
    values,
  }
}