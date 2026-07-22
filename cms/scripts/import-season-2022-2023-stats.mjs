// One-off import: player_season_stats for BRI Liga 1 2022/2023, sourced from a
// squad stats table (tabel.html at repo root, Transfermarkt-style export).
// Creates any player missing from the `players` collection, backfills `posisi`
// from this data, and upserts one player_season_stats row per player for the
// 2022/2023 season. Sibling of import-season-2023-2024-stats.mjs.
// Run with: node cms/scripts/import-season-2022-2023-stats.mjs

import { api, login } from './lib/directus-client.mjs'

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// Directus dev instance occasionally drops its pg connection under rapid writes
// ("ROLLBACK - Client has encountered a connection error" / statement timeout);
// retry with backoff rather than aborting the whole import over a transient hiccup.
async function apiRetry(p, options, attempts = 8) {
  for (let i = 1; i <= attempts; i++) {
    try {
      return await api(p, options)
    } catch (err) {
      if (i === attempts) throw err
      console.log(`  (retry ${i}/${attempts - 1} after error: ${err.message.slice(0, 100)})`)
      await sleep(3000 * i)
    }
  }
}

function toSlug(nama) {
  return nama
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// Transfermarkt-style position label -> our players.posisi choice.
const posisiMap = {
  'Kiper': 'Kiper',
  'Bek-Kiri': 'Bek Sayap',
  'Bek-Kanan': 'Bek Sayap',
  'Bek-Tengah': 'Bek Tengah',
  'Gel. Bertahan': 'Gelandang Bertahan',
  'Gel. Tengah': 'Gelandang Tengah',
  'Gel. Serang': 'Gelandang Serang',
  'Sayap Kanan': 'Sayap Kanan',
  'Sayap Kiri': 'Sayap Kiri',
  'Depan-Tengah': 'Penyerang Tengah'
}

// Rows where the source's display name doesn't slug-match an already-seeded
// player, but is confirmed the same person under a shortened name.
const slugAliases = new Map([
  ['Fitrul Rustapa', 'fitrul-dwi-rustapa'], // same as already-seeded "Fitrul Dwi Rustapa"
  ['Tyronne', 'tyronne-del-pino'] // Transfermarkt shortens "Tyronne del Pino" to "Tyronne"
])

const rows = [
  { nomor: 14, nama: 'Teja Paku Alam', posisi: 'Kiper', negara: ['Indonesia'], jumlah_laga: 21, jumlah_gol: 0, jumlah_assist: 0, kartu_kuning: 1, kartu_merah: 1, jumlah_menit_bermain: 1833 },
  { nomor: 1, nama: 'Fitrul Rustapa', posisi: 'Kiper', negara: ['Indonesia'], jumlah_laga: 2, jumlah_gol: 0, jumlah_assist: 0, kartu_kuning: 0, kartu_merah: 0, jumlah_menit_bermain: 180 },
  { nomor: 34, nama: 'Reky Rahayu', posisi: 'Kiper', negara: ['Indonesia'], jumlah_laga: 9, jumlah_gol: 0, jumlah_assist: 0, kartu_kuning: 0, kartu_merah: 0, jumlah_menit_bermain: 658 },
  { nomor: null, nama: 'Satrio Azhar', posisi: 'Kiper', negara: ['Indonesia'], jumlah_laga: 0, jumlah_gol: 0, jumlah_assist: 0, kartu_kuning: 0, kartu_merah: 0, jumlah_menit_bermain: 0 },
  { nomor: null, nama: 'Made Wirawan', posisi: 'Kiper', negara: ['Indonesia'], jumlah_laga: 6, jumlah_gol: 0, jumlah_assist: 0, kartu_kuning: 1, kartu_merah: 0, jumlah_menit_bermain: 388 },
  { nomor: null, nama: 'Edo Febriansyah', posisi: 'Bek-Kiri', negara: ['Indonesia'], jumlah_laga: 0, jumlah_gol: 0, jumlah_assist: 0, kartu_kuning: 0, kartu_merah: 0, jumlah_menit_bermain: 0 },
  { nomor: 5, nama: 'Kakang Rudianto', posisi: 'Bek-Tengah', negara: ['Indonesia'], jumlah_laga: 11, jumlah_gol: 0, jumlah_assist: 0, kartu_kuning: 5, kartu_merah: 0, jumlah_menit_bermain: 705 },
  { nomor: null, nama: 'Putu Gede', posisi: 'Bek-Kanan', negara: ['Indonesia'], jumlah_laga: 0, jumlah_gol: 0, jumlah_assist: 0, kartu_kuning: 0, kartu_merah: 0, jumlah_menit_bermain: 0 },
  { nomor: 2, nama: 'Nick Kuipers', posisi: 'Bek-Tengah', negara: ['Belanda'], jumlah_laga: 29, jumlah_gol: 1, jumlah_assist: 0, kartu_kuning: 10, kartu_merah: 0, jumlah_menit_bermain: 2508 },
  { nomor: null, nama: 'Henhen Herdiana', posisi: 'Bek-Kanan', negara: ['Indonesia'], jumlah_laga: 20, jumlah_gol: 1, jumlah_assist: 5, kartu_kuning: 1, kartu_merah: 0, jumlah_menit_bermain: 1449 },
  { nomor: 66, nama: 'Daisuke Sato', posisi: 'Bek-Kiri', negara: ['Filipina'], jumlah_laga: 31, jumlah_gol: 2, jumlah_assist: 0, kartu_kuning: 11, kartu_merah: 0, jumlah_menit_bermain: 2650 },
  { nomor: 56, nama: 'Rezaldi Hehanussa', posisi: 'Bek-Kiri', negara: ['Indonesia'], jumlah_laga: 12, jumlah_gol: 0, jumlah_assist: 2, kartu_kuning: 1, kartu_merah: 0, jumlah_menit_bermain: 511 },
  { nomor: 27, nama: 'Zalnando', posisi: 'Bek-Kiri', negara: ['Indonesia'], jumlah_laga: 9, jumlah_gol: 0, jumlah_assist: 1, kartu_kuning: 2, kartu_merah: 0, jumlah_menit_bermain: 506 },
  { nomor: null, nama: 'Bayu Fiqri', posisi: 'Bek-Kanan', negara: ['Indonesia'], jumlah_laga: 3, jumlah_gol: 0, jumlah_assist: 0, kartu_kuning: 2, kartu_merah: 0, jumlah_menit_bermain: 160 },
  { nomor: 16, nama: 'Achmad Jufriyanto', posisi: 'Bek-Tengah', negara: ['Indonesia'], jumlah_laga: 24, jumlah_gol: 1, jumlah_assist: 0, kartu_kuning: 4, kartu_merah: 0, jumlah_menit_bermain: 1603 },
  { nomor: null, nama: 'David Rumakiek', posisi: 'Bek-Kiri', negara: ['Indonesia'], jumlah_laga: 1, jumlah_gol: 0, jumlah_assist: 0, kartu_kuning: 0, kartu_merah: 0, jumlah_menit_bermain: 16 },
  { nomor: null, nama: 'Faris Abdul', posisi: 'Bek-Tengah', negara: ['Indonesia'], jumlah_laga: 0, jumlah_gol: 0, jumlah_assist: 0, kartu_kuning: 0, kartu_merah: 0, jumlah_menit_bermain: 0 },
  { nomor: 3, nama: 'Eriyanto', posisi: 'Bek-Kanan', negara: ['Indonesia'], jumlah_laga: 0, jumlah_gol: 0, jumlah_assist: 0, kartu_kuning: 0, kartu_merah: 0, jumlah_menit_bermain: 0 },
  { nomor: 32, nama: 'Victor Igbonefo', posisi: 'Bek-Tengah', negara: ['Indonesia', 'Nigeria'], jumlah_laga: 15, jumlah_gol: 0, jumlah_assist: 0, kartu_kuning: 2, kartu_merah: 0, jumlah_menit_bermain: 1042 },
  { nomor: 10, nama: 'Marc Klok', posisi: 'Gel. Tengah', negara: ['Indonesia', 'Belanda'], jumlah_laga: 25, jumlah_gol: 4, jumlah_assist: 3, kartu_kuning: 4, kartu_merah: 0, jumlah_menit_bermain: 2169 },
  { nomor: 55, nama: 'Ricky Kambuaya', posisi: 'Gel. Serang', negara: ['Indonesia'], jumlah_laga: 22, jumlah_gol: 0, jumlah_assist: 3, kartu_kuning: 5, kartu_merah: 0, jumlah_menit_bermain: 1093 },
  { nomor: 53, nama: 'Rachmat Irianto', posisi: 'Gel. Bertahan', negara: ['Indonesia'], jumlah_laga: 25, jumlah_gol: 1, jumlah_assist: 4, kartu_kuning: 1, kartu_merah: 0, jumlah_menit_bermain: 2160 },
  { nomor: 6, nama: 'Robi Darwis', posisi: 'Gel. Bertahan', negara: ['Indonesia'], jumlah_laga: 17, jumlah_gol: 1, jumlah_assist: 1, kartu_kuning: 6, kartu_merah: 0, jumlah_menit_bermain: 1006 },
  { nomor: null, nama: 'Tyronne', posisi: 'Gel. Serang', negara: ['Spanyol'], jumlah_laga: 0, jumlah_gol: 0, jumlah_assist: 0, kartu_kuning: 0, kartu_merah: 0, jumlah_menit_bermain: 0 },
  { nomor: null, nama: 'Diandra Diaz', posisi: 'Gel. Bertahan', negara: ['Indonesia'], jumlah_laga: 0, jumlah_gol: 0, jumlah_assist: 0, kartu_kuning: 0, kartu_merah: 0, jumlah_menit_bermain: 0 },
  { nomor: null, nama: 'Adzikry Fadlillah', posisi: 'Gel. Serang', negara: ['Indonesia'], jumlah_laga: 0, jumlah_gol: 0, jumlah_assist: 0, kartu_kuning: 0, kartu_merah: 0, jumlah_menit_bermain: 0 },
  { nomor: 11, nama: 'Dedi Kusnandar', posisi: 'Gel. Bertahan', negara: ['Indonesia'], jumlah_laga: 32, jumlah_gol: 0, jumlah_assist: 1, kartu_kuning: 5, kartu_merah: 0, jumlah_menit_bermain: 2073 },
  { nomor: 8, nama: 'Abdul Aziz', posisi: 'Gel. Tengah', negara: ['Indonesia'], jumlah_laga: 20, jumlah_gol: 0, jumlah_assist: 0, kartu_kuning: 0, kartu_merah: 0, jumlah_menit_bermain: 692 },
  { nomor: null, nama: 'Ardi Maulana', posisi: 'Gel. Tengah', negara: ['Indonesia'], jumlah_laga: 0, jumlah_gol: 0, jumlah_assist: 0, kartu_kuning: 0, kartu_merah: 0, jumlah_menit_bermain: 0 },
  { nomor: 7, nama: 'Beckham Putra', posisi: 'Sayap Kanan', negara: ['Indonesia'], jumlah_laga: 25, jumlah_gol: 1, jumlah_assist: 3, kartu_kuning: 4, kartu_merah: 0, jumlah_menit_bermain: 1388 },
  { nomor: 30, nama: 'Ezra Walian', posisi: 'Sayap Kiri', negara: ['Indonesia', 'Belanda'], jumlah_laga: 22, jumlah_gol: 1, jumlah_assist: 0, kartu_kuning: 3, kartu_merah: 0, jumlah_menit_bermain: 774 },
  { nomor: 77, nama: 'Ciro Alves', posisi: 'Sayap Kanan', negara: ['Brasil'], jumlah_laga: 31, jumlah_gol: 10, jumlah_assist: 5, kartu_kuning: 4, kartu_merah: 0, jumlah_menit_bermain: 2406 },
  { nomor: null, nama: 'Ryan Kurnia', posisi: 'Sayap Kanan', negara: ['Indonesia'], jumlah_laga: 0, jumlah_gol: 0, jumlah_assist: 0, kartu_kuning: 0, kartu_merah: 0, jumlah_menit_bermain: 0 },
  { nomor: 21, nama: 'Frets Butuan', posisi: 'Sayap Kiri', negara: ['Indonesia'], jumlah_laga: 25, jumlah_gol: 2, jumlah_assist: 2, kartu_kuning: 0, kartu_merah: 0, jumlah_menit_bermain: 1412 },
  { nomor: 19, nama: 'David da Silva', posisi: 'Depan-Tengah', negara: ['Brasil'], jumlah_laga: 33, jumlah_gol: 24, jumlah_assist: 5, kartu_kuning: 7, kartu_merah: 0, jumlah_menit_bermain: 2765 },
  { nomor: 13, nama: 'Febri Hariyadi', posisi: 'Sayap Kanan', negara: ['Indonesia'], jumlah_laga: 19, jumlah_gol: 1, jumlah_assist: 1, kartu_kuning: 0, kartu_merah: 0, jumlah_menit_bermain: 851 },
  { nomor: 17, nama: 'Ferdiansyah', posisi: 'Sayap Kanan', negara: ['Indonesia'], jumlah_laga: 5, jumlah_gol: 0, jumlah_assist: 0, kartu_kuning: 0, kartu_merah: 0, jumlah_menit_bermain: 65 },
  { nomor: 70, nama: 'Arsan Makarin', posisi: 'Sayap Kanan', negara: ['Indonesia'], jumlah_laga: 5, jumlah_gol: 0, jumlah_assist: 0, kartu_kuning: 1, kartu_merah: 0, jumlah_menit_bermain: 172 },
  { nomor: null, nama: 'Erwin Ramdani', posisi: 'Sayap Kiri', negara: ['Indonesia'], jumlah_laga: 14, jumlah_gol: 1, jumlah_assist: 0, kartu_kuning: 1, kartu_merah: 0, jumlah_menit_bermain: 347 },
  { nomor: 99, nama: 'Ridwan Ansori', posisi: 'Sayap Kiri', negara: ['Indonesia'], jumlah_laga: 0, jumlah_gol: 0, jumlah_assist: 0, kartu_kuning: 0, kartu_merah: 0, jumlah_menit_bermain: 0 }
]

async function main() {
  await login()

  const seasons = await apiRetry('/items/seasons?filter[tahun_mulai][_eq]=2022&filter[tahun_selesai][_eq]=2023&limit=1')
  const season = seasons.data[0]
  if (!season) throw new Error('Season 2022/2023 not found in seasons collection')
  console.log(`Using season #${season.id} "${season.nama_kompetisi}" ${season.tahun_mulai}/${season.tahun_selesai}\n`)

  let playersCreated = 0
  let posisiUpdated = 0
  let statsCreated = 0
  let statsUpdated = 0

  for (const row of rows) {
    const slug = slugAliases.get(row.nama) ?? toSlug(row.nama)
    const posisi = posisiMap[row.posisi]
    if (!posisi) throw new Error(`No posisi mapping for "${row.posisi}" (${row.nama})`)

    const existing = await apiRetry(`/items/players?filter[slug][_eq]=${slug}&fields=id,nama,posisi`)
    let playerId

    if (existing.data.length === 0) {
      const created = await apiRetry('/items/players', {
        method: 'POST',
        body: JSON.stringify({ slug, nama: row.nama, negara: row.negara, posisi: [posisi], status: 'published' })
      })
      playerId = created.data.id
      console.log(`+ created player ${slug} (${posisi})`)
      playersCreated++
    } else {
      const player = existing.data[0]
      playerId = player.id
      const currentPosisi = player.posisi ?? []
      if (!currentPosisi.includes(posisi)) {
        await apiRetry(`/items/players/${playerId}`, { method: 'PATCH', body: JSON.stringify({ posisi: [...currentPosisi, posisi] }) })
        console.log(`~ updated posisi for ${slug}: [${currentPosisi.join(', ')}] -> [${[...currentPosisi, posisi].join(', ')}]`)
        posisiUpdated++
      }
    }

    const statPayload = {
      nomor_punggung: row.nomor,
      jumlah_laga: row.jumlah_laga,
      jumlah_menit_bermain: row.jumlah_menit_bermain,
      gol: row.jumlah_gol,
      assist: row.jumlah_assist,
      kartu_kuning: row.kartu_kuning,
      kartu_merah: row.kartu_merah
    }

    const existingStat = await apiRetry(`/items/player_season_stats?filter[player][_eq]=${playerId}&filter[season][_eq]=${season.id}`)
    if (existingStat.data.length === 0) {
      await apiRetry('/items/player_season_stats', {
        method: 'POST',
        body: JSON.stringify({ player: playerId, season: season.id, ...statPayload })
      })
      console.log(`  + stats: ${row.nama} — ${row.jumlah_laga} laga, ${row.jumlah_gol} gol, ${row.jumlah_assist} assist, ${row.jumlah_menit_bermain}'`)
      statsCreated++
    } else {
      await apiRetry(`/items/player_season_stats/${existingStat.data[0].id}`, { method: 'PATCH', body: JSON.stringify(statPayload) })
      console.log(`  ~ stats updated: ${row.nama}`)
      statsUpdated++
    }
  }

  console.log(`\nDone. Players created: ${playersCreated}, posisi updated: ${posisiUpdated}, stats created: ${statsCreated}, stats updated: ${statsUpdated}.`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
