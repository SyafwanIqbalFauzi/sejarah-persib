// Seed data — placeholder/example content, NOT verified historical fact. See seed-coaches.mjs.
// Run with: node cms/scripts/seed-matches.mjs

import { api, login } from './lib/directus-client.mjs'
import { seedSources, sources } from './seed-sources.mjs'

const matches = [
  {
    tanggal: '2014-11-08',
    lawan: 'Persipura Jayapura',
    skor: 'Persib menang adu penalti (skor pasti perlu verifikasi)',
    kategori: 'ikonik',
    id: { deskripsi_naratif: 'Final Indonesia Super League 2014 — Persib juara setelah adu penalti (data contoh, perlu verifikasi ulang detail skor & tanggal).' },
    en: { deskripsi_naratif: '2014 Indonesia Super League final — Persib won the title via penalty shootout (sample data, exact score/date needs verification).' }
  }
]

async function main() {
  await login()
  const sourceIds = await seedSources()
  const sourceId = sourceIds[sources[0].nama_sumber]

  for (const match of matches) {
    const existing = await api(`/items/matches?filter[lawan][_eq]=${encodeURIComponent(match.lawan)}&filter[tanggal][_eq]=${match.tanggal}`)
    if (existing.data.length > 0) {
      console.log(`= match vs ${match.lawan} (${match.tanggal}) already exists, skipping`)
      continue
    }
    await api('/items/matches', {
      method: 'POST',
      body: JSON.stringify({
        tanggal: match.tanggal,
        lawan: match.lawan,
        skor: match.skor,
        kategori: match.kategori,
        status: 'published',
        sumber_utama: sourceId,
        translations: [
          { languages_code: 'id-ID', deskripsi_naratif: match.id.deskripsi_naratif },
          { languages_code: 'en-US', deskripsi_naratif: match.en.deskripsi_naratif }
        ]
      })
    })
    console.log(`+ created match vs ${match.lawan}`)
  }
  console.log('\nDone seeding matches.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
