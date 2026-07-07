// Seed data — placeholder/example content. Origin-of-nickname and stadium facts
// are general public knowledge, but still flagged for verification per PRD §8.
// Run with: node cms/scripts/seed-stories.mjs

import { api, login } from './lib/directus-client.mjs'
import { seedSources, sources } from './seed-sources.mjs'

const stories = [
  {
    slug: 'asal-usul-maung-bandung',
    tipe: 'fun_fact',
    id: { judul: 'Asal-usul julukan "Maung Bandung"', isi: 'Julukan "Maung Bandung" merujuk pada macan (maung, dalam bahasa Sunda) sebagai simbol keberanian dan identitas Jawa Barat (data contoh, perlu verifikasi).' },
    en: { judul: 'Origin of the "Maung Bandung" nickname', isi: '"Maung Bandung" ("Bandung Tiger") refers to the tiger as a symbol of courage and West Javanese identity (sample data, needs verification).' }
  },
  {
    slug: 'gbla-kandang-persib',
    tipe: 'fun_fact',
    id: { judul: 'GBLA, kandang modern Persib', isi: 'Gelora Bandung Lautan Api (GBLA) menjadi salah satu stadion kandang Persib di era modern (data contoh, perlu verifikasi).' },
    en: { judul: 'GBLA, Persib\'s modern home ground', isi: 'Gelora Bandung Lautan Api (GBLA) is one of Persib\'s home stadiums in the modern era (sample data, needs verification).' }
  }
]

async function main() {
  await login()
  const sourceIds = await seedSources()
  const sourceId = sourceIds[sources[0].nama_sumber]

  for (const story of stories) {
    const existing = await api(`/items/stories?filter[slug][_eq]=${story.slug}`)
    if (existing.data.length > 0) {
      console.log(`= story ${story.slug} already exists, skipping`)
      continue
    }
    await api('/items/stories', {
      method: 'POST',
      body: JSON.stringify({
        slug: story.slug,
        tipe: story.tipe,
        status: 'published',
        sumber_utama: sourceId,
        translations: [
          { languages_code: 'id-ID', judul: story.id.judul, isi: story.id.isi },
          { languages_code: 'en-US', judul: story.en.judul, isi: story.en.isi }
        ]
      })
    })
    console.log(`+ created story ${story.slug}`)
  }
  console.log('\nDone seeding stories.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
