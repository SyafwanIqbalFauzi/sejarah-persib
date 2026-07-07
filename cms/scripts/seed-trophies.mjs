// Seed data — placeholder/example content, NOT verified historical fact. See seed-coaches.mjs.
// Run with: node cms/scripts/seed-trophies.mjs

import { api, login } from './lib/directus-client.mjs'
import { seedSources, sources } from './seed-sources.mjs'

const trophies = [
  { nama_gelar: 'Juara Perserikatan 1990 (perlu verifikasi)', tahun: 1990, kompetisi: 'Perserikatan', jenis: 'klub' },
  { nama_gelar: 'Juara Liga Indonesia 1994/1995 (perlu verifikasi)', tahun: 1995, kompetisi: 'Liga Indonesia', jenis: 'klub' },
  { nama_gelar: 'Juara Indonesia Super League 2014 (perlu verifikasi)', tahun: 2014, kompetisi: 'Indonesia Super League', jenis: 'klub' }
]

async function main() {
  await login()
  const sourceIds = await seedSources()
  const sourceId = sourceIds[sources[0].nama_sumber]

  for (const trophy of trophies) {
    const existing = await api(`/items/trophies?filter[nama_gelar][_eq]=${encodeURIComponent(trophy.nama_gelar)}`)
    if (existing.data.length > 0) {
      console.log(`= trophy "${trophy.nama_gelar}" already exists, skipping`)
      continue
    }
    await api('/items/trophies', {
      method: 'POST',
      body: JSON.stringify({ ...trophy, status: 'published', sumber_utama: sourceId })
    })
    console.log(`+ created trophy "${trophy.nama_gelar}"`)
  }
  console.log('\nDone seeding trophies.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
