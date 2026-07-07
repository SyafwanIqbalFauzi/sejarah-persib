// Seeds the 6 eras from PRD §5.1. Safe to re-run (skips existing slugs).
// Run with: node cms/scripts/seed-eras.mjs

import { api, login } from './lib/directus-client.mjs'

const eras = [
  {
    slug: 'psib-fusi-1933-1934',
    tahun_mulai: 1933,
    tahun_selesai: 1934,
    id: { nama_era: 'PSIB & Fusi menjadi Persib', deskripsi: 'Penggabungan klub-klub Bandung menjadi Persib.' },
    en: { nama_era: 'PSIB & Merger into Persib', deskripsi: 'Bandung clubs merge to form Persib.' }
  },
  {
    slug: 'perserikatan-1934-1994',
    tahun_mulai: 1934,
    tahun_selesai: 1994,
    id: { nama_era: 'Era Perserikatan', deskripsi: 'Persib berkompetisi di kompetisi Perserikatan.' },
    en: { nama_era: 'Perserikatan Era', deskripsi: 'Persib competes in the Perserikatan league.' }
  },
  {
    slug: 'galatama',
    tahun_mulai: 1979,
    tahun_selesai: 1994,
    id: { nama_era: 'Era Galatama', deskripsi: 'Periode kompetisi semi-profesional Galatama yang overlap dengan Perserikatan.' },
    en: { nama_era: 'Galatama Era', deskripsi: 'Semi-professional Galatama league period, overlapping with Perserikatan.' }
  },
  {
    slug: 'liga-indonesia-1994-2017',
    tahun_mulai: 1994,
    tahun_selesai: 2017,
    id: { nama_era: 'Liga Indonesia / Liga Super Indonesia', deskripsi: 'Penggabungan Perserikatan dan Galatama menjadi Liga Indonesia, kemudian Liga Super Indonesia.' },
    en: { nama_era: 'Liga Indonesia / Indonesia Super League', deskripsi: 'Perserikatan and Galatama merge into Liga Indonesia, later the Indonesia Super League.' }
  },
  {
    slug: 'liga-1-modern-2017-sekarang',
    tahun_mulai: 2017,
    tahun_selesai: null,
    id: { nama_era: 'Era Liga 1 Modern', deskripsi: 'Era modern Persib di kompetisi Liga 1 Indonesia.' },
    en: { nama_era: 'Modern Liga 1 Era', deskripsi: "Persib's modern era in the Liga 1 Indonesia competition." }
  }
]

async function main() {
  await login()

  for (const era of eras) {
    const existing = await api(`/items/eras?filter[slug][_eq]=${era.slug}`)
    if (existing.data.length > 0) {
      console.log(`= era ${era.slug} already exists, skipping`)
      continue
    }
    await api('/items/eras', {
      method: 'POST',
      body: JSON.stringify({
        slug: era.slug,
        tahun_mulai: era.tahun_mulai,
        tahun_selesai: era.tahun_selesai,
        status: 'published',
        translations: [
          { languages_code: 'id-ID', nama_era: era.id.nama_era, deskripsi: era.id.deskripsi },
          { languages_code: 'en-US', nama_era: era.en.nama_era, deskripsi: era.en.deskripsi }
        ]
      })
    })
    console.log(`+ created era ${era.slug}`)
  }
  console.log('\nDone seeding eras.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
