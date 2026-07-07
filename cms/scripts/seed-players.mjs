// Seed data — placeholder/example content, NOT verified historical fact. See seed-coaches.mjs.
// Run with: node cms/scripts/seed-players.mjs

import { api, login } from './lib/directus-client.mjs'
import { seedSources, sources } from './seed-sources.mjs'

const players = [
  {
    slug: 'robby-darwis',
    nama: 'Robby Darwis',
    posisi: 'Bek',
    tahun_aktif_mulai: 1985,
    tahun_aktif_selesai: 1997,
    id: { biodata: 'Bek legendaris era Perserikatan & awal Liga Indonesia (data contoh, perlu verifikasi).' },
    en: { biodata: 'Legendary defender from the Perserikatan and early Liga Indonesia era (sample data, needs verification).' }
  },
  {
    slug: 'atep',
    nama: 'Atep',
    posisi: 'Winger',
    tahun_aktif_mulai: 2005,
    tahun_aktif_selesai: 2018,
    id: { biodata: 'Kapten & winger andalan Persib era modern, bagian dari skuat juara ISL 2014 (data contoh, perlu verifikasi).' },
    en: { biodata: "Persib's modern-era captain and winger, part of the 2014 ISL title squad (sample data, needs verification)." }
  }
]

async function main() {
  await login()
  const sourceIds = await seedSources()
  const sourceId = sourceIds[sources[0].nama_sumber]

  for (const player of players) {
    const existing = await api(`/items/players?filter[slug][_eq]=${player.slug}`)
    if (existing.data.length > 0) {
      console.log(`= player ${player.slug} already exists, skipping`)
      continue
    }
    await api('/items/players', {
      method: 'POST',
      body: JSON.stringify({
        slug: player.slug,
        nama: player.nama,
        posisi: player.posisi,
        tahun_aktif_mulai: player.tahun_aktif_mulai,
        tahun_aktif_selesai: player.tahun_aktif_selesai,
        status: 'published',
        sumber_utama: sourceId,
        translations: [
          { languages_code: 'id-ID', biodata: player.id.biodata },
          { languages_code: 'en-US', biodata: player.en.biodata }
        ]
      })
    })
    console.log(`+ created player ${player.slug}`)
  }
  console.log('\nDone seeding players.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
