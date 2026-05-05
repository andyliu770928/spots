const { Client } = require('pg');

const DATABASE_URL = 'postgresql://neondb_owner:npg_86QmdZwLxsOM@ep-long-shape-anjuza89.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require';
const CSV_PATH = '/Users/andyliu/MEGA/openclaw/generated/stats/places_rows.csv';

const fs = require('fs');
const lines = fs.readFileSync(CSV_PATH, 'utf-8').split('\n');
const headers = lines[0].split(',');

async function main() {
  const client = new Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const values = parseCSVLine(lines[i]);
    const row = {};
    headers.forEach((h, idx) => {
      const v = values[idx];
      if (v !== undefined && v.trim()) row[h.trim()] = v.trim();
    });

    // Remove rating from row if it's the last empty one
    if (row.rating === '') delete row.rating;

    // Parse tags JSON
    let tags = null;
    if (row.tags) {
      try { tags = JSON.parse(row.tags); } catch {}
    }

    const columns = Object.keys(row).filter(k => k !== 'tags' && k !== 'rating');
    const vals = columns.map(k => row[k]);
    const placeholders = columns.map((_, i) => `$${i+1}`).join(', ');

    try {
      const query = `INSERT INTO places (${columns.join(', ')}) VALUES (${placeholders}) RETURNING id, title`;
      const res = await client.query(query, vals);
      console.log(`[${i}] Inserted: ${res.rows[0].title}`);
    } catch (e) {
      console.error(`[${i}] Error: ${e.message}`);
    }
  }

  await client.end();
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQuotes && line[i+1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += c;
    }
  }
  result.push(current);
  return result;
}

main().catch(console.error);