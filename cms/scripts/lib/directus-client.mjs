// Shared Directus admin-API client for the cms/scripts/*.mjs setup & seed scripts.

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

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
