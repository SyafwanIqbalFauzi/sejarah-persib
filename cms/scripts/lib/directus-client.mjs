// Shared Directus admin-API client for the cms/scripts/*.mjs setup & seed scripts.

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import pg from 'pg'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..')

export const env = Object.fromEntries(
  readFileSync(path.join(rootDir, '.env'), 'utf-8')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#') && l.includes('='))
    .map((l) => {
      const i = l.indexOf('=')
      return [l.slice(0, i), l.slice(i + 1)]
    })
)

export const DIRECTUS_URL = env.NUXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055'

let token

export async function api(p, options = {}) {
  const res = await fetch(`${DIRECTUS_URL}${p}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  })
  const text = await res.text()
  const body = text ? JSON.parse(text) : null
  if (!res.ok) {
    throw new Error(`${options.method || 'GET'} ${p} -> ${res.status}: ${JSON.stringify(body?.errors ?? body)}`)
  }
  return body
}

export async function login() {
  const res = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: env.DIRECTUS_ADMIN_EMAIL, password: env.DIRECTUS_ADMIN_PASSWORD })
  })
  token = res.data.access_token
  return token
}

// Direct Postgres access for schema changes the Directus REST API can't express
// safely (e.g. altering a foreign key's ON DELETE behavior — PATCH /relations
// drops and does not reliably recreate the underlying constraint).
let pgClient

async function getPgClient() {
  if (pgClient) return pgClient
  pgClient = new pg.Client({
    host: env.SUPABASE_DB_HOST,
    port: Number(env.SUPABASE_DB_PORT),
    database: env.SUPABASE_DB_DATABASE,
    user: env.SUPABASE_DB_USER,
    password: env.SUPABASE_DB_PASSWORD,
    ssl: { rejectUnauthorized: false }
  })
  await pgClient.connect()
  return pgClient
}

// Ensures a foreign key on `table.column` -> `refTable.id` exists with the given
// ON DELETE behavior, dropping and recreating it so it's always in the intended state.
export async function ensureForeignKey(table, column, refTable, onDelete) {
  const client = await getPgClient()
  const conname = `${table}_${column}_foreign`
  const { rows } = await client.query(
    `SELECT confdeltype FROM pg_constraint WHERE conname = $1 AND conrelid = $2::regclass`,
    [conname, table]
  )
  const desired = { CASCADE: 'c', 'SET NULL': 'n' }[onDelete]
  if (rows[0]?.confdeltype === desired) {
    console.log(`= constraint ${conname} already ON DELETE ${onDelete}, skipping`)
    return
  }
  await client.query(`ALTER TABLE ${table} DROP CONSTRAINT IF EXISTS ${conname}`)
  await client.query(`ALTER TABLE ${table} ADD CONSTRAINT ${conname} FOREIGN KEY (${column}) REFERENCES ${refTable}(id) ON DELETE ${onDelete}`)
  console.log(`~ set constraint ${conname} -> ${refTable} ON DELETE ${onDelete}`)
}

export async function closePg() {
  if (pgClient) await pgClient.end()
}
