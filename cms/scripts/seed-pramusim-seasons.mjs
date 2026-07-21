// Seed data for pramusim_seasons — Persib Bandung's pre-season / friendly tournaments.
// Sourced from open references (Kompas, Detik, Antara, Wikipedia) as of 2026-07.
// `juara` = that edition's overall champion; `hasil_akhir` = Persib's own result.
// Idempotent: matches existing rows by (nama_kompetisi, tahun_mulai).
// Run with: node cms/scripts/seed-pramusim-seasons.mjs

import { api, login } from './lib/directus-client.mjs'

const editions = [
  {
    nama_kompetisi: 'Piala Presiden',
    tahun_mulai: 2015,
    tahun_selesai: 2015,
    juara: 'Persib Bandung',
    hasil_akhir: 'Juara',
    keterangan: 'Edisi perdana Piala Presiden. Persib juara usai mengalahkan Sriwijaya FC 2-0 di final (SUGBK, 18 Oktober 2015).',
    status: 'published'
  },
  {
    nama_kompetisi: 'Piala Presiden',
    tahun_mulai: 2017,
    tahun_selesai: 2017,
    juara: 'Arema FC',
    hasil_akhir: 'Peringkat 3',
    keterangan: 'Persib meraih peringkat ketiga usai mengalahkan Semen Padang 1-0.',
    status: 'published'
  },
  {
    nama_kompetisi: 'Piala Presiden',
    tahun_mulai: 2018,
    tahun_selesai: 2018,
    juara: 'Persija Jakarta',
    hasil_akhir: 'Fase Grup',
    keterangan: 'Tersingkir di fase grup (posisi 3 Grup A); Sriwijaya FC lolos sebagai juara grup.',
    status: 'published'
  },
  {
    nama_kompetisi: 'Piala Presiden',
    tahun_mulai: 2019,
    tahun_selesai: 2019,
    juara: 'Arema FC',
    hasil_akhir: 'Fase Grup',
    keterangan: 'Tersingkir di fase grup. Arema FC juara usai mengalahkan Persebaya (agregat 4-2).',
    status: 'published'
  },
  {
    nama_kompetisi: 'Piala Presiden',
    tahun_mulai: 2025,
    tahun_selesai: 2025,
    juara: 'Port FC',
    hasil_akhir: 'Fase Grup',
    keterangan: 'Tersingkir di fase grup (Grup B). Port FC (Thailand) juara usai mengalahkan Oxford United 2-1 di final.',
    status: 'published'
  },
  {
    nama_kompetisi: 'Inter Island Cup',
    tahun_mulai: 2014,
    tahun_selesai: 2015,
    juara: 'Arema Cronus',
    hasil_akhir: 'Runner-up',
    keterangan: 'Edisi 2014 (final digelar 1 Februari 2015). Persib runner-up usai kalah 1-2 dari Arema Cronus lewat perpanjangan waktu.',
    status: 'published'
  },
  {
    nama_kompetisi: 'Celebes Cup',
    tahun_mulai: 2012,
    tahun_selesai: 2012,
    juara: 'Persib Bandung',
    hasil_akhir: 'Juara',
    keterangan: 'Celebes Cup II. Persib juara usai mengalahkan Sriwijaya FC 1-0 di final (Stadion Siliwangi, 4 November 2012).',
    status: 'published'
  },
  {
    nama_kompetisi: 'Piala Menpora',
    tahun_mulai: 2021,
    tahun_selesai: 2021,
    juara: 'Persija Jakarta',
    hasil_akhir: 'Runner-up',
    keterangan: 'Persib runner-up usai kalah agregat 1-4 dari Persija Jakarta di final dua leg.',
    status: 'published'
  }
]

async function main() {
  await login()

  for (const edition of editions) {
    const existing = await api(
      `/items/pramusim_seasons?filter[nama_kompetisi][_eq]=${encodeURIComponent(edition.nama_kompetisi)}&filter[tahun_mulai][_eq]=${edition.tahun_mulai}`
    )
    if (existing.data.length > 0) {
      console.log(`= pramusim_season "${edition.nama_kompetisi} ${edition.tahun_mulai}" already exists, skipping`)
      continue
    }
    await api('/items/pramusim_seasons', {
      method: 'POST',
      body: JSON.stringify(edition)
    })
    console.log(`+ created pramusim_season "${edition.nama_kompetisi} ${edition.tahun_mulai}"`)
  }
  console.log('\nDone seeding pramusim_seasons.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
