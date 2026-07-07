// Seed data — placeholder/example content, NOT verified historical fact.
// Flagged inline ("data contoh, perlu verifikasi") per PRD §8 data governance:
// replace with sourced, checked data before real publishing.
// Run with: node cms/scripts/seed-coaches.mjs

import { api, login } from './lib/directus-client.mjs'
import { seedSources, sources } from './seed-sources.mjs'

const coaches = [
  {
    slug: 'indra-thohir',
    nama: 'Indra Thohir',
    periode_mulai: '1993-01-01',
    periode_selesai: '1995-12-31',
    id: { pencapaian: 'Membawa Persib juara Liga Indonesia musim 1994/1995 (data contoh, perlu verifikasi).' },
    en: { pencapaian: 'Led Persib to the 1994/1995 Liga Indonesia title (sample data, needs verification).' }
  },
  {
    slug: 'djadjang-nurdjaman',
    nama: 'Djadjang Nurdjaman',
    periode_mulai: '2013-01-01',
    periode_selesai: '2015-12-31',
    id: { pencapaian: 'Membawa Persib juara Indonesia Super League 2014 (data contoh, perlu verifikasi).' },
    en: { pencapaian: 'Led Persib to the 2014 Indonesia Super League title (sample data, needs verification).' }
  }
]

async function main() {
  await login()
  const sourceIds = await seedSources()
  const sourceId = sourceIds[sources[0].nama_sumber]

  for (const coach of coaches) {
    const existing = await api(`/items/coaches?filter[slug][_eq]=${coach.slug}`)
    if (existing.data.length > 0) {
      console.log(`= coach ${coach.slug} already exists, skipping`)
      continue
    }
    await api('/items/coaches', {
      method: 'POST',
      body: JSON.stringify({
        slug: coach.slug,
        nama: coach.nama,
        periode_mulai: coach.periode_mulai,
        periode_selesai: coach.periode_selesai,
        status: 'published',
        sumber_utama: sourceId,
        translations: [
          { languages_code: 'id-ID', pencapaian: coach.id.pencapaian },
          { languages_code: 'en-US', pencapaian: coach.en.pencapaian }
        ]
      })
    })
    console.log(`+ created coach ${coach.slug}`)
  }
  console.log('\nDone seeding coaches.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
