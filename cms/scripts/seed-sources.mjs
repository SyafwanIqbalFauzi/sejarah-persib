// Seeds a couple of placeholder sources. These are NOT verified citations —
// they only exist so seeded content entries have something to point `sumber_utama` at.
// Replace with real, checked references before publishing for real.
// Run with: node cms/scripts/seed-sources.mjs

import { api, login } from './lib/directus-client.mjs'

export const sources = [
  {
    nama_sumber: 'Wikipedia - Persib Bandung (perlu verifikasi ulang)',
    url: 'https://id.wikipedia.org/wiki/Persib_Bandung',
    tipe: 'situs_web',
    catatan: 'Sumber sementara untuk data seed/dev. Ganti dengan referensi primer yang sudah diverifikasi sebelum publish.'
  }
]

export async function seedSources() {
  const created = {}
  for (const src of sources) {
    const existing = await api(`/items/sources?filter[nama_sumber][_eq]=${encodeURIComponent(src.nama_sumber)}`)
    if (existing.data.length > 0) {
      console.log(`= source "${src.nama_sumber}" already exists, skipping`)
      created[src.nama_sumber] = existing.data[0].id
      continue
    }
    const res = await api('/items/sources', { method: 'POST', body: JSON.stringify({ ...src, status: 'published' }) })
    console.log(`+ created source "${src.nama_sumber}"`)
    created[src.nama_sumber] = res.data.id
  }
  return created
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await login()
  await seedSources()
  console.log('\nDone seeding sources.')
}
