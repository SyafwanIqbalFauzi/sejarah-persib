// Seed data for cup_seasons — edition list + overall champion sourced from
// https://www.arsipsepakbolaindonesia.com/p/piala-indonesia.html (2026-07-21).
// That source is an index of ALL editions' overall champions — it does NOT say
// whether/how Persib participated in any given edition. `hasil_akhir` (Persib's
// result) is left null here and needs to be filled in per edition after
// checking dedicated per-season sources (Persib never won this competition,
// per the user, but did play in some editions — group stage, semifinal, etc.).
// Run with: node cms/scripts/seed-cup-seasons.mjs

import { api, login } from './lib/directus-client.mjs'

const editions = [
  { nama_kompetisi: 'Piala Liga', tahun_mulai: 1985, tahun_selesai: 1985, juara: 'Arseto' },
  { nama_kompetisi: 'Piala Liga', tahun_mulai: 1986, tahun_selesai: 1986, juara: 'Makassar Utama' },
  { nama_kompetisi: 'Piala Liga', tahun_mulai: 1987, tahun_selesai: 1987, juara: 'Krama Yudha Tiga Berlian' },
  { nama_kompetisi: 'Piala Liga', tahun_mulai: 1988, tahun_selesai: 1988, juara: 'Krama Yudha Tiga Berlian' },
  { nama_kompetisi: 'Piala Liga', tahun_mulai: 1989, tahun_selesai: 1989, juara: 'Krama Yudha Tiga Berlian' },
  { nama_kompetisi: 'Piala Galatama', tahun_mulai: 1992, tahun_selesai: 1992, juara: 'Semen Padang' },
  { nama_kompetisi: 'Piala Galatama', tahun_mulai: 1993, tahun_selesai: 1993, juara: "Gelora Dewata '89" },
  { nama_kompetisi: 'Copa Indonesia', tahun_mulai: 2005, tahun_selesai: 2005, juara: 'Arema Malang' },
  { nama_kompetisi: 'Copa Indonesia', tahun_mulai: 2006, tahun_selesai: 2006, juara: 'Arema Malang' },
  { nama_kompetisi: 'Copa Indonesia', tahun_mulai: 2007, tahun_selesai: 2008, juara: 'Sriwijaya FC' },
  { nama_kompetisi: 'Copa Indonesia', tahun_mulai: 2008, tahun_selesai: 2009, juara: 'Sriwijaya FC' },
  { nama_kompetisi: 'Piala Indonesia', tahun_mulai: 2010, tahun_selesai: 2010, juara: 'Sriwijaya FC' },
  { nama_kompetisi: 'Piala Indonesia', tahun_mulai: 2012, tahun_selesai: 2012, juara: 'Persibo Bojonegoro' },
  { nama_kompetisi: 'Piala Indonesia', tahun_mulai: 2018, tahun_selesai: 2019, juara: 'PSM Makassar' }
]

async function main() {
  await login()

  for (const edition of editions) {
    const existing = await api(
      `/items/cup_seasons?filter[nama_kompetisi][_eq]=${encodeURIComponent(edition.nama_kompetisi)}&filter[tahun_mulai][_eq]=${edition.tahun_mulai}`
    )
    if (existing.data.length > 0) {
      console.log(`= cup_season "${edition.nama_kompetisi} ${edition.tahun_mulai}" already exists, skipping`)
      continue
    }
    await api('/items/cup_seasons', {
      method: 'POST',
      body: JSON.stringify({ ...edition, status: 'draft' })
    })
    console.log(`+ created cup_season "${edition.nama_kompetisi} ${edition.tahun_mulai}"`)
  }
  console.log('\nDone seeding cup_seasons. hasil_akhir (Persib) is still unset for every row — fill in per edition after verification.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
