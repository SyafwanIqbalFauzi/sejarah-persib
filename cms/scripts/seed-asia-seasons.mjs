// Seed data for asia_seasons — Persib Bandung's participation in Asian club competitions.
// Sourced from open references (Kompas, AFC, Wikipedia, persib.co.id) as of 2026-07.
// `juara` = that edition's overall champion; `hasil_akhir` = Persib's own result.
// Idempotent: matches existing rows by (nama_kompetisi, tahun_mulai).
// Run with: node cms/scripts/seed-asia-seasons.mjs

import { api, login } from './lib/directus-client.mjs'

const editions = [
  {
    nama_kompetisi: 'Asian Club Championship',
    tahun_mulai: 1994,
    tahun_selesai: 1995,
    juara: 'Ilhwa Chunma',
    hasil_akhir: 'Perempat Final',
    keterangan: 'Debut Asia sebagai juara Liga Indonesia 1994/95. Menyingkirkan Bangkok Bank & Pasay City FC, lolos ke perempat final (format grup di Stadion Siliwangi) bersama Ilhwa Chunma, Verdy Kawasaki, dan Thai Farmers Bank.',
    status: 'published'
  },
  {
    nama_kompetisi: 'Piala AFC',
    tahun_mulai: 2015,
    tahun_selesai: 2015,
    juara: 'Johor Darul Tazim',
    hasil_akhir: '16 Besar',
    keterangan: 'Juara Grup H, lalu tersingkir di babak 16 besar (kalah 0-2 dari Kitchee FC di Stadion Si Jalak Harupat).',
    status: 'published'
  },
  {
    nama_kompetisi: 'AFC Champions League Two',
    tahun_mulai: 2024,
    tahun_selesai: 2025,
    juara: 'Sharjah',
    hasil_akhir: 'Fase Grup',
    keterangan: 'Edisi perdana ACL Two. Tergabung di Grup F bersama Zhejiang FC, Port FC, dan Lion City Sailors; finis di dasar klasemen dan gagal lolos ke babak 16 besar.',
    status: 'published'
  },
  {
    nama_kompetisi: 'AFC Champions League Two',
    tahun_mulai: 2025,
    tahun_selesai: 2026,
    juara: 'Gamba Osaka',
    hasil_akhir: '16 Besar',
    keterangan: 'Juara Grup G, lalu tersingkir di babak 16 besar (kalah agregat 1-3 dari Ratchaburi FC).',
    status: 'published'
  },
  {
    nama_kompetisi: 'AFC Champions League Two',
    tahun_mulai: 2026,
    tahun_selesai: 2027,
    juara: null,
    hasil_akhir: null,
    keterangan: null,
    status: 'draft'
  }
]

async function main() {
  await login()

  for (const edition of editions) {
    const existing = await api(
      `/items/asia_seasons?filter[nama_kompetisi][_eq]=${encodeURIComponent(edition.nama_kompetisi)}&filter[tahun_mulai][_eq]=${edition.tahun_mulai}`
    )
    if (existing.data.length > 0) {
      console.log(`= asia_season "${edition.nama_kompetisi} ${edition.tahun_mulai}" already exists, skipping`)
      continue
    }
    await api('/items/asia_seasons', {
      method: 'POST',
      body: JSON.stringify(edition)
    })
    console.log(`+ created asia_season "${edition.nama_kompetisi} ${edition.tahun_mulai}"`)
  }
  console.log('\nDone seeding asia_seasons.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
