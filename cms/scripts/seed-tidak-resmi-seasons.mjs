// Seeds tidak_resmi_seasons — kompetisi tidak resmi (Inlandsche Stedenwedstrijden,
// ISC/Torabika, turnamen internasional tidak resmi: Aga Khan Gold Cup, Pesta Sukan,
// Selangor Asia Challenge Cup, dst). As of 2026-07-21.
// Depends on eras already being seeded (matches era by slug via seed-eras.mjs).
// Idempotent: matches existing rows by (nama_kompetisi, tahun_mulai).
// Run with: node cms/scripts/seed-tidak-resmi-seasons.mjs

import { api, login } from './lib/directus-client.mjs'

const editions = [
  {
    "nama_kompetisi": "Inlandsche Stedenwedstrijden",
    "juara": "PERSIB Bandung",
    "hasil_akhir": "Juara",
    "tahun_mulai": 1950,
    "tahun_selesai": 1950,
    "keterangan": "Kompetisi tidak resmi",
    "status": "published",
    "era_slug": "perserikatan-1931-1994"
  },
  {
    "nama_kompetisi": "Aga Khan Gold Cup",
    "juara": null,
    "hasil_akhir": "Perempat Final",
    "tahun_mulai": 1962,
    "tahun_selesai": 1962,
    "keterangan": "Digelar di Stadion Dhaka, Pakistan Timur (kini Bangladesh). Persib bye di babak 1, menang 5-0 atas Azad SC, lalu kalah 0-2 dari Pakistan Railways di perempat final.",
    "status": "published",
    "era_slug": "perserikatan-1931-1994"
  },
  {
    "nama_kompetisi": "Pesta Sukan (Sultan Hassanal Bolkiah Cup)",
    "juara": "PERSIB Bandung",
    "hasil_akhir": "Juara",
    "tahun_mulai": 1986,
    "tahun_selesai": 1986,
    "keterangan": "Mewakili Indonesia sebagai juara Perserikatan 1986. Persib juara di Bandar Seri Begawan usai mengalahkan tim nasional Malaysia 1-0 di final.",
    "status": "published",
    "era_slug": "perserikatan-1931-1994"
  },
  {
    "nama_kompetisi": "Indonesia Soccer Championship A (Torabika Soccer Championship)",
    "juara": "Persipura Jayapura",
    "hasil_akhir": null,
    "tahun_mulai": 2016,
    "tahun_selesai": 2017,
    "keterangan": "Kompetisi tidak resmi. Kompetisi tidak berafiliasi dengan PSSI, AFC & FIFA.",
    "status": "published",
    "era_slug": "indonesia-super-league"
  },
  {
    "nama_kompetisi": "Selangor Asia Challenge Cup",
    "juara": "Bangkok United",
    "hasil_akhir": "Peringkat 3",
    "tahun_mulai": 2020,
    "tahun_selesai": 2020,
    "keterangan": "Turnamen pramusim 4 tim di Shah Alam, Malaysia (Persib, Hanoi FC, Bangkok United, tuan rumah Selangor FA). Persib peringkat 3; kalah 0-3 dari Selangor. Juara: Bangkok United (menang adu penalti atas Selangor).",
    "status": "published",
    "era_slug": "super-league"
  }
]

async function main() {
  await login()

  const eras = await api('/items/eras?limit=-1&fields=id,slug')
  const eraIdBySlug = Object.fromEntries(eras.data.map((e) => [e.slug, e.id]))

  for (const edition of editions) {
    const { era_slug, ...fields } = edition
    const existing = await api(
      `/items/tidak_resmi_seasons?filter[nama_kompetisi][_eq]=${encodeURIComponent(fields.nama_kompetisi ?? '')}&filter[tahun_mulai][_eq]=${fields.tahun_mulai}`
    )
    if (existing.data.length > 0) {
      console.log(`= tidak_resmi_season "${fields.nama_kompetisi} ${fields.tahun_mulai}" already exists, skipping`)
      continue
    }
    await api('/items/tidak_resmi_seasons', {
      method: 'POST',
      body: JSON.stringify({ ...fields, era: era_slug ? eraIdBySlug[era_slug] : null })
    })
    console.log(`+ created tidak_resmi_season "${fields.nama_kompetisi} ${fields.tahun_mulai}"`)
  }
  console.log('
Done seeding tidak_resmi_seasons.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
